"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-100">
      {/* Coluna esquerda: formulário */}
      <div className="w-full lg:w-[45%] relative flex flex-col justify-center items-center px-8 lg:px-20 bg-white">
        {/* --- LOGÓTIPO --- */}
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
            className="w-full bg-[#1E66FF] text-white py-2.5 px-4 rounded-md hover:bg-[#1557E5] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Sign in
          </button>

          {/* Linha “or” */}
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

      {/* Coluna direita: imagem */}
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
