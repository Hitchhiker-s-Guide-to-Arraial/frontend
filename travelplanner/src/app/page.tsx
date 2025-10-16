"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { src: "/HP1.svg", alt: "Homepage Design 1" },
    { src: "/HP2.svg", alt: "Homepage Design 2" },
    { src: "/HP3.svg", alt: "Homepage Design 3" },
  ];

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0.1]); // fades as you scroll

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center pt-24">
      {/* --- Fixed Header --- */}
      <motion.header
        style={{ opacity }}
        className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-3 bg-white shadow-md z-50 transition-opacity duration-500"
      >
        {/* Placeholder Logo (centered using absolute positioning) */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Image
            src="/logo_viajamus.svg"
            alt="Logo"
            width={150}
            height={150}
            className="object-contain"
          />
        </div>

        {/* Profile button (top-right) */}
        <div className="ml-auto">
          <button
            onClick={() => router.push("/profile")}
            className="rounded-full p-2 hover:bg-gray-100 transition"
            title="Profile"
          >
            <Image
              src="/profile.svg"
              alt="Profile"
              width={36}
              height={36}
              className="rounded-full object-contain"
            />
          </button>
        </div>
      </motion.header>

      {/* --- Carousel Section --- */}
      <section className="relative w-full max-w-5xl h-[24rem] overflow-hidden mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Image
              src={slides[currentSlide].src}
              alt={slides[currentSlide].alt}
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index
                  ? "bg-gray-600 scale-110"
                  : "bg-gray-400 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>
      </section>

      {/* --- Buttons Section --- */}
{/* --- Buttons Section --- */}
<section className="flex justify-center mt-8 px-4 w-full max-w-5xl gap-6">
  {/* --- Planear Button --- */}
  <Link
    href="/planear"
    className="flex-1 max-w-[50%] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition group"
  >
    <div className="flex flex-col h-full bg-gray-100">
      {/* Top image area */}
      <div className="relative w-full aspect-[5/3]">
        <Image
          src="/Plan.svg"
          alt="Planear"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-200">
        <span className="font-bold text-lg text-gray-800">Plan my next trip</span>
        <Image src="/arrow.svg" alt="arrow" width={20} height={20} />
      </div>
    </div>
  </Link>

  {/* --- Gerir Button --- */}
  <Link
    href="/gerir"
    className="flex-1 max-w-[50%] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition group"
  >
    <div className="flex flex-col h-full bg-gray-100">
      {/* Top image area */}
      <div className="relative w-full aspect-[5/3]">
        <Image
          src="/Manage.svg"
          alt="Gerir"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-200">
        <span className="font-bold text-lg text-gray-800">Manage my trips</span>
        <Image src="/arrow.svg" alt="arrow" width={20} height={20} />
      </div>
    </div>
  </Link>
</section>


      {/* --- Sign out button (optional bottom) --- */}
      <div className="mt-10">
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
