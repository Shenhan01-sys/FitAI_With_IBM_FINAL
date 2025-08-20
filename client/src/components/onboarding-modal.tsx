import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: any) => void;
  isLoading?: boolean;
}

export default function OnboardingModal({ isOpen, onComplete, isLoading = false }: OnboardingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    weight: '',
    bodyFat: '',
    muscleMass: '',
    age: '',
    goal: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      name: formData.name,
      weight: parseInt(formData.weight),
      bodyFat: parseInt(formData.bodyFat),
      muscleMass: parseInt(formData.muscleMass),
      age: parseInt(formData.age),
      goal: formData.goal
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md scale-in">
        <CardHeader>
          <CardTitle>Selamat Datang di FitAI!</CardTitle>
          <CardDescription>
            Ceritakan tentang diri Anda untuk mendapatkan rencana yang dipersonalisasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ahmad Rizki"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="weight">Berat Badan (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="70"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="bodyFat">Persentase Lemak Tubuh (%)</Label>
              <Input
                id="bodyFat"
                type="number"
                value={formData.bodyFat}
                onChange={(e) => handleInputChange('bodyFat', e.target.value)}
                placeholder="15"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="muscleMass">Persentase Massa Otot (%)</Label>
              <Input
                id="muscleMass"
                type="number"
                value={formData.muscleMass}
                onChange={(e) => handleInputChange('muscleMass', e.target.value)}
                placeholder="40"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="age">Usia</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="25"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="goal">Tujuan</Label>
              <Select value={formData.goal} onValueChange={(value) => handleInputChange('goal', value)} required disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tujuan Anda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cutting">Cutting (Menurunkan Lemak)</SelectItem>
                  <SelectItem value="bulking">Bulking (Menambah Otot)</SelectItem>
                  <SelectItem value="recomposition">Body Recomposition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !formData.name || !formData.weight || !formData.bodyFat || !formData.muscleMass || !formData.age || !formData.goal}
            >
              {isLoading ? "Membuat..." : "Buat Rencana Saya"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
