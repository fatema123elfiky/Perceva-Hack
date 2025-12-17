import { useRef, useState, useEffect } from "react";
import { useAccessibility } from "@/hooks/useAccessibility";
import * as tf from "@tensorflow/tfjs";
import * as coco from "@tensorflow-models/coco-ssd";

export default function CameraSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const modelRef = useRef<coco.ObjectDetection | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [cameraError, setCameraError] = useState<string>("");
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const { announce, screenReaderEnabled } = useAccessibility();

  // Cleanup function for stopping the camera
  const stopCamera = () => {
    // Stop detection interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setDetectedObjects([]);
    announce("Camera stopped");
  };

  // Load the COCO-SSD model
  const loadModel = async () => {
    try {
      setIsModelLoading(true);
      await tf.ready();
      const model = await coco.load();
      modelRef.current = model;
      setIsModelLoading(false);
    } catch (error) {
      console.error("Error loading model:", error);
      setIsModelLoading(false);
    }
  };

  // Detect objects in the camera feed
  const detectObjects = async () => {
    if (!videoRef.current || !modelRef.current) return;

    try {
      const predictions = await modelRef.current.detect(videoRef.current as HTMLImageElement | HTMLVideoElement | HTMLCanvasElement);

      if (predictions.length > 0) {
        // Group by class and get unique objects
        const uniqueClasses = new Set<string>();
        predictions.forEach((pred) => {
          uniqueClasses.add(pred.class);
        });

        const objectsList = Array.from(uniqueClasses).slice(0, 5); // Show top 5 objects
        setDetectedObjects(objectsList);

        // Announce detected objects occasionally for accessibility
        if (screenReaderEnabled && Math.random() < 0.1) {
          const objectsText = objectsList.join(", ");
          announce(`Camera is detecting: ${objectsText}`);
        }
      } else {
        setDetectedObjects([]);
      }
    } catch (error) {
      console.error("Error detecting objects:", error);
    }
  };

  // Start object detection loop
  const startDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Load model if not already loaded
    if (!modelRef.current) {
      loadModel();
    }

    detectionIntervalRef.current = window.setInterval(() => {
      detectObjects();
    }, 500); // Detect every 500ms
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoadingCamera(true);
      setCameraError("");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera is not supported in your browser.");
        setIsLoadingCamera(false);
        announce("Camera is not supported in your browser");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { min: 320, ideal: 640, max: 1920 },
          height: { min: 240, ideal: 480, max: 1080 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          // Ensure video plays once metadata is loaded
          videoRef.current?.play().catch((error) => {
            console.error("Error playing video:", error);
            setCameraError("Could not play video stream. Please try again.");
            announce("Error: Could not play video stream");
          });
        };

        // Also try to play immediately
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Video playback started successfully");
              setIsCameraActive(true);
              setIsLoadingCamera(false);
              announce("Camera is now active and displaying your video feed");
              // Start object detection
              startDetection();
            })
            .catch((error) => {
              console.error("Error playing video:", error);
              // This might be normal in some browsers, don't fail completely
              setIsCameraActive(true);
              setIsLoadingCamera(false);
              announce("Camera is now active. Analyzing video feed");
              startDetection();
            });
        }
      }
    } catch (error: unknown) {
      setIsLoadingCamera(false);
      let errorMessage = "Error: Could not access camera.";

      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
            break;
          case "NotFoundError":
            errorMessage = "No camera device found on this device.";
            break;
          case "NotReadableError":
            errorMessage = "Camera is already in use by another application. Please close other apps using the camera.";
            break;
          case "OverconstrainedError":
            errorMessage = "Camera requirements could not be met. Try relaxing constraints.";
            break;
          default:
            errorMessage = `Error: ${error.message}`;
        }
      }

      console.error("Camera error:", error);
      setCameraError(errorMessage);
      setIsCameraActive(false);
      announce(errorMessage);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).filter((file) => {
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        return isVideo || isImage;
      });

      if (newFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...newFiles]);
        announce(`${newFiles.length} file${newFiles.length !== 1 ? "s" : ""} uploaded successfully`);
      }
    }
  };

  const removeFile = (index: number) => {
    const removedFile = uploadedFiles[index];
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    announce(`File ${removedFile.name} removed`);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <h2 className="text-4xl font-bold mb-6 text-[#ff3b84] text-center" role="heading" aria-level={2}>
        Camera Vision Analysis
      </h2>
      <p className="text-center text-gray-300 mb-8" role="doc-subtitle">
        Start your camera or upload videos and images to detect objects in
        real-time.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Section */}
        <div
          className="border-2 border-dashed border-[#4e4e6f] rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px] bg-[#0a0a0c] overflow-hidden"
          role="region"
          aria-label="Camera control section"
        >
          {/* Video Container with Detection Display */}
          <div className={`w-full relative ${isCameraActive ? "block" : "hidden"}`}>
            {/* Video Element */}
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay={true}
              aria-label="Live camera feed"
              role="application"
              className="w-full rounded-lg bg-black"
              style={{ maxHeight: "360px", objectFit: "cover" }}
            />

            {/* Detection Display Overlay */}
            {detectedObjects.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 rounded-b-lg">
                <p className="text-xs text-gray-300 mb-2">Detecting:</p>
                <div className="flex flex-wrap gap-2">
                  {detectedObjects.map((obj, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-[#ff3b84] text-white text-xs rounded-full font-semibold capitalize"
                    >
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detection Status Text */}
          {isCameraActive && (
            <div className="w-full mt-4 p-3 bg-[#1b1723] rounded-lg border border-[#302839]">
              <p className="text-sm text-gray-300 text-center">
                {isModelLoading ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    Loading detection model...
                  </>
                ) : detectedObjects.length > 0 ? (
                  <>
                    <i className="fas fa-eye mr-2 text-[#a54bff]"></i>
                    Detecting: <span className="text-[#ff3b84] font-semibold">{detectedObjects.join(", ")}</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-camera mr-2"></i>
                    Camera active - Analyzing video stream
                  </>
                )}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className={`flex flex-col items-center gap-4 transition-all ${
            isCameraActive ? "mt-4" : ""
          }`}>
            {!isCameraActive && (
              <>
                <p
                  className={`text-center text-sm ${
                    cameraError ? "text-red-400" : "text-gray-300"
                  }`}
                >
                  {cameraError || "Click the button to start your camera."}
                </p>
                <button
                  onClick={startCamera}
                  disabled={isLoadingCamera}
                  aria-label="Start camera button. Press to activate your device camera."
                  className="flex items-center gap-2 bg-[#ee0979] hover:bg-[#ff6a00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-lg transition-colors"
                >
                  {isLoadingCamera ? (
                    <>
                      <i className="fas fa-spinner animate-spin" aria-hidden="true"></i>
                      Accessing Camera...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-video" aria-hidden="true"></i>
                      Start Camera
                    </>
                  )}
                </button>
              </>
            )}

            {isCameraActive && (
              <button
                onClick={stopCamera}
                aria-label="Stop camera button. Press to turn off the camera."
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
              >
                <i className="fas fa-stop" aria-hidden="true"></i>
                Stop Camera
              </button>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div
          className="border-2 border-dashed border-[#4e4e6f] rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px] bg-[#0a0a0c]"
          role="region"
          aria-label="File upload section"
        >
          <div className="text-center">
            <i className="fas fa-cloud-arrow-up text-4xl text-[#a54bff] mb-4 block" aria-hidden="true"></i>
            <p className="text-gray-300 mb-4">
              Upload videos or images for analysis
            </p>
            <button
              onClick={triggerFileInput}
              aria-label="Choose files button. Press to select videos or images from your device."
              className="flex items-center gap-2 bg-[#a54bff] hover:bg-[#8a3fbf] text-white font-bold px-6 py-3 rounded-lg transition-colors mx-auto"
            >
              <i className="fas fa-folder-open" aria-hidden="true"></i>
              Choose Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*,image/*"
              onChange={handleFileUpload}
              className="hidden"
              aria-label="File input for uploading videos and images"
            />
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div
          className="mt-8 border border-[#302839] rounded-lg p-6 bg-[#0a0a0c]"
          role="region"
          aria-label="Uploaded files list"
        >
          <h3 className="text-xl font-bold text-[#a54bff] mb-4" role="heading" aria-level={3}>
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-[#1b1723] rounded-lg border border-[#302839]"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <i
                    className={`fas ${
                      file.type.startsWith("video/")
                        ? "fa-video"
                        : "fa-image"
                    } text-[#ff3b84]`}
                  ></i>
                  <div className="min-w-0">
                    <p className="text-white truncate text-sm font-medium">
                      {file.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  aria-label={`Delete ${file.name}`}
                  className="text-red-500 hover:text-red-400 ml-4 flex-shrink-0"
                >
                  <i className="fas fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
