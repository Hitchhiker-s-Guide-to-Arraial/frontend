"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Sparkles, MapPin, Users, Calendar, Euro } from "lucide-react";

interface SavedTrip {
  id: string;
  departure: string;
  destination: string;
  destinationCity?: string;
  differentContinent?: string;
  travelers: string;
  startDate?: Date;
  endDate?: Date;
  duration?: number;
  activities: string[];
  budget: string;
  createdAt: Date;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
    
    // Load saved trips from localStorage (for now - later from API)
    const saved = localStorage.getItem('savedTrips');
    if (saved) {
      setSavedTrips(JSON.parse(saved));
    }
  }, [session, status, router]);

  const getRecommendationsForTrip = (trip: SavedTrip) => {
    // Prepare the trip data for recommendations
    const recommendationData = {
      departure: trip.departure,
      destination: trip.destinationCity || 'flexible',
      differentContinent: trip.differentContinent === 'yes',
      travelers: parseInt(trip.travelers),
      startDate: trip.startDate,
      endDate: trip.endDate,
      duration: trip.duration,
      activities: trip.activities,
      budget: parseFloat(trip.budget),
      travelStyle: trip.differentContinent === 'yes' ? 'international' : 'regional'
    };
    
    // Store in localStorage for the recommendations page to use
    localStorage.setItem('currentTripData', JSON.stringify(recommendationData));
    
    // Navigate to recommendations page
    router.push("/recs");
  };

  const clearAllTrips = () => {
    localStorage.removeItem('savedTrips');
    setSavedTrips([]);
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-gray-600">Welcome back, {session.user?.name}!</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              Home
            </Button>
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg">{session.user?.name || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{session.user?.email || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Trips</label>
                <p className="text-lg">{savedTrips.length}</p>
              </div>
            </CardContent>
          </Card>

          {/* Saved Trips */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Travel Plans</CardTitle>
                <CardDescription>Your created travel plans</CardDescription>
              </div>
              {savedTrips.length > 0 && (
                <Button variant="outline" onClick={clearAllTrips}>
                  Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {savedTrips.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips saved yet</h3>
                  <p className="text-gray-500 mb-4">Create your first travel plan to see it here</p>
                  <Button onClick={() => router.push("/planear")}>
                    Create Trip Plan
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {savedTrips.map((trip) => (
                    <Card key={trip.id} className="bg-white border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          {/* Trip Details */}
                          <div className="space-y-3 flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-xl mb-1">
                                  {trip.destinationCity ? `Trip to ${trip.destinationCity}` : 'Flexible Destination Trip'}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  From {trip.departure} • Created {formatDate(trip.createdAt)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span>{trip.travelers} traveler{trip.travelers !== '1' ? 's' : ''}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Euro className="h-4 w-4 text-gray-400" />
                                <span>€{trip.budget}</span>
                              </div>
                              {trip.duration && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>{trip.duration} days</span>
                                </div>
                              )}
                              {trip.activities.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>{trip.activities.length} activities</span>
                                </div>
                              )}
                            </div>

                            {/* Activities Preview */}
                            {trip.activities.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {trip.activities.slice(0, 4).map((activity, index) => (
                                  <span 
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                                  >
                                    {activity}
                                  </span>
                                ))}
                                {trip.activities.length > 4 && (
                                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                    +{trip.activities.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Get Recommendations Button */}
                          <div className="flex flex-col gap-2 items-end">
                            <Button 
                              onClick={() => getRecommendationsForTrip(trip)}
                              className="flex items-center gap-2 bg-[#1e66ff] hover:bg-[#4a75d2]"
                            >
                              <Sparkles className="h-4 w-4" />
                              Get Recommendations
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Updated without Recommendations button */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your travel plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => router.push("/planear")} className="py-4 bg-[#1e66ff]">
                Create New Trip
              </Button>
              <Button variant="outline" onClick={() => router.push("/gerir")} className="py-4">
                Manage Trips
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}