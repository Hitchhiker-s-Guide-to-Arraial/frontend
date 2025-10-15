"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome, {session.user?.name}!</h1>
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </div>

        
        <div className="flex flex-col bg-gray-400">
          <div className="h-56 bg-gray-600">
            Banner
          </div>

          <div className="flex justify-center mt-4 p-4"> {/* Changed to justify-center instead of flex-row */}
            <div className="flex gap-4 w-full max-w-2xl"> {/* Container with max width and gap */}
              <div className="flex-1">
                <Link href="/planear" className="block">
                <button className="w-full bg-blue-500 text-white rounded-lg py-3 px-4 hover:bg-blue-600 transition shadow-md">
                  Planear
                </button>
                </Link>
              </div>

              <div className="flex-1">
                <button className="w-full bg-green-500 text-white rounded-lg py-3 px-4 hover:bg-green-600 transition shadow-md">
                  Gerir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}