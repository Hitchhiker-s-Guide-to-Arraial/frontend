"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      // Register the user
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      console.log("Registration successful, attempting auto-login...");

      const result = await signIn("credentials", {
        name,
        email,
        password,
        redirect: false,
      });

      console.log("Login result:", result);

      if (result?.error) {
        console.log("Login error details:", result.error);
        setError("Registration successful but login failed. Please try logging in manually.");
        // Optional: Redirect to login page instead of showing error
        // setTimeout(() => router.push("/login"), 2000);
      } else {
        console.log("Auto-login successful, redirecting to home...");
        router.push("/");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-100">
      {/* Coluna esquerda: formulário (visual igual ao login) */}
      <div className="w-full lg:w-[45%] relative flex flex-col justify-center items-center px-8 lg:px-20 bg-white pt-16 lg:pt-0">
        {/* Logótipo — centrado em mobile, à esquerda em desktop */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 lg:left-8 lg:translate-x-0">
          <img src="/logo_viajamus.svg" alt="Viaja Mus" className="h-5 lg:h-6 w-auto" />
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-8 text-left text-black">Create Account</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#1E66FF]"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#1E66FF]"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#1E66FF]"
              required
              minLength={6}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#1E66FF]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1E66FF] text-white py-2.5 px-4 rounded-md hover:bg-[#1557E5] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Divider “or” (igual ao login) */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-3 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-[#1E66FF] hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* Coluna direita: imagem (igual ao login, sem bordas arredondadas) */}
      <div className="hidden lg:block w-[60%] relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/loginBanner.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>
    </div>
  );
}
