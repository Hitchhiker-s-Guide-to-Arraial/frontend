"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Plane, Utensils, Home, Activity, ArrowLeft, Check, Target, Loader2, X, Trophy, RotateCcw, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface TripPricing {
  flights: number;
  activities: number;
  stay: number;
  meals: number;
}

interface ListItem {
  id: string;
  name: string;
  cost: number;
}

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
  pricing?: TripPricing;
  actualCosts?: TripPricing;
  isFinished?: boolean;
  finishedAt?: Date;
  savedAt: Date;
}

export default function GastosPage() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get('trip');
  const [trip, setTrip] = useState<SavedRecommendation | null>(null);
  const [estimatedCosts, setEstimatedCosts] = useState<TripPricing>({
    flights: 300,
    activities: 150,
    stay: 200,
    meals: 100
  });
  const [actualCosts, setActualCosts] = useState<TripPricing>({
    flights: 150,
    activities: 0, // Start at 0
    stay: 250,
    meals: 0 // Start at 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showFinishSuccess, setShowFinishSuccess] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [showRevertSuccess, setShowRevertSuccess] = useState(false);
  
  // New state for activities and meals lists
  const [activitiesList, setActivitiesList] = useState<ListItem[]>([]);
  const [mealsList, setMealsList] = useState<ListItem[]>([]);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [showMealsModal, setShowMealsModal] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: '', cost: '' });
  const [newMeal, setNewMeal] = useState({ name: '', cost: '' });
  const [isClosingModal, setIsClosingModal] = useState(false);

  useEffect(() => {
    if (tripId) {
      loadTripData();
    }
  }, [tripId]);

  const loadTripData = () => {
    const saved = localStorage.getItem('savedRecommendations');
    if (saved && tripId) {
      try {
        const parsed = JSON.parse(saved);
        const foundTrip = parsed.find((rec: SavedRecommendation) => rec.id === tripId);
        if (foundTrip) {
          setTrip(foundTrip);
          if (foundTrip.pricing) {
            setEstimatedCosts(foundTrip.pricing);
          }
          // Load actual costs if they exist
          if (foundTrip.actualCosts) {
            setActualCosts(foundTrip.actualCosts);
          }
          // Load activities and meals lists if they exist
          if (foundTrip.activitiesList) {
            setActivitiesList(foundTrip.activitiesList);
          }
          if (foundTrip.mealsList) {
            setMealsList(foundTrip.mealsList);
          }
        }
      } catch (error) {
        console.error('Error loading trip data:', error);
      }
    }
  };

  const handleActualCostChange = (category: keyof TripPricing, value: string) => {
    const numValue = parseInt(value) || 0;
    setActualCosts(prev => ({
      ...prev,
      [category]: numValue
    }));
  };

  const calculateTotal = (pricing: TripPricing) => {
    return pricing.flights + pricing.activities + pricing.stay + pricing.meals;
  };

  const calculateListTotal = (list: ListItem[]) => {
    return list.reduce((total, item) => total + item.cost, 0);
  };

  // Modal close with animation
  const closeModal = (setModal: (value: boolean) => void) => {
    setIsClosingModal(true);
    setTimeout(() => {
      setModal(false);
      setIsClosingModal(false);
    }, 300);
  };

  // Activities modal functions
  const handleAddActivity = () => {
    if (newActivity.name.trim() && newActivity.cost) {
      const cost = parseInt(newActivity.cost) || 0;
      const newItem: ListItem = {
        id: Date.now().toString(),
        name: newActivity.name.trim(),
        cost: cost
      };
      setActivitiesList(prev => [...prev, newItem]);
      setNewActivity({ name: '', cost: '' });
    }
  };

  const handleRemoveActivity = (id: string) => {
    setActivitiesList(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveActivities = () => {
    const total = calculateListTotal(activitiesList);
    setActualCosts(prev => ({ ...prev, activities: total }));
    closeModal(setShowActivitiesModal);
  };

  // Meals modal functions
  const handleAddMeal = () => {
    if (newMeal.name.trim() && newMeal.cost) {
      const cost = parseInt(newMeal.cost) || 0;
      const newItem: ListItem = {
        id: Date.now().toString(),
        name: newMeal.name.trim(),
        cost: cost
      };
      setMealsList(prev => [...prev, newItem]);
      setNewMeal({ name: '', cost: '' });
    }
  };

  const handleRemoveMeal = (id: string) => {
    setMealsList(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveMeals = () => {
    const total = calculateListTotal(mealsList);
    setActualCosts(prev => ({ ...prev, meals: total }));
    closeModal(setShowMealsModal);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Wait 2 seconds to show loading state
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save actual costs to localStorage
      const saved = localStorage.getItem('savedRecommendations');
      if (saved && tripId) {
        const parsed = JSON.parse(saved);
        const updated = parsed.map((rec: SavedRecommendation) => 
          rec.id === tripId 
            ? { 
                ...rec, 
                actualCosts: actualCosts,
                activitiesList: activitiesList,
                mealsList: mealsList,
                lastUpdated: new Date()
              }
            : rec
        );
        
        localStorage.setItem('savedRecommendations', JSON.stringify(updated));
      }

      // Show success toast
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving actual costs:', error);
      alert('Error saving costs. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinishConfirm = async () => {
    setIsFinishing(true);
    
    try {
      // Wait 4 seconds to show loading state
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Mark trip as finished in localStorage
      const saved = localStorage.getItem('savedRecommendations');
      if (saved && tripId) {
        const parsed = JSON.parse(saved);
        const updated = parsed.map((rec: SavedRecommendation) => 
          rec.id === tripId 
            ? { 
                ...rec, 
                isFinished: true,
                finishedAt: new Date(),
                actualCosts: actualCosts,
                activitiesList: activitiesList,
                mealsList: mealsList
              }
            : rec
        );
        
        localStorage.setItem('savedRecommendations', JSON.stringify(updated));
        
        // Update local state
        setTrip(prev => prev ? { ...prev, isFinished: true, finishedAt: new Date() } : null);
      }

      // Close finish modal and show success popup
      closeModal(setShowFinishModal);
      setShowFinishSuccess(true);
      
    } catch (error) {
      console.error('Error finishing trip:', error);
      alert('Error finishing trip. Please try again.');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleFinishCancel = () => {
    closeModal(setShowFinishModal);
  };

  const handleFinishStart = () => {
    setShowFinishModal(true);
  };

  const handleRevertFinish = async () => {
    setIsReverting(true);
    
    try {
      // Wait 2 seconds to show loading state
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Revert trip finish status in localStorage
      const saved = localStorage.getItem('savedRecommendations');
      if (saved && tripId) {
        const parsed = JSON.parse(saved);
        const updated = parsed.map((rec: SavedRecommendation) => 
          rec.id === tripId 
            ? { 
                ...rec, 
                isFinished: false,
                finishedAt: undefined
              }
            : rec
        );
        
        localStorage.setItem('savedRecommendations', JSON.stringify(updated));
        
        // Update local state
        setTrip(prev => prev ? { ...prev, isFinished: false, finishedAt: undefined } : null);
      }

      // Show success toast
      setShowRevertSuccess(true);
      setTimeout(() => setShowRevertSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error reverting trip:', error);
      alert('Error reverting trip. Please try again.');
    } finally {
      setIsReverting(false);
    }
  };

  const estimatedTotal = calculateTotal(estimatedCosts);
  const actualTotal = calculateTotal(actualCosts);
  const isOnBudget = actualTotal <= estimatedTotal;
  const isTripFinished = trip?.isFinished;

  if (!trip) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Link href="/gerir" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Gerir
          </Link>
          <div className="text-center py-12">
            <p className="text-gray-500">Trip not found</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      {/* Save Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <Check className="h-5 w-5" />
          <div>
            <p className="font-semibold">Saved successfully!</p>
            <p className="text-sm text-green-100">Your actual costs have been updated</p>
          </div>
        </div>
      )}

      {/* Revert Success Toast */}
      {showRevertSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <RotateCcw className="h-5 w-5" />
          <div>
            <p className="font-semibold">Trip reverted successfully!</p>
            <p className="text-sm text-blue-100">You can now edit the trip again</p>
          </div>
        </div>
      )}

      {/* Activities Modal */}
      {showActivitiesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className={`bg-white rounded-xl shadow-lg p-6 mx-4 max-w-2xl w-full border border-gray-200 transition-all duration-300 ${
            isClosingModal ? 'animate-out zoom-out-95' : 'animate-in zoom-in-95'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Activities</h3>
              <button
                onClick={() => closeModal(setShowActivitiesModal)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Add new activity form */}
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                placeholder="Activity name"
                value={newActivity.name}
                onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Cost (€)"
                value={newActivity.cost}
                onChange={(e) => setNewActivity(prev => ({ ...prev, cost: e.target.value }))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddActivity}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {/* Activities list */}
            <div className="max-h-64 overflow-y-auto mb-6">
              {activitiesList.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No activities added yet</p>
              ) : (
                <div className="space-y-2">
                  {activitiesList.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{activity.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{activity.cost} €</span>
                        <button
                          onClick={() => handleRemoveActivity(activity.id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total and Save button */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-lg font-semibold">
                Total: {calculateListTotal(activitiesList)} €
              </div>
              <button
                onClick={handleSaveActivities}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meals Modal */}
      {showMealsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className={`bg-white rounded-xl shadow-lg p-6 mx-4 max-w-2xl w-full border border-gray-200 transition-all duration-300 ${
            isClosingModal ? 'animate-out zoom-out-95' : 'animate-in zoom-in-95'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Meals</h3>
              <button
                onClick={() => closeModal(setShowMealsModal)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Add new meal form */}
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                placeholder="Meal name"
                value={newMeal.name}
                onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Cost (€)"
                value={newMeal.cost}
                onChange={(e) => setNewMeal(prev => ({ ...prev, cost: e.target.value }))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddMeal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {/* Meals list */}
            <div className="max-h-64 overflow-y-auto mb-6">
              {mealsList.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No meals added yet</p>
              ) : (
                <div className="space-y-2">
                  {mealsList.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{meal.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{meal.cost} €</span>
                        <button
                          onClick={() => handleRemoveMeal(meal.id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total and Save button */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-lg font-semibold">
                Total: {calculateListTotal(mealsList)} €
              </div>
              <button
                onClick={handleSaveMeals}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Confirmation Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className={`bg-white rounded-xl shadow-lg p-6 mx-4 max-w-md w-full border border-gray-200 transition-all duration-300 ${
            isClosingModal ? 'animate-out zoom-out-95' : 'animate-in zoom-in-95'
          }`}>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Finish this trip?
              </h3>
              <p className="text-gray-600 mb-6">
                You won't be able to edit this trip after finishing.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleFinishCancel}
                  disabled={isFinishing}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinishConfirm}
                  disabled={isFinishing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {isFinishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finishing...
                    </>
                  ) : (
                    'Finish Trip'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finish Success Popup */}
      {showFinishSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full text-center animate-in zoom-in duration-300 border border-gray-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Trip Finished Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Your trip to {trip.location} has been completed and archived.
            </p>
            <button
              onClick={() => setShowFinishSuccess(false)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Back to Costs
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Link href="/gerir" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Gerir
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Costs</h1>
              <p className="text-lg text-gray-600">{trip.location} • {trip.name}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Finished Trip Badge */}
              {isTripFinished && (
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">Finished Trip</span>
                </div>
              )}
              
              {/* Revert Finish Button (Development Only) */}
              {isTripFinished && (
                <button
                  onClick={handleRevertFinish}
                  disabled={isReverting}
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isReverting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  {isReverting ? 'Reverting...' : 'Revert Finish'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Estimated Costs Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Estimated Costs</h2>
          
          {/* Total Estimated */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-lg font-medium text-gray-700">Total</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{estimatedTotal} €</span>
            </div>
          </div>

          {/* Estimated Costs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flights & Stay */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plane className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">Flights</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{estimatedCosts.flights} €</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Home className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-700">Stay</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{estimatedCosts.stay} €</p>
              </div>
            </div>

            {/* Activities & Meals */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-700">Activities</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{estimatedCosts.activities} €</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Utensils className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="font-medium text-gray-700">Meals</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{estimatedCosts.meals} €</p>
              </div>
            </div>
          </div>
        </section>

        {/* Actual Costs Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Actual Costs</h2>
            
            {/* Budget Status - Moved to the right of the title */}
            <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-full ${
              isOnBudget 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                isOnBudget ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="font-semibold text-lg">
                {isOnBudget ? 'On budget' : 'Over budget'}
              </span>
              <div className="text-sm font-medium">
                {isOnBudget 
                  ? `-${estimatedTotal - actualTotal}€`
                  : `+${actualTotal - estimatedTotal}€`
                }
              </div>
            </div>
          </div>
          
          {/* Total Actual */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-lg font-medium text-gray-700">Total</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{actualTotal} €</span>
            </div>
          </div>

          {/* Actual Costs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flights & Stay */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plane className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">Flights</span>
                </div>
                <input
                  type="number"
                  value={actualCosts.flights}
                  onChange={(e) => handleActualCostChange('flights', e.target.value)}
                  disabled={isTripFinished}
                  className="text-2xl font-bold text-gray-900 w-full border-none focus:outline-none focus:ring-0 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Home className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-700">Stay</span>
                </div>
                <input
                  type="number"
                  value={actualCosts.stay}
                  onChange={(e) => handleActualCostChange('stay', e.target.value)}
                  disabled={isTripFinished}
                  className="text-2xl font-bold text-gray-900 w-full border-none focus:outline-none focus:ring-0 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Activities & Meals */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-700">Activities</span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-bold text-gray-900">{actualCosts.activities} €</span>
                  <button
                    onClick={() => setShowActivitiesModal(true)}
                    disabled={isTripFinished}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Utensils className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="font-medium text-gray-700">Meals</span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-bold text-gray-900">{actualCosts.meals} €</span>
                  <button
                    onClick={() => setShowMealsModal(true)}
                    disabled={isTripFinished}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        {!isTripFinished && (
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
            <button
              onClick={handleFinishStart}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Finish
            </button>
          </div>
        )}
      </div>
    </main>
  );
}