import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressCardProps {
  profile: {
    completed: Record<string, boolean> | null;
  };
}

export default function ProgressCard({ profile }: ProgressCardProps) {
  const completed = profile.completed || {};
  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = 7;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const getMotivationalText = () => {
    if (completedCount === totalCount) return 'Hebat! Semua latihan selesai!';
    if (completedCount > 4) return 'Hampir selesai!';
    if (completedCount > 2) return 'Pertahankan!';
    return 'Ayo semangat!';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Minggu Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-200"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${percentage}, 100`}
                className="progress-ring text-primary-600"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{completedCount}</span> dari {totalCount} latihan selesai
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {getMotivationalText()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
