import type { UserProfile } from "@shared/schema";

interface AIResponse {
  generated_text: string;
}

export class AIService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.IBM_GRANITE_API_KEY || '';
    
    // Use watsonx.ai endpoint with fallback to environment variable
    const watsonxUrl = process.env.IBM_WATSONX_API_URL || 'https://us-south.ml.cloud.ibm.com';
    const projectId = process.env.IBM_WATSONX_PROJECT_ID || '';
    
    // If we have a proper watsonx URL, use it; otherwise fallback to environment
    if (watsonxUrl.startsWith('http')) {
      this.apiUrl = `${watsonxUrl}/ml/v1/text/generation${projectId ? `?version=2023-05-29&project_id=${projectId}` : '?version=2023-05-29'}`;
    } else {
      this.apiUrl = process.env.IBM_GRANITE_API_URL || '';
    }
    
    // Log configuration status for debugging
    console.log('AI Service Configuration:');
    console.log('- API Key configured:', !!this.apiKey);
    console.log('- Using watsonx.ai endpoint:', watsonxUrl.startsWith('http'));
    console.log('- Project ID configured:', !!projectId);
    console.log('- Final API URL valid:', this.apiUrl.startsWith('http://') || this.apiUrl.startsWith('https://'));
    
    if (!this.apiKey) {
      console.warn('IBM Granite API key not configured');
    }
  }

  private async makeRequest(prompt: string): Promise<string> {
    // Check for API configuration
    if (!this.apiKey || !this.apiUrl) {
      console.warn('AI API not configured, using fallback responses');
      return this.getFallbackResponse(prompt);
    }

    // Check if URL is valid (not just the API key)
    if (!this.apiUrl.startsWith('http://') && !this.apiUrl.startsWith('https://')) {
      console.error('Invalid API URL format. Expected URL but got:', this.apiUrl.substring(0, 20) + '...');
      return this.getFallbackResponse(prompt);
    }

    try {

      const requestBody = {
        model_id: "ibm/granite-13b-instruct-v2",
        input: prompt,
        parameters: {
          decoding_method: "greedy",
          max_new_tokens: 500,
          min_new_tokens: 1,
          temperature: 0.7,
          top_k: 50,
          top_p: 0.9,
          repetition_penalty: 1.0
        }
      };

      console.log('Making API request to:', this.apiUrl);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed: ${response.status} ${response.statusText}`);
        console.error('Error response:', errorText);
        
        // If it's an authentication error, provide specific feedback
        if (response.status === 401) {
          console.error('Authentication failed - API key might be invalid');
        } else if (response.status === 403) {
          console.error('Access forbidden - check project permissions');
        }
        
        return this.getFallbackResponse(prompt);
      }

      const data = await response.json();
      console.log('API response:', JSON.stringify(data, null, 2));
      
      // Handle different response formats
      if (data.results && data.results.length > 0) {
        const generatedText = data.results[0].generated_text || "";
        console.log('Generated text received:', generatedText.substring(0, 100) + '...');
        return generatedText || this.getFallbackResponse(prompt);
      } else if (data.generated_text) {
        return data.generated_text;
      } else if (data.choices && data.choices.length > 0) {
        return data.choices[0].text || data.choices[0].message?.content || this.getFallbackResponse(prompt);
      } else {
        console.error('Unexpected API response format:', data);
        return this.getFallbackResponse(prompt);
      }
    } catch (error) {
      console.error('AI API Error:', error);
      if (error instanceof TypeError && error.message.includes('Invalid URL')) {
        return this.getFallbackResponse(prompt);
      }
      return this.getFallbackResponse(prompt);
    }
  }

  private getFallbackResponse(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    
    // Workout plan fallbacks
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
    
    // Nutrition plan fallbacks
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
    
    // Sleep plan fallbacks
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
    
    // Chat fallbacks
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

    const prompt = `
Sebagai ahli fitness profesional, buatkan program latihan mingguan untuk:
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

Sesuaikan intensitas dengan kondisi fisik dan tujuan yang ingin dicapai.
`;

    return await this.makeRequest(prompt);
  }

  async generateWeeklySchedule(profile: UserProfile): Promise<Array<{name: string, workout: string}>> {
    const goalText = {
      cutting: 'menurunkan lemak tubuh dengan cardio lebih intensif',
      bulking: 'menambah massa otot dengan fokus strength training',
      recomposition: 'kombinasi strength training dan cardio moderat'
    };

    const prompt = `
Sebagai ahli fitness, buatkan jadwal mingguan singkat untuk tujuan ${goalText[profile.goal as keyof typeof goalText] || 'fitness umum'}.

Berikan dalam format:
Senin: [Nama latihan singkat]
Selasa: [Nama latihan singkat]
Rabu: [Nama latihan singkat]
Kamis: [Nama latihan singkat]
Jumat: [Nama latihan singkat]
Sabtu: [Nama latihan singkat]
Minggu: [Nama latihan singkat]

Contoh: "Latihan Dada & Trisep" atau "Cardio HIIT" atau "Istirahat Aktif"
`;

    try {
      const response = await this.makeRequest(prompt);
      
      // Parse the response into array format
      const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      const schedule = days.map((day, index) => {
        const dayPattern = new RegExp(`${day}:\\s*(.+)`, 'i');
        const match = response.match(dayPattern);
        
        // Fallback schedule based on goal if AI response can't be parsed
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
      // Return default schedule
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

  async generateNutritionPlan(profile: UserProfile): Promise<string> {
    const goalText = {
      cutting: 'defisit kalori untuk menurunkan lemak',
      bulking: 'surplus kalori untuk menambah massa otot',
      recomposition: 'maintenance kalori dengan fokus protein tinggi'
    };

    const prompt = `
Sebagai ahli nutrisi olahraga, buatkan panduan pola makan untuk:
- Berat badan: ${profile.weight} kg
- Persentase lemak tubuh: ${profile.bodyFat}%
- Persentase massa otot: ${profile.muscleMass}%
- Usia: ${profile.age} tahun
- Tujuan: ${goalText[profile.goal as keyof typeof goalText] || 'umum'}

Berikan rekomendasi:
1. Target kalori harian
2. Pembagian makronutrien (protein, karbohidrat, lemak)
3. Contoh makanan yang direkomendasikan
4. Tips pola makan

Sesuaikan dengan kondisi tubuh dan tujuan yang ingin dicapai.
`;

    return await this.makeRequest(prompt);
  }

  async generateSleepPlan(profile: UserProfile): Promise<string> {
    const prompt = `
Sebagai ahli sleep health dan recovery, buatkan panduan pola tidur untuk:
- Usia: ${profile.age} tahun
- Aktivitas: Program fitness intensif
- Tujuan: Optimalisasi recovery dan performa

Berikan rekomendasi:
1. Durasi tidur ideal
2. Jadwal tidur yang optimal
3. Tips untuk meningkatkan kualitas tidur
4. Hubungan tidur dengan recovery otot

Berikan panduan praktis dan mudah diterapkan.
`;

    return await this.makeRequest(prompt);
  }

  async generateChatResponse(userMessage: string, profile?: UserProfile): Promise<string> {
    const contextInfo = profile ? `
Context pengguna:
- Berat: ${profile.weight}kg, Lemak: ${profile.bodyFat}%, Otot: ${profile.muscleMass}%
- Usia: ${profile.age} tahun, Tujuan: ${profile.goal}
` : '';

    const prompt = `
Anda adalah FitAI, asisten fitness profesional yang ramah dan berpengetahuan luas.
${contextInfo}

Pertanyaan pengguna: "${userMessage}"

Berikan jawaban yang:
- Relevan dengan konteks fitness/kesehatan
- Praktis dan mudah dipahami
- Menggunakan bahasa Indonesia yang natural
- Singkat tapi informatif (maksimal 100 kata)
- Mendorong pola hidup sehat

Jika pertanyaan di luar topik fitness, arahkan kembali ke topik kesehatan dengan sopan.
`;

    return await this.makeRequest(prompt);
  }
}

export const aiService = new AIService();