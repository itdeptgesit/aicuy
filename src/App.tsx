import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Code2, Terminal, MessageSquare, User, Bot, Loader2, 
  FileText, Trophy, Users, BookOpen, Home, History, Settings, Moon, 
  Sun, Plus, Mic, LayoutGrid, Bell, Store, Search, ChevronDown, MoreHorizontal,
  ChevronLeft, ChevronRight, RefreshCw, Share2, Crown, Zap, Trash2, Copy, Check,
  LayoutDashboard, ArrowLeft, ArrowRight, LogOut, LogIn, Mail, Lock, UserPlus,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ChatService } from './services/chatService';
import { supabase } from './lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { cn } from './lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
}

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  comingSoon?: boolean;
  iconBg: string;
}

const ActionCard = ({ icon, title, description, onClick, comingSoon, iconBg }: ActionCardProps) => (
  <motion.button
    whileHover={comingSoon ? {} : { scale: 1.01, translateY: -2 }}
    whileTap={comingSoon ? {} : { scale: 0.99 }}
    onClick={comingSoon ? undefined : onClick}
    className={cn(
      "flex flex-col items-start p-6 rounded-xl border text-left transition-all h-full relative group overflow-hidden",
      comingSoon 
        ? "bg-muted/50 border-border cursor-not-allowed opacity-60" 
        : "bg-card border-border hover:border-primary/50 hover:bg-accent/5"
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-transparent group-hover:from-blue-500/5 transition-colors duration-500" />
    {comingSoon && (
      <div className="absolute top-4 right-4 bg-[#1e1e20] px-2 py-1 rounded-full border border-[#2a2a2d]">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Soon</span>
      </div>
    )}
    <div className={cn("p-2.5 rounded-lg mb-4 relative z-10", iconBg)}>
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-foreground mb-1 font-sans tracking-tight relative z-10">{title}</h3>
    <p className="text-xs text-muted-foreground leading-relaxed font-normal relative z-10">{description}</p>
  </motion.button>
);

interface PRDQuestionProps {
  number: number;
  question: string;
  options?: string[];
  multiSelect?: boolean;
  onSelect: (value: string | string[]) => void;
  selectedValues: string[];
  onSkip: () => void;
  isSkipped: boolean;
  isCustom?: boolean;
}

interface DynamicQuestion {
  id: number;
  question: string;
  options?: string[];
  multiSelect?: boolean;
  isCustom?: boolean;
}

const PRDQuestion = ({ number, question, options, multiSelect, onSelect, selectedValues, onSkip, isSkipped, isCustom }: PRDQuestionProps) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customOptionValue, setCustomOptionValue] = useState('');

  const toggleOption = (option: string) => {
    if (multiSelect) {
      const newValues = selectedValues.includes(option)
        ? selectedValues.filter(v => v !== option)
        : [...selectedValues, option];
      onSelect(newValues);
    } else {
      onSelect(option);
    }
  };

  const handleAddCustomOption = () => {
    if (customOptionValue.trim()) {
      toggleOption(customOptionValue.trim());
      setCustomOptionValue('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="py-8 border-b border-[#333333] last:border-0">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-lg font-bold text-white flex gap-2 font-display tracking-tight">
          <span className="text-slate-500">{number}.</span>
          {question}
          {multiSelect && <span className="text-slate-400 font-normal text-sm ml-1">(boleh pilih beberapa)</span>}
        </h4>
        <button 
          onClick={onSkip}
          className={`text-sm font-medium transition-colors ${isSkipped ? 'text-orange-500' : 'text-slate-500 hover:text-white'}`}
        >
          {isSkipped ? 'Batal Lewati' : 'Lewati'}
        </button>
      </div>
      
      {!isSkipped && (
        <>
          {isCustom ? (
            <textarea
              value={selectedValues[0] || ''}
              onChange={(e) => onSelect([e.target.value])}
              placeholder="Tulis jawaban kamu di sini..."
              className="w-full bg-[#1e1e1e] border border-[#333333] rounded-xl p-4 text-white text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all min-h-[100px] resize-none"
            />
          ) : (
            <div className="flex flex-wrap gap-3">
              {options?.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    selectedValues.includes(option)
                      ? 'bg-orange-600/20 border-orange-600 text-orange-500 shadow-lg shadow-orange-900/10'
                      : 'bg-[#2d2d2d] border-[#454545] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {option}
                </button>
              ))}
              
              {showCustomInput ? (
                <div className="flex gap-2 items-center">
                  <input
                    autoFocus
                    type="text"
                    value={customOptionValue}
                    onChange={(e) => setCustomOptionValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomOption()}
                    placeholder="Ketik opsi..."
                    className="bg-[#1e1e1e] border border-orange-500/50 rounded-full px-4 py-2 text-sm text-white focus:outline-none w-32"
                  />
                  <button 
                    onClick={handleAddCustomOption}
                    className="text-orange-500 hover:text-orange-400 text-xs font-bold"
                  >
                    OK
                  </button>
                  <button 
                    onClick={() => setShowCustomInput(false)}
                    className="text-slate-500 hover:text-slate-400 text-xs"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowCustomInput(true)}
                  className="px-4 py-2 rounded-full border border-[#454545] text-slate-500 text-sm font-medium hover:border-slate-500"
                >
                  + Lainnya
                </button>
              )}
            </div>
          )}
        </>
      )}
      
      {isSkipped && (
        <div className="text-sm italic text-slate-500 bg-[#333333]/30 px-4 py-2 rounded-lg inline-block">
          Pertanyaan ini dilewati
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [view, setView] = useState<'home' | 'chat' | 'prd-form'>('home');
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [prdStep, setPrdStep] = useState<1 | 2 | 3>(1);
  const [historyTab, setHistoryTab] = useState<'chats' | 'prds'>('chats');
  
  // Dynamic History
  const [chatHistory, setChatHistory] = useState([
    { id: '1', title: "Belajar Dasar React", date: "Hari ini", icon: <Code2 className="w-4 h-4 text-blue-500" /> },
    { id: '2', title: "Optimasi Query SQL", date: "Kemarin", icon: <Terminal className="w-4 h-4 text-orange-500" /> },
  ]);
  
  const [prdHistory, setPrdHistory] = useState([
    { id: 'p1', title: "Aplikasi POS Warung", date: "2 hari yang lalu", icon: <FileText className="w-4 h-4 text-purple-500" /> },
    { id: 'p2', title: "Portal Berita AI", date: "Minggu lalu", icon: <Sparkles className="w-4 h-4 text-blue-400" /> },
  ]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const notify = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatServiceRef = useRef<ChatService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState(localStorage.getItem('cuy_ai_model') || "google/gemini-2.0-flash-001");

  // PRD Form State
  const [prdAppName, setPrdAppName] = useState('');
  const [prdTechStack, setPrdTechStack] = useState<string[]>([]);
  const [customTech, setCustomTech] = useState('');
  const [prdAnswers, setPrdAnswers] = useState<Record<number, string[]>>({});
  const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);
  const [dynamicQuestions, setDynamicQuestions] = useState<DynamicQuestion[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [techSuggestions, setTechSuggestions] = useState<string[]>([]);
  const [isGeneratingTech, setIsGeneratingTech] = useState(false);
  const [prdIncludeAiStudioPrompt, setPrdIncludeAiStudioPrompt] = useState(false);
  const [prdIncludeGeminiBuildPrompt, setPrdIncludeGeminiBuildPrompt] = useState(false);

  // Persistence: Load data on mount
  useEffect(() => {
    chatServiceRef.current = new ChatService(aiModel);

    // Auth Listener
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Sync with Supabase when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Fallback to local storage if not logged in
      loadLocalData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user || !supabase) return;
    
    try {
      // Load Messages
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true });

      if (msgError) throw msgError;
      
      if (msgData && msgData.length > 0) {
        setMessages(msgData.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp)
        })));
      } else {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `Halo ${user.email?.split('@')[0]}! Cuy di sini! ✨ Siap nemenin kamu ngoding hari ini. Ada yang bisa aku bantu? 🚀`,
          timestamp: new Date(),
        }]);
      }

      // Load PRD State
      const { data: prdData, error: prdError } = await supabase
        .from('prd_state')
        .select('state')
        .eq('user_id', user.id)
        .single();

      if (prdError && prdError.code !== 'PGRST116') throw prdError;

      if (prdData?.state) {
        const prd = prdData.state;
        setPrdAppName(prd.appName || '');
        setPrdTechStack(prd.techStack || []);
        setPrdAnswers(prd.answers || {});
        setSkippedQuestions(prd.skipped || []);
        setDynamicQuestions(prd.questions || []);
        setPrdStep(prd.step || 1);
        setPrdIncludeAiStudioPrompt(prd.includeAiStudio || false);
        setPrdIncludeGeminiBuildPrompt(prd.includeGeminiBuild || false);
      }
    } catch (e) {
      console.error("Failed to load data from Supabase", e);
      loadLocalData();
    }
  };

  const loadLocalData = () => {
    try {
      const savedMessages = localStorage.getItem('cuy_ai_messages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } else {
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: 'Halo! Cuy di sini! ✨ Siap nemenin kamu ngoding hari ini. Ada yang bisa aku bantu? 🚀',
            timestamp: new Date(),
          },
        ]);
      }

      const savedPrd = localStorage.getItem('cuy_ai_prd_state');
      if (savedPrd) {
        const prd = JSON.parse(savedPrd);
        setPrdAppName(prd.appName || '');
        setPrdTechStack(prd.techStack || []);
        setPrdAnswers(prd.answers || {});
        setSkippedQuestions(prd.skipped || []);
        setDynamicQuestions(prd.questions || []);
        setPrdStep(prd.step || 1);
        setPrdIncludeAiStudioPrompt(prd.includeAiStudio || false);
        setPrdIncludeGeminiBuildPrompt(prd.includeGeminiBuild || false);
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
  };

  // Persistence: Save data on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('cuy_ai_messages', JSON.stringify(messages));
      // Only sync to Supabase when not loading (streaming finished)
      if (user && !isLoading) syncMessagesToSupabase();
    }
  }, [messages, isLoading]);

  const syncMessagesToSupabase = async () => {
    if (!user || !supabase || messages.length === 0) return;
    
    // Sync the last two messages to ensure both user prompt and assistant response are saved
    const messagesToSync = messages.slice(-2);
    
    try {
      for (const msg of messagesToSync) {
        await supabase.from('messages').upsert({
          id: msg.id.length > 30 ? msg.id : undefined,
          user_id: user.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        });
      }
    } catch (e) {
      console.error("Failed to sync messages to Supabase", e);
    }
  };

  useEffect(() => {
    const prdState = {
      appName: prdAppName,
      techStack: prdTechStack,
      answers: prdAnswers,
      skipped: skippedQuestions,
      questions: dynamicQuestions,
      step: prdStep,
      includeAiStudio: prdIncludeAiStudioPrompt,
      includeGeminiBuild: prdIncludeGeminiBuildPrompt
    };
    localStorage.setItem('cuy_ai_prd_state', JSON.stringify(prdState));
    if (user) syncPrdToSupabase(prdState);
  }, [prdAppName, prdTechStack, prdAnswers, skippedQuestions, dynamicQuestions, prdStep, prdIncludeAiStudioPrompt, prdIncludeGeminiBuildPrompt]);

  const syncPrdToSupabase = async (state: any) => {
    if (!user || !supabase) return;
    try {
      await supabase.from('prd_state').upsert({
        user_id: user.id,
        state: state
      });
    } catch (e) {
      console.error("Failed to sync PRD to Supabase", e);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      notify("Supabase belum dikonfigurasi. Silakan hubungi admin. ❌");
      return;
    }
    setAuthLoading(true);
    try {
      if (authView === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        notify("Berhasil login! ✨");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        notify("Cek email kamu buat verifikasi ya! 📧");
      }
      setShowAuthModal(false);
    } catch (error: any) {
      notify(error.message || "Gagal autentikasi ❌");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Halo! Cuy di sini! ✨ Siap nemenin kamu ngoding hari ini. Ada yang bisa aku bantu? 🚀',
      timestamp: new Date(),
    }]);
    notify("Berhasil logout! 👋");
  };

  useEffect(() => {
    localStorage.setItem('cuy_ai_view', view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('cuy_ai_model', aiModel);
    chatServiceRef.current?.setModel(aiModel);
  }, [aiModel]);

  const clearHistory = () => {
    if (confirm("Kamu yakin mau hapus semua riwayat chat? 🗑️")) {
      const initialMsg: Message[] = [{
        id: '1',
        role: 'assistant',
        content: 'Halo! Cuy di sini! ✨ Siap nemenin kamu ngoding hari ini. Ada yang bisa aku bantu? 🚀',
        timestamp: new Date(),
      }];
      setMessages(initialMsg);
      localStorage.setItem('cuy_ai_messages', JSON.stringify(initialMsg));
      notify("Riwayat chat berhasil dihapus! ✨");
    }
  };

  const resetPrdForm = () => {
    setPrdAppName('');
    setPrdTechStack([]);
    setPrdAnswers({});
    setSkippedQuestions([]);
    setDynamicQuestions([]);
    setPrdStep(1);
    setPrdIncludeAiStudioPrompt(false);
    setPrdIncludeGeminiBuildPrompt(false);
    localStorage.removeItem('cuy_ai_prd_state');
    notify("Form PRD berhasil di-reset! 📝");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify("Waduh, gambarnya kegedean! Maksimal 5MB ya ✨");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (text: string = input) => {
    const messageText = text.trim();
    if (!messageText || isLoading) return;
    
    if (!chatServiceRef.current) {
      chatServiceRef.current = new ChatService();
    }

    if (!user) {
      setShowAuthModal(true);
      notify("Kamu harus login dulu ya buat nemenin Cuy ngoding! ✨");
      return;
    }

    if (view !== 'chat') setView('chat');

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 11),
      role: 'user',
      content: messageText,
      image: selectedImage || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentImage = selectedImage;
    setSelectedImage(null);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = Math.random().toString(36).substring(2, 11);
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);

    // IMAGE GENERATION LOGIC (Gunakan Regex biar lebih fleksibel)
    const imageKeywords = /(buat|bikin|buatkan|bikinin|generate|gambar:)\s*(gambar|image|ilustrasi|foto|lukisan)/i;
    const isImageRequest = imageKeywords.test(messageText);

    if (isImageRequest) {
      try {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId ? { ...msg, content: "Siaapp! Cuy lagi gambarin dulu ya, tunggu bentar... 🎨✨" } : msg
        ));

        const imageUrl = await chatServiceRef.current?.generateImage(messageText);
        if (imageUrl) {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId ? { 
              ...msg, 
              content: "Ini dia hasil gambar dari Cuy! Gimana, keren gak? 😎🖼️",
              image: imageUrl
            } : msg
          ));
        }
      } catch (error) {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId ? { ...msg, content: "Waduh, Cuy gagal bikin gambarnya nih. Coba lagi ya! ✨ Error: " + (error as Error).message } : msg
        ));
      }
      setIsLoading(false);
      return;
    }

    // REGULAR CHAT STREAMING
    let fullResponse = '';
    const history = messages.slice(-20).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    await chatServiceRef.current?.sendMessageStream(messageText, (chunk) => {
      fullResponse += chunk;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: fullResponse } : msg
        )
      );
    }, history, currentImage || undefined);

    setIsLoading(false);
  };

  const generateTechSuggestions = async () => {
    if (!user) {
      setShowAuthModal(true);
      notify("Login dulu yuk biar Cuy bisa kasih saran teknologi! 🚀");
      return;
    }
    
    setIsGeneratingTech(true);
    
    if (!chatServiceRef.current) {
      chatServiceRef.current = new ChatService();
    }
    
    try {
      const prompt = `Berdasarkan deskripsi aplikasi: "${prdAppName}", berikan saran stack teknologi yang paling cocok (frontend, backend, database, dll). 
      Berikan jawaban HANYA berupa JSON array of strings (nama teknologi saja). Maksimal 6 teknologi.
      Contoh: ["React", "Node.js", "PostgreSQL", "Redis"]`;
      
      const response = await chatServiceRef.current?.sendMessage(prompt);
      if (response) {
        const jsonStr = response.replace(/```json|```/g, '').trim();
        const suggestions = JSON.parse(jsonStr);
        setTechSuggestions(suggestions);
      }
    } catch (error) {
      console.error("Error generating tech suggestions:", error);
      setTechSuggestions(['React', 'Node.js', 'Supabase']);
    } finally {
      setIsGeneratingTech(false);
    }
  };

  const generateDynamicQuestions = async () => {
    if (!prdAppName.trim()) return;
    
    if (!user) {
      setShowAuthModal(true);
      notify("Yuk login dulu biar Cuy bisa bantu susun PRD-nya! 📝");
      return;
    }

    setIsGeneratingQuestions(true);
    setPrdStep(2); 
    
    if (!chatServiceRef.current) {
      chatServiceRef.current = new ChatService();
    }

    try {
      const prompt = `Berdasarkan deskripsi aplikasi: "${prdAppName}", buatkan 5-7 pertanyaan strategis dan spesifik (dalam Bahasa Indonesia) untuk menyusun PRD (Product Requirements Document) yang komprehensif.

      KRITERIA PERTANYAAN:
      1. **Spesifik & Kontekstual**: Jangan gunakan pertanyaan generik. Sesuaikan dengan jenis aplikasi (misal: jika FinTech, tanya soal keamanan/regulasi; jika Game, tanya soal mekanik).
      2. **Cakup Aspek Kritis**: Target pengguna, Fitur Utama (MVP), Monetisasi/Model Bisnis, Platform, dan Integrasi Pihak Ketiga.
      3. **Opsi Jawaban Relevan**: Berikan pilihan jawaban (options) yang masuk akal dan mencakup skenario umum untuk aplikasi tersebut.
      4. **Tidak Ambigu**: Pertanyaan harus jelas dan mudah dijawab oleh user.

      FORMAT OUTPUT (HANYA JSON):
      [
        {
          "id": number,
          "question": "string",
          "options": ["string", "string", ...], // Berikan minimal 3-4 opsi relevan
          "multiSelect": boolean,
          "isCustom": boolean // true jika pertanyaan butuh penjelasan teks bebas (open-ended)
        }
      ]
      
      Jangan berikan teks penjelasan apapun, hanya JSON array.`;

      const response = await chatServiceRef.current?.sendMessage(prompt);
      if (response) {
        const jsonStr = response.replace(/```json|```/g, '').trim();
        const questions = JSON.parse(jsonStr);
        setDynamicQuestions(questions);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      setDynamicQuestions([
        { id: 1, question: "Siapa target pengguna utama aplikasi ini?", options: ['End-user (B2C)', 'Perusahaan (B2B)', 'Internal Tim', 'Komunitas Spesifik'] },
        { id: 2, question: "Fitur apa yang paling krusial untuk MVP (Minimum Viable Product)?", multiSelect: true, options: ['Sistem Autentikasi', 'Dashboard Utama', 'Integrasi Pembayaran', 'Notifikasi Real-time'] },
        { id: 3, question: "Bagaimana rencana monetisasi atau model bisnisnya?", options: ['Gratis (Open Source)', 'Langganan (SaaS)', 'Sekali Bayar', 'Iklan / Freemium'] },
        { id: 4, question: "Platform mana yang menjadi prioritas peluncuran?", options: ['Web (Responsive)', 'Mobile Native (iOS/Android)', 'Cross-platform Mobile', 'Desktop App'] },
        { id: 5, question: "Apakah ada integrasi pihak ketiga yang wajib ada?", multiSelect: true, options: ['Payment Gateway', 'Social Media Login', 'Maps / Geolocation', 'Cloud Storage'] },
        { id: 6, question: "Jelaskan alur kerja utama atau 'Core Loop' dari aplikasi ini?", isCustom: true }
      ]);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleGeneratePRD = () => {
    let prompt = `Tolong buatkan PRD (Product Requirements Document) yang sangat DETAIL, PROFESIONAL, dan TERSTRUKTUR untuk aplikasi berikut:\n\n`;
    prompt += `**Nama/Deskripsi Aplikasi:** ${prdAppName}\n`;
    prompt += `**Stack Teknologi Utama:** ${prdTechStack.join(", ") || "Tentukan yang paling optimal"}\n\n`;
    
    prompt += `**Informasi Tambahan dari User:**\n`;
    dynamicQuestions.forEach((q) => {
      const answer = skippedQuestions.includes(q.id) ? "Dilewati" : (prdAnswers[q.id]?.join(", ") || "Tidak dijawab");
      prompt += `- ${q.question}: ${answer}\n`;
    });

    prompt += `\n### INSTRUKSI OUTPUT:
1. **Executive Summary**: Visi misi aplikasi dan problem yang diselesaikan.
2. **User Personas**: Siapa saja penggunanya dan apa pain points mereka.
3. **Functional Requirements**: Daftar fitur lengkap (MVP vs Future Phase).
4. **Non-Functional Requirements**: Keamanan, performa, dan skalabilitas.
5. **User Stories**: Minimal 5 user stories utama (As a [user], I want to [action], so that [benefit]).
6. **Technical Architecture**: Detail database schema (tabel & relasi), API endpoints utama, dan integrasi third-party.
7. **UI/UX Guidelines**: Tema warna, tipografi, dan alur navigasi utama.
8. **Timeline & Milestone**: Estimasi pengerjaan per modul.\n`;

    if (prdIncludeAiStudioPrompt) {
      prompt += `\n9. **Google AI Studio Prompt**: Sertakan sebuah section khusus bernama "SYSTEM INSTRUCTION FOR AI STUDIO" yang berisi instruksi sistem lengkap (role, constraint, context) agar AI di Google AI Studio bisa berperan sebagai Lead Developer untuk membangun aplikasi ini dari nol.`;
    }

    if (prdIncludeGeminiBuildPrompt) {
      prompt += `\n10. **Gemini AI Build Prompt**: Sertakan sebuah section khusus bernama "GEMINI AI BUILD PROMPT" yang berisi prompt perintah terperinci yang bisa saya copy-paste ke AI Builder (seperti Gemini atau Claude) untuk mulai men-generate kode boilerplate dan struktur folder project ini.`;
    }

    prompt += `\n\n### PENUTUP
Gunakan gaya bahasa Cuy (ceria & suportif) di bagian pembuka dan penutup, tapi isi PRD-nya harus sangat teknis dan siap pakai buat developer/AI Coder. Gunakan Markdown yang rapi dengan tabel jika perlu.`;

    handleSend(prompt);
  };

  const toggleTech = (tech: string) => {
    setPrdTechStack(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const addCustomTech = () => {
    if (customTech.trim() && !prdTechStack.includes(customTech.trim())) {
      setPrdTechStack(prev => [...prev, customTech.trim()]);
      setCustomTech('');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0a0a0b] font-sans text-[#d4d4d4] overflow-hidden selection:bg-blue-500/30 pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-16 lg:w-20 border-r border-border bg-card py-6 items-center justify-between z-50">
        <div className="flex flex-col items-center gap-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('home')}
            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center cursor-pointer shadow-lg shadow-primary/10"
          >
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          
          <nav className="flex flex-col gap-4">
            <SidebarIcon icon={<Home className="w-5 h-5" />} active={view === 'home'} onClick={() => setView('home')} title="Home" />
            <SidebarIcon icon={<MessageSquare className="w-5 h-5" />} active={view === 'chat'} onClick={() => setView('chat')} title="Chat" />
            <SidebarIcon icon={<History className="w-5 h-5" />} active={activeTab === 'history'} onClick={() => { setView('home'); setActiveTab('history'); }} title="Riwayat" />
            <SidebarIcon icon={<FileText className="w-5 h-5" />} active={view === 'prd-form'} onClick={() => { setView('prd-form'); setPrdStep(1); }} title="Bikin PRD" />
          </nav>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col bg-muted/30 rounded-lg p-1 border border-border">
            <button onClick={() => setTheme('dark')} className={cn("p-1.5 rounded-md", theme === 'dark' ? "bg-secondary text-foreground" : "text-muted-foreground")}><Moon className="w-3.5 h-3.5" /></button>
            <button onClick={() => setTheme('light')} className={cn("p-1.5 rounded-md", theme === 'light' ? "bg-secondary text-foreground" : "text-muted-foreground")}><Sun className="w-3.5 h-3.5" /></button>
          </div>
          {user ? (
            <button onClick={handleLogout} className="p-3 text-muted-foreground hover:text-red-400"><LogOut className="w-5 h-5" /></button>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="p-3 text-muted-foreground hover:text-primary"><LogIn className="w-5 h-5" /></button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t border-border z-50 flex items-center justify-around px-4 pb-2">
        <SidebarIcon icon={<Home className="w-5 h-5" />} active={view === 'home'} onClick={() => setView('home')} />
        <SidebarIcon icon={<MessageSquare className="w-5 h-5" />} active={view === 'chat'} onClick={() => setView('chat')} />
        <SidebarIcon icon={<Plus className="w-6 h-6" />} active={view === 'prd-form'} onClick={() => { setView('prd-form'); setPrdStep(1); }} />
        <SidebarIcon icon={<History className="w-5 h-5" />} active={activeTab === 'history'} onClick={() => { setView('home'); setActiveTab('history'); }} />
        <button onClick={() => setShowAuthModal(true)} className="p-2 text-muted-foreground">
          <User className="w-5 h-5" />
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-background pb-16 md:pb-0">
        {/* Global Header - Hide on mobile if in chat or prd form for better focus */}
        <header className={cn(
          "h-14 md:h-16 px-4 md:px-6 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 transition-all",
          view === 'chat' || view === 'prd-form' ? "hidden md:flex" : "flex"
        )}>
          <div className="flex items-center gap-3">
            {view !== 'home' && (
              <button 
                onClick={() => setView('home')}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-sm font-semibold tracking-tight text-foreground truncate max-w-[150px] md:max-w-none">
              {view === 'prd-form' ? 'Bikin PRD' : view === 'chat' ? 'Chat Cuy' : 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex items-center bg-muted/30 border border-border rounded-lg px-2 py-0.5">
              <Code2 className="w-3 h-3 text-muted-foreground mr-2 ml-1" />
              <select 
                value={aiModel}
                onChange={(e) => {
                  setAiModel(e.target.value);
                  notify(`Model diganti ke ${e.target.value.split('/')[1].toUpperCase()}! 🧠`);
                }}
                className="bg-transparent border-none text-[10px] font-bold text-muted-foreground focus:ring-0 cursor-pointer pr-6 py-1 uppercase tracking-wider outline-none"
              >
                <option value="google/gemini-2.0-flash-001">Gemini 2.0</option>
                <option value="openai/gpt-4o">GPT-4o</option>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5</option>
                <option value="meta-llama/llama-3.1-405b-instruct">Llama 3.1</option>
                <option value="deepseek/deepseek-chat">DeepSeek</option>
              </select>
            </div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => notify("Upgrade ke Pro Plan sedang disiapkan! 🚀")}
              className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 md:px-4 py-1.5 rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] md:text-xs font-bold text-foreground hidden xs:inline">Pro</span>
            </motion.div>

            <button 
              onClick={() => notify("Pengaturan sedang dalam pengembangan! ⚙️")}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative bg-background pb-16 md:pb-0">
          <div className="max-w-6xl mx-auto w-full h-full">
            {view === 'home' && (
              <div className="flex flex-col items-center justify-center min-h-full py-12 md:py-20 px-4 md:px-6">
                {/* Tab Switcher */}
                <div className="flex gap-8 mb-12 border-b border-border w-full max-w-xs justify-center">
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'chat' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Obrolan Baru
                    {activeTab === 'chat' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'history' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Riwayat
                    {activeTab === 'history' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                  </button>
                </div>

                {activeTab === 'chat' ? (
                  <>
                    <div className="flex flex-col items-center mb-12">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
                        <div className="relative w-24 h-24 bg-card rounded-3xl border border-border flex items-center justify-center shadow-2xl">
                          <div className="flex flex-col items-center text-center px-2">
                            <span className="text-2xl font-black text-foreground leading-tight tracking-tighter">CUY AI</span>
                            <span className="text-[7px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">Smart Coding Partner</span>
                          </div>
                        </div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-foreground font-display tracking-tight mb-3 text-center">Halo, Boss! 👋</h2>
                      <p className="text-muted-foreground text-center max-w-md text-sm md:text-base">Gue Cuy AI, asisten paling asik buat nemenin ngoding atau sekadar curhat ide. Mau bikin apa kita hari ini?</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-2xl mb-12">
                      <SuggestionChip label="Bikin PRD ✨" onClick={() => { setView('prd-form'); setPrdStep(1); }} />
                      <SuggestionChip label="Review Code" onClick={() => handleSend("Tolong review kode saya supaya lebih bersih.")} />
                      <SuggestionChip label="Ide Project" onClick={() => handleSend("Kasih 3 ide project TypeScript buat portfolio.")} />
                      <SuggestionChip label="Belajar Next.js" onClick={() => handleSend("Gimana cara mulai belajar Next.js 14?")} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
                      <ActionCard 
                        icon={<FileText className="w-5 h-5 text-blue-500" />}
                        iconBg="bg-blue-500/10"
                        title="PRD Master"
                        description="Ide mentah jadi PRD siap tempur."
                        onClick={() => { setView('prd-form'); setPrdStep(1); }}
                      />
                      <ActionCard 
                        icon={<Trophy className="w-5 h-5 text-amber-500" />}
                        iconBg="bg-amber-500/10"
                        title="AI Tools"
                        description="Ranking tools coding paling gacor."
                        onClick={() => handleSend("Cuy, kasih tau ranking AI tools terbaik buat ngoding saat ini.")}
                      />
                      <ActionCard 
                        icon={<Users className="w-5 h-5 text-indigo-500" />}
                        iconBg="bg-indigo-500/10"
                        title="Coaching"
                        description="Konsultasi karir bareng Raf Dev."
                        onClick={() => handleSend("Gue mau mentoring soal karir dev, bantuin dong.")}
                      />
                    </div>
                  </>
                ) : (
                  <div className="w-full max-w-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-foreground">Akses Riwayat</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Pilih kategori yang ingin kamu lihat</p>
                      </div>
                      <div className="flex bg-muted p-1 rounded-xl border border-border">
                        <button 
                          onClick={() => setHistoryTab('chats')}
                          className={cn(
                            "px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2",
                            historyTab === 'chats' ? "bg-card text-foreground shadow-sm shadow-primary/5 border border-border" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Chat
                        </button>
                        <button 
                          onClick={() => setHistoryTab('prds')}
                          className={cn(
                            "px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2",
                            historyTab === 'prds' ? "bg-card text-foreground shadow-sm shadow-primary/5 border border-border" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          PRD
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {(historyTab === 'chats' ? chatHistory : prdHistory).map((item) => (
                        <motion.div 
                          key={item.id}
                          whileHover={{ x: 4, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            if (historyTab === 'chats') setView('chat');
                            else setView('chat'); // Future: Load PRD
                          }}
                          className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all shadow-sm group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "p-2.5 rounded-xl border",
                              historyTab === 'chats' ? "bg-blue-500/5 border-blue-500/10" : "bg-purple-500/5 border-purple-500/10"
                            )}>
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{item.date}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                        </motion.div>
                      ))}
                    </div>

                    {(historyTab === 'chats' ? chatHistory : prdHistory).length === 0 && (
                      <div className="py-20 text-center space-y-3">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                          <History className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm font-medium italic">Belum ada riwayat di sini, Boss. ✨</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {view === 'prd-form' && (
              <div className="py-8 md:py-12 px-4 md:px-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-3xl mx-auto w-full bg-card rounded-3xl p-6 md:p-10 border border-border shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  
                  {/* Progress & Header */}
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-bold text-foreground font-display">PRD Generator</h2>
                      <div className="flex gap-1.5 mt-2">
                        {[1, 2, 3].map((step) => (
                          <div 
                            key={step} 
                            className={cn(
                              "h-1.5 w-8 rounded-full transition-all duration-500",
                              prdStep >= step ? 'bg-primary' : 'bg-muted'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={resetPrdForm}
                      className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                      title="Reset Form"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {prdStep === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                      <div className="space-y-3">
                        <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-none">Mau bikin aplikasi apa, Boss?</h2>
                        <p className="text-muted-foreground font-medium italic">Ceritain ide aplikasimu sesantai mungkin... ✨</p>
                      </div>
                      <textarea
                        value={prdAppName}
                        onChange={(e) => setPrdAppName(e.target.value)}
                        placeholder="Contoh: Gue mau bikin aplikasi kasir buat laundry yang bisa kirim struk via WhatsApp..."
                        className="w-full bg-muted border border-border rounded-2lx p-6 text-foreground text-lg focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[180px] resize-none outline-none shadow-inner"
                      />
                      <div className="flex justify-end pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!prdAppName.trim() || isGeneratingQuestions}
                          onClick={() => {
                            setPrdStep(2);
                            generateDynamicQuestions();
                            generateTechSuggestions();
                          }}
                          className={cn(
                            "px-10 py-5 rounded-2xl font-black text-base transition-all flex items-center gap-3 shadow-xl",
                            prdAppName.trim() && !isGeneratingQuestions
                              ? 'bg-primary text-primary-foreground hover:shadow-primary/20' 
                              : 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
                          )}
                        >
                          {isGeneratingQuestions ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                              Lanjut Coy <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {prdStep === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                      <div className="space-y-3">
                        <h2 className="text-3xl font-black text-foreground tracking-tight">Teknologi Pilihan 🚀</h2>
                        <p className="text-muted-foreground font-medium italic">Pilih stack andalanmu atau dengerin saran Cuy!</p>
                      </div>
                      
                      {/* Rekomendasi AI */}
                      {(isGeneratingTech || techSuggestions.length > 0) && (
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-primary font-black text-sm flex items-center gap-2 uppercase tracking-widest">
                              <Sparkles className="w-4 h-4" />
                              Rekomendasi Cuy ✨
                            </h3>
                            {isGeneratingTech && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {isGeneratingTech ? (
                              <p className="text-[13px] text-muted-foreground font-medium animate-pulse italic">Lagi ngeracik stack paling gacor buat kamu... 🧪</p>
                            ) : (
                              techSuggestions.map((tech) => (
                                <button
                                  key={`suggest-${tech}`}
                                  onClick={() => toggleTech(tech)}
                                  className={cn(
                                    "px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm",
                                    prdTechStack.includes(tech)
                                      ? 'bg-primary border-primary text-primary-foreground'
                                      : 'bg-card border-border text-muted-foreground hover:bg-accent'
                                  )}
                                >
                                  {prdTechStack.includes(tech) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                  {tech}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {['React', 'Next.js', 'Tailwind CSS', 'Node.js', 'Firebase', 'Supabase', 'PostgreSQL', 'Flutter', 'Go', 'Python'].map((tech) => (
                          <button
                            key={tech}
                            onClick={() => toggleTech(tech)}
                            className={cn(
                              "px-4 py-2.5 rounded-xl border text-sm font-bold transition-all",
                              prdTechStack.includes(tech)
                                ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                : 'bg-card border-border text-muted-foreground hover:border-muted-foreground/50'
                            )}
                          >
                            {tech}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customTech}
                          onChange={(e) => setCustomTech(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addCustomTech()}
                          placeholder="Pake teknologi lain? Ketik di sini..."
                          className="flex-1 bg-muted border border-border rounded-xl px-5 py-4 text-foreground focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                        <button 
                          onClick={addCustomTech}
                          className="bg-card border border-border text-foreground px-6 py-4 rounded-xl font-black hover:bg-accent transition-all text-sm uppercase tracking-wider"
                        >
                          Tambah
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                        <button 
                          onClick={() => setPrdStep(1)}
                          className="text-muted-foreground hover:text-foreground font-bold flex items-center gap-2 group"
                        >
                          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                          Kembali
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPrdStep(3)}
                          className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center gap-3"
                        >
                          Lanjut Coy <ArrowRight className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {prdStep === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                      <div className="space-y-3">
                        <h2 className="text-3xl font-black text-foreground tracking-tight leading-none">Detail Khusus 🔥</h2>
                        <p className="text-muted-foreground font-medium italic text-sm md:text-base">Dikit lagi beres, isi detail ini biar PRD-nya makin akurat!</p>
                      </div>

                      <div className="space-y-1">
                        {dynamicQuestions.length > 0 ? (
                          <div className="divide-y divide-border border-y border-border">
                            {dynamicQuestions.map((q) => (
                              <PRDQuestion 
                                key={q.id}
                                number={q.id}
                                question={q.question}
                                options={q.options}
                                multiSelect={q.multiSelect}
                                isCustom={q.isCustom}
                                selectedValues={prdAnswers[q.id] || []}
                                onSelect={(val) => setPrdAnswers(prev => ({ ...prev, [q.id]: Array.isArray(val) ? val : [val] }))}
                                onSkip={() => setSkippedQuestions(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id])}
                                isSkipped={skippedQuestions.includes(q.id)}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="py-20 text-center space-y-6">
                            <div className="relative mx-auto w-16 h-16">
                              <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
                              <Sparkles className="w-8 h-8 text-primary absolute inset-0 m-auto" />
                            </div>
                            <p className="text-muted-foreground font-medium animate-pulse italic">Nyiapin pertanyaan spesifik buat kamu... ✨</p>
                          </div>
                        )}

                        {dynamicQuestions.length > 0 && (
                          <div className="space-y-4 pt-6 mt-6 border-t border-border">
                            <div className="flex flex-col gap-2">
                              <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Opsi Prompt AI (Opsional)
                              </h3>
                              <p className="text-[11px] text-muted-foreground font-medium">Bikin prompt khusus biar bisa langsung dipasang di platform AI kesayanganmu! ✨</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <button 
                                onClick={() => setPrdIncludeAiStudioPrompt(!prdIncludeAiStudioPrompt)}
                                className={cn(
                                  "flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                                  prdIncludeAiStudioPrompt 
                                    ? "bg-blue-500/10 border-blue-500/50 shadow-sm" 
                                    : "bg-card border-border hover:border-slate-500"
                                )}
                              >
                                <div className={cn(
                                  "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                                  prdIncludeAiStudioPrompt ? "bg-blue-500 border-blue-500 text-white" : "border-slate-600"
                                )}>
                                  {prdIncludeAiStudioPrompt && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex flex-col">
                                  <span className={cn("text-xs font-bold", prdIncludeAiStudioPrompt ? "text-blue-400" : "text-foreground")}>Google AI Studio Prompt</span>
                                  <span className="text-[10px] text-muted-foreground font-medium">Auto-generate System Instruction.</span>
                                </div>
                              </button>

                              <button 
                                onClick={() => setPrdIncludeGeminiBuildPrompt(!prdIncludeGeminiBuildPrompt)}
                                className={cn(
                                  "flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                                  prdIncludeGeminiBuildPrompt 
                                    ? "bg-orange-500/10 border-orange-500/50 shadow-sm" 
                                    : "bg-card border-border hover:border-slate-500"
                                )}
                              >
                                <div className={cn(
                                  "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                                  prdIncludeGeminiBuildPrompt ? "bg-orange-500 border-orange-500 text-white" : "border-slate-600"
                                )}>
                                  {prdIncludeGeminiBuildPrompt && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex flex-col">
                                  <span className={cn("text-xs font-bold", prdIncludeGeminiBuildPrompt ? "text-orange-400" : "text-foreground")}>Gemini AI Build Prompt</span>
                                  <span className="text-[10px] text-muted-foreground font-medium">Custom prompt buat LLM builder.</span>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                        <button 
                          onClick={() => setPrdStep(2)}
                          className="text-muted-foreground hover:text-foreground font-bold flex items-center gap-2 group"
                        >
                          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                          Kembali
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.05, rotate: -1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleGeneratePRD}
                          className="bg-primary text-primary-foreground px-12 py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-3"
                        >
                          GENERATE PRD <Sparkles className="w-5 h-5 text-amber-300" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            )}

            {view === 'chat' && (
              <div className="flex flex-col h-full bg-background relative">
                {/* Integrated Mobile Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setView('home')}
                      className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-foreground">CUY AI</h3>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Active Partner</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={clearHistory}
                      className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                      title="Hapus Chat"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => notify('Asyik! Fitur bagiin chat lagi gue bikin, tunggu ya! 📤')}
                      className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scroll-smooth">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-foreground font-black text-lg">Mulai Obrolan Baru ✨</p>
                        <p className="text-muted-foreground text-sm max-w-[250px]">Tanya apa aja soal koding, ide aplikasi, atau sekadar sapa Cuy!</p>
                      </div>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} notify={notify} />
                      ))}
                    </AnimatePresence>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Input Area */}
        <footer className="p-6 bg-[#0a0a0b]/80 backdrop-blur-xl border-t border-[#1e1e20]">
          <div className="max-w-4xl mx-auto">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center gap-3 bg-[#121214] border border-[#1e1e20] rounded-2xl p-2 focus-within:border-blue-500/50 transition-all shadow-2xl"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 transition-colors ${selectedImage ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Plus className={`w-5 h-5 transition-transform ${selectedImage ? 'rotate-45' : ''}`} />
              </button>
              
              <div className="flex-1 flex flex-col">
                {selectedImage && (
                  <div className="relative w-20 h-20 mb-2 group">
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-xl border border-blue-500/50" />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Tanya apa aja ke Cuy AI... ✨"
                  className="bg-transparent border-none focus:ring-0 py-3 text-white placeholder:text-slate-600 font-medium w-full"
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center gap-1 pr-2">
                <button 
                  type="button" 
                  onClick={() => notify('Fitur Voice lagi disiapin Cuy! 🎙️')}
                  className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                    isLoading || !input.trim() 
                      ? 'bg-[#1e1e20] text-slate-600' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </div>
        </footer>
        {/* Auth Modal */}
        <AnimatePresence>
          {showAuthModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAuthModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-foreground mb-2 font-display tracking-tight">
                    {authView === 'login' ? 'Selamat Datang Kembali!' : 'Gabung Cuy AI!'}
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium">
                    {authView === 'login' ? 'Masuk buat akses chat history kamu.' : 'Bikin akun buat simpan semua progres kamu.'}
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@kamu.com"
                        className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none text-sm"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/10"
                  >
                    {authLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {authView === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                        {authView === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border text-center">
                  <p className="text-muted-foreground text-sm font-medium">
                    {authView === 'login' ? "Belum punya akun?" : "Sudah punya akun?"}
                    <button 
                      onClick={() => setAuthView(authView === 'login' ? 'signup' : 'login')}
                      className="ml-2 text-primary font-bold hover:text-primary/80 transition-colors"
                    >
                      {authView === 'login' ? 'Daftar di sini' : 'Login di sini'}
                    </button>
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black shadow-2xl flex items-center gap-3 border border-primary/20 backdrop-blur-md"
            >
              <Bell className="w-5 h-5" />
              <span className="text-sm tracking-tight">{notificationMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const MessageBubble = ({ message, notify }: { message: Message, notify: (msg: string) => void }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPRD = (content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PRD_CuyAI.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isPrd = message.content.includes('# PRD') || message.content.includes('Product Requirements Document');
  
  const aiStudioPrompt = message.content.match(/SYSTEM INSTRUCTION FOR AI STUDIO[\s\S]*?(?=###|$|10\.)/i)?.[0];
  const geminiBuildPrompt = message.content.match(/GEMINI AI BUILD PROMPT[\s\S]*?(?=###|$)/i)?.[0];

  const copySpecificPrompt = (text: string, label: string) => {
    // Regex for bold headers or plain text headers
    const cleanedText = text.replace(/^(\d+\.\s*)?\*\*.*?\*\*:\s*/, '').replace(/^(\d+\.\s*)?.*?\s*PROMPT:\s*/i, '').trim();
    navigator.clipboard.writeText(cleanedText);
    notify(`Prompt ${label} berhasil dicopy! 🚀`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full", message.role === 'user' ? "justify-end" : "justify-start")}
    >
      <div className={cn(
        "flex gap-3 max-w-[85%] group animate-in",
        message.role === 'user' ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm",
          message.role === 'user' ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"
        )}>
          {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-500" />}
        </div>
        <div className={cn(
          "flex flex-col",
          message.role === 'user' ? "items-end" : "items-start"
        )}>
          <div className={cn(
            "px-4 py-2.5 rounded-2xl shadow-sm text-sm border",
            message.role === 'user' 
              ? "bg-primary text-primary-foreground border-primary rounded-tr-none" 
              : "bg-card text-foreground border-border rounded-tl-none"
          )}>
            {message.image && (
              <div className="mb-2 max-w-full overflow-hidden rounded-md border border-border/30">
                <img 
                  src={message.image} 
                  alt="Attachment" 
                  className="w-full h-auto max-h-[250px] object-contain cursor-pointer" 
                  onClick={() => window.open(message.image, '_blank')}
                />
              </div>
            )}
            <div className={cn(
              "prose max-w-none text-inherit prose-sm",
              message.role === 'assistant' ? "prose-invert" : ""
            )}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => copyToClipboard(message.content)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </button>
            {isPrd && message.role === 'assistant' && (
              <div className="flex gap-2">
                <button 
                  onClick={() => downloadPRD(message.content)}
                  className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300"
                >
                  Download PRD
                </button>
                {aiStudioPrompt && (
                  <button 
                    onClick={() => copySpecificPrompt(aiStudioPrompt, 'AI Studio')}
                    className="text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" /> AI Studio
                  </button>
                )}
                {geminiBuildPrompt && (
                  <button 
                    onClick={() => copySpecificPrompt(geminiBuildPrompt, 'Gemini Build')}
                    className="text-[10px] font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" /> Gemini Build
                  </button>
                )}
              </div>
            )}
            <span className="text-[10px] text-muted-foreground font-medium">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SidebarIcon = ({ icon, active, onClick, title, comingSoon }: { icon: React.ReactNode, active?: boolean, onClick?: () => void, title?: string, comingSoon?: boolean }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    title={title}
    className={cn(
      "p-2.5 rounded-lg transition-all relative group",
      active 
        ? "bg-secondary text-foreground shadow-sm border border-border" 
        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
    )}
  >
    {icon}
    {comingSoon && (
      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full border-2 border-background" />
    )}
    {title && (
      <div className="absolute left-full ml-3 px-2 py-1 bg-popover border border-border text-popover-foreground text-[10px] font-medium rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {title} {comingSoon && '(Soon)'}
      </div>
    )}
  </motion.button>
);

const SuggestionChip = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-md border border-border bg-card text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all shadow-sm"
  >
    {label}
  </button>
);
