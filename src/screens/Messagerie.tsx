import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { messagesAPI, notificationsAPI } from "../services/api";
import { Send, Bell, Mail, Search } from "lucide-react";

export function Messagerie() {
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [message, setMessage]     = useState("");
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [msgData, notifData] = await Promise.all([
        messagesAPI.list(),
        notificationsAPI.list()
      ]);
      setAllMessages(msgData);
      setNotifications(notifData);
    } catch (err) {
      console.error("Erreur messagerie:", err);
    } finally {
      setLoading(false);
    }
  };

  // Regrouper les messages par interlocuteur
  const conversationsMap = new Map();
  allMessages.forEach(m => {
    const isMine = !m.expediteur_nom.includes("Admin"); // Simplification pour démo
    const otherId = isMine ? m.destinataire_id : m.expediteur_id;
    const otherName = isMine ? m.destinataire_nom : m.expediteur_nom;
    
    if (!conversationsMap.has(otherId)) {
      conversationsMap.set(otherId, { id: otherId, name: otherName, lastMessage: m.contenu, time: new Date(m.created_at).toLocaleTimeString().substring(0,5), messages: [] });
    }
    conversationsMap.get(otherId).messages.push(m);
  });
  const conversations = Array.from(conversationsMap.values());

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  const handleSend = async () => {
    if (!message.trim() || !selectedConvId) return;
    try {
      await messagesAPI.send({
        destinataire_id: selectedConvId,
        contenu: message
      });
      setMessage("");
      loadData();
    } catch (err) {
      alert("Erreur lors de l'envoi");
    }
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500 font-medium">Synchronisation de vos messages…</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="patient" activePath="/messagerie" />
      <div className="flex-1 overflow-auto p-8 animate-fadeIn">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Messagerie & Notifications</h1>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card className="flex flex-col" style={{ height: "600px" }}>
              <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Mail className="w-6 h-6 text-blue-600" /> Messages
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
                <div className="border-r pr-4 overflow-y-auto">
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConvId(conv.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedConvId === conv.id ? "bg-blue-600 text-white shadow-lg border-blue-600 scale-[1.02]" : "bg-white border-gray-100 hover:bg-gray-50 text-gray-900"}`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-bold text-sm">{conv.name}</p>
                        </div>
                        <p className={`text-xs truncate ${selectedConvId === conv.id ? "text-blue-100" : "text-gray-500"}`}>{conv.lastMessage}</p>
                        <p className={`text-[10px] mt-1 ${selectedConvId === conv.id ? "text-blue-200" : "text-gray-400"}`}>{conv.time}</p>
                      </div>
                    ))}
                    {conversations.length === 0 && <p className="text-center text-gray-400 text-xs py-10 italic">Aucune conversation</p>}
                  </div>
                </div>

                <div className="col-span-2 flex flex-col min-h-0">
                  {selectedConvId ? (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-hide">
                        {[...(selectedConv?.messages || [])].reverse().map((msg, i) => {
                          const isMine = !msg.expediteur_nom.includes("Admin"); // Simplification
                          return (
                            <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fadeInUp`} style={{animationDelay:`${i*50}ms`}}>
                              <div className={`max-w-[75%] p-3.5 rounded-2xl shadow-sm ${isMine ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-900 rounded-tl-none"}`}>
                                <p className="text-sm leading-relaxed">{msg.contenu}</p>
                                <p className={`text-[10px] mt-1.5 font-medium ${isMine ? "text-blue-200" : "text-gray-400"}`}>
                                  {new Date(msg.created_at).toLocaleTimeString().substring(0,5)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Tapez votre message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <Button onClick={handleSend} variant="primary" icon={<Send className="w-4 h-4" />}>Envoyer</Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">Sélectionnez une conversation</div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card>
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-orange-600" /> Notifications
              </h3>
              <div className="space-y-3">
                {notifications.map((notif, i) => (
                  <div key={notif.id || i} className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{notif.titre}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-mono uppercase tracking-wider">{new Date(notif.created_at).toLocaleString()}</p>
                  </div>
                ))}
                {notifications.length === 0 && <p className="text-center text-gray-400 text-xs py-10 italic">Aucune notification</p>}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
