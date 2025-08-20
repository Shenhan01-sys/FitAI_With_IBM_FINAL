import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

interface MotivationalAlertProps {
  onClose: () => void;
}

export default function MotivationalAlert({ onClose }: MotivationalAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const motivationalPhrases = [
    'Kerja Bagus! Terus Jaga Konsistensi!',
    'Selesai! Satu langkah lebih dekat ke tujuanmu!',
    'Luar Biasa! Tubuhmu akan berterima kasih.',
    'Mantap! Kamu sedang membangun kebiasaan yang hebat!',
    'Sukses! Dedikasi ini yang akan membawa perubahan!'
  ];

  const randomPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-40 slide-in">
      <div className="bg-primary-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
        <CheckCircle className="w-6 h-6 text-white" />
        <span className="font-medium">{randomPhrase}</span>
      </div>
    </div>
  );
}
