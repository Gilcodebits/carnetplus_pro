import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../components/Card";
import { 
  ArrowLeft, ArrowRight, Send, Bot, 
  Sparkles, History, MessageSquare, 
  Zap, Info, ChevronRight, User,
  Activity, ShieldCheck, Search, Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI, consultationsAPI, examensAPI } from "../services/api";
import { formatDate } from "../utils/format";

export function AssistantIA() {
  const navigate = useNavigate();
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [thinkingStep, setThinkingStep] = useState("");
  const [message, setMessage] = useState("");
  const [patientData, setPatientData] = useState<{me: any, consultations: any[], examens: any[]}>({
    me: null,
    consultations: [],
    examens: []
  });

  const [conversation, setConversation] = useState([
    { role: "assistant", text: "Connexion sécurisée en cours..." },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Analyse de mon dernier examen",
    "J'ai des douleurs abdominales",
    "Quand était ma dernière consultation ?",
    "Résumé de mon état de santé",
  ];

  // Fetch real patient data from the platform
  useEffect(() => {
    const fetchData = async () => {
      try {
        const me = await authAPI.me();
        // Assuming user.patient_id exists if the user is a patient
        const patientId = me.patient_id || me.id; 
        
        const [consults, exams] = await Promise.all([
          consultationsAPI.list(patientId),
          examensAPI.list({ patient_id: patientId })
        ]);

        setPatientData({ me, consultations: consults, examens: exams });
        setConversation([{ 
          role: "assistant", 
          text: `Bonjour ${me.nom} ! Je suis votre assistant santé Pro-IA connecté à votre dossier. Je vois que vous avez ${consults.length} consultations et ${exams.length} examens enregistrés. Comment puis-je vous aider ?` 
        }]);
      } catch (err) {
        console.error("Erreur de chargement des données:", err);
        setConversation([{ role: "assistant", text: "Désolé, je n'ai pas pu me connecter à votre dossier médical. Je vais fonctionner en mode limité." }]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isThinking]);

  const processResponse = (userMsg: string) => {
    setIsThinking(true);
    const steps = [
      "Interrogation de la base de données clinique...",
      "Analyse de vos antécédents personnels...",
      "Vérification des protocoles de soin...",
      "Génération du diagnostic assisté...",
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setThinkingStep(steps[currentStep]);
      currentStep++;
      if (currentStep >= steps.length) {
        clearInterval(interval);
        finalizeResponse(userMsg);
      }
    }, 600);
  };

  const finalizeResponse = (userMsg: string) => {
    const msg = userMsg.toLowerCase();
    let response = "";

    const greetings = ["salut", "bonjour", "bonsoir", "ça va", "hello"];
    const roleInquiry = ["tu fais quoi", "qui es-tu", "ton rôle", "tes fonctions", "tu sers à quoi", "tu es qui"];
    const negativeState = ["rien", "tout va bien", "pas de problème", "aucun symptôme", "ça va mieux", "pas mal"];
    const symptoms = ["douleur", "souffre", "fièvre", "toux", "fatigue", "vomir", "nausée", "mal", "fatigué"];
    const advice = ["conseil", "aider", "astuce", "santé", "recommandation", "bien-être"];
    const exams = ["examen", "résultat", "bilan", "analyse", "prise de sang"];
    
    const lastAIResponse = conversation.filter(m => m.role === "assistant").pop()?.text || "";
    const lastConsult = patientData.consultations[0];
    const lastExam = patientData.examens[0];

    // Logique de réponse affinée
    if (negativeState.some(n => msg.includes(n))) {
      response = "C'est une excellente nouvelle ! Maintenir cet état de forme est primordial. Souhaitez-vous des conseils pour rester en bonne santé ?";
    } else if (greetings.some(g => msg.includes(g))) {
      response = `Bonjour ${patientData.me?.nom || "à vous"} ! Je suis prêt à analyser votre dossier médical. Comment vous sentez-vous aujourd'hui ?`;
    } else if (roleInquiry.some(r => msg.includes(r))) {
      response = "Je suis votre assistant Pro-IA. Je peux interpréter vos examens, analyser vos symptômes (comme la fatigue ou les douleurs) et vous orienter vers des spécialistes.";
    } else if (advice.some(a => msg.includes(a))) {
      response = "Pour une santé optimale, je vous recommande de maintenir une hydratation régulière (1.5L/jour), d'assurer 7h de sommeil et de pratiquer 30min de marche. Voulez-vous un conseil spécifique à votre dernier bilan ?";
    } else if (msg.includes("examen") || msg.includes("résultat") || msg.includes("dernier")) {
      if (lastExam) {
        response = `Votre dernier examen (${lastExam.type_examen}) remonte au ${formatDate(lastExam.created_at)}. Le statut est "${lastExam.statut}". Voulez-vous que j'analyse les valeurs ?`;
      } else {
        response = "Je ne trouve pas d'examens récents. La prévention passe par des bilans réguliers. Souhaitez-vous que je vous aide à en planifier un ?";
      }
    } else if (msg.includes("consultation") || msg.includes("médecin") || msg.includes("rendez-vous")) {
      if (lastConsult) {
        response = `Votre dernière visite était le ${formatDate(lastConsult.created_at)} avec le Dr. ${lastConsult.medecin_nom || "un confrère"}. Le motif était : ${lastConsult.motif || "non renseigné"}.`;
      } else {
        response = "Aucune consultation récente. Je peux vous proposer une liste de médecins disponibles pour un check-up.";
      }
    } else if (symptoms.some(s => msg.includes(s))) {
      const isFatigue = msg.includes("fatigue") || msg.includes("fatigué");
      const symptomTerm = isFatigue ? "cet état de fatigue" : "ce symptôme";
      const historyInfo = patientData.consultations.length > 0 ? `vu votre historique de ${patientData.consultations.length} consultations` : "pour plus de sécurité";
      response = `Je prends note de ${symptomTerm}. Même si cela peut être passager, ${historyInfo}, il serait sage d'en parler à un professionnel. Voulez-vous un créneau ?`;
    } else if (msg === "oui" || msg === "ok" || msg === "d'accord") {
      if (lastAIResponse.includes("médecin") || lastAIResponse.includes("rendez-vous") || lastAIResponse.includes("créneau")) {
        response = "Parfait. Je prépare votre demande d'orientation médicale. Je vais inclure un résumé de notre échange pour le praticien.";
      } else {
        response = "C'est entendu. Avez-vous d'autres questions sur votre dossier ou votre santé ?";
      }
    } else if (msg === "non" || msg.includes("non merci") || msg.includes("pas besoin")) {
      response = "C'est noté. Je reste à votre entière disposition. N'hésitez pas à me solliciter si votre état change ou pour toute autre question.";
    } else {
      response = "Je traite votre message avec attention. Pourriez-vous me donner un peu plus de détails, comme l'intensité de ce que vous ressentez ou depuis quand cela dure ?";
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

  return (
    <div className="animate-fadeIn bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Modern FIXED Header - Premium White */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-50 bg-white border-b-2 border-slate-200 shadow-md h-[90px] flex items-center shrink-0">
        <div className="px-6 md:px-10 flex flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-1.5 h-10 bg-blue-600 rounded-full shrink-0 shadow-sm shadow-blue-200" />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Assistant <span className="text-blue-600">Pro-IA</span></h1>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Connecté au Cloud Clinique • Temps Réel</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             {isLoadingData ? (
               <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest">
                 <Loader2 className="w-4 h-4 animate-spin" /> Synchronisation...
               </div>
             ) : (
               <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-xl border border-white/10">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Dossier synchronisé</span>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 md:px-10 pb-10 pt-[130px] md:pt-[140px] grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          
          {/* Chat Container */}
          <div className="lg:col-span-8 flex flex-col relative min-h-[60vh] lg:h-[70vh]">
            <Card noPadding className="flex-1 border border-slate-200 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] bg-white flex flex-col overflow-hidden relative">
              
              <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-6 md:space-y-10 scrollbar-hide">
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
                        <div className={`text-[8px] mt-3 font-black uppercase tracking-widest opacity-80 ${msg.role === 'user' ? 'text-white' : 'text-slate-600'}`}>
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
              <div className="p-4 md:p-8 bg-slate-50 border-t border-slate-100">
                <div className="relative flex gap-3 md:gap-4 p-2 md:p-4 bg-white border-2 border-transparent rounded-[1.5rem] md:rounded-[2rem] items-center pr-2 md:pr-4 transition-all shadow-sm">
                  
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                     <Bot className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                  </div>

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
                    disabled={!message.trim() || isThinking || isLoadingData}
                    className="w-10 h-10 md:w-14 md:h-14 bg-blue-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-20 shadow-xl shadow-blue-100"
                  >
                    <Send className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Smart Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl p-6 md:p-8 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50" />
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 md:mb-8 flex items-center gap-4 relative z-10">
                 <Sparkles className="w-6 h-6 text-blue-600"/>
                 Analyses Suggérées
              </h3>
              <div className="space-y-3 md:space-y-4 relative z-10">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(suggestion)}
                    className="w-full p-4 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl text-left hover:bg-white hover:border-blue-300 border-2 border-transparent transition-all group"
                  >
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed group-hover:text-blue-600 transition-colors">{suggestion}</span>
                       <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <div className="p-6 md:p-8 bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-50" />
               <div className="relative z-10">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 border border-white/20">
                   <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-blue-400"/>
                 </div>
                 <h4 className="text-lg md:text-xl font-black uppercase tracking-tight mb-3">Diagnostic Sécurisé</h4>
                 <p className="text-[11px] md:text-[12px] text-slate-300 font-medium leading-relaxed mb-6 md:mb-8">
                   Toutes vos interactions sont chiffrées de bout en bout et validées par nos protocoles médicaux.
                 </p>
                 <div className="flex items-center gap-3 md:gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-500 shrink-0" />
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-tight text-slate-200">En cas d'urgence vitale, contactez immédiatement le SAMU (15).</p>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
  );
}

