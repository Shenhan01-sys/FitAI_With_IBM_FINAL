import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import DetailedPlan from "@/components/detailed-plan";
import type { UserProfile } from "@shared/schema";

export default function Plan() {
  const { data: profile, isLoading } = useQuery<UserProfile | null>({
    queryKey: ['/api/profile'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Memuat rencana...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Profil tidak ditemukan</h2>
          <p className="text-gray-600 mb-6">Silakan lengkapi profil Anda terlebih dahulu.</p>
          <Link href="/dashboard" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-700 hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali ke Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Rencana Detail Saya</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DetailedPlan userGoal={profile.goal} />
      </main>
    </div>
  );
}
