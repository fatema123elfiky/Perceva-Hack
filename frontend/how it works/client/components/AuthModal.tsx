import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle authentication logic here
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-[#1b1723] p-8 rounded-2xl w-[90%] max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-[#a54bff]">
          {isLogin ? "Log In" : "Sign Up"}
        </h2>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              className="p-2 rounded bg-[#211c27] border border-[#473b54] focus:outline-none focus:ring-2 focus:ring-[#a54bff] text-white placeholder-gray-400"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="p-2 rounded bg-[#211c27] border border-[#473b54] focus:outline-none focus:ring-2 focus:ring-[#a54bff] text-white placeholder-gray-400"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="p-2 rounded bg-[#211c27] border border-[#473b54] focus:outline-none focus:ring-2 focus:ring-[#a54bff] text-white placeholder-gray-400"
          />

          <button
            type="submit"
            className="gradient-btn py-2 rounded-lg font-bold mt-2 text-white"
          >
            Continue
          </button>
        </form>

        <p className="text-sm text-[#b9a9cc] mt-4 text-center">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#ff3b84] hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>

        <p className="text-xs text-[#9b8cab] mt-2 text-center">
          <button onClick={() => {}} className="hover:text-[#ff3b84]">
            Forgot your password?
          </button>
        </p>
      </div>
    </div>
  );
}
