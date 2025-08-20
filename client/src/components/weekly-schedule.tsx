import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface WeeklyScheduleProps {
  completed: Record<string, boolean>;
  onToggleCompletion: (dayId: string) => void;
  disabled?: boolean;
}

export default function WeeklySchedule({ completed, onToggleCompletion, disabled = false }: WeeklyScheduleProps) {
  const { data: aiSchedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['/api/generate-schedule'],
    queryFn: async () => {
      const response = await fetch('/api/generate-schedule', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to generate AI schedule');
      }
      return response.json();
    },
    retry: 1,
  });

  const defaultDays = [
    { id: 'mon', name: 'Senin', workout: 'Latihan Dada & Trisep' },
    { id: 'tue', name: 'Selasa', workout: 'Latihan Punggung & Bisep' },
    { id: 'wed', name: 'Rabu', workout: 'Istirahat Aktif' },
    { id: 'thu', name: 'Kamis', workout: 'Latihan Kaki & Glutes' },
    { id: 'fri', name: 'Jumat', workout: 'Latihan Bahu & Core' },
    { id: 'sat', name: 'Sabtu', workout: 'Cardio & Stretching' },
    { id: 'sun', name: 'Minggu', workout: 'Istirahat Total' }
  ];

  // Map AI schedule to the format with IDs
  const days = aiSchedule?.schedule 
    ? aiSchedule.schedule.map((day: {name: string, workout: string}, index: number) => ({
        id: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][index],
        name: day.name,
        workout: day.workout
      }))
    : defaultDays;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Jadwal Latihan Mingguan Saya
          {isLoadingSchedule && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Menghasilkan dengan AI...)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {days.map((day) => (
            <div 
              key={day.id} 
              className={`border border-gray-200 rounded-lg p-4 card-hover cursor-pointer transition-colors ${
                completed[day.id] ? 'bg-primary-50 border-primary-200' : 'bg-white'
              }`}
              onClick={() => !disabled && onToggleCompletion(day.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{day.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{day.workout}</p>
                </div>
                <Checkbox
                  checked={completed[day.id] || false}
                  onCheckedChange={() => !disabled && onToggleCompletion(day.id)}
                  disabled={disabled}
                  className="mt-1"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
