import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../components/Card";
import { 
  ArrowLeft, Mic, MicOff, Send, Bot, 
  Sparkles, History, MessageSquare, 
  Zap, Info, ChevronRight, User,
  Activity, ShieldCheck, Search, Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AssistantIA() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState("");
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([
    { role: "assistant", text: "Bonjour ! Je suis votre assistant santé IA. Je suis connecté à votre dossier médical en temps réel. Comment puis-je vous aider ?" },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Analyse de mes derniers résultats d'examens",
    "J'ai des douleurs abdominales persistantes",
    "Interprétation de ma tension artérielle",
    "Conseils nutritionnels basés sur mon profil",
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isThinking]);

  const processResponse = (userMsg: string) => {
    setIsThinking(true);
    const steps = [
      "Analyse sémantique de la requête...",
      "Consultation de votre historique clinique...",
      "Comparaison avec la base de données médicale...",
      "Simulation de diagnostics différentiels...",
      "Génération de recommandations personnalisées..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setThinkingStep(steps[currentStep]);
      currentStep++;
      if (currentStep >= steps.length) {
        clearInterval(interval);
        finalizeResponse(userMsg);
      }
    }, 800);
  };

  const finalizeResponse = (userMsg: string) => {
    const msg = userMsg.toLowerCase();
    let response = "";

    if (msg.includes("mal") || msg.includes("douleur")) {
      response = "D'après l'analyse de vos symptômes et de vos antécédents, il pourrait s'agir d'une inflammation légère. Cependant, votre dernier bilan montre une sensibilité hépatique. Je vous recommande une téléconsultation immédiate avec le Dr. Rousseau.";
    } else if (msg.includes("examen") || msg.includes("résultat")) {
      response = "Vos résultats du 5 Mai indiquent un taux d'hémoglobine stable (14.2 g/dL). Votre cholestérol LDL est en légère baisse, ce qui est excellent. Continuez votre régime actuel.";
    } else {
      response = "Je traite votre demande. Basé sur les protocoles cliniques actuels, je vous suggère de surveiller votre température et de rester hydraté. Souhaitez-vous que je programme une alerte de suivi ?";
    }

    setConversation((prev) => [...prev, { role: "assistant", text: response }]);
    setIsThinking(false);
    setThinkingStep("");
  };

  const handleSend = () => {
    if (message.trim()) {
      const newMsg = message;
      setConversation((prev) => [...prev, { role: "user", text: newMsg }]);
      setMessage("");
      processResponse(newMsg);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate voice input
      setTimeout(() => {
        setMessage("Analyse mes résultats d'examens");
        setIsListening(false);
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col relative pt-6 px-10 pb-10 bg-slate-50 min-h-screen">
        
        {/* Advanced AI Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl -mx-10 px-10 py-6 border-b border-slate-200/60 mb-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 relative z-10">
                  <Bot className={`w-8 h-8 text-blue-500 ${isThinking ? 'animate-bounce' : 'animate-pulse'}`}/>
                </div>
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                  Assistant Santé <span className="text-blue-600">Pro-IA</span>
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-80">Moteur Clinique v4.2 • Analyse en Temps Réel</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-xl border border-white/10">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Dossier Synchronisé</span>
               </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          
          {/* Chat Container */}
          <div className="lg:col-span-8 flex flex-col relative h-[70vh]">
            <Card noPadding className="flex-1 border border-slate-200 shadow-2xl rounded-[2.5rem] bg-white flex flex-col overflow-hidden relative">
              
              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 scrollbar-hide">
                <AnimatePresence initial={false}>
                  {conversation.map((msg, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center mr-4 shrink-0 mt-1 shadow-lg border border-white/10">
                          <Bot className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] p-6 rounded-[1.5rem] shadow-sm relative ${
                        msg.role === "user" 
                          ? "bg-blue-600 text-white rounded-tr-none shadow-blue-200/50" 
                          : "bg-slate-50 border border-slate-100 text-slate-900 rounded-tl-none"
                      }`}>
                        <p className={`text-sm font-bold leading-relaxed tracking-tight ${msg.role === "assistant" ? "font-medium" : ""}`}>
                          {msg.text}
                        </p>
                        <div className={`text-[8px] mt-3 font-black uppercase tracking-widest opacity-40 ${msg.role === 'user' ? 'text-white' : 'text-slate-400'}`}>
                          {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {msg.role === "user" && (
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center ml-4 shrink-0 mt-1 shadow-md">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {isThinking && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start items-start gap-4"
                    >
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-6 rounded-[1.5rem] rounded-tl-none">
                         <div className="flex items-center gap-3">
                           <div className="flex gap-1">
                             <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                             <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                             <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                           </div>
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">{thinkingStep}</span>
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* Advanced Input Area */}
              <div className="p-8 bg-slate-50 border-t border-slate-100">
                <div className={`relative flex gap-4 p-4 bg-white border-2 rounded-[2rem] items-center pr-4 transition-all shadow-sm ${isListening ? 'border-blue-600 shadow-blue-100' : 'border-transparent'}`}>
                  
                  {isListening && (
                    <div className="absolute -top-12 left-0 right-0 flex justify-center gap-1">
                      {[1,2,3,4,5,4,3,2,1].map((h, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: [8, h*4, 8] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                          className="w-1 bg-blue-600 rounded-full"
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={toggleListening}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-lg ${
                      isListening 
                        ? "bg-rose-600 text-white shadow-rose-200 animate-pulse" 
                        : "bg-slate-900 text-blue-500 hover:scale-105"
                    }`}
                  >
                    {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>

                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Décrivez vos symptômes ou posez une question clinique..."
                    className="flex-1 bg-transparent px-4 py-3 text-sm font-black text-slate-900 focus:outline-none placeholder-slate-300"
                  />

                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || isThinking}
                    className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-20 shadow-xl shadow-blue-100"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Smart Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2.5rem] border border-slate-200 shadow-xl p-8 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50" />
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-4 relative z-10">
                 <Sparkles className="w-6 h-6 text-blue-600"/>
                 Analyses Suggérées
              </h3>
              <div className="space-y-4 relative z-10">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(suggestion)}
                    className="w-full p-6 bg-slate-50 rounded-2xl text-left hover:bg-white hover:border-blue-300 border-2 border-transparent transition-all group"
                  >
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed group-hover:text-blue-600 transition-colors">{suggestion}</span>
                       <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-50" />
               <div className="relative z-10">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                   <ShieldCheck className="w-6 h-6 text-blue-400"/>
                 </div>
                 <h4 className="text-xl font-black uppercase tracking-tight mb-3">Diagnostic Sécurisé</h4>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mb-8">
                   Toutes vos interactions sont chiffrées de bout en bout et validées par nos protocoles médicaux.
                 </p>
                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-[8px] font-black uppercase tracking-widest leading-tight text-slate-400">En cas d'urgence vitale, contactez immédiatement le SAMU (15).</p>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
  );
}

      </div>
  );
}
