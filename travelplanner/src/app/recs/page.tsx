"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    // Get trip data from localStorage
    const storedTripData = localStorage.getItem('currentTripData');
    if (storedTripData) {
      const parsedData = JSON.parse(storedTripData);
      setTripData(parsedData);
      
      // Generate personalized recommendations based on trip data
      generatePersonalizedRecommendations(parsedData);
    } else {
      setIsLoading(false);
      // If no trip data, show generic recommendations
      setRecommendations(getGenericRecommendations());
    }
  }, []);

  const handleNavigation = async (route: string, message: string) => {
    setIsNavigating(true);
    setNavigationMessage(message);
    
    // Wait 1 second before navigating
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push(route);
  };

  const generatePersonalizedRecommendations = (tripData: TripData) => {
    setIsLoading(true);
    
    // Simulate API call to backend/LLM
    setTimeout(() => {
      const personalizedRecs = getPersonalizedRecommendations(tripData);
      setRecommendations(personalizedRecs);
      setIsLoading(false);
    }, 1500); // Simulate loading time
  };

  const getPersonalizedRecommendations = (tripData: TripData): Recommendation[] => {
    // This is where you would integrate with your actual backend/LLM
    // For now, we'll simulate personalized recommendations based on the trip data
    
    const baseRecommendations = [
      {
        id: 1,
        name: "Cultural City Escape",
        description: `Perfect for ${tripData.travelers} travelers from ${tripData.departure} looking for ${tripData.activities.join(', ')}`,
        location: tripData.destination !== 'flexible' ? tripData.destination : "Lisbon, Portugal",
        estimatedCost: tripData.budget * 0.8,
        bestSeason: "Spring/Fall",
        activities: tripData.activities.slice(0, 3),
        matchScore: 95,
        slug: "rec-1"
      },
      {
        id: 2,
        name: "Adventure Getaway",
        description: `Tailored for your ${tripData.duration || 7}-day trip with focus on ${tripData.activities[0] || 'adventure'}`,
        location: tripData.differentContinent ? "Bali, Indonesia" : "Algarve, Portugal",
        estimatedCost: tripData.budget * 0.6,
        bestSeason: "Summer",
        activities: ["Adventure Sports", "Nature", ...tripData.activities.filter(a => a !== 'Adventure Sports')],
        matchScore: 88,
        slug: "rec-2"
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
        slug: "rec-3"
      },
      {
        id: 4,
        name: "Mountain Exploration",
        description: `Based on your interest in ${tripData.activities.join(' and ')} for ${tripData.travelers} people`,
        location: "Serra da Estrela, Portugal",
        estimatedCost: tripData.budget * 0.5,
        bestSeason: "All Year",
        activities: ["Hiking", "Nature", "Photography"],
        matchScore: 78,
        slug: "rec-4"
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
        slug: "rec-5"
      }
    ];

    return baseRecommendations;
  };

  const getGenericRecommendations = (): Recommendation[] => {
    return [
      {
        id: 1,
        name: "Beach Paradise",
        description: "Relaxing beach vacation with stunning ocean views",
        location: "Algarve, Portugal",
        estimatedCost: 1200,
        bestSeason: "Summer",
        activities: ["Beach", "Swimming", "Relaxation"],
        matchScore: 75,
        slug: "rec-1"
      },
      {
        id: 2,
        name: "City Explorer",
        description: "Urban adventure through historic city centers",
        location: "Lisbon, Portugal",
        estimatedCost: 1500,
        bestSeason: "Spring/Fall",
        activities: ["City Tours", "Museums", "Food & Dining"],
        matchScore: 70,
        slug: "rec-2"
      },
      {
        id: 3,
        name: "Mountain Retreat",
        description: "Peaceful getaway in the mountains",
        location: "Serra da Estrela, Portugal",
        estimatedCost: 800,
        bestSeason: "All Year",
        activities: ["Hiking", "Nature", "Photography"],
        matchScore: 65,
        slug: "rec-3"
      },
      {
        id: 4,
        name: "Cultural Journey",
        description: "Immerse yourself in local culture and traditions",
        location: "Porto, Portugal",
        estimatedCost: 1100,
        bestSeason: "Spring/Fall",
        activities: ["Cultural Events", "Museums", "Food & Dining"],
        matchScore: 72,
        slug: "rec-4"
      },
      {
        id: 5,
        name: "Adventure Seekers",
        description: "Thrilling activities for the adventurous soul",
        location: "Azores, Portugal",
        estimatedCost: 1800,
        bestSeason: "Summer",
        activities: ["Adventure Sports", "Hiking", "Nature"],
        matchScore: 68,
        slug: "rec-5"
      }
    ];
  };

  // Full page loading splash for navigation
  if (isNavigating) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Taking you there...</h2>
          <p className="text-gray-600">{navigationMessage}</p>
        </div>
      </div>
    );
  }

  // Original loading state for recommendations
  if (isLoading) {
    return (
      <main className="min-h-screen p-8 flex flex-col justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Creating Your Personalized Recommendations</h2>
          <p className="text-gray-600">Analyzing your trip preferences...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header with trip summary */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {tripData ? "Your Personalized Recommendations" : "Top 5 Recommendations"}
          </h1>
          {tripData && (
            <div className="bg-white rounded-lg p-6 shadow-sm max-w-2xl mx-auto mb-6">
              <p className="text-lg text-gray-700 mb-2">
                Based on your trip from <strong>{tripData.departure}</strong>{" "}
                {tripData.destination !== 'flexible' && `to ${tripData.destination}`}
                {tripData.destination === 'flexible' && tripData.differentContinent && 'to international destinations'}
                {tripData.destination === 'flexible' && !tripData.differentContinent && 'within the region'}
              </p>
              <div className="flex justify-center gap-6 text-sm text-gray-600">
                <span>👥 {tripData.travelers} travelers</span>
                <span>💰 €{tripData.budget} budget</span>
                {tripData.duration && <span>📅 {tripData.duration} days</span>}
                {tripData.activities.length > 0 && <span>🎯 {tripData.activities.length} activities</span>}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Moved to top */}
        <div className="flex justify-center gap-4 mb-12">
          <Button 
            onClick={() => handleNavigation("/profile", "Going to your profile...")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            My Profile
          </Button>
          <Button 
            onClick={() => handleNavigation("/", "Going home...")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home Page
          </Button>
          <Button 
            onClick={() => handleNavigation("/gerir", "Managing your trips...")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            Manage Trips
          </Button>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <div key={rec.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Match Score Badge */}
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {rec.matchScore}% Match
              </div>
              
              {/* Recommendation Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">{rec.location}</div>
                  <div className="text-sm opacity-90">{rec.bestSeason}</div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{rec.name}</h3>
                <p className="text-gray-600 mb-4">{rec.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Estimated Cost:</span>
                    <span className="font-semibold">€{rec.estimatedCost}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-semibold">{rec.location}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">Activities:</div>
                  <div className="flex flex-wrap gap-1">
                    {rec.activities.slice(0, 3).map((activity, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {activity}
                      </span>
                    ))}
                    {rec.activities.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        +{rec.activities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={{
                    pathname: `/recs/${rec.slug}`,
                    query: {
                      name: rec.name,
                      description: rec.description,
                      location: rec.location,
                      estimatedCost: rec.estimatedCost,
                      bestSeason: rec.bestSeason,
                      activities: JSON.stringify(rec.activities),
                      matchScore: rec.matchScore
                    }
                  }}
                  className="block"
                >
                  <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}