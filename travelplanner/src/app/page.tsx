"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { src: "/HP1.svg", alt: "Homepage Design 1" },
    { src: "/HP2.svg", alt: "Homepage Design 2" },
    { src: "/HP3.svg", alt: "Homepage Design 3" },
  ];

  // ciclo automático de slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // redireciona se não estiver autenticado
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1E66FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-[#F5F7FE] flex flex-col items-center">
      {/* HEADER – igual ao da página "Gerir" */}
      <header className="relative flex items-center justify-center bg-white shadow-sm py-4 px-6 w-full">
        {/* Logótipo centrado */}
        <img
          src="/logo_viajamus.svg"
          alt="Viaja Mus"
          className="h-6 w-auto"
        />

        {/* Ícone de perfil à direita */}
        <button
          onClick={() => router.push("/profile")}
          className="absolute right-6 h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
          title="Profile"
        >
          <img
            src="/profile.svg"
            alt="Profile"
            className="h-6 w-6 object-contain"
          />
        </button>
      </header>

      {/* BANNER com o mesmo comportamento do anterior */}
      <section className="w-full max-w-6xl px-4 mt-6">
        <div
          className="relative rounded-2xl overflow-hidden shadow-md bg-gray-200"
          style={{ height: "24rem" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <Image
                src={slides[currentSlide].src}
                alt={slides[currentSlide].alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === index
                    ? "bg-white ring-2 ring-black/20"
                    : "bg-white/70 hover:bg-white"
                }`}
                aria-label={`Ir para o slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Cartões inferiores */}
      <section className="w-full max-w-6xl px-4 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Planear */}
        <Link
          href="/planear"
          className="group block rounded-xl bg-white shadow-md hover:shadow-lg transition"
        >
          <div className="p-4">
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
              <Image
                src="/Plan.svg"
                alt="Planear"
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
            <div className="flex items-center justify-between px-1 mt-3">
              <span className="font-semibold text-gray-800">
                Plan my next trip
              </span>
              <Image src="/arrow.svg" alt="arrow" width={20} height={20} />
            </div>
          </div>
        </Link>

        {/* Gerir */}
        <Link
          href="/gerir"
          className="group block rounded-xl bg-white shadow-md hover:shadow-lg transition"
        >
          <div className="p-4">
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
              <Image
                src="/Manage.svg"
                alt="Gerir"
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
            <div className="flex items-center justify-between px-1 mt-3">
              <span className="font-semibold text-gray-800">
                Manage my trips
              </span>
              <Image src="/arrow.svg" alt="arrow" width={20} height={20} />
            </div>
          </div>
        </Link>
      </section>

      {/* Sign out */}
      <div className="mt-10 mb-10">
        <button
          onClick={() => signOut()}
          className="text-sm text-gray-600 hover:text-red-600 transition"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
