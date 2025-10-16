import Link from 'next/link';


export default function GerirPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Gerir page</h1>

      <Link href="/gastos" className="block mt-6">
        <button className="w-full bg-blue-500 text-white rounded-lg py-3 px-4 hover:bg-blue-600 transition shadow-md">
          Trip Card's placeholder
        </button>
      </Link>


    </main>
  );
}
