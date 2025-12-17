import { useState, useCallback, useRef, useEffect } from "react";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export function useAccessibility() {
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>("");
  const [microphonePermission, setMicrophonePermission] = useState<
    "granted" | "denied" | "unknown"
  >("unknown");
  const [voiceCommandError, setVoiceCommandError] = useState<string>("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check microphone permission on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((permissionStatus) => {
          setMicrophonePermission(
            permissionStatus.state === "granted" ? "granted" : "denied"
          );

          permissionStatus.onchange = () => {
            setMicrophonePermission(
              permissionStatus.state === "granted" ? "granted" : "denied"
            );
          };
        })
        .catch(() => {
          // If permissions API is not supported, set to unknown
          setMicrophonePermission("unknown");
        });
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (voiceCommandsEnabled) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setVoiceCommandError(
          "Speech recognition is not supported in your browser. Try Chrome, Edge, or Safari."
        );
        announce(
          "Speech recognition is not supported in your browser. Try Chrome, Edge, or Safari."
        );
        setVoiceCommandsEnabled(false);
        return;
      }

      if (microphonePermission === "denied") {
        setVoiceCommandError(
          "Microphone permission denied. Please enable microphone access in your browser settings."
        );
        announce(
          "Microphone permission denied. Please enable microphone access in your browser settings."
        );
        setVoiceCommandsEnabled(false);
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setVoiceCommandError("");
        announce("Listening for voice commands");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Restart listening if still enabled
        if (voiceCommandsEnabled && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.error("Error restarting recognition:", err);
          }
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);

        let errorMessage = "";
        switch (event.error) {
          case "not-allowed":
            errorMessage =
              "Microphone permission denied. Please allow microphone access in your browser settings.";
            setMicrophonePermission("denied");
            setVoiceCommandsEnabled(false);
            break;
          case "no-speech":
            errorMessage = "No speech detected. Please try again.";
            break;
          case "network":
            errorMessage = "Network error. Please check your connection.";
            break;
          case "audio-capture":
            errorMessage =
              "No microphone found. Please check your device has a working microphone.";
            break;
          case "service-not-allowed":
            errorMessage =
              "Speech recognition service is not available. Try using HTTPS connection.";
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        setVoiceCommandError(errorMessage);
        announce(errorMessage);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          const command = finalTranscript.toLowerCase().trim();
          setLastCommand(command);
          handleVoiceCommand(command);
        }
      };

      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        } catch (err) {
          console.error("Error stopping speech recognition:", err);
        }
      }
      setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error("Error in cleanup:", err);
        }
      }
    };
  }, [voiceCommandsEnabled, microphonePermission]);

  // Text-to-speech function
  const announce = useCallback((text: string) => {
    if (screenReaderEnabled && "speechSynthesis" in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      utteranceRef.current = new SpeechSynthesisUtterance(text);
      utteranceRef.current.rate = 1;
      utteranceRef.current.pitch = 1;
      utteranceRef.current.volume = 1;

      speechSynthesis.speak(utteranceRef.current);
    }
  }, [screenReaderEnabled]);

  const handleVoiceCommand = useCallback(
    (command: string) => {
      const lowerCommand = command.toLowerCase();

      if (
        lowerCommand.includes("start") &&
        (lowerCommand.includes("camera") || lowerCommand.includes("cam"))
      ) {
        announce("Starting camera");
        const button = document.querySelector(
          'button:has-text("Start Camera")'
        ) as HTMLButtonElement;
        if (button) button.click();
      } else if (lowerCommand.includes("stop") && lowerCommand.includes("camera")) {
        announce("Stopping camera");
        const button = document.querySelector(
          'button:has-text("Stop Camera")'
        ) as HTMLButtonElement;
        if (button) button.click();
      } else if (
        lowerCommand.includes("upload") ||
        lowerCommand.includes("choose")
      ) {
        announce("Opening file chooser");
        const button = document.querySelector(
          'button:has-text("Choose Files")'
        ) as HTMLButtonElement;
        if (button) button.click();
      } else {
        announce(`Command not recognized: ${command}`);
      }
    },
    [announce]
  );

  const toggleScreenReader = useCallback(() => {
    setScreenReaderEnabled((prev) => {
      const newValue = !prev;
      if (newValue) {
        announce(
          "Screen reader enabled. All buttons and descriptions will be read aloud."
        );
      }
      return newValue;
    });
  }, [announce]);

  const toggleVoiceCommands = useCallback(() => {
    if (microphonePermission === "denied") {
      setVoiceCommandError(
        "Microphone permission is denied. Please enable it in your browser settings."
      );
      announce(
        "Microphone permission is denied. Please enable it in your browser settings."
      );
      return;
    }

    setVoiceCommandsEnabled((prev) => !prev);
  }, [microphonePermission, announce]);

  const readPageDescription = useCallback(() => {
    const description = `
      Welcome to Perceva Camera Vision Analysis.
      This page has two main sections:
      Left side: Camera controls. Click Start Camera to access your device's camera.
      Right side: File upload. Click Choose Files to upload videos or images for analysis.
      Enable voice commands to interact using your voice.
    `;
    announce(description);
  }, [announce]);

  return {
    screenReaderEnabled,
    voiceCommandsEnabled,
    isListening,
    lastCommand,
    microphonePermission,
    voiceCommandError,
    announce,
    toggleScreenReader,
    toggleVoiceCommands,
    readPageDescription,
  };
}
