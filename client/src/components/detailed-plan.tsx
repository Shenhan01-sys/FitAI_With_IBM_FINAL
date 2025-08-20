import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AIPlans } from "@shared/schema";

interface DetailedPlanProps {
  userGoal: string;
}

export default function DetailedPlan({ userGoal }: DetailedPlanProps) {
  const { data: aiPlans, isLoading: isLoadingPlans } = useQuery<AIPlans>({
    queryKey: ['/api/generate-plans'],
    queryFn: async () => {
      const response = await fetch('/api/generate-plans', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to generate AI plans');
      }
      return response.json();
    },
    retry: 1,
  });

  const nutritionContent: Record<string, string> = {
    cutting: "Terapkan defisit kalori (-300-500 kkal dari kebutuhan harian). Jaga asupan protein tetap tinggi untuk mempertahankan massa otot. Perbanyak konsumsi serat dari sayuran untuk rasa kenyang lebih lama.",
    bulking: "Fokus pada surplus kalori (+300-500 kkal dari kebutuhan harian). Prioritaskan protein tinggi (1.6-2.2g per kg berat badan) dari sumber seperti dada ayam, telur, dan ikan. Pastikan karbohidrat kompleks tercukupi untuk energi.",
    recomposition: "Pertahankan kalori maintenance dengan fokus tinggi pada protein (2.0-2.5g per kg berat badan). Kombinasikan latihan beban dengan cardio moderat untuk hasil optimal."
  };

  const workoutPlans = [
    {
      name: "Latihan Dada & Trisep",
      exercises: [
        { name: "Bench Press", sets: "4 set x 10 repetisi" },
        { name: "Dumbbell Flys", sets: "3 set x 12 repetisi" },
        { name: "Tricep Pushdown", sets: "4 set x 15 repetisi" }
      ]
    },
    {
      name: "Latihan Punggung & Bisep",
      exercises: [
        { name: "Pull-ups", sets: "4 set x 8-12 repetisi" },
        { name: "Barbell Row", sets: "4 set x 10 repetisi" },
        { name: "Bicep Curls", sets: "3 set x 12 repetisi" }
      ]
    },
    {
      name: "Latihan Kaki & Glutes",
      exercises: [
        { name: "Squats", sets: "4 set x 12 repetisi" },
        { name: "Romanian Deadlift", sets: "3 set x 10 repetisi" },
        { name: "Bulgarian Split Squats", sets: "3 set x 12 per kaki" }
      ]
    },
    {
      name: "Latihan Bahu & Core",
      exercises: [
        { name: "Overhead Press", sets: "4 set x 8-10 repetisi" },
        { name: "Lateral Raises", sets: "3 set x 15 repetisi" },
        { name: "Plank", sets: "3 set x 60 detik" }
      ]
    }
  ];

  return (
    <Tabs defaultValue="workout" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="workout">Rekomendasi Latihan</TabsTrigger>
        <TabsTrigger value="nutrition">Rekomendasi Pola Makan</TabsTrigger>
        <TabsTrigger value="sleep">Rekomendasi Pola Tidur</TabsTrigger>
      </TabsList>

      <TabsContent value="workout" className="space-y-6 mt-6">
        {isLoadingPlans ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Menghasilkan rencana latihan dengan AI...</span>
              </div>
            </CardContent>
          </Card>
        ) : aiPlans?.workoutPlan ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rencana Latihan AI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm text-gray-700">
                <pre className="whitespace-pre-wrap font-sans">{aiPlans.workoutPlan}</pre>
              </div>
            </CardContent>
          </Card>
        ) : (
          workoutPlans.map((plan, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.exercises.map((exercise, exerciseIndex) => (
                    <li key={exerciseIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium">{exercise.name}</span>
                      <span className="text-gray-600 text-sm">{exercise.sets}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="nutrition" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Panduan Nutrisi</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPlans ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Menghasilkan panduan nutrisi dengan AI...</span>
              </div>
            ) : aiPlans?.nutritionPlan ? (
              <div className="prose prose-sm text-gray-700">
                <pre className="whitespace-pre-wrap font-sans">{aiPlans.nutritionPlan}</pre>
              </div>
            ) : (
              <div className="prose prose-sm text-gray-700">
                <p className="leading-relaxed">
                  {nutritionContent[userGoal] || nutritionContent.recomposition}
                </p>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Tips Tambahan:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Minum air putih minimal 8-10 gelas per hari</li>
                      <li>Konsumsi makanan whole foods sebanyak mungkin</li>
                      <li>Hindari makanan olahan dan gula berlebih</li>
                      <li>Makan dalam porsi kecil tapi sering (4-6x sehari)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sleep" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Panduan Tidur</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPlans ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Menghasilkan panduan tidur dengan AI...</span>
              </div>
            ) : aiPlans?.sleepPlan ? (
              <div className="prose prose-sm text-gray-700">
                <pre className="whitespace-pre-wrap font-sans">{aiPlans.sleepPlan}</pre>
              </div>
            ) : (
              <div className="prose prose-sm text-gray-700">
                <p className="leading-relaxed mb-6">
                  Tidur berkualitas selama 7-9 jam setiap malam sangat krusial untuk pemulihan otot, 
                  regulasi hormon, dan tingkat energi. Hindari penggunaan gawai 1 jam sebelum tidur.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Tips untuk Tidur Berkualitas:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Tetapkan jadwal tidur yang konsisten</li>
                      <li>Ciptakan lingkungan tidur yang nyaman dan gelap</li>
                      <li>Hindari kafein 6 jam sebelum tidur</li>
                      <li>Lakukan rutinitas relaksasi sebelum tidur</li>
                      <li>Jaga suhu kamar sekitar 18-22°C</li>
                      <li>Gunakan kasur dan bantal yang nyaman</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Manfaat Tidur untuk Fitness:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Mempercepat recovery otot</li>
                      <li>Meningkatkan produksi growth hormone</li>
                      <li>Mengatur hormon lapar (leptin dan ghrelin)</li>
                      <li>Meningkatkan fokus dan motivasi saat latihan</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
