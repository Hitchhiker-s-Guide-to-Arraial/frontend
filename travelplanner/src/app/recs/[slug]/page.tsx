"use client";

import { notFound, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

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

  if (!recommendation) {
    notFound();
  }

  // ... rest of the component remains the same
  const handleAddToGerir = async () => {
    setIsAddingToGerir(true);
    
    try {
      // Get the current recommendation data
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
        savedAt: new Date()
      };

      // Get existing saved recommendations
      const existing = JSON.parse(localStorage.getItem('savedRecommendations') || '[]');
      
      // Check if already saved
      const alreadyExists = existing.some((rec: any) => rec.slug === recommendation.slug);
      if (alreadyExists) {
        alert('This recommendation is already saved to Gerir!');
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

  return (
    <main className="min-h-screen p-8">
      {/* Custom Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <CheckCircle2 className="h-5 w-5" />
          <div>
            <p className="font-semibold">Added to Gerir successfully!</p>
            <p className="text-sm text-green-100">{recommendation.name} was added to your Gerir page</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{recommendation.name}</h1>
        <p className="text-lg text-gray-600 mb-8">{recommendation.description}</p>
        
        {/* Trip Details */}
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Trip Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Location:</strong> {recommendation.location}</p>
              <p><strong>Best Season:</strong> {recommendation.bestSeason}</p>
              <p><strong>Estimated Cost:</strong> €{recommendation.estimatedCost}</p>
              <p><strong>Match Score:</strong> {recommendation.matchScore}%</p>
            </div>
            <div>
              <p><strong>Activities:</strong></p>
              <div className="flex flex-wrap gap-2 mt-2">
                {recommendation.activities.map((activity: string, index: number) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Go to Gerir Button - In main content */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleGoToGerir}
            disabled={isGoingToGerir}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition flex items-center gap-2 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoingToGerir ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Going to Gerir...
              </>
            ) : (
              <>
                Go to Gerir Page
                <span>→</span>
              </>
            )}
          </button>
        </div>

        {/* Add to Gerir Button - Fixed position */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-4">
          <button
            onClick={handleAddToGerir}
            disabled={isAddingToGerir}
            className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition flex items-center gap-2 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingToGerir ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                Add to Gerir
                <span className="text-xl">+</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}