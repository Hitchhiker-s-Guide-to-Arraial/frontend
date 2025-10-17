"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  image: string;
  flight_price: number;
  flight_link: string;
  meals_price: number;
  activities_price: number;
  hotel: {
    name: string;
    link: string;
    price: number;
  };
}

interface JsonDestination {
  destination: string;
  image: string;
  flight_price: number;
  flight_link: string;
  meals_price: number;
  activities_price: number;
  hotel: {
    name: string;
    link: string;
    price: number;
  };
  price_total: number;
  travelers: number;
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
      fetchJsonRecommendations();
    }
  }, []);

  const fetchJsonRecommendations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/without_destination 1.json');
      const jsonData = await response.json();
      
      const jsonRecommendations = jsonData.destinations.map((dest: JsonDestination, index: number) => ({
        id: index + 1,
        name: dest.destination.split(',')[0], // Get city name only
        description: `Perfect trip to ${dest.destination} for ${dest.travelers} travelers`,
        location: dest.destination,
        estimatedCost: dest.price_total,
        bestSeason: "All Year", // You can add this to your JSON later
        activities: ["Sightseeing", "Cultural Tours", "Local Cuisine"], // Default activities
        matchScore: Math.floor(85 + Math.random() * 15), // Random match score between 85-99
        slug: `rec-${index + 1}`,
        image: dest.image,
        flight_price: dest.flight_price,
        flight_link: dest.flight_link,
        meals_price: dest.meals_price || dest.average_meals_price || 30, // Handle both field names
        activities_price: dest.activities_price,
        hotel: dest.hotel
      }));
      
      setRecommendations(jsonRecommendations);
    } catch (error) {
      console.error('Error fetching JSON data:', error);
      // Fallback to generic recommendations if JSON fails
      setRecommendations(getGenericRecommendations());
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = async (route: string, message: string) => {
    setIsNavigating(true);
    setNavigationMessage(message);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push(route);
  };

  const generatePersonalizedRecommendations = (tripData: TripData) => {
    setIsLoading(true);
    setTimeout(() => {
      fetchJsonRecommendations(); // Use JSON data for personalized too
    }, 1500);
  };

  const getGenericRecommendations = (): Recommendation[] => [
    { 
      id: 1, 
      name: "Paris", 
      description: "City of Light", 
      location: "Paris, France", 
      estimatedCost: 750, 
      bestSeason: "Spring", 
      activities: [], 
      matchScore: 92, 
      slug: "paris",
      image: "https://img.freepik.com/fotos-gratis/bela-foto-ampla-da-torre-eiffel-em-paris-rodeada-de-agua-com-navios-sob-o-ceu-colorido_181624-5118.jpg?semt=ais_hybrid&w=740&q=80",
      flight_price: 533,
      flight_link: "https://www.skyscanner.pt/",
      meals_price: 30,
      activities_price: 200,
      hotel: {
        name: "ibis Paris Bastille Opera",
        link: "https://www.booking.com/",
        price: 649
      }
    },
    { 
      id: 2, 
      name: "Madrid", 
      description: "Vibrant Spanish capital", 
      location: "Madrid, Spain", 
      estimatedCost: 750, 
      bestSeason: "Summer", 
      activities: [], 
      matchScore: 90, 
      slug: "madrid",
      image: "https://img.freepik.com/fotos-gratis/palacio-de-cibeles-e-fonte-na-plaza-de-cibeles-em-madrid-espanha_268835-1304.jpg?semt=ais_hybrid&w=740&q=80",
      flight_price: 336,
      flight_link: "https://www.skyscanner.pt/",
      meals_price: 30,
      activities_price: 150,
      hotel: {
        name: "Hostal Central Palace Madrid",
        link: "https://www.booking.com/",
        price: 978
      }
    },
  ];

  const imgFor = (rec: Recommendation) => {
    // Use the image from JSON if available, otherwise fallback
    const image = rec.image || "/placeholder.jpg";
    
    // Fix broken Rome image
    if (image.includes("encrypted-tbn0.gstatic.com") && image.length > 500) {
      return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
    }
    
    return image;
  };

  const money = (n: number) => `${Math.round(n)}€`;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F5F7FE] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recommendations...</p>
        </div>
      </main>
    );
  }

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
              href={{
                pathname: `/recs/${rec.slug}`,
                query: {
                  name: rec.name,
                  description: rec.description,
                  location: rec.location,
                  estimatedCost: rec.estimatedCost,
                  bestSeason: rec.bestSeason,
                  activities: JSON.stringify(rec.activities),
                  matchScore: rec.matchScore,
                  // Pass all the JSON data to the detail page
                  image: rec.image,
                  flight_price: rec.flight_price.toString(),
                  flight_link: rec.flight_link,
                  meals_price: rec.meals_price.toString(),
                  activities_price: rec.activities_price.toString(),
                  hotel_name: rec.hotel.name,
                  hotel_link: rec.hotel.link,
                  hotel_price: rec.hotel.price.toString()
                }
              }}
              className="group block bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden"
            >
              {/* imagem com cantos superiores arredondados e altura ligeiramente maior */}
              <div className="relative overflow-hidden rounded-t-2xl">
                <div className="relative w-full aspect-[4/4] overflow-hidden">
                  <img
                    src={imgFor(rec)}
                    alt={rec.location}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                  />
                  {/* Match Score Badge */}
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                    {rec.matchScore}% match
                  </div>
                </div>
              </div>

              {/* barra inferior reta */}
              <div className="flex items-center justify-between px-4 py-3 bg-white">
                <div>
                  <span className="text-gray-800 font-medium block">{rec.name}</span>
                  <span className="text-gray-500 text-sm">{rec.location.split(',')[0]}</span>
                </div>
                <span className="text-gray-800 font-bold">{money(rec.estimatedCost)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}