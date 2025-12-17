export default function Footer() {
  return (
    <footer className="border-t border-[#302839] py-8 text-center text-[#ab9db9] bg-[#141118]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              className="text-[#ab9db9] hover:text-[#ff3b84] transition-colors"
              href="#privacy"
            >
              Privacy Policy
            </a>
            <a
              className="text-[#ab9db9] hover:text-[#ff3b84] transition-colors"
              href="#terms"
            >
              Terms of Service
            </a>
            <a
              className="text-[#ab9db9] hover:text-[#ff3b84] transition-colors"
              href="#contact"
            >
              Contact Us
            </a>
          </div>
          <p className="text-[#ab9db9]">© 2025 Perceva. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
