import Link from 'next/link';

export default function RecsPage() {
  // This data would come from your API in the future
  const recommendations = [
    { id: 1, name: "Recommendation 1", color: "blue", slug: "rec-1" },
    { id: 2, name: "Recommendation 2", color: "green", slug: "rec-2" },
    { id: 3, name: "Recommendation 3", color: "purple", slug: "rec-3" },
    { id: 4, name: "Recommendation 4", color: "orange", slug: "rec-4" },
    { id: 5, name: "Recommendation 5", color: "red", slug: "rec-5" },
  ];

  return (
    <main className="min-h-screen p-8 flex flex-col justify-center">
      <div className='flex justify-center mb-12'>
        <h1 className="text-4xl font-bold">Top 5 Recommendations</h1>
      </div>

      {/* Button Grid */}
      <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto">
        {/* First Row - 3 buttons */}
        <div className="flex gap-8 w-full justify-center">
          {recommendations.slice(0, 3).map((rec) => (
            <Link key={rec.id} href={`/recs/${rec.slug}`} className="block">
              <div className={`w-64 h-32 bg-${rec.color}-500 text-white rounded-lg hover:bg-${rec.color}-600 transition shadow-md text-lg font-semibold flex items-center justify-center cursor-pointer`}>
                {rec.name}
              </div>
            </Link>
          ))}
        </div>

        {/* Second Row - 2 buttons */}
        <div className="flex gap-8 w-full justify-center">
          {recommendations.slice(3, 5).map((rec) => (
            <Link key={rec.id} href={`/recs/${rec.slug}`} className="block">
              <div className={`w-64 h-32 bg-${rec.color}-500 text-white rounded-lg hover:bg-${rec.color}-600 transition shadow-md text-lg font-semibold flex items-center justify-center cursor-pointer`}>
                {rec.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}