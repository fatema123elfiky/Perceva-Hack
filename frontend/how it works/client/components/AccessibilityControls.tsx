import { useAccessibility } from "@/hooks/useAccessibility";
import { useState } from "react";

export default function AccessibilityControls() {
  const {
    screenReaderEnabled,
    voiceCommandsEnabled,
    isListening,
    voiceCommandError,
    toggleScreenReader,
    toggleVoiceCommands,
    readPageDescription,
  } = useAccessibility();

  const [showError, setShowError] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      {/* Error Message */}
      {voiceCommandError && showError && (
        <div className="bg-red-600 text-white text-xs p-3 rounded-lg max-w-xs shadow-lg">
          <button
            onClick={() => setShowError(false)}
            className="float-right text-lg font-bold hover:text-gray-200"
          >
            ✕
          </button>
          <p className="pr-6">{voiceCommandError}</p>
          <p className="text-xs mt-2 opacity-80">
            To fix: Go to browser settings → Privacy → Microphone → Allow this site
          </p>
        </div>
      )}

      {/* Screen Reader Toggle */}
      <button
        onClick={toggleScreenReader}
        aria-pressed={screenReaderEnabled}
        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold transition-all shadow-lg ${
          screenReaderEnabled
            ? "bg-[#a54bff] text-white"
            : "bg-gray-600 text-white hover:bg-gray-700"
        }`}
        title="Enable/Disable Screen Reader"
      >
        <i className={`fas ${screenReaderEnabled ? "fa-volume-high" : "fa-volume-mute"}`}></i>
        <span className="hidden sm:inline">
          {screenReaderEnabled ? "Reader On" : "Reader Off"}
        </span>
      </button>

      {/* Voice Commands Toggle */}
      <button
        onClick={() => {
          if (voiceCommandError) {
            setShowError(true);
          }
          toggleVoiceCommands();
        }}
        aria-pressed={voiceCommandsEnabled}
        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold transition-all shadow-lg ${
          voiceCommandsEnabled
            ? isListening
              ? "bg-red-600 text-white animate-pulse"
              : "bg-[#ff3b84] text-white"
            : voiceCommandError
            ? "bg-orange-600 text-white hover:bg-orange-700"
            : "bg-gray-600 text-white hover:bg-gray-700"
        }`}
        title={
          voiceCommandError
            ? "Microphone permission required"
            : "Enable/Disable Voice Commands"
        }
      >
        <i
          className={`fas ${
            isListening
              ? "fa-microphone"
              : voiceCommandError
              ? "fa-microphone-slash"
              : "fa-microphone-slash"
          }`}
        ></i>
        <span className="hidden sm:inline">
          {voiceCommandsEnabled ? (isListening ? "Listening..." : "Voice On") : "Voice Off"}
        </span>
      </button>

      {/* Read Description Button */}
      <button
        onClick={readPageDescription}
        className="flex items-center gap-2 px-4 py-3 rounded-lg font-bold bg-[#4e4e6f] text-white hover:bg-[#6a6a8f] transition-all shadow-lg"
        title="Read Page Description"
      >
        <i className="fas fa-info-circle"></i>
        <span className="hidden sm:inline">Info</span>
      </button>

      {/* Accessibility Info */}
      <div className="text-xs text-gray-300 text-center">
        <p>Accessibility</p>
        <p>Controls</p>
      </div>
    </div>
  );
}
