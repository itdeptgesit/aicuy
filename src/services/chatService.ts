const SYSTEM_INSTRUCTION = `
Nama lo adalah Cuy. Lo adalah asisten AI serba bisa yang super chill, cerdas, dan suportif banget. Lo bukan cuma ahli koding, tapi teman ngobrol yang asik buat bahas apa aja (sains, sejarah, lifestyle, or even curhat tipis-tipis).

### KEPRIBADIAN:
- Santai, asik, enerjik, dan selalu positif (vibe-nya kayak mentor yang juga teman nongkrong).
- Pake gaya bahasa Indonesia yang kasual/gaul tapi tetep sopan. Gunakan sapaan "lo/gue" atau "aku/kamu" tergantung konteks yang nyaman buat user.
- Jangan kaku! Kalo user nanya hal receh, bales dengan receh juga. Kalo user serius, kasih jawaban pro tapi tetep dibungkus gaya santai.
- Gak pernah judge user, apalagi pemula. Bantuin mereka sampe paham dengan sabar.

### PENGETAHUAN:
1. **Tech & Coding**: Ini makanan sehari-hari. Jago JS, Python, PHP, Java, dsb. Selalu saranin cara tercepat/terkeren pake AI tools.
2. **General Knowledge**: Luas banget! Bisa jelasin fisika kuantum sampe sejarah Majapahit dengan bahasa yang gampang dimengerti.
3. **NgodingPakeAI**: Paham banget alur belajar di platform ini.

### GAYA BICARA:
- Selalu mulai atau akhiri dengan catchphrase asik kayak "Halo! Cuy di sini! ✨", "Semangat ngodingnya, Bos! 🚀", atau "Gas terus belajarnya! 🔥".
- Sering pake emoji yang pas biar gak keliatan kayak robot (💻, ✨, 🚀, 🔥, 📚, 🧠, 😎, 🙌).
- Hindari bahasa yang terlalu formal kayak "Saya akan membantu Anda...". Ganti jadi "Gue bantu lo...", "Bisa banget, nih ceritanya...", "Oke, gas!".
- Kalo ngejelasin panjang, kasih "TL;DR" atau ringkasan singkat di akhir biar user gak pusing.

### ATURAN MAIN:
- Tetep jaga etika & keamanan.
- Tetap jadi "Cuy" yang asik dan solutif!
`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | any[];
}

export class ChatService {
  private apiKey: string;
  private currentModel: string;

  constructor(model?: string) {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || "";
    this.currentModel = model || "google/gemini-2.0-flash-001";
  }

  setModel(model: string) {
    this.currentModel = model;
  }

  async sendMessage(message: string, history: ChatMessage[] = [], imageBase64?: string) {
    try {
      const userContent: any[] = [{ type: "text", text: message }];
      if (imageBase64) {
        userContent.push({
          type: "image_url",
          image_url: { url: imageBase64 }
        });
      }

      const messages = [
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...history,
        { role: "user", content: userContent }
      ];

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Cuy AI",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.currentModel,
          messages: messages
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "OpenRouter Error");
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error sending message to OpenRouter:", error);
      return "Waduh, Cuy gagal konek ke OpenRouter nih! ✨ Error: " + (error as Error).message;
    }
  }

  async generateImage(prompt: string) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Cuy AI",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "black-forest-labs/flux-schnell",
          messages: [
            { role: "user", content: `Generate an image based on this description: ${prompt}` }
          ]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "Gagal bikin gambar");
      
      const content = data.choices[0].message.content;
      const urlMatch = content.match(/\((https:\/\/.*?)\)/) || content.match(/(https:\/\/.*?)/);
      return urlMatch ? urlMatch[1] : content;
    } catch (error) {
      console.error("Image generation error:", error);
      throw error;
    }
  }

  async sendMessageStream(message: string, onChunk: (chunk: string) => void, history: ChatMessage[] = [], imageBase64?: string) {
    try {
      const userContent: any[] = [{ type: "text", text: message }];
      if (imageBase64) {
        userContent.push({
          type: "image_url",
          image_url: { url: imageBase64 }
        });
      }

      const messages = [
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...history,
        { role: "user", content: userContent }
      ];

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Cuy AI",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.currentModel,
          messages: messages,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Streaming failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error("ReadableStream not supported");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(line => line.trim() !== "");

        for (const line of lines) {
          if (line.includes("data: [DONE]")) break;
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));
              const content = data.choices[0]?.delta?.content || "";
              if (content) onChunk(content);
            } catch (e) {
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming from OpenRouter:", error);
      onChunk("Sorry Boss, ada kendala koneksi! ✨ Error: " + (error as Error).message);
    }
  }
}
