import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CameraSection from "@/components/CameraSection";
import AuthModal from "@/components/AuthModal";
import AccessibilityControls from "@/components/AccessibilityControls";

export default function HowWorks() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#141118] text-white">
      <Navbar onGetStartedClick={() => setIsAuthModalOpen(true)} />

      <main className="flex-1 flex items-center justify-center py-16" role="main">
        <CameraSection />
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
