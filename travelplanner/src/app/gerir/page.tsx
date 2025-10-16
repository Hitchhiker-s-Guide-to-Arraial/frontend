"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function GerirPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-[#F3F6FF]">
      {/* Header */}
      <header className="relative flex items-center justify-center bg-white shadow-sm py-4 px-6">
        {/* Logótipo centrado */}
        <img
          src="/logo_viajamus.svg"
          alt="Viaja Mus"
          className="h-6 w-auto"
        />

        {/* Ícone de perfil à direita */}
        <Link
          href="/profile"
          className="absolute right-6 h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          aria-label="Profile"
        >
          <img
            src="/profile.svg"
            alt="Profile icon"
            className="h-6 w-6 object-contain"
          />
        </Link>
      </header>

      {/* Conteúdo principal */}
      <div className="px-5 md:px-8 mt-6">
        {/* Saudação */}
        <section className="bg-white/80 backdrop-blur-[2px] border border-gray-100 rounded-xl shadow-sm px-4 md:px-6 py-4 md:py-5">
          <p className="text-gray-700">
            Hello,{" "}
            <span className="text-[#1E66FF] font-medium">{userName}</span>!
          </p>
        </section>

        {/* Tabs */}
        <nav className="mt-6">
          <div className="inline-flex items-center gap-4 bg-white/80 border border-gray-100 rounded-lg px-2 py-1 shadow-sm">
            <button
              className="text-sm font-medium text-[#1E66FF] bg-[#E8F0FF] rounded-md px-3 py-1"
              type="button"
            >
              My Trips
            </button>
            <button
              className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1"
              type="button"
            >
              Preferences
            </button>
          </div>
        </nav>

        {/* Cards */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Paris */}
          <Link
            href="/gastos?trip=paris"
            className="group bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src="/paris.jpg"
                alt="Paris"
                className="h-full w-full object-cover group-hover:scale-[1.02] transition"
              />
            </div>
            <div className="px-4 py-3">
              <p className="text-gray-800">Paris</p>
            </div>
          </Link>

          {/* Card Oslo */}
          <Link
            href="/gastos?trip=oslo"
            className="group bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src="/oslo.jpg"
                alt="Oslo"
                className="h-full w-full object-cover group-hover:scale-[1.02] transition"
              />
            </div>
            <div className="px-4 py-3">
              <p className="text-gray-800">Oslo</p>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}
