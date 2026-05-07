import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { messagesAPI, notificationAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Send, Bell, Mail, Search, User, Clock, Check, MoreVertical, MessageSquarePlus, ChevronRight } from "lucide-react";

export function Messagerie() {
  const { user } = useAuth();
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [message, setMessage]     = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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
        user?.id ? notificationAPI.getAll(user.id).catch(() => []) : Promise.resolve([])
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
  const conversations = Array.from(conversationsMap.values()).filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="p-8 text-center py-40">
      <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
      <p className="text-gray-400 font-black uppercase tracking-widest text-xs tracking-widest">Initialisation de la messagerie...</p>
    </div>
  );

  return (
    <div className="p-10 animate-fadeIn h-full overflow-hidden flex flex-col bg-slate-200">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Messagerie & Alertes</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Plateforme de communication sécurisée CarnetPlus.</p>
        </div>
        <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-105 transition-all active:scale-95">
           Démarrer une discussion
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0 pb-10">
        {/* Unified Chat & List Card */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card noPadding className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 flex-1 flex overflow-hidden bg-white">
            
            {/* Sidebar: Conversations List */}
            <div className="w-96 border-r-2 border-slate-200 flex flex-col bg-slate-50/50">
              <div className="p-8 border-b-2 border-slate-200 bg-white">
                <div className="relative">
                  <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-blue-600' : 'text-slate-400'}`} />
                  <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Chercher un contact..." 
                    className="w-full pl-11 pr-4 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder-slate-400 shadow-inner"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-6 rounded-[2.2rem] cursor-pointer transition-all flex items-center gap-4 border-2 group ${selectedConvId === conv.id ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200" : "bg-white hover:bg-slate-50 text-slate-900 border-slate-100 hover:border-slate-200"}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-base shadow-sm ${selectedConvId === conv.id ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                      {conv.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-black text-[11px] truncate uppercase tracking-tight">{conv.name}</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${selectedConvId === conv.id ? "text-blue-100" : "text-slate-400"}`}>{conv.time}</span>
                      </div>
                      <p className={`text-[9px] truncate font-bold uppercase tracking-widest opacity-60 ${selectedConvId === conv.id ? "text-blue-50" : "text-slate-500"}`}>{conv.lastMessage}</p>
                    </div>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <div className="py-20 text-center">
                    <Mail className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Aucune discussion</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat View */}
            <div className="flex-1 flex flex-col bg-white">
              {selectedConvId ? (
                <>
                  <div className="p-8 border-b-2 border-slate-200 bg-white flex justify-between items-center shadow-sm relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-100">
                        {selectedConv?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-xl uppercase tracking-tight">{selectedConv?.name}</p>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-2 mt-0.5">Contact Vérifié</p>
                      </div>
                    </div>
                    <button className="p-4 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"><MoreVertical className="w-6 h-6" /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-12 space-y-10 bg-slate-50/20">
                    {[...(selectedConv?.messages || [])].reverse().map((msg, i) => {
                      const isMine = !msg.expediteur_nom.includes("Admin");
                      return (
                        <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fadeInUp`}>
                          <div className={`max-w-[75%] space-y-3`}>
                            <div className={`px-8 py-5 rounded-[2.5rem] shadow-xl ${isMine ? "bg-blue-600 text-white rounded-tr-none shadow-blue-200/40" : "bg-white border-2 border-slate-100 text-slate-900 rounded-tl-none shadow-slate-200/20"}`}>
                              <p className="text-[13px] font-bold leading-relaxed">{msg.contenu}</p>
                            </div>
                            <div className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-widest ${isMine ? "justify-end text-blue-500" : "text-slate-400"}`}>
                              {new Date(msg.created_at).toLocaleTimeString().substring(0,5)}
                              {isMine && <Check className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-10 bg-white border-t-2 border-slate-200">
                    <div className="flex gap-6 p-4 bg-slate-100 border-2 border-slate-200 rounded-[3rem] items-center pr-6 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-8 focus-within:ring-blue-500/5 transition-all shadow-inner">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Répondre au contact..."
                        className="flex-1 bg-transparent px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none placeholder-slate-400"
                      />
                      <button 
                        onClick={handleSend}
                        className="w-14 h-14 bg-blue-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200 hover:scale-110 active:scale-95 transition-all"
                      >
                        <Send className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-slate-50/10">
                  <div className="w-32 h-32 bg-white border-2 border-slate-100 rounded-[3.5rem] flex items-center justify-center mb-8 shadow-xl">
                    <Mail className="w-12 h-12 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Espace de Discussion</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs leading-loose">Veuillez sélectionner un contact dans la liste à gauche pour voir vos échanges.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Notifications Column */}
        <div className="flex flex-col min-h-0">
          <Card className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 flex-1 flex flex-col overflow-hidden bg-white p-10">
            <h3 className="font-black text-slate-900 mb-10 flex items-center gap-4 uppercase tracking-tight">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 shadow-sm">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
              Alertes
            </h3>
            <div className="flex-1 overflow-y-auto space-y-5 pr-2 scrollbar-hide">
              {notifications.map((notif, i) => (
                <div key={notif.id || i} className={`p-6 rounded-[2.2rem] border-2 transition-all cursor-pointer group shadow-sm hover:scale-[1.03] hover:shadow-xl ${i % 2 === 0 ? "border-slate-100 bg-white" : "border-slate-50 bg-slate-50/50"}`}>
                  <p className="text-[11px] font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{notif.titre}</p>
                  <p className="text-[10px] text-slate-500 mt-3 font-bold leading-relaxed uppercase tracking-widest opacity-70">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-5 pt-4 border-t-2 border-slate-100/50">
                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{new Date(notif.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Aucune notification</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
