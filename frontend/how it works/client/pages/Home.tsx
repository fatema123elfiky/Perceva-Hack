import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import AccessibilityControls from "@/components/AccessibilityControls";

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#141118] text-white">
      <Navbar onGetStartedClick={() => setIsAuthModalOpen(true)} />

      <main className="flex-1 flex items-center justify-center" role="main">
        <div className="text-center max-w-3xl px-4 py-20">
          <h1 className="text-6xl md:text-7xl font-black mb-6 animated-gradient">
            Perceva
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Advanced Computer Vision & Object Detection Platform
          </p>
          <p className="text-gray-400 mb-12 text-lg">
            Transform how you analyze visual data with real-time camera vision
            analysis and intelligent object detection.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="gradient-btn text-white font-bold px-8 py-3 rounded-lg transition-all"
            >
              Get Started
            </button>
            <Link
              to="/how"
              className="border-2 border-[#a54bff] text-white font-bold px-8 py-3 rounded-lg hover:bg-[#a54bff] hover:bg-opacity-10 transition-all"
            >
              Learn More
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 bg-[#0a0a0c] rounded-lg border border-[#302839]">
              <i className="fas fa-camera text-3xl text-[#ff3b84] mb-4 block"></i>
              <h3 className="text-lg font-bold mb-2">Real-time Analysis</h3>
              <p className="text-gray-400 text-sm">
                Analyze video streams and images in real-time with powerful
                detection algorithms
              </p>
            </div>

            <div className="p-6 bg-[#0a0a0c] rounded-lg border border-[#302839]">
              <i className="fas fa-brain text-3xl text-[#a54bff] mb-4 block"></i>
              <h3 className="text-lg font-bold mb-2">AI-Powered</h3>
              <p className="text-gray-400 text-sm">
                Leverage cutting-edge machine learning for accurate object
                detection and classification
              </p>
            </div>

            <div className="p-6 bg-[#0a0a0c] rounded-lg border border-[#302839]">
              <i className="fas fa-bolt text-3xl text-[#ff3b84] mb-4 block"></i>
              <h3 className="text-lg font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">
                Get instant results with our optimized processing engine
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <AccessibilityControls />
    </div>
  );
}
