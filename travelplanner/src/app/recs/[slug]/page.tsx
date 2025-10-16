"use client";

import { notFound } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

const recommendationData: { [key: string]: any } = {
  'rec-1': {
    id: 1,
    name: 'Recommendation 1',
    description: 'Detailed information about recommendation 1',
    color: 'blue',
  },
  'rec-2': {
    id: 2,
    name: 'Recommendation 2', 
    description: 'Detailed information about recommendation 2',
    color: 'green',
  },
  'rec-3': {
    id: 3,
    name: 'Recommendation 3',
    description: 'Detailed information about recommendation 3', 
    color: 'purple',
  },
  'rec-4': {
    id: 4,
    name: 'Recommendation 4',
    description: 'Detailed information about recommendation 4',
    color: 'orange',
  },
  'rec-5': {
    id: 5,
    name: 'Recommendation 5',
    description: 'Detailed information about recommendation 5',
    color: 'red',
  },
};

export default function RecommendationDetail({ params }: Props) {
  const router = useRouter();
  const [isAddingToGerir, setIsAddingToGerir] = useState(false);
  const [isGoingToGerir, setIsGoingToGerir] = useState(false);
  
  // Unwrap the params promise using React.use()
  const unwrappedParams = use(params);
  const recommendation = recommendationData[unwrappedParams.slug];

  if (!recommendation) {
    notFound();
  }

  const handleAddToGerir = async () => {
    setIsAddingToGerir(true);
    
    try {
      // TODO: Add API call to save to backend
      console.log('Adding to gerir:', recommendation);
      
      // For now, save to localStorage or show alert
      const existing = JSON.parse(localStorage.getItem('gerirItems') || '[]');
      const updated = [...existing, recommendation];
      localStorage.setItem('gerirItems', JSON.stringify(updated));
      
      // Wait 1.5 seconds
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`Added ${recommendation.name} to Gerir page!`);
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{recommendation.name}</h1>
        <p className="text-lg text-gray-600 mb-8">{recommendation.description}</p>
        
        {/* Add more details here */}
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">More Details</h2>
          <p>Additional information about this recommendation would go here.</p>
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
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Going to Gerir...</span>
              </>
            ) : (
              <>
                <span>Go to Gerir Page</span>
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
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <span>Add to Gerir</span>
                <span className="text-xl">+</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}