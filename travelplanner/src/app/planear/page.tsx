"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

// ⛔️ Lógica original intacta. Apenas estilos e estrutura visual.

type FormStep =
  | "departure"
  | "destination"
  | "destinationCity"
  | "differentContinent"
  | "travelers"
  | "startDate"
  | "endDate"
  | "duration"
  | "activities"
  | "budget"
  | "summary";

export default function PlanearPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>("departure");
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

  const activities = [
    "Beach",
    "Hiking",
    "City Tours",
    "Museums",
    "Shopping",
    "Food & Dining",
    "Nightlife",
    "Adventure Sports",
    "Relaxation",
    "Cultural Events",
    "Nature",
    "Photography",
  ];

  const saveTripToProfile = (tripData: any) => {
    const newTrip = {
      id: Date.now().toString(),
      departure: tripData.departure,
      destination:
        tripData.hasDestination === "yes"
          ? "Specific destination"
          : "Open to suggestions",
      destinationCity: tripData.destinationCity,
      differentContinent: tripData.differentContinent,
      travelers: tripData.travelers,
      startDate: startDate,
      endDate: endDate,
      duration: startDate && endDate ? differenceInDays(endDate, startDate) + 1 : duration,
      activities: selectedActivities,
      budget: tripData.budget,
      createdAt: new Date(),
    };

    const existingTrips = JSON.parse(localStorage.getItem("savedTrips") || "[]");
    const updatedTrips = [newTrip, ...existingTrips];
    localStorage.setItem("savedTrips", JSON.stringify(updatedTrips));
    return newTrip;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const calculatedDuration =
        startDate && endDate ? differenceInDays(endDate, startDate) + 1 : duration;

      const tripData = {
        ...formData,
        startDate,
        endDate,
        duration: calculatedDuration,
        selectedActivities,
      };

      console.log("Form submitted:", tripData);

      const savedTrip = saveTripToProfile(formData);
      console.log("Trip saved:", savedTrip);

      const recommendationData = {
        departure: formData.departure,
        destination:
          formData.hasDestination === "yes" ? formData.destinationCity : "flexible",
        differentContinent: formData.differentContinent === "yes",
        travelers: parseInt(formData.travelers),
        startDate: startDate,
        endDate: endDate,
        duration: calculatedDuration,
        activities: selectedActivities,
        budget: parseFloat(formData.budget),
        travelStyle: formData.differentContinent === "yes" ? "international" : "regional",
      };

      localStorage.setItem("currentTripData", JSON.stringify(recommendationData));

      setShowSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
    const baseSteps: FormStep[] = [
      "departure",
      "destination",
      "travelers",
      "startDate",
      "endDate",
      "activities",
      "budget",
      "summary",
    ];

    if (formData.hasDestination === "yes") {
      const destinationIndex = baseSteps.indexOf("destination");
      baseSteps.splice(destinationIndex + 1, 0, "destinationCity");
    } else if (formData.hasDestination === "no") {
      const destinationIndex = baseSteps.indexOf("destination");
      baseSteps.splice(destinationIndex + 1, 0, "differentContinent");
    }

    if (formData.wantsEndDate === "no") {
      const endDateIndex = baseSteps.indexOf("endDate");
      baseSteps.splice(endDateIndex + 1, 0, "duration");
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      budget: "",
    });
    setStartDate(new Date());
    setEndDate(undefined);
    setDuration(undefined);
    setSelectedActivities([]);
    setCurrentStep("departure");
  };

  const getTotalSteps = () => getNextSteps().length;
  const getCurrentStepNumber = () => {
    const steps = getNextSteps();
    return steps.indexOf(currentStep) + 1;
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity],
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      /* ===================== DEPARTURE ===================== */
      case "departure":
        return (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-[480px] px-2 text-center">
              <h2 className="text-[22px] md:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">
                Where are you departing from?
              </h2>

              <div className="flex justify-center mb-4">
                <img src="/plane.svg" alt="plane" className="h-10 w-10 object-contain" />
              </div>

              <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-5">
                <div className="text-left text-[13px] text-gray-500 mb-2">
                  Insert your departure
                </div>
                <div className="flex items-center gap-3 bg-[#F3F6FF] rounded-xl px-4 py-3 border border-gray-200">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#1E66FF]" />
                  <Input
                    name="departure"
                    value={formData.departure}
                    onChange={handleChange}
                    placeholder="Type here..."
                    className="border-0 bg-transparent focus-visible:ring-0 text-gray-900 placeholder:text-gray-400 text-base"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            {/* Só o botão continuar, a toda a largura, com arrow.svg */}
            <div className="flex justify-center mt-8 w-full px-2 max-w-md">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!formData.departure}
                className="w-full h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-end pr-6 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Continue"
              >
                <img src="/arrow.svg" alt="Next" className="h-5 w-5" />
              </button>
            </div>
          </div>
        );

      /* ===================== DESTINATION ===================== */
      case "destination":
        return (
          <div className="text-center space-y-6 w-full">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Do you have a destination in mind?</h2>
            </div>

            <div className="flex justify-center">
              <img src="/map.svg" alt="map" className="h-12 w-12 object-contain" />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xl px-2 mx-auto">
              <Button
                variant={formData.hasDestination === "yes" ? "default" : "outline"}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, hasDestination: "yes" }));
                  setCurrentStep("destinationCity");
                }}
                className="h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-medium"
              >
                Yes
              </Button>
              <Button
                variant={formData.hasDestination === "no" ? "default" : "outline"}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, hasDestination: "no" }));
                  setCurrentStep("differentContinent");
                }}
                className="h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-medium"
              >
                Not really
              </Button>
            </div>

            {/* Barra inferior (arrow2) */}
            <div className="flex justify-between mt-8 gap-4 w-full max-w-xl px-2 mx-auto">
              <button type="button" onClick={handlePreviousStep} className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50" aria-label="Back">
                <img src="/arrow2.svg" alt="Back" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (formData.hasDestination === "yes") setCurrentStep("destinationCity");
                  else if (formData.hasDestination === "no") setCurrentStep("differentContinent");
                }}
                disabled={!formData.hasDestination}
                className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Continue"
              >
                <img src="/arrow2.svg" alt="Next" className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        );

      /* ===================== DESTINATION CITY ===================== */
      case "destinationCity":
        return (
          <div className="text-center space-y-6 w-full">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Type in your preferred destination</h2>
            </div>

            <div className="flex justify-center">
              <img src="/map.svg" alt="map" className="h-12 w-12 object-contain" />
            </div>

            <div className="w-full max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
                <div className="text-left text-sm text-gray-600 mb-2">Insert your destination</div>
                <div className="flex items-center gap-3 bg-[#F3F6FF] rounded-xl px-4 py-3 border border-gray-200">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#1E66FF]" />
                  <Input
                    name="destinationCity"
                    value={formData.destinationCity}
                    onChange={handleChange}
                    placeholder="Type here..."
                    className="border-0 bg-transparent focus-visible:ring-0 text-gray-900 placeholder:text-gray-400 text-base"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            {/* Barra inferior (arrow2) */}
            <div className="flex justify-between mt-8 gap-4 w-full max-w-xl px-2 mx-auto">
              <button type="button" onClick={handlePreviousStep} className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50" aria-label="Back">
                <img src="/arrow2.svg" alt="Back" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep("travelers")}
                disabled={!formData.destinationCity}
                className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Continue"
              >
                <img src="/arrow2.svg" alt="Next" className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        );

      /* ===================== DIFFERENT CONTINENT ===================== */
      case "differentContinent":
        return (
          <div className="text-center space-y-6 w-full">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Do you want to travel to a different continent?</h2>
            </div>

            <div className="flex justify-center">
              <img src="/map.svg" alt="map" className="h-12 w-12 object-contain" />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xl px-2 mx-auto">
              <Button
                variant={formData.differentContinent === "yes" ? "default" : "outline"}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, differentContinent: "yes" }));
                  setCurrentStep("travelers");
                }}
                className="h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-medium"
              >
                Yes
              </Button>
              <Button
                variant={formData.differentContinent === "no" ? "default" : "outline"}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, differentContinent: "no" }));
                  setCurrentStep("travelers");
                }}
                className="h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-medium"
              >
                No
              </Button>
            </div>

            <div className="flex justify-between mt-8 gap-4 w-full max-w-xl px-2 mx-auto">
              <button type="button" onClick={handlePreviousStep} className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50" aria-label="Back">
                <img src="/arrow2.svg" alt="Back" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (formData.differentContinent) setCurrentStep("travelers");
                }}
                disabled={!formData.differentContinent}
                className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Continue"
              >
                <img src="/arrow2.svg" alt="Next" className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        );

      /* ===================== TRAVELERS ===================== */
      case "travelers":
        return (
          <div className="text-center space-y-6 w-full">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">How many people are going on this trip?</h2>
            </div>

            <div className="flex justify-center">
              <img src="/pessoas.svg" alt="people" className="h-12 w-12 object-contain" />
            </div>

            <div className="flex justify-center items-center gap-6 mt-4">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    travelers: Math.max(1, (parseInt(prev.travelers) || 1) - 1).toString(),
                  }))
                }
                className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 text-2xl hover:bg-gray-50"
              >
                −
              </button>

              <span className="text-3xl font-semibold text-gray-800 min-w-[40px]">
                {formData.travelers || 1}
              </span>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    travelers: ((parseInt(prev.travelers) || 1) + 1).toString(),
                  }))
                }
                className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 text-2xl hover:bg-gray-50"
              >
                +
              </button>
            </div>

            <div className="flex justify-between mt-10 gap-4 w-full max-w-xl px-2 mx-auto">
              <button type="button" onClick={handlePreviousStep} className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50" aria-label="Back">
                <img src="/arrow2.svg" alt="Back" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep("startDate")}
                disabled={!formData.travelers || parseInt(formData.travelers) < 1}
                className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Continue"
              >
                <img src="/arrow2.svg" alt="Next" className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        );

      /* ===================== START DATE ===================== */
      case "startDate":
        return (
          <div className="text-center space-y-6 w-full">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Do you want to schedule your trip?</h2>
            </div>

            <div className="flex justify-center">
              <img src="/calendar.svg" alt="calendar" className="h-12 w-12 object-contain" />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xl px-2 mx-auto">
              <Button
                variant={formData.wantsStartDate === "yes" ? "default" : "outline"}
                onClick={() => setFormData((prev) => ({ ...prev, wantsStartDate: "yes" }))}
                className="h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-medium"
              >
                Yes
              </Button>

              <Button
                variant={formData.wantsStartDate === "no" ? "default" : "outline"}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, wantsStartDate: "no" }));
                  setStartDate(new Date());
                  setCurrentStep("endDate");
                }}
                className="h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-medium"
              >
                Not really
              </Button>
            </div>

            {formData.wantsStartDate === "yes" && (
              <div className="space-y-4 max-w-md mx-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-12 text-lg justify-center font-normal rounded-2xl",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>

                <Button onClick={() => setCurrentStep("endDate")} disabled={!startDate} className="w-full h-12 text-lg rounded-2xl">
                  Continue
                </Button>
              </div>
            )}

            <div className="flex justify-between mt-8 gap-4 w-full max-w-xl px-2 mx-auto">
              <button type="button" onClick={handlePreviousStep} className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50" aria-label="Back">
                <img src="/arrow2.svg" alt="Back" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (formData.wantsStartDate === "no") {
                    setStartDate(new Date());
                    setCurrentStep("endDate");
                  } else if (formData.wantsStartDate === "yes" && startDate) {
                    setCurrentStep("endDate");
                  }
                }}
                disabled={!formData.wantsStartDate || (formData.wantsStartDate === "yes" && !startDate)}
                className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Continue"
              >
                <img src="/arrow2.svg" alt="Next" className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        );

      /* ===================== END DATE ===================== */
      case "endDate":
        return (
          <div className="text-center space-y-6 w-full">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Do you want to pick an end date?</h2>
            </div>

            <div className="flex justify-center">
              <img src="/calendar.svg" alt="calendar" className="h-12 w-12 object-contain" />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xl px-2 mx-auto">
              <Button
                variant={formData.wantsEndDate === "yes" ? "default" : "outline"}
                onClick={() => setFormData((prev) => ({ ...prev, wantsEndDate: "yes" }))}
                className="h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-medium"
              >
                Yes
              </Button>
              <Button
                variant={formData.wantsEndDate === "no" ? "default" : "outline"}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, wantsEndDate: "no" }));
                  setEndDate(undefined);
                  setCurrentStep("duration");
                }}
                className="h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-medium"
              >
                Not really
              </Button>
            </div>

            {formData.wantsEndDate === "yes" && (
              <div className="space-y-4 max-w-md mx-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-12 text-lg justify-center font-normal rounded-2xl",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>

                <Button onClick={() => setCurrentStep("activities")} disabled={!endDate} className="w-full h-12 text-lg rounded-2xl">
                  Continue
                </Button>
              </div>
            )}

            <div className="flex justify-between mt-8 gap-4 w-full max-w-xl px-2 mx-auto">
              <button type="button" onClick={handlePreviousStep} className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50" aria-label="Back">
                <img src="/arrow2.svg" alt="Back" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (formData.wantsEndDate === "no") {
                    setEndDate(undefined);
                    setCurrentStep("duration");
                  } else if (formData.wantsEndDate === "yes" && endDate) {
                    setCurrentStep("activities");
                  }
                }}
                disabled={!formData.wantsEndDate || (formData.wantsEndDate === "yes" && !endDate)}
                className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Continue"
              >
                <img src="/arrow2.svg" alt="Next" className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        );

      /* ===================== DURATION ===================== */
      case "duration":
        return (
          <div className="text-center space-y-6 w-full">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Do you want to define a trip duration?</h2>
              <p className="text-gray-600">In days</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xl px-2 mx-auto">
              <Button
                variant={formData.wantsDuration === "yes" ? "default" : "outline"}
                onClick={() => setFormData((prev) => ({ ...prev, wantsDuration: "yes" }))}
                className="h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-medium"
              >
                Yes
              </Button>
              <Button
                variant={formData.wantsDuration === "no" ? "default" : "outline"}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, wantsDuration: "no" }));
                  setDuration(undefined);
                  setCurrentStep("activities");
                }}
                className="h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-medium"
              >
                Not really
              </Button>
            </div>

            {formData.wantsDuration === "yes" && (
              <div className="space-y-4 max-w-md mx-auto">
                <Input
                  type="number"
                  min="1"
                  value={duration || ""}
                  onChange={(e) => setDuration(parseInt(e.target.value) || undefined)}
                  placeholder="Number of days..."
                  className="h-12 rounded-2xl text-center text-lg"
                />
                <Button onClick={() => setCurrentStep("activities")} disabled={!duration || duration < 1} className="w-full h-12 text-lg rounded-2xl">
                  Continue
                </Button>
              </div>
            )}

            <div className="flex justify-between mt-8 gap-4 w-full max-w-xl px-2 mx-auto">
              <button type="button" onClick={handlePreviousStep} className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50" aria-label="Back">
                <img src="/arrow2.svg" alt="Back" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (formData.wantsDuration === "no") {
                    setDuration(undefined);
                    setCurrentStep("activities");
                  } else if (formData.wantsDuration === "yes" && duration && duration > 0) {
                    setCurrentStep("activities");
                  }
                }}
                disabled={!formData.wantsDuration || (formData.wantsDuration === "yes" && (!duration || duration < 1))}
                className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Continue"
              >
                <img src="/arrow2.svg" alt="Next" className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        );

      /* ===================== ACTIVITIES ===================== */
      case "activities":
        return (
          <div className="text-center space-y-6 w-full">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Choose activities you're interested in</h2>
              <p className="text-gray-600">Select 2 or more activities</p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto max-w-xl mx-auto">
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

            <div className="max-w-xl mx-auto space-y-3">
              <Button
                onClick={() => {
                  setFormData((prev) => ({ ...prev, wantsActivities: "yes" }));
                  setCurrentStep("budget");
                }}
                disabled={selectedActivities.length < 2}
                className="w-full py-6 text-lg"
              >
                Continue ({selectedActivities.length} selected)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, wantsActivities: "no" }));
                  setSelectedActivities([]);
                  setCurrentStep("budget");
                }}
                className="w-full py-6 text-lg"
              >
                Skip Activities
              </Button>
            </div>

            {/* Barra inferior com setas — replicar mesma lógica do Continue */}
            <div className="flex justify-between mt-6 gap-4 w-full max-w-xl px-2 mx-auto">
              <button type="button" onClick={handlePreviousStep} className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50" aria-label="Back">
                <img src="/arrow2.svg" alt="Back" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, wantsActivities: "yes" }));
                  setCurrentStep("budget");
                }}
                disabled={selectedActivities.length < 2}
                className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Continue"
              >
                <img src="/arrow2.svg" alt="Next" className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        );

      /* ===================== BUDGET ===================== */
      case "budget":
        return (
          <div className="text-center space-y-6 w-full">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">What's your total budget?</h2>
              <p className="text-gray-600">For the entire trip</p>
            </div>

            <div className="relative max-w-md mx-auto">
              <Input
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleChange}
                placeholder="0.00"
                className="text-center text-lg py-6 pr-12 rounded-2xl"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>

            <Button onClick={() => setCurrentStep("summary")} disabled={!formData.budget} className="w-full max-w-md mx-auto h-12 text-lg rounded-2xl">
              Continue
            </Button>

            {/* Barra inferior com setas */}
            <div className="flex justify-between mt-6 gap-4 w-full max-w-xl px-2 mx-auto">
              <button type="button" onClick={handlePreviousStep} className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50" aria-label="Back">
                <img src="/arrow2.svg" alt="Back" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep("summary")}
                disabled={!formData.budget}
                className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Continue"
              >
                <img src="/arrow2.svg" alt="Next" className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        );

      /* ===================== SUMMARY ===================== */
      case "summary":
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Review Your Trip Plan</h2>
              <p className="text-gray-600">Confirm all your choices</p>
            </div>

            <div className="space-y-4 text-left bg-gray-50 p-4 rounded-lg text-sm max-w-xl mx-auto">
              <div><strong>Departure:</strong> {formData.departure}</div>
              <div><strong>Destination:</strong> {formData.hasDestination === "yes" ? formData.destinationCity : "Open to suggestions"}</div>
              {formData.hasDestination === "no" && (<div><strong>Different Continent:</strong> {formData.differentContinent === "yes" ? "Yes" : "No"}</div>)}
              <div><strong>Travelers:</strong> {formData.travelers} people</div>
              <div><strong>Start Date:</strong> {startDate ? format(startDate, "PPP") : "Not set"}</div>
              <div><strong>End Date:</strong> {endDate ? format(endDate, "PPP") : "Not set"}</div>
              {formData.wantsEndDate === "no" && duration && (<div><strong>Duration:</strong> {duration} days</div>)}
              {formData.wantsEndDate === "yes" && startDate && endDate && (<div><strong>Duration:</strong> {differenceInDays(endDate, startDate) + 1} days (calculated)</div>)}
              <div><strong>Activities:</strong> {selectedActivities.length > 0 ? selectedActivities.join(", ") : "None selected"}</div>
              <div><strong>Budget:</strong> €{formData.budget}</div>
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full max-w-xl mx-auto h-12 text-lg rounded-2xl">
              {isSubmitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Creating Plan...</>) : ("Create Trip Plan")}
            </Button>

            {/* Barra inferior: voltar / submeter */}
            <div className="flex justify-between mt-6 gap-4 w-full max-w-xl px-2 mx-auto">
              <button type="button" onClick={handlePreviousStep} className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50" aria-label="Back">
                <img src="/arrow2.svg" alt="Back" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e as any)}
                className="w-1/2 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50"
                aria-label="Finish"
              >
                <img src="/arrow2.svg" alt="Next" className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen p-4 bg-[#F5F7FF] flex items-center justify-center">
      {/* Toast de sucesso */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5" />
          <div>
            <p className="font-semibold">Plano criado com sucesso!</p>
            <p className="text-sm text-green-100">A redirecionar...</p>
          </div>
        </div>
      )}

      {/* Wrapper central */}
      <div className="w-full flex justify-center px-4">
        <div className="w-full max-w-[980px]">
          {/* Top bar + progresso (mostra seta excepto no 1º ecrã, se quiseres trocar é aqui) */}
          <div className="flex justify-between items-center mb-6">
            {currentStep !== "departure" ? (
              <Button variant="ghost" size="icon" onClick={handlePreviousStep} className="flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <div className="w-[40px]" />
            )}

            <div className="flex-1 mx-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Step {getCurrentStepNumber()} of {getTotalSteps()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(getCurrentStepNumber() / getTotalSteps()) * 100}%` }} />
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={clearAllFields} className="flex-shrink-0">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Card principal */}
          <Card className="w-full rounded-2xl shadow-xl border-0 bg-white/90">
            <CardContent className="flex-1 flex items-center justify-center p-6 md:p-10">
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
