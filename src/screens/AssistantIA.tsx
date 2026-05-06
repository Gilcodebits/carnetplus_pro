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
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="patient" activePath="/patient/assistant-ia" />
      <div className="flex-1 overflow-auto p-8">
        <button onClick={() => navigate("/patient")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Retour à l'accueil
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assistant Vocal IA</h1>
              <p className="text-gray-600">Décrivez vos symptômes ou posez vos questions</p>
            </div>
          </div>

          <Card className="mb-6" style={{ height: "500px", display: "flex", flexDirection: "column" }}>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {conversation.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  <div className={`max-w-[70%] p-4 rounded-2xl ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="border-t pt-4">
              <div className="flex gap-3">
                <button
                  onClick={toggleListening}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${isListening ? "bg-red-600 text-white animate-pulse" : "bg-purple-100 text-purple-600 hover:bg-purple-200"}`}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Tapez votre message ou utilisez le micro..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSend}
                  className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold mb-4">Suggestions rapides</h3>
            <div className="grid grid-cols-2 gap-3">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(suggestion)}
                  className="p-3 bg-gray-50 rounded-lg text-left hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t">
              <Button onClick={() => navigate("/patient/recherche-rdv")} variant="primary" fullWidth>
                Prendre rendez-vous avec un médecin
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
