import { Link } from "react-router-dom";
import { useState } from "react";

interface NavbarProps {
  onGetStartedClick?: () => void;
}

export default function Navbar({ onGetStartedClick }: NavbarProps) {
  return (
    <header
      className="flex items-center justify-between border-b border-[#302839] px-10 py-4 sticky top-0 z-50 bg-[#141118]"
      role="banner"
    >
      <Link
        to="/"
        className="flex items-center gap-3 text-white no-underline"
        aria-label="Perceva Home"
      >
        <h1 className="flex items-center gap-3 text-3xl md:text-4xl font-black tracking-tight animated-gradient">
          <i className="fas fa-eye" aria-hidden="true"></i>
          Perceva
        </h1>
      </Link>

      <nav className="hidden md:flex items-center gap-8 text-base font-medium" role="navigation" aria-label="Main navigation">
        <Link
          to="/"
          className="text-white hover:text-[#ff3b84] transition-colors"
          aria-label="Navigate to home page"
        >
          Home
        </Link>
        <a
          href="#mission"
          className="text-white hover:text-[#ff3b84] transition-colors"
          aria-label="Navigate to our mission section"
        >
          Our Mission
        </a>
        <Link
          to="/how"
          className="text-white hover:text-[#ff3b84] transition-colors"
          aria-label="Navigate to how it works page"
        >
          How It Works
        </Link>
        <a
          href="#products"
          className="text-white hover:text-[#ff3b84] transition-colors"
          aria-label="Navigate to products section"
        >
          Products
        </a>
        <a
          href="#contact"
          className="text-white hover:text-[#ff3b84] transition-colors"
          aria-label="Navigate to contact section"
        >
          Contact
        </a>
      </nav>

      <button
        onClick={onGetStartedClick}
        aria-label="Get started with Perceva. Opens sign up form."
        className="gradient-btn text-white font-bold px-6 py-2 rounded-lg transition-all"
      >
        Get Started
      </button>
    </header>
  );
}
