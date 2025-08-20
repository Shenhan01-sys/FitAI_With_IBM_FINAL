import type { UserProfile } from "../shared/schema";

interface ReplicateResponse {
  id: string;
  status: string;
  output?: string[];
  error?: string;
}

export class AIService {
  private apiToken: string;
  private modelVersionHash: string;
  private replicateBaseUrl: string;

  constructor() {
    this.apiToken = process.env.API_TOKEN_IBM || '';
    this.modelVersionHash = process.env.MODEL_IBM_VERSION_HASH || '';
    this.replicateBaseUrl = 'https://api.replicate.com/v1';
    
    console.log('IBM Granite AI Service Configuration:');
    console.log('- API Token configured:', !!this.apiToken);
    console.log('- Model Version Hash configured:', !!this.modelVersionHash);
    console.log('- Using Replicate endpoint for IBM Granite 3.3-8b-instruct');
    
    if (!this.apiToken || !this.modelVersionHash) {
      console.warn('IBM Granite Replicate credentials not configured properly');
    }
  }

  private async makeRequest(prompt: string): Promise<string> {
    if (!this.apiToken || !this.modelVersionHash) {
      console.warn('AI API not configured, using fallback responses');
      return this.getFallbackResponse(prompt);
    }

    try {
      // Step 1: Create prediction
      const predictionResponse = await fetch(`${this.replicateBaseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: this.modelVersionHash,
          input: {
            prompt: prompt,
            max_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
            top_k: 50,
          }
        })
      });

      if (!predictionResponse.ok) {
        const errorText = await predictionResponse.text();
        console.error(`Prediction creation failed: ${predictionResponse.status}`, errorText);
        return this.getFallbackResponse(prompt);
      }

      const prediction = await predictionResponse.json() as ReplicateResponse;
      console.log('Prediction created:', prediction.id);

      // Step 2: Poll for completion
      const result = await this.pollForCompletion(prediction.id);
      
      if (result && result.length > 0) {
        return result.join('');
      } else {
        return this.getFallbackResponse(prompt);
      }

    } catch (error) {
      console.error('AI API Error:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  private async pollForCompletion(predictionId: string, maxAttempts: number = 30): Promise<string[] | null> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.replicateBaseUrl}/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${this.apiToken}`,
          }
        });

        if (!response.ok) {
          console.error(`Polling failed: ${response.status}`);
          continue;
        }

        const result = await response.json() as ReplicateResponse;
        
        if (result.status === 'succeeded' && result.output) {
          console.log('Prediction completed successfully');
          return result.output;
        } else if (result.status === 'failed') {
          console.error('Prediction failed:', result.error);
          return null;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error('Polling error:', error);
      }
    }

    console.warn('Polling timeout reached');
    return null;
  }

  private getFallbackResponse(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('program latihan') || promptLower.includes('jadwal latihan')) {
      return `SENIN: Latihan Dada & Trisep
- Bench Press: 4 set x 8-10 repetisi
- Incline Dumbbell Press: 3 set x 10-12 repetisi
- Tricep Dips: 3 set x 12-15 repetisi
- Push-ups: 2 set hingga gagal

SELASA: Latihan Punggung & Bisep
- Pull-ups: 4 set x 6-8 repetisi
- Barbell Row: 4 set x 8-10 repetisi
- Hammer Curls: 3 set x 12-15 repetisi
- Lat Pulldown: 3 set x 10-12 repetisi

RABU: Istirahat Aktif
- Jalan kaki 30 menit
- Stretching ringan
- Yoga atau meditasi

KAMIS: Latihan Kaki & Glutes
- Squats: 4 set x 10-12 repetisi
- Romanian Deadlift: 3 set x 8-10 repetisi
- Lunges: 3 set x 12 per kaki
- Calf Raises: 3 set x 15-20 repetisi

JUMAT: Latihan Bahu & Core
- Overhead Press: 4 set x 8-10 repetisi
- Lateral Raises: 3 set x 12-15 repetisi
- Plank: 3 set x 60 detik
- Russian Twists: 3 set x 20 repetisi

SABTU: Cardio HIIT
- 20 menit HIIT training
- 5 menit warm-up, 10 menit interval, 5 menit cool-down

MINGGU: Istirahat Total
- Recovery penuh
- Hidrasi yang cukup
- Persiapan untuk minggu depan`;
    }
    
    if (promptLower.includes('nutrisi') || promptLower.includes('pola makan')) {
      return `TARGET KALORI HARIAN: 2000-2200 kkal

PEMBAGIAN MAKRONUTRIEN:
- Protein: 25-30% (125-165g)
- Karbohidrat: 40-45% (200-248g)
- Lemak: 25-30% (56-73g)

MAKANAN YANG DIREKOMENDASIKAN:
Protein: Dada ayam, ikan salmon, telur, tahu, tempe
Karbohidrat: Nasi merah, oats, ubi, quinoa
Lemak sehat: Alpukat, kacang-kacangan, minyak zaitun

POLA MAKAN HARIAN:
- Sarapan: Oats + protein powder + buah
- Snack pagi: Yogurt Greek + kacang almond
- Makan siang: Nasi merah + dada ayam + sayuran
- Snack sore: Protein shake + pisang
- Makan malam: Ikan + ubi + brokoli
- Sebelum tidur: Casein protein (opsional)

TIPS PENTING:
- Minum air 2.5-3 liter per hari
- Makan setiap 3-4 jam
- Hindari makanan olahan berlebih
- Konsumsi protein dalam setiap makan`;
    }
    
    if (promptLower.includes('tidur') || promptLower.includes('istirahat')) {
      return `DURASI TIDUR IDEAL: 7-9 jam per malam

JADWAL TIDUR OPTIMAL:
- Tidur: 22:00 - 06:00 WIB
- Konsisten setiap hari, termasuk weekend

RUTINITAS SEBELUM TIDUR:
- 21:00: Matikan gadget dan lampu terang
- 21:15: Mandi air hangat atau baca buku
- 21:30: Meditasi atau latihan pernapasan
- 22:00: Tidur dalam kamar gelap dan sejuk

TIPS KUALITAS TIDUR:
- Suhu kamar 18-22°C
- Kamar gelap total (blackout curtains)
- Tidak ada suara bising
- Kasur dan bantal nyaman
- Hindari kafein setelah jam 15:00
- Tidak makan berat 3 jam sebelum tidur

MANFAAT UNTUK FITNESS:
- Pemulihan otot optimal
- Produksi growth hormone meningkat
- Pengaturan hormon lapar (leptin/ghrelin)
- Energi dan fokus latihan lebih baik
- Sistem imun lebih kuat

JIKA SULIT TIDUR:
- Progressive muscle relaxation
- Teknik pernapasan 4-7-8
- White noise atau musik instrumental
- Hindari olahraga 4 jam sebelum tidur`;
    }
    
    if (promptLower.includes('protein')) {
      return "Protein sangat penting untuk membangun dan memperbaiki otot. Konsumsi 1.6-2.2g protein per kg berat badan. Sumber terbaik: dada ayam, ikan, telur, Greek yogurt, dan quinoa.";
    }
    
    if (promptLower.includes('cardio')) {
      return "Cardio membantu kesehatan jantung dan pembakaran lemak. Lakukan 150 menit cardio sedang per minggu atau 75 menit cardio intensif. HIIT sangat efektif untuk pembakaran lemak.";
    }
    
    if (promptLower.includes('pemanasan')) {
      return "Pemanasan wajib 5-10 menit sebelum latihan untuk mencegah cedera. Mulai dengan gerakan ringan, lalu dynamic stretching, dan aktivasi otot target.";
    }
    
    return "Terima kasih atas pertanyaannya! Saya siap membantu dengan topik fitness, nutrisi, dan kesehatan. Silakan tanyakan hal spesifik yang ingin Anda ketahui.";
  }

  async generateWorkoutPlan(profile: UserProfile): Promise<string> {
    const goalText = {
      cutting: 'menurunkan lemak tubuh',
      bulking: 'menambah massa otot',
      recomposition: 'rekomposisi tubuh (mengurangi lemak dan menambah otot)'
    };

    const prompt = `Sebagai ahli fitness profesional, buatkan program latihan mingguan untuk:
- Berat badan: ${profile.weight} kg
- Persentase lemak tubuh: ${profile.bodyFat}%
- Persentase massa otot: ${profile.muscleMass}%
- Usia: ${profile.age} tahun
- Tujuan: ${goalText[profile.goal as keyof typeof goalText] || 'umum'}

Berikan jadwal latihan 7 hari dengan format yang detail:
SENIN: [Nama Latihan] - [3-4 latihan spesifik dengan set x rep]
SELASA: [Nama Latihan] - [3-4 latihan spesifik dengan set x rep]
RABU: [Istirahat Aktif/Recovery] - [Aktivitas ringan]
KAMIS: [Nama Latihan] - [3-4 latihan spesifik dengan set x rep]
JUMAT: [Nama Latihan] - [3-4 latihan spesifik dengan set x rep]
SABTU: [Cardio/HIIT] - [Jenis dan durasi]
MINGGU: [Istirahat Total] - [Recovery tips]

Sesuaikan intensitas dengan kondisi fisik dan tujuan yang ingin dicapai.`;

    return await this.makeRequest(prompt);
  }

  async generateNutritionPlan(profile: UserProfile): Promise<string> {
    const goalText = {
      cutting: 'defisit kalori untuk menurunkan lemak',
      bulking: 'surplus kalori untuk menambah massa otot',
      recomposition: 'kalori maintenance untuk rekomposisi tubuh'
    };

    const prompt = `Sebagai ahli nutrisi, buatkan rencana diet untuk:
- Berat badan: ${profile.weight} kg
- Persentase lemak tubuh: ${profile.bodyFat}%
- Persentase massa otot: ${profile.muscleMass}%
- Usia: ${profile.age} tahun
- Tujuan: ${goalText[profile.goal as keyof typeof goalText] || 'umum'}

Berikan panduan lengkap meliputi:
1. Target kalori harian
2. Pembagian makronutrien (protein, karbohidrat, lemak)
3. Jadwal makan (5-6 kali sehari)
4. Contoh menu harian
5. Makanan yang direkomendasikan dan dihindari
6. Tips suplemen (jika diperlukan)

Sesuaikan dengan kondisi tubuh dan target yang ingin dicapai.`;

    return await this.makeRequest(prompt);
  }

  async generateSleepPlan(profile: UserProfile): Promise<string> {
    const prompt = `Sebagai ahli kesehatan, buatkan rencana tidur optimal untuk:
- Usia: ${profile.age} tahun
- Target fitness: ${profile.goal}
- Aktivitas latihan intensif

Berikan panduan meliputi:
1. Durasi tidur ideal
2. Jadwal tidur yang konsisten
3. Rutinitas sebelum tidur
4. Tips kualitas tidur
5. Hubungan tidur dengan recovery otot
6. Cara mengatasi gangguan tidur

Fokus pada optimalisasi pemulihan dan performa atlet.`;

    return await this.makeRequest(prompt);
  }

  async generateWeeklySchedule(profile: UserProfile): Promise<Array<{name: string, workout: string}>> {
    const goalText = {
      cutting: 'menurunkan lemak tubuh dengan cardio lebih intensif',
      bulking: 'menambah massa otot dengan fokus strength training',
      recomposition: 'kombinasi strength training dan cardio moderat'
    };

    const prompt = `Sebagai ahli fitness, buatkan jadwal mingguan singkat untuk tujuan ${goalText[profile.goal as keyof typeof goalText] || 'fitness umum'}.

Berikan dalam format:
Senin: [Nama latihan singkat]
Selasa: [Nama latihan singkat]
Rabu: [Nama latihan singkat]
Kamis: [Nama latihan singkat]
Jumat: [Nama latihan singkat]
Sabtu: [Nama latihan singkat]
Minggu: [Nama latihan singkat]

Contoh: "Latihan Dada & Trisep" atau "Cardio HIIT" atau "Istirahat Aktif"`;

    try {
      const response = await this.makeRequest(prompt);
      
      const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      const schedule = days.map((day, index) => {
        const dayPattern = new RegExp(`${day}:\\s*(.+)`, 'i');
        const match = response.match(dayPattern);
        
        const fallbackSchedule = {
          cutting: [
            'Latihan Upper Body & Cardio',
            'Latihan Lower Body',
            'Cardio HIIT',
            'Latihan Push (Dada, Bahu, Trisep)',
            'Latihan Pull (Punggung, Bisep)',
            'Cardio Steady State',
            'Istirahat Total'
          ],
          bulking: [
            'Latihan Dada & Trisep',
            'Latihan Punggung & Bisep',
            'Istirahat Aktif',
            'Latihan Kaki & Glutes',
            'Latihan Bahu & Core',
            'Latihan Full Body',
            'Istirahat Total'
          ],
          recomposition: [
            'Latihan Upper Body',
            'Latihan Lower Body',
            'Cardio & Core',
            'Latihan Push',
            'Latihan Pull',
            'Functional Training',
            'Istirahat Total'
          ]
        };
        
        return {
          name: day,
          workout: match ? match[1].trim() : fallbackSchedule[profile.goal as keyof typeof fallbackSchedule]?.[index] || 'Latihan Umum'
        };
      });
      
      return schedule;
    } catch (error) {
      console.error('Error generating weekly schedule:', error);
      return [
        { name: 'Senin', workout: 'Latihan Dada & Trisep' },
        { name: 'Selasa', workout: 'Latihan Punggung & Bisep' },
        { name: 'Rabu', workout: 'Istirahat Aktif' },
        { name: 'Kamis', workout: 'Latihan Kaki & Glutes' },
        { name: 'Jumat', workout: 'Latihan Bahu & Core' },
        { name: 'Sabtu', workout: 'Cardio & Stretching' },
        { name: 'Minggu', workout: 'Istirahat Total' }
      ];
    }
  }

  async generateChatResponse(message: string, profile?: UserProfile): Promise<string> {
    let contextPrompt = `Sebagai asisten fitness AI yang ahli, jawab pertanyaan berikut dengan informatif dan membantu: "${message}"`;
    
    if (profile) {
      contextPrompt += `\n\nKonteks pengguna:
- Berat: ${profile.weight} kg
- Body fat: ${profile.bodyFat}%
- Massa otot: ${profile.muscleMass}%
- Usia: ${profile.age} tahun
- Tujuan: ${profile.goal}

Berikan saran yang dipersonalisasi sesuai profil pengguna.`;
    }

    return await this.makeRequest(contextPrompt);
  }
}

export const aiService = new AIService();