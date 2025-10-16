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
import { CalendarIcon, X, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function PlanearPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [formData, setFormData] = useState({
    budget: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    "Beach",
    "City",
    "Rural"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call or form processing
      console.log("Form submitted:", { ...formData, dateRange });
      
      // Show success message
      setShowSuccess(true);

      // Wait 2 seconds before redirecting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      
      router.push("/recs");
    } catch (error) {
      console.error("Error submitting form:", error);
      // You could add an error state here if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearAllFields = () => {
    setFormData({ budget: "", category: "" });
    setDateRange(undefined);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
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

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Planeamento</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Plano</CardTitle>
            <CardDescription>
              Configure os parametros principais do seu plano.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Budget - First Field with Clear Button */}
              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento (€)</Label>
                <div className="relative">
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    className="pr-10"
                  />
                  {formData.budget && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, budget: "" }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Dropdown with Clear Button */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="category">Categoria</Label>
                    {formData.category && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: "" }))}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Limpar
                      </button>
                    )}
                  </div>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Picker with Clear Button */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Período da Viagem</Label>
                    {dateRange && (
                      <button
                        type="button"
                        onClick={() => setDateRange(undefined)}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Limpar
                      </button>
                    )}
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yy")
                          )
                        ) : (
                          <span>Selecionar período</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A processar...
                    </>
                  ) : (
                    "Criar Plano"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearAllFields}
                  disabled={(!formData.budget && !formData.category && !dateRange) || isSubmitting}
                >
                  Limpar Tudo
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}