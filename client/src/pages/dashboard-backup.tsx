import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import OnboardingModal from "@/components/onboarding-modal";
import WeeklySchedule from "@/components/weekly-schedule";
import UserProfileCard from "@/components/user-profile-card";
import ProgressCard from "@/components/progress-card";
import MotivationalAlert from "@/components/motivational-alert";
import AIChat from "@/components/ai-chat";
import type { UserProfile } from "@shared/schema";

export default function Dashboard() {
  const [showAlert, setShowAlert] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<UserProfile | null>({
    queryKey: ['/api/profile'],
    retry: false,
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const res = await apiRequest("POST", "/api/profile", profileData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    },
  });

  const updateCompletionMutation = useMutation({
    mutationFn: async (completed: Record<string, boolean>) => {
      const res = await apiRequest("PATCH", "/api/profile/completion", { completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    },
  });

  const handleOnboardingComplete = (formData: any) => {
    createProfileMutation.mutate(formData);
  };

  const handleToggleCompletion = (dayId: string) => {
    if (!profile) return;
    
    const newCompleted = {
      ...(profile.completed || {}),
      [dayId]: !(profile.completed || {})[dayId]
    };
    
    updateCompletionMutation.mutate(newCompleted);
    
    if (!(profile.completed || {})[dayId]) {
      setShowAlert(true);
    }
  };

  const showOnboarding = !isLoading && !profile;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Selamat Datang{profile?.name ? `, ${profile.name}` : ''}!
          </h1>
          <p className="text-gray-600 mt-2">Mari capai target fitness Anda hari ini</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {profile && (
              <WeeklySchedule 
                completed={profile.completed || {}}
                onToggleCompletion={handleToggleCompletion}
                disabled={updateCompletionMutation.isPending}
              />
            )}
          </div>
          
          <div className="space-y-6">
            {profile && <UserProfileCard profile={profile} />}
            {profile && <ProgressCard profile={profile} />}
          </div>
        </div>
      </main>

      {showAlert && (
        <MotivationalAlert onClose={() => setShowAlert(false)} />
      )}

      <OnboardingModal 
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        isLoading={createProfileMutation.isPending}
      />

      <AIChat />
    </div>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <WeeklySchedule 
              completed={profile?.completed || {}}
              onToggleCompletion={handleToggleCompletion}
              disabled={updateCompletionMutation.isPending}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <UserProfileCard userGoal={profile?.goal || ''} />
            <ProgressCard completed={profile?.completed || {}} />
          </div>
        </div>
      </main>

      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={handleOnboardingComplete}
        isLoading={createProfileMutation.isPending}
      />
      
      <MotivationalAlert 
        isVisible={showAlert}
        onHide={() => setShowAlert(false)}
      />
      
      <AIChat />
    </div>
  );
}
