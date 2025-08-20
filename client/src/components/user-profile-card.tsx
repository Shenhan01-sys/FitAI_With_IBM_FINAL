import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

interface UserProfileCardProps {
  profile: {
    name: string;
    goal: string;
  };
}

export default function UserProfileCard({ profile }: UserProfileCardProps) {
  const goalText: Record<string, string> = {
    cutting: 'Cutting (Menurunkan Lemak)',
    bulking: 'Bulking (Menambah Otot)',
    recomposition: 'Body Recomposition'
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{profile.name}</h3>
            <p className="text-sm text-gray-600">Target: {goalText[profile.goal] || 'Belum ditentukan'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
