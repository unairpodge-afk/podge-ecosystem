"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  CloudRain, 
  Sun, 
  ThermometerSun, 
  Sprout, 
  HeartHandshake, 
  Wind,
  Map,
  X
} from 'lucide-react';

type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
};

export default function HumaneAICompanion({ farmerName }: { farmerName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: 'init-1',
            sender: 'ai',
            text: `Halo Bapak/Ibu ${farmerName}, saya Podge Companion. Bagaimana kabar Anda dan keluarga hari ini? Semoga sehat selalu.`,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: 'init-2',
            sender: 'ai',
            text: `Saya memantau suhu di sekitar kebun saat ini cukup panas (sekitar 33°C). Jangan lupa banyak minum air putih dan berteduh jika lelah ya. Kesehatan Anda yang paling utama. Ada yang bisa saya bantu hari ini?`,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsTyping(false);
      }, 1500);
    }
  }, [isOpen, farmerName, messages.length]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Humane AI response logic
    setTimeout(() => {
      let aiResponseText = '';
      const text = userMessage.text.toLowerCase();

      if (text.includes('panen') || text.includes('tbs') || text.includes('buah')) {
        aiResponseText = `Alhamdulillah jika sudah panen. Ingat untuk tidak memaksakan diri mengangkat beban terlalu berat. Saya sudah mencatatkan prakiraan hasil Anda ke sistem. Semoga hasilnya berkah untuk keluarga ya.`;
      } else if (text.includes('cuaca') || text.includes('hujan') || text.includes('panas')) {
        aiResponseText = `Berdasarkan data satelit kami, sore ini kemungkinan ada hujan ringan. Pastikan pupuk yang baru disebar tidak ikut hanyut. Gunakan waktu hujan nanti untuk beristirahat di rumah bersama keluarga.`;
      } else if (text.includes('tanah') || text.includes('pupuk') || text.includes('subur')) {
        aiResponseText = `Untuk menjaga kesuburan tanah, saya sarankan menggunakan sisa pelepah sawit sebagai mulsa alami. Selain hemat biaya, ini sangat baik untuk menjaga kelembapan tanah di musim kemarau ini.`;
      } else if (text.includes('capek') || text.includes('lelah') || text.includes('sakit')) {
        aiResponseText = `Kesehatan Anda adalah aset yang tak ternilai. Tolong segera beristirahat. Jangan memaksakan diri untuk ke kebun hari ini. Rezeki sudah ada yang mengatur, kesehatan Anda lebih penting.`;
      } else {
        aiResponseText = `Saya mengerti. Saya di sini bukan hanya sebagai asisten teknologi, tapi juga rekan Anda. Jangan ragu cerita jika ada kendala di lapangan, baik soal kebun maupun cuaca.`;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-transform z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <HeartHandshake size={28} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#040806]"></span>
        </span>
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] glass-panel border border-emerald-500/30 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right z-50 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-emerald-950/80 border-b border-emerald-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold font-space text-sm">Podge Companion</h3>
              <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Selalu Peduli & Siap Membantu
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-emerald-400/50 hover:text-emerald-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Weather / Geo-spatial Widget */}
        <div className="bg-black/40 px-4 py-2 border-b border-emerald-950 flex items-center justify-between text-[10px] font-mono text-emerald-200/70">
          <div className="flex items-center gap-1.5 text-orange-400">
            <ThermometerSun size={12} />
            <span>33°C (Panas)</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-400">
            <CloudRain size={12} />
            <span>Potensi Hujan Sore</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Sprout size={12} />
            <span>Tanah Kering</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-emerald-950/10">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-emerald-500 text-black rounded-tr-sm' 
                    : 'bg-emerald-950/60 border border-emerald-500/20 text-emerald-50 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-emerald-200/40 mt-1 font-mono">{msg.time}</span>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start">
              <div className="bg-emerald-950/60 border border-emerald-500/20 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce delay-75"></span>
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-emerald-500/20 bg-black/60">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ceritakan keadaan kebun Anda hari ini..."
              className="w-full bg-emerald-950/30 border border-emerald-500/30 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-emerald-200/30 focus:outline-none focus:border-emerald-400 transition-colors"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/40 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
