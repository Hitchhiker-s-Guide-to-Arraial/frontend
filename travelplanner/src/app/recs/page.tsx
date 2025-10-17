"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, User, FolderOpen } from "lucide-react";

interface TripData {
  departure: string;
  destination: string;
  differentContinent: boolean;
  travelers: number;
  startDate?: Date;
  endDate?: Date;
  duration?: number;
  activities: string[];
  budget: number;
  travelStyle: string;
}

interface Recommendation {
  id: number;
  name: string;
  description: string;
  location: string;
  estimatedCost: number;
  bestSeason: string;
  activities: string[];
  matchScore: number;
  slug: string;
}

export default function RecsPage() {
  const router = useRouter();
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationMessage, setNavigationMessage] = useState("");

  useEffect(() => {
    const storedTripData = localStorage.getItem("currentTripData");
    if (storedTripData) {
      const parsedData = JSON.parse(storedTripData);
      setTripData(parsedData);
      generatePersonalizedRecommendations(parsedData);
    } else {
      setIsLoading(false);
      setRecommendations(getGenericRecommendations());
    }
  }, []);

  const handleNavigation = async (route: string, message: string) => {
    setIsNavigating(true);
    setNavigationMessage(message);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push(route);
  };

  const generatePersonalizedRecommendations = (tripData: TripData) => {
    setIsLoading(true);
    setTimeout(() => {
      const personalizedRecs = getPersonalizedRecommendations(tripData);
      setRecommendations(personalizedRecs);
      setIsLoading(false);
    }, 1500);
  };

  const getPersonalizedRecommendations = (tripData: TripData): Recommendation[] => {
    const baseRecommendations = [
      {
        id: 1,
        name: "Cultural City Escape",
        description: `Perfect for ${tripData.travelers} travelers from ${tripData.departure} looking for ${tripData.activities.join(", ")}`,
        location: tripData.destination !== "flexible" ? tripData.destination : "Lisbon, Portugal",
        estimatedCost: tripData.budget * 0.8,
        bestSeason: "Spring/Fall",
        activities: tripData.activities.slice(0, 3),
        matchScore: 95,
        slug: "rec-1",
      },
      {
        id: 2,
        name: "Adventure Getaway",
        description: `Tailored for your ${tripData.duration || 7}-day trip with focus on ${tripData.activities[0] || "adventure"}`,
        location: tripData.differentContinent ? "Bali, Indonesia" : "Algarve, Portugal",
        estimatedCost: tripData.budget * 0.6,
        bestSeason: "Summer",
        activities: ["Adventure Sports", "Nature", ...tripData.activities.filter((a) => a !== "Adventure Sports")],
        matchScore: 88,
        slug: "rec-2",
      },
      {
        id: 3,
        name: "Relaxing Beach Retreat",
        description: `Ideal ${tripData.travelStyle} vacation from ${tripData.departure} within your €${tripData.budget} budget`,
        location: "Algarve, Portugal",
        estimatedCost: tripData.budget * 0.7,
        bestSeason: "Summer",
        activities: ["Beach", "Relaxation", "Food & Dining"],
        matchScore: 82,
        slug: "rec-3",
      },
      {
        id: 4,
        name: "Mountain Exploration",
        description: `Based on your interest in ${tripData.activities.join(" and ")} for ${tripData.travelers} people`,
        location: "Serra da Estrela, Portugal",
        estimatedCost: tripData.budget * 0.5,
        bestSeason: "All Year",
        activities: ["Hiking", "Nature", "Photography"],
        matchScore: 78,
        slug: "rec-4",
      },
      {
        id: 5,
        name: "Historic Tour",
        description: `Cultural journey perfect for your ${tripData.duration || 5}-day itinerary`,
        location: "Porto, Portugal",
        estimatedCost: tripData.budget * 0.9,
        bestSeason: "Spring/Fall",
        activities: ["City Tours", "Museums", "Cultural Events"],
        matchScore: 85,
        slug: "rec-5",
      },
    ];
    return baseRecommendations;
  };

  const getGenericRecommendations = (): Recommendation[] => [
    { id: 1, name: "Paris", description: "City of Light", location: "Paris", estimatedCost: 750, bestSeason: "Spring", activities: [], matchScore: 92, slug: "paris" },
    { id: 2, name: "Oslo", description: "Nordic charm", location: "Oslo", estimatedCost: 750, bestSeason: "Summer", activities: [], matchScore: 90, slug: "oslo" },
    { id: 3, name: "Scotland", description: "Castles and nature", location: "Scotland", estimatedCost: 870, bestSeason: "Summer", activities: [], matchScore: 88, slug: "scotland" },
    { id: 4, name: "Greece", description: "Beaches and ruins", location: "Greece", estimatedCost: 900, bestSeason: "Summer", activities: [], matchScore: 87, slug: "greece" },
    { id: 5, name: "Rome", description: "Ancient city", location: "Rome", estimatedCost: 950, bestSeason: "Spring", activities: [], matchScore: 89, slug: "rome" },
    { id: 6, name: "Berlin", description: "Modern culture", location: "Berlin", estimatedCost: 999, bestSeason: "All Year", activities: [], matchScore: 86, slug: "berlin" },
  ];

  const imgFor = (loc: string) => {
    const key = loc.toLowerCase();
    if (key.includes("paris")) return "/paris2.jpg";
    if (key.includes("oslo")) return "/oslo.jpg";
    if (key.includes("scotland")) return "/scotland.jpg";
    if (key.includes("greece")) return "/greece.jpg";
    if (key.includes("rome")) return "/rome.jpg";
    if (key.includes("berlin")) return "/berlin.jpg";
    return "/placeholder.jpg";
  };

  const money = (n: number) => `${Math.round(n)}€`;

  return (
    <main className="min-h-screen bg-[#F5F7FE]">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm">
        <div className="relative h-14 px-4 md:px-6 flex items-center justify-center">
          <button
            onClick={() => router.back()}
            className="absolute left-4 md:left-6 h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            aria-label="Back"
          >
            <img
              src="/back.svg"
              alt="Go Back"
              className="h-5 w-5 md:h-6 md:w-6 object-contain"
            />
          </button>
          <img src="/logo_viajamus.svg" alt="Viaja Mus" className="h-5 md:h-6 w-auto" />
          <button
            onClick={() => handleNavigation("/profile", "Going to your profile...")}
            className="absolute right-4 md:right-6 h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Profile"
          >
            <img src="/profile.svg" alt="Profile" className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <h2 className="text-2xl md:text-[28px] font-semibold text-gray-900 mb-6">Top recommendations</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <Link
              key={rec.id}
              href={`/recs/${rec.slug}`}
              className="group block bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden"
            >
              {/* imagem com cantos superiores arredondados e altura ligeiramente maior */}
              <div className="relative overflow-hidden rounded-t-2xl">
                <div className="relative w-full aspect-[4/4]"> {/* ligeiramente mais alto */}
                  <Image
                    src={imgFor(rec.location)}
                    alt={rec.location}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </div>

              {/* barra inferior reta */}
              <div className="flex items-center justify-between px-4 py-3 bg-white">
                <span className="text-gray-800">{rec.name}</span>
                <span className="text-gray-800 font-medium">{money(rec.estimatedCost)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
