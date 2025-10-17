"use client";

import { notFound, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { CheckCircle2, Loader2, Info, Plane, Utensils, Home, Activity, ExternalLink, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default function RecommendationDetail({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAddingToGerir, setIsAddingToGerir] = useState(false);
  const [isGoingToGerir, setIsGoingToGerir] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAlreadySaved, setShowAlreadySaved] = useState(false);
  
  // Unwrap the params promise using React.use()
  const unwrappedParams = use(params);
  
  // Get data from query parameters or fallback to hardcoded data
  const recommendation = {
    id: parseInt(unwrappedParams.slug.split('-')[1]) || 1,
    name: searchParams.get('name') || 'Unknown Recommendation',
    description: searchParams.get('description') || 'No description available',
    location: searchParams.get('location') || 'Unknown Location',
    estimatedCost: parseInt(searchParams.get('estimatedCost') || '0'),
    bestSeason: searchParams.get('bestSeason') || 'All Year',
    activities: JSON.parse(searchParams.get('activities') || '[]'),
    matchScore: parseInt(searchParams.get('matchScore') || '0'),
    slug: unwrappedParams.slug
  };

  // Hardcoded pricing data with names and links (will be replaced with JSON later)
  const pricingData = {
    flights: {
      price: 300,
      name: "TAP Air Portugal",
      link: "https://www.flytap.com"
    },
    activities: {
      price: 150,
      name: "City Tours & Museums",
      link: "https://www.getyourguide.com"
    },
    stay: {
      price: 200,
      name: "Hotel Premium Collection",
      link: "https://www.booking.com"
    },
    meals: {
      price: 100,
      name: "Local Restaurants",
      link: "https://www.thefork.com"
    }
  };

  if (!recommendation) {
    notFound();
  }

  const handleAddToGerir = async () => {
    setIsAddingToGerir(true);
    
    try {
      // Get the current recommendation data WITH pricing data
      const recommendationData = {
        id: Date.now().toString(),
        name: recommendation.name,
        description: recommendation.description,
        location: recommendation.location,
        estimatedCost: recommendation.estimatedCost,
        bestSeason: recommendation.bestSeason,
        activities: recommendation.activities,
        matchScore: recommendation.matchScore,
        slug: recommendation.slug,
        savedAt: new Date(),
        // ADD THE PRICING DATA:
        pricing: {
          flights: pricingData.flights.price,
          activities: pricingData.activities.price,
          stay: pricingData.stay.price,
          meals: pricingData.meals.price
        }
      };

      // Get existing saved recommendations
      const existing = JSON.parse(localStorage.getItem('savedRecommendations') || '[]');
      
      // Check if already saved
      const alreadyExists = existing.some((rec: any) => rec.slug === recommendation.slug);
      if (alreadyExists) {
        // Show "already saved" toast instead of alert
        setShowAlreadySaved(true);
        setTimeout(() => setShowAlreadySaved(false), 3000);
        return;
      }

      // Wait 1.5 seconds to show loading state
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add new recommendation
      const updated = [recommendationData, ...existing];
      
      // Save to storage
      localStorage.setItem('savedRecommendations', JSON.stringify(updated));
      
      // Show success toast
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving recommendation:', error);
      alert('Error saving recommendation. Please try again.');
    } finally {
      setIsAddingToGerir(false);
    }
  };

  const handleGoToGerir = async () => {
    setIsGoingToGerir(true);
    
    try {
      // Wait 1.5 seconds before navigating
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/gerir');
    } finally {
      setIsGoingToGerir(false);
    }
  };

  const handleGoBack = () => {
    router.back(); // This will go back to the previous page (Recs main page)
  };

  return (
    <main className="min-h-screen p-8">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <CheckCircle2 className="h-5 w-5" />
          <div>
            <p className="font-semibold">Added to Gerir successfully!</p>
            <p className="text-sm text-green-100">{recommendation.name} was added to your Gerir page</p>
          </div>
        </div>
      )}

      {/* Already Saved Toast */}
      {showAlreadySaved && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <Info className="h-5 w-5" />
          <div>
            <p className="font-semibold">Already in Gerir!</p>
            <p className="text-sm text-blue-100">{recommendation.name} is already saved to your Gerir page</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Recommendations
        </button>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{recommendation.location}</h1>
          <p className="text-lg text-gray-600 mb-4">{recommendation.description}</p>
          
          {/* Trip Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>Best Season: <strong className="text-gray-700">{recommendation.bestSeason}</strong></span>
            <span>Match Score: <strong className="text-gray-700">{recommendation.matchScore}%</strong></span>
            <span>Total Estimated: <strong className="text-gray-700">€{recommendation.estimatedCost}</strong></span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Flights Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plane className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Flights</h3>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-2">~ {pricingData.flights.price}€</p>
            <p className="text-sm text-gray-600 mb-4">{pricingData.flights.name}</p>
            <a 
              href={pricingData.flights.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center gap-2 text-blue-600 hover:text-blue-700 transition text-sm font-medium"
            >
              Book flights
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Activities Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Activities</h3>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-2">~ {pricingData.activities.price}€</p>
            <p className="text-sm text-gray-600 mb-4">{pricingData.activities.name}</p>
            <a 
              href={pricingData.activities.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center gap-2 text-green-600 hover:text-green-700 transition text-sm font-medium"
            >
              Book activities
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Stay Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Home className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">Stay</h3>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-2">~ {pricingData.stay.price}€</p>
            <p className="text-sm text-gray-600 mb-4">{pricingData.stay.name}</p>
            <a 
              href={pricingData.stay.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center gap-2 text-purple-600 hover:text-purple-700 transition text-sm font-medium"
            >
              Book hotel
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Meals Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Utensils className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold">Meals</h3>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-2">~ {pricingData.meals.price}€</p>
            <p className="text-sm text-gray-600 mb-4">{pricingData.meals.name}</p>
            <a 
              href={pricingData.meals.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center gap-2 text-orange-600 hover:text-orange-700 transition text-sm font-medium"
            >
              Reserve table
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Activities Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Activities Included</h2>
          <div className="flex flex-wrap gap-3">
            {recommendation.activities.map((activity: string, index: number) => (
              <span 
                key={index} 
                className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200"
              >
                {activity}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <button
            onClick={handleGoToGerir}
            disabled={isGoingToGerir}
            className="w-full sm:w-auto bg-gray-500 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-gray-600 transition flex items-center justify-center gap-2 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoingToGerir ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Going to Gerir...
              </>
            ) : (
              'Go to Gerir Page'
            )}
          </button>

          <button
            onClick={handleAddToGerir}
            disabled={isAddingToGerir}
            className="w-full sm:w-auto bg-blue-500 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-green-600 transition flex items-center justify-center gap-2 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingToGerir ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                Add trip
                <span className="text-xl">+</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}