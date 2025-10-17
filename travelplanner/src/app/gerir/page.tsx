"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

interface SavedRecommendation {
  id: string;
  name: string;
  description: string;
  location: string;
  estimatedCost: number;
  bestSeason: string;
  activities: string[];
  matchScore: number;
  slug: string;
  // ADD PRICING DATA:
  pricing?: {
    flights: number;
    activities: number;
    stay: number;
    meals: number;
  };
  // Additional fields from when it was saved
  departure?: string;
  travelers?: string;
  budget?: string;
  duration?: number;
  savedAt: Date;
}

export default function GerirPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";
  const [savedRecommendations, setSavedRecommendations] = useState<SavedRecommendation[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSavedRecommendations();
  }, []);

  const loadSavedRecommendations = () => {
    const saved = localStorage.getItem('savedRecommendations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter out any invalid recommendations and ensure they have required fields
        const validRecommendations = parsed.filter((rec: any) => 
          rec && rec.id && rec.name && rec.location
        );
        setSavedRecommendations(validRecommendations);
      } catch (error) {
        console.error('Error loading saved recommendations:', error);
        setSavedRecommendations([]);
      }
    }
  };

  const removeRecommendation = (recommendationId: string) => {
    const updatedRecommendations = savedRecommendations.filter(rec => rec.id !== recommendationId);
    setSavedRecommendations(updatedRecommendations);
    localStorage.setItem('savedRecommendations', JSON.stringify(updatedRecommendations));
  };

  const clearAllRecommendations = () => {
    setSavedRecommendations([]);
    localStorage.removeItem('savedRecommendations');
  };

  const handleImageError = (recommendationId: string, imageSrc: string) => {
    setFailedImages(prev => new Set(prev).add(imageSrc));
  };

  // Safe function to get location with fallback
  const getSafeLocation = (recommendation: SavedRecommendation) => {
    return recommendation?.location || recommendation?.name || 'Unknown Location';
  };

  // Function to get a placeholder image based on recommendation
  const getPlaceholderImage = (recommendation: SavedRecommendation) => {
    if (!recommendation) return null;
    
    const locationLower = getSafeLocation(recommendation).toLowerCase();
    
    // Check for specific locations first
    if (locationLower.includes('paris') && !failedImages.has('/paris.jpg')) return '/paris.jpg';
    if (locationLower.includes('oslo') && !failedImages.has('/oslo.jpg')) return '/oslo.jpg';
    if (locationLower.includes('lisbon') && !failedImages.has('/lisbon.jpg')) return '/lisbon.jpg';
    if (locationLower.includes('portugal') && !failedImages.has('/lisbon.jpg')) return '/lisbon.jpg';
    if (locationLower.includes('bali') && !failedImages.has('/bali.jpg')) return '/bali.jpg';
    if (locationLower.includes('indonesia') && !failedImages.has('/bali.jpg')) return '/bali.jpg';
    if (locationLower.includes('algarve') && !failedImages.has('/beach.jpg')) return '/beach.jpg';
    if ((locationLower.includes('serra') || locationLower.includes('estrela')) && !failedImages.has('/mountain.jpg')) return '/mountain.jpg';
    if (locationLower.includes('porto') && !failedImages.has('/city.jpg')) return '/city.jpg';
    if (locationLower.includes('azores') && !failedImages.has('/mountain.jpg')) return '/mountain.jpg';
    
    // Then check by activities
    const activities = recommendation.activities || [];
    if (activities.some(activity => 
      ['Beach', 'Swimming', 'Relaxation'].includes(activity)) && !failedImages.has('/beach.jpg')
    ) return '/beach.jpg';
    
    if (activities.some(activity => 
      ['Hiking', 'Mountain', 'Nature', 'Adventure Sports'].includes(activity)) && !failedImages.has('/mountain.jpg')
    ) return '/mountain.jpg';
    
    if (activities.some(activity => 
      ['City Tours', 'Museums', 'Cultural Events', 'Shopping', 'Nightlife'].includes(activity)) && !failedImages.has('/city.jpg')
    ) return '/city.jpg';
    
    // If all else fails, use gradient placeholder
    return null;
  };

  // Gradient color based on recommendation type
  const getGradientColor = (recommendation: SavedRecommendation) => {
    if (!recommendation) return 'from-blue-500 to-purple-400';
    
    const locationLower = getSafeLocation(recommendation).toLowerCase();
    const activities = recommendation.activities || [];
    
    if (locationLower.includes('beach') || activities.includes('Beach')) 
      return 'from-blue-400 to-cyan-300';
    if (locationLower.includes('mountain') || activities.includes('Hiking')) 
      return 'from-green-500 to-emerald-400';
    if (locationLower.includes('city') || activities.includes('City Tours')) 
      return 'from-purple-500 to-pink-400';
    
    return 'from-blue-500 to-purple-400';
  };

  // Safe function to get recommendation name
  const getSafeName = (recommendation: SavedRecommendation) => {
    return recommendation?.name || 'Unnamed Trip';
  };

  // Safe function to get estimated cost
  const getSafeCost = (recommendation: SavedRecommendation) => {
    return recommendation?.estimatedCost || 0;
  };

  // Safe function to get match score
  const getSafeMatchScore = (recommendation: SavedRecommendation) => {
    return recommendation?.matchScore || 0;
  };

  // Safe function to get activities
  const getSafeActivities = (recommendation: SavedRecommendation) => {
    return recommendation?.activities || [];
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-[#F3F6FF]">
      {/* Header */}
      <header className="relative flex items-center justify-center bg-white shadow-sm py-4 px-6">
        <img
          src="/logo_viajamus.svg"
          alt="Viaja Mus"
          className="h-6 w-auto"
        />

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
          <div className="flex justify-between items-center">
            <p className="text-gray-700">
              Hello,{" "}
              <span className="text-[#1E66FF] font-medium">{userName}</span>!
            </p>
            {savedRecommendations.length > 0 && (
              <button
                onClick={clearAllRecommendations}
                className="text-sm text-red-500 hover:text-red-600 transition"
              >
                Clear All
              </button>
            )}
          </div>
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
          </div>
        </nav>

        {/* Cards */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedRecommendations.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips saved yet</h3>
              <p className="text-gray-500 mb-4">Add recommendations from the details page to see them here</p>
            </div>
          ) : (
            savedRecommendations.map((recommendation) => {
              const imageSrc = getPlaceholderImage(recommendation);
              const gradient = getGradientColor(recommendation);
              
              return (
                <div
                  key={recommendation.id}
                  className="group bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-lg transition overflow-hidden relative"
                >
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeRecommendation(recommendation.id);
                    }}
                    className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Remove trip"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>

                  <Link href={`/gastos?trip=${recommendation.id}`}>
                    <div className="aspect-[16/9] overflow-hidden">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={getSafeLocation(recommendation)}
                          className="h-full w-full object-cover group-hover:scale-[1.02] transition"
                          onError={() => handleImageError(recommendation.id, imageSrc)}
                        />
                      ) : (
                        <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-2">✈️</div>
                            <div className="text-lg font-semibold">{getSafeLocation(recommendation)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-gray-800 font-medium">
                        {getSafeName(recommendation)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {getSafeLocation(recommendation)}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>💰 €{getSafeCost(recommendation)}</span>
                        <span>⭐ {getSafeMatchScore(recommendation)}% match</span>
                      </div>
                      {getSafeActivities(recommendation).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {getSafeActivities(recommendation).slice(0, 2).map((activity, index) => (
                            <span 
                              key={index}
                              className="bg-[#E8F0FF] text-[#1E66FF] text-xs px-2 py-1 rounded-full"
                            >
                              {activity}
                            </span>
                          ))}
                          {getSafeActivities(recommendation).length > 2 && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                              +{getSafeActivities(recommendation).length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}