"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, Loader2, CheckCircle2, ArrowLeft, Users, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

type FormStep = 
  | 'departure' 
  | 'destination' 
  | 'destinationCity' 
  | 'differentContinent' 
  | 'travelers' 
  | 'startDate' 
  | 'endDate' 
  | 'duration' 
  | 'activities' 
  | 'budget' 
  | 'summary';

export default function PlanearPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>('departure');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [duration, setDuration] = useState<number | undefined>();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    departure: "",
    hasDestination: "",
    destinationCity: "",
    differentContinent: "",
    travelers: "",
    wantsStartDate: "",
    wantsEndDate: "",
    wantsDuration: "",
    wantsActivities: "",
    budget: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const continents = ["Europe", "Asia", "North America", "South America", "Africa", "Oceania"];
  const activities = [
    "Beach", "Hiking", "City Tours", "Museums", "Shopping", "Food & Dining",
    "Nightlife", "Adventure Sports", "Relaxation", "Cultural Events", "Nature", "Photography"
  ];


    const saveTripToProfile = (tripData: any) => {
    const newTrip = {
      id: Date.now().toString(),
      departure: tripData.departure,
      destination: tripData.hasDestination === 'yes' ? 'Specific destination' : 'Open to suggestions',
      destinationCity: tripData.destinationCity,
      differentContinent: tripData.differentContinent,
      travelers: tripData.travelers,
      startDate: startDate,
      endDate: endDate,
      duration: startDate && endDate ? differenceInDays(endDate, startDate) + 1 : duration,
      activities: selectedActivities,
      budget: tripData.budget,
      createdAt: new Date()
    };

    // Get existing trips from localStorage
    const existingTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
    
    // Add new trip
    const updatedTrips = [newTrip, ...existingTrips];
    
    // Save back to localStorage
    localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
    
    return newTrip;
  };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // Calculate duration if both start and end dates are selected
    const calculatedDuration = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : duration;
    
    const tripData = { 
      ...formData, 
      startDate, 
      endDate, 
      duration: calculatedDuration, 
      selectedActivities 
    };
    
    console.log("Form submitted:", tripData);
    
    // Save trip to profile (for history)
    const savedTrip = saveTripToProfile(formData);
    console.log("Trip saved:", savedTrip);
    
    // Prepare data for recommendations
    const recommendationData = {
      departure: formData.departure,
      destination: formData.hasDestination === 'yes' ? formData.destinationCity : 'flexible',
      differentContinent: formData.differentContinent === 'yes',
      travelers: parseInt(formData.travelers),
      startDate: startDate,
      endDate: endDate,
      duration: calculatedDuration,
      activities: selectedActivities,
      budget: parseFloat(formData.budget),
      travelStyle: formData.differentContinent === 'yes' ? 'international' : 'regional'
    };
    
    // Store data for recommendations page to use
    localStorage.setItem('currentTripData', JSON.stringify(recommendationData));
    
    setShowSuccess(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redirect to recommendations page instead of profile
    router.push("/recs");
  } catch (error) {
    console.error("Error submitting form:", error);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleNextStep = () => {
    const steps: FormStep[] = getNextSteps();
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const getNextSteps = (): FormStep[] => {
    const baseSteps: FormStep[] = ['departure', 'destination', 'travelers', 'startDate', 'endDate', 'activities', 'budget', 'summary'];
    
    // Insert destinationCity after destination if user has a specific destination
    if (formData.hasDestination === 'yes') {
      const destinationIndex = baseSteps.indexOf('destination');
      baseSteps.splice(destinationIndex + 1, 0, 'destinationCity');
    }
    // Insert differentContinent after destination if user doesn't have a specific destination
    else if (formData.hasDestination === 'no') {
      const destinationIndex = baseSteps.indexOf('destination');
      baseSteps.splice(destinationIndex + 1, 0, 'differentContinent');
    }
    
    // Insert duration after endDate only if user didn't select an end date
    if (formData.wantsEndDate === 'no') {
      const endDateIndex = baseSteps.indexOf('endDate');
      baseSteps.splice(endDateIndex + 1, 0, 'duration');
    }
    
    return baseSteps;
  };

  const handlePreviousStep = () => {
    const steps = getNextSteps();
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearAllFields = () => {
    setFormData({ 
      departure: "", 
      hasDestination: "", 
      destinationCity: "", 
      differentContinent: "",
      travelers: "",
      wantsStartDate: "",
      wantsEndDate: "",
      wantsDuration: "",
      wantsActivities: "",
      budget: "" 
    });
    setStartDate(new Date());
    setEndDate(undefined);
    setDuration(undefined);
    setSelectedActivities([]);
    setCurrentStep('departure');
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const getTotalSteps = () => {
    return getNextSteps().length;
  };

  const getCurrentStepNumber = () => {
    const steps = getNextSteps();
    return steps.indexOf(currentStep) + 1;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'departure':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Where are you departing from?</h2>
              <p className="text-gray-600">Insert your departure city</p>
            </div>
            <Input
              name="departure"
              value={formData.departure}
              onChange={handleChange}
              placeholder="Type here..."
              className="text-center text-lg py-6"
              autoFocus
            />
            <Button 
              onClick={handleNextStep}
              disabled={!formData.departure}
              className="w-full py-6 text-lg"
            >
              Continue
            </Button>
          </div>
        );

      case 'destination':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Do you have a destination in mind?</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={formData.hasDestination === 'yes' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ ...prev, hasDestination: 'yes' }));
                  setCurrentStep('destinationCity');
                }}
                className="py-6 text-lg"
              >
                Yes
              </Button>
              <Button
                variant={formData.hasDestination === 'no' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ ...prev, hasDestination: 'no' }));
                  setCurrentStep('differentContinent');
                }}
                className="py-6 text-lg"
              >
                Not really
              </Button>
            </div>
          </div>
        );

      case 'destinationCity':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Which destination city?</h2>
              <p className="text-gray-600">Enter your desired destination</p>
            </div>
            <Input
              name="destinationCity"
              value={formData.destinationCity}
              onChange={handleChange}
              placeholder="Type destination city..."
              className="text-center text-lg py-6"
              autoFocus
            />
            <Button 
              onClick={() => setCurrentStep('travelers')}
              disabled={!formData.destinationCity}
              className="w-full py-6 text-lg"
            >
              Continue
            </Button>
          </div>
        );

      case 'differentContinent':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Do you want to travel to a different continent?</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={formData.differentContinent === 'yes' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ ...prev, differentContinent: 'yes' }));
                  setCurrentStep('travelers');
                }}
                className="py-6 text-lg"
              >
                Yes
              </Button>
              <Button
                variant={formData.differentContinent === 'no' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ ...prev, differentContinent: 'no' }));
                  setCurrentStep('travelers');
                }}
                className="py-6 text-lg"
              >
                No
              </Button>
            </div>
          </div>
        );

      case 'travelers':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">How many people are traveling?</h2>
              <p className="text-gray-600">Including yourself</p>
            </div>
            <Input
              name="travelers"
              type="number"
              min="1"
              value={formData.travelers}
              onChange={handleChange}
              placeholder="Number of travelers..."
              className="text-center text-lg py-6"
              autoFocus
            />
            <Button 
              onClick={() => setCurrentStep('startDate')}
              disabled={!formData.travelers || parseInt(formData.travelers) < 1}
              className="w-full py-6 text-lg"
            >
              Continue
            </Button>
          </div>
        );

      case 'startDate':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Do you want to pick a start date?</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={formData.wantsStartDate === 'yes' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ ...prev, wantsStartDate: 'yes' }));
                }}
                className="py-6 text-lg"
              >
                Yes
              </Button>
              <Button
                variant={formData.wantsStartDate === 'no' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ ...prev, wantsStartDate: 'no' }));
                  setStartDate(new Date()); // Set to current date
                  setCurrentStep('endDate');
                }}
                className="py-6 text-lg"
              >
                No
              </Button>
            </div>
            
            {formData.wantsStartDate === 'yes' && (
              <div className="space-y-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full py-6 text-lg justify-center font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button 
                  onClick={() => setCurrentStep('endDate')}
                  disabled={!startDate}
                  className="w-full py-6 text-lg"
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        );

      case 'endDate':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Do you want to pick an end date?</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={formData.wantsEndDate === 'yes' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ ...prev, wantsEndDate: 'yes' }));
                }}
                className="py-6 text-lg"
              >
                Yes
              </Button>
              <Button
                variant={formData.wantsEndDate === 'no' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ ...prev, wantsEndDate: 'no' }));
                  setEndDate(undefined);
                  // Go to duration step since no end date was selected
                  setCurrentStep('duration');
                }}
                className="py-6 text-lg"
              >
                No
              </Button>
            </div>
            
            {formData.wantsEndDate === 'yes' && (
              <div className="space-y-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full py-6 text-lg justify-center font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button 
                  onClick={() => setCurrentStep('activities')}
                  disabled={!endDate}
                  className="w-full py-6 text-lg"
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        );

      case 'duration':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Do you want to define a trip duration?</h2>
              <p className="text-gray-600">In days</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={formData.wantsDuration === 'yes' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ ...prev, wantsDuration: 'yes' }));
                }}
                className="py-6 text-lg"
              >
                Yes
              </Button>
              <Button
                variant={formData.wantsDuration === 'no' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ ...prev, wantsDuration: 'no' }));
                  setDuration(undefined);
                  setCurrentStep('activities');
                }}
                className="py-6 text-lg"
              >
                No
              </Button>
            </div>
            
            {formData.wantsDuration === 'yes' && (
              <div className="space-y-4">
                <Input
                  type="number"
                  min="1"
                  value={duration || ''}
                  onChange={(e) => setDuration(parseInt(e.target.value) || undefined)}
                  placeholder="Number of days..."
                  className="text-center text-lg py-6"
                />
                <Button 
                  onClick={() => setCurrentStep('activities')}
                  disabled={!duration || duration < 1}
                  className="w-full py-6 text-lg"
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        );

      case 'activities':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Choose activities you're interested in</h2>
              <p className="text-gray-600">Select 2 or more activities</p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {activities.map((activity) => (
                <Button
                  key={activity}
                  variant={selectedActivities.includes(activity) ? "default" : "outline"}
                  onClick={() => toggleActivity(activity)}
                  className="py-3 h-auto"
                >
                  {activity}
                </Button>
              ))}
            </div>
            <Button 
              onClick={() => {
                setFormData(prev => ({ ...prev, wantsActivities: 'yes' }));
                setCurrentStep('budget');
              }}
              disabled={selectedActivities.length < 2}
              className="w-full py-6 text-lg"
            >
              Continue ({selectedActivities.length} selected)
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setFormData(prev => ({ ...prev, wantsActivities: 'no' }));
                setSelectedActivities([]);
                setCurrentStep('budget');
              }}
              className="w-full py-6 text-lg"
            >
              Skip Activities
            </Button>
          </div>
        );

      case 'budget':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">What's your total budget?</h2>
              <p className="text-gray-600">For the entire trip</p>
            </div>
            <div className="relative">
              <Input
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleChange}
                placeholder="0.00"
                className="text-center text-lg py-6 pr-12"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
            </div>
            <Button 
              onClick={() => setCurrentStep('summary')}
              disabled={!formData.budget}
              className="w-full py-6 text-lg"
            >
              Continue
            </Button>
          </div>
        );

      case 'summary':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Review Your Trip Plan</h2>
              <p className="text-gray-600">Confirm all your choices</p>
            </div>
            <div className="space-y-4 text-left bg-gray-50 p-4 rounded-lg text-sm">
              <div><strong>Departure:</strong> {formData.departure}</div>
              <div><strong>Destination:</strong> {formData.hasDestination === 'yes' ? formData.destinationCity : 'Open to suggestions'}</div>
              {formData.hasDestination === 'no' && (
                <div><strong>Different Continent:</strong> {formData.differentContinent === 'yes' ? 'Yes' : 'No'}</div>
              )}
              <div><strong>Travelers:</strong> {formData.travelers} people</div>
              <div><strong>Start Date:</strong> {startDate ? format(startDate, "PPP") : 'Not set'}</div>
              <div><strong>End Date:</strong> {endDate ? format(endDate, "PPP") : 'Not set'}</div>
              {formData.wantsEndDate === 'no' && duration && <div><strong>Duration:</strong> {duration} days</div>}
              {formData.wantsEndDate === 'yes' && startDate && endDate && (
                <div><strong>Duration:</strong> {differenceInDays(endDate, startDate) + 1} days (calculated)</div>
              )}
              <div><strong>Activities:</strong> {selectedActivities.length > 0 ? selectedActivities.join(', ') : 'None selected'}</div>
              <div><strong>Budget:</strong> €{formData.budget}</div>
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-6 text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Plan...
                </>
              ) : (
                "Create Trip Plan"
              )}
            </Button>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen p-4 bg-gray-50 flex items-center justify-center">
      {/* Custom Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <CheckCircle2 className="h-5 w-5" />
          <div>
            <p className="font-semibold">Plano criado com sucesso!</p>
            <p className="text-sm text-green-100">A redirecionar...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handlePreviousStep}
            disabled={currentStep === 'departure'}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 mx-4">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {getCurrentStepNumber()} of {getTotalSteps()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getCurrentStepNumber() / getTotalSteps()) * 100}%` }}
              />
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={clearAllFields}
            className="flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Step Content Card */}
        <Card className="min-h-[500px] flex flex-col">
          <CardContent className="flex-1 flex items-center justify-center p-6">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}