import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { ArrowLeft, Mic, MicOff, Send, Bot } from "lucide-react";

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
    <div className="flex h-screen bg-slate-200">
      <Sidebar role="patient" activePath="/patient/assistant-ia" />
      <div className="flex-1 overflow-auto p-10">
        <button onClick={() => navigate("/patient")} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-8 transition-all font-black text-[10px] uppercase tracking-widest bg-white px-5 py-2.5 rounded-xl border-2 border-slate-100 shadow-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour à l'accueil
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2rem] flex items-center justify-center shadow-xl shadow-purple-200 border-2 border-white/20">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Assistant Vocal IA</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Diagnostic intelligent et prise de rendez-vous assistée</p>
            </div>
          </div>

          <Card className="mb-8 border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-white" style={{ height: "600px", display: "flex", flexDirection: "column" }}>
            <div className="flex-1 overflow-y-auto space-y-8 mb-6 pr-4 scroll-smooth">
              {conversation.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeInUp`}>
                  {msg.role === "assistant" && (
                    <div className="w-12 h-12 bg-purple-50 border-2 border-purple-100 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0 mt-1 shadow-sm">
                      <Bot className="w-6 h-6 text-purple-600" />
                    </div>
                  )}
                  <div className={`max-w-[75%] p-6 rounded-[2rem] border-2 shadow-xl ${msg.role === "user" ? "bg-blue-600 border-blue-500 text-white rounded-tr-none shadow-blue-200/40" : "bg-slate-50 border-slate-100 text-slate-900 rounded-tl-none shadow-slate-200/30"}`}>
                    <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="pt-8 border-t-2 border-slate-100">
              <div className="flex gap-4 p-3 bg-slate-50 border-2 border-slate-200 rounded-[2.5rem] items-center pr-4 focus-within:border-purple-500 transition-all shadow-inner">
                <button
                  onClick={toggleListening}
                  className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all flex-shrink-0 shadow-lg ${isListening ? "bg-rose-600 text-white animate-pulse border-2 border-rose-400" : "bg-white text-purple-600 border-2 border-slate-100 hover:border-purple-200"}`}
                >
                  {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Échangez avec l'IA ou utilisez le micro..."
                  className="flex-1 bg-transparent px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none placeholder-slate-300"
                />
                <button
                  onClick={handleSend}
                  className="w-14 h-14 bg-purple-600 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-purple-700 shadow-xl shadow-purple-200 transition-all active:scale-95 border-2 border-purple-500"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </Card>

          <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Suggestions d'assistance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(suggestion)}
                  className="p-5 bg-slate-50 rounded-[1.5rem] text-left hover:bg-white hover:border-purple-300 border-2 border-slate-100 transition-all text-xs font-bold text-slate-600 uppercase tracking-widest shadow-sm group"
                >
                  <span className="text-purple-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">✦</span>
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t-2 border-slate-100">
              <button onClick={() => navigate("/patient/recherche-rdv")} className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.01] transition-all border-2 border-purple-500">
                PRENDRE RENDEZ-VOUS AVEC UN MÉDECIN
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
