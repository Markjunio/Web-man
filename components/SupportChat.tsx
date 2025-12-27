import React, { useState, useRef, useEffect } from 'react';
import { createQuantumChatSession } from '../services/geminiService.ts';

const SupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const getSession = async () => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = await createQuantumChatSession();
    }
    return chatSessionRef.current;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const session = await getSession();
      const result = await session.sendMessage({ message: userMsg });
      const responseText = result.text || "Sorry, I lost connection. Please try again.";
      setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Connection unstable. Please check your network." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      {isOpen ? (
        <div className="w-80 md:w-96 h-[500px] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl border-2 border-[#0aff0a] animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#0a2a0a] p-4 flex justify-between items-center border-b border-[#0aff0a]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0aff0a] animate-pulse"></div>
              <h3 className="font-orbitron font-bold text-[#0aff0a] text-sm tracking-widest">HELP CENTER</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-[#0aff0a]">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40">
            {messages.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <i className="fas fa-comment-dots text-3xl text-[#0aff0a]/20 animate-spin-slow"></i>
                <p className="text-[#80a080] text-xs italic">How can I help you today?</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-xs font-mono leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-[#0aff0a] text-black rounded-tr-none shadow-[0_2px_10px_rgba(10,255,10,0.3)]' 
                  : 'bg-black/80 text-[#0aff0a] rounded-tl-none border border-[#0aff0a]/30'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-black/80 p-3 rounded-xl rounded-tl-none border border-[#0aff0a]/30">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-[#0aff0a] rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-[#0aff0a] rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                    <div className="w-1 h-1 bg-[#0aff0a] rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-[#000f08] border-t border-[#0aff0a]/20 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..."
              className="flex-1 bg-black/60 border border-[#0aff0a]/30 rounded-lg px-3 py-2 text-[#0aff0a] text-xs outline-none focus:border-[#0aff0a] transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-[#0aff0a] text-black px-4 py-2 rounded-lg hover:bg-[#00ffaa] disabled:opacity-50 transition-all flex items-center justify-center"
            >
              <i className="fas fa-paper-plane text-sm"></i>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setIsOpen(true);
            getSession();
          }}
          className="w-14 h-14 bg-[#0aff0a] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(10,255,10,0.4)] hover:scale-110 transition-all group border-2 border-black relative"
        >
          <div className="absolute inset-0 rounded-full border border-[#0aff0a] animate-ping opacity-20"></div>
          <i className="fas fa-headset text-xl text-black"></i>
        </button>
      )}
    </div>
  );
};

export default SupportChat;