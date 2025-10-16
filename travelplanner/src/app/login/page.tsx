"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ✅ Helper: Hash password using SHA-256 (same as in register page)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

   try {
      // ✅ Hash password before sending
      const hashedPassword = await hashPassword(password);

      // ✅ Send credentials to backend /api/login
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: hashedPassword, // hashed version
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      // ✅ Optionally save token to localStorage or cookie
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // ✅ Redirect after successful login
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-100">
      {/* Left column: form */}
      <div className="w-full lg:w-[45%] relative flex flex-col justify-center items-center px-8 lg:px-20 bg-white">
        {/* Logo */}
        <div
          className="
            absolute 
            top-5 
            left-1/2 
            -translate-x-1/2 
            lg:left-8 lg:translate-x-0 
            flex items-center gap-2
          "
        >
          <img
            src="/logo_viajamus.svg"
            alt="Viaja Mus"
            className="h-5 lg:h-6 w-auto"
          />
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="text-3xl text-black font-semibold mb-8 mt-12 lg:mt-0">
            Sign in
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E66FF]"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E66FF]"
              required
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center text-gray-600 text-sm">
              <input type="checkbox" className="mr-2 accent-[#1E66FF]" />
              Keep me logged in
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1E66FF] text-white py-2.5 px-4 rounded-md hover:bg-[#1557E5] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          {/* Divider “or” */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-3 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <p className="text-gray-600 text-sm text-center">
            Need an account?{" "}
            <a href="/register" className="text-[#1E66FF] hover:underline">
              Create one
            </a>
          </p>
        </form>
      </div>

      {/* Right column: image */}
      <div className="hidden lg:block w-[60%] relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/loginBanner.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
      </div>
    </div>
  );
}
