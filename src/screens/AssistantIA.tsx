import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../components/Card";
import { 
  ArrowLeft, Mic, MicOff, Send, Bot, 
  Sparkles, History, MessageSquare, 
  Zap, Info, ChevronRight, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AssistantIA() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([
    { role: "assistant", text: "Bonjour ! Je suis votre assistant santé IA. Comment puis-je vous aider aujourd'hui ?" },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "J'ai mal à la tête depuis ce matin",
    "Je voudrais prendre rendez-vous",
    "Quels sont mes prochains RDV ?",
    "J'ai de la fièvre",
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleSend = () => {
    if (message.trim()) {
      const newConv = [...conversation, { role: "user", text: message }];
      setConversation(newConv);
      setMessage("");
      setTimeout(() => {
        const responses = [
          "Je comprends. Pouvez-vous me décrire vos symptômes plus en détail ? Depuis combien de temps avez-vous ces symptômes ?",
          "D'accord, je peux vous aider avec cela. Laissez-moi vérifier les disponibilités du Dr. Rousseau.",
          "Basé sur vos symptômes, je vous recommande de consulter un médecin dans les prochaines 24 heures. Souhaitez-vous prendre rendez-vous ?",
          "Je note votre demande. Avez-vous d'autres symptômes associés ?",
        ];
        setConversation((prev) => [...prev, { role: "assistant", text: responses[Math.floor(Math.random() * responses.length)] }]);
      }, 1000);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setMessage("J'ai mal à la tête depuis ce matin");
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <div className="overflow-auto flex flex-col relative pt-6 px-10 pb-10">
        
        {/* Compact Header for Patient Side */}
        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-200 border-2 border-white/20">
              <Bot className="w-8 h-8 text-white animate-pulse"/>
            </div>
            <div>
              <div className="flex items-center gap-3">
                 <span className="w-6 h-1.5 bg-indigo-500 rounded-full" />
                 <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Assistant Santé IA</h1>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">Intelligence Artificielle de Diagnostic & Orientation</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-5 py-2.5 bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest">Connecté au Cloud IA</span>
             </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
          
          {/* Chat Section */}
          <div className="lg:col-span-8 flex flex-col min-h-0">
            <Card noPadding className="flex-1 border-2 border-slate-200 shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white flex flex-col overflow-hidden relative group">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 transition-all group-hover:scale-110 opacity-40 pointer-events-none" />
              
              <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide relative z-10">
                <AnimatePresence initial={false}>
                  {conversation.map((msg, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-12 h-12 bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex items-center justify-center mr-6 flex-shrink-0 mt-1 shadow-sm">
                          <Bot className="w-6 h-6 text-indigo-600" />
                        </div>
                      )}
                      <div className={`max-w-[80%] p-8 rounded-[2.5rem] border-2 shadow-xl ${
                        msg.role === "user" 
                          ? "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500 text-white rounded-tr-none shadow-blue-200/40" 
                          : "bg-slate-50/80 backdrop-blur-sm border-slate-100 text-slate-900 rounded-tl-none shadow-slate-200/30 font-medium leading-relaxed italic"
                      }`}>
                        <p className="text-sm font-bold tracking-tight leading-relaxed">{msg.text}</p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-12 h-12 bg-white border-2 border-blue-100 rounded-2xl flex items-center justify-center ml-6 flex-shrink-0 mt-1 shadow-sm">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* Input Area */}
              <div className="p-8 bg-slate-50 border-t-2 border-slate-100 relative z-10">
                <div className="flex gap-4 p-4 bg-white border-2 border-slate-200 rounded-[2.5rem] items-center pr-4 focus-within:border-indigo-500 transition-all shadow-inner focus-within:shadow-xl focus-within:shadow-indigo-100">
                  <button
                    onClick={toggleListening}
                    className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all flex-shrink-0 shadow-lg ${
                      isListening 
                        ? "bg-rose-600 text-white animate-pulse border-2 border-rose-400" 
                        : "bg-slate-50 text-indigo-600 border-2 border-slate-100 hover:border-indigo-200 hover:bg-white"
                    }`}
                  >
                    {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Décrivez vos symptômes ou posez une question..."
                    className="flex-1 bg-transparent px-6 py-4 text-base font-black text-slate-900 focus:outline-none placeholder-slate-300"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 border-2 border-indigo-500 disabled:opacity-30"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-white">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-4">
                 <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm"><Sparkles className="w-5 h-5 text-indigo-600"/></div>
                 Suggestions
              </h3>
              <div className="space-y-4">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(suggestion)}
                    className="w-full p-6 bg-slate-50 rounded-[1.8rem] text-left hover:bg-white hover:border-indigo-300 border-2 border-slate-50 transition-all text-[11px] font-black text-slate-600 uppercase tracking-widest shadow-sm group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                       <span className="truncate pr-4">{suggestion}</span>
                       <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-slate-900 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
               <div className="relative z-10">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/20"><Zap className="w-6 h-6 text-blue-400"/></div>
                 <h4 className="text-xl font-black uppercase tracking-tight mb-3">Besoin d'un RDV ?</h4>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed mb-10">L'IA peut vous orienter vers le bon spécialiste en quelques secondes.</p>
                 <button onClick={() => navigate("/patient/calendrier-rdv")} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/50 hover:bg-blue-700 transition-all active:scale-95 border-2 border-blue-500">
                   TROUVER UN MÉDECIN
                 </button>
               </div>
            </Card>
          </div>

        </div>
      </div>
  );
}
