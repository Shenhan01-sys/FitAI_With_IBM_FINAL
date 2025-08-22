// Removed auto-redirect effect so onboarding stays visible even if local profile exists
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import OnboardingModal from "@/components/onboarding-modal";
import Navigation from "@/components/navigation";
import type { UserProfile } from "@shared/schema";
import { useLocation } from "wouter";

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<UserProfile | null>({
    queryKey: ["/api/profile"],
    retry: false,
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const res = await apiRequest("POST", "/api/profile", profileData);
      try {
        window.localStorage.setItem("userProfile", JSON.stringify(profileData));
      } catch {}
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/profile"], data);
      navigate("/dashboard");
    },
    onError: async (err: any) => {
      // Minimal user feedback when API fails (e.g., Netlify Dev not proxying /api)
      const message = err?.message || "Gagal membuat profil.";
      console.error("Onboarding submit error:", message);
      try { alert(`Gagal membuat profil: ${message}`); } catch {}
    }
  });

  // Note: We intentionally do not auto-redirect here to avoid bouncing back to dashboard.
  // Navigation to dashboard happens only after successful submit above.

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <OnboardingModal
        isOpen={true}
        onComplete={(data) => createProfileMutation.mutate(data)}
        isLoading={createProfileMutation.isPending}
      />
    </div>
  );
}
