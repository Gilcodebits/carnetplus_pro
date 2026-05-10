import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { messagesAPI, notificationAPI, utilisateursAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Send, Bell, Mail, Search, User, Clock, Check, CheckCheck, MoreVertical, MessageSquarePlus, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Messagerie() {
  const { user } = useAuth();
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [message, setMessage]     = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    fetchDoctors();
    const interval = setInterval(() => loadData(true), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      messagesAPI.markRead(selectedConvId).catch(console.error);
    }
  }, [selectedConvId]);

  const fetchDoctors = async () => {
    try {
      const allUsers = await utilisateursAPI.list();
      let filtered = allUsers.filter((u: any) => u.id !== user?.id && u.role !== 'patient');
      
      if (user?.role !== 'admin') {
         filtered = filtered.filter((u: any) => u.etablissement_id === user?.etablissement_id);
      }
      
      const docs = filtered.map((u: any) => ({
        id: u.id,
        name: `${u.prenom} ${u.nom}`,
        specialty: u.role.charAt(0).toUpperCase() + u.role.slice(1),
        online: true
      }));
      setAvailableDoctors(docs);
    } catch (err) {
      console.error("Erreur chargement collaborateurs", err);
    }
  };

  const startNewChat = (doc: any) => {
    // Si la conversation existe déjà, on la sélectionne simplement
    setSelectedConvId(doc.id);
    setShowNewChatModal(false);
    // Optionnel: ajouter un message de bienvenue automatique si c'est nouveau
  };

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
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
      if (!isSilent) setLoading(false);
    }
  };

  // Regrouper les messages par interlocuteur
  const conversationsMap = new Map();
  allMessages.forEach(m => {
    const isMine = Number(m.expediteur_id) === Number(user?.id);
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
      loadData(true);
    } catch (err) {
      alert("Erreur lors de l'envoi");
    }
  };

  if (loading) return (
    <div className="p-8 text-center py-40 bg-slate-50 h-screen">
      <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-blue-200 animate-bounce">
         <Mail className="w-10 h-10 text-white" />
      </div>
      <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-[10px]">Initialisation de la messagerie sécurisée...</p>
    </div>
  );

  return (
    <div className="p-10 animate-fadeIn h-[calc(100vh-64px)] flex flex-col bg-slate-200">
      {/* Fixed Top Header */}
      <div className="sticky top-0 z-40 bg-slate-200/90 backdrop-blur-xl -mx-10 -mt-10 px-10 pb-4 pt-6 border-b border-slate-300/50 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1rem] flex items-center justify-center shadow-md border border-white/20">
              <Mail className="w-6 h-6 text-white" />
           </div>
           <div>
             <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Messagerie</h1>
             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-80">Communication cryptée de bout en bout</p>
           </div>
        </div>
        <button 
          onClick={() => setShowNewChatModal(true)}
          className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-3"
        >
           <MessageSquarePlus className="w-4 h-4 text-blue-400" /> Démarrer une discussion
        </button>
      </div>

      {/* Main Layout Area - Fixed Height */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden min-h-0">
        {/* Unified Chat & List Card */}
        <div className="lg:col-span-12 flex flex-col min-h-0 h-full">
          <Card noPadding className="rounded-[3.5rem] border-0 shadow-2xl shadow-slate-200/60 flex-1 flex overflow-hidden bg-white">
              {/* Sidebar: Conversations List - Scrollable */}
            <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/40 backdrop-blur-md">
              <div className="p-6 border-b border-slate-100 bg-white/80">
                <div className="relative group">
                  <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-blue-600' : 'text-slate-300'}`} />
                  <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Chercher..." 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder-slate-400 shadow-inner"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                {conversations.map((conv) => {
                  const active = selectedConvId === conv.id;
                  return (
                    <motion.div
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      whileHover={{ x: 3 }}
                      className={`p-4 rounded-[1.8rem] cursor-pointer transition-all flex items-center gap-4 border-2 ${
                        active 
                        ? "bg-white border-blue-500 shadow-xl shadow-blue-100" 
                        : "bg-white/50 hover:bg-white border-transparent hover:border-slate-100"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-base shadow-lg relative ${
                        active ? "bg-blue-600 text-white" : "bg-white text-slate-400 border border-slate-100"
                      }`}>
                        {conv.name.charAt(0)}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className={`font-black text-[10px] truncate uppercase tracking-tight ${active ? 'text-slate-900' : 'text-slate-700'}`}>{conv.name}</p>
                          <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">{conv.time}</span>
                        </div>
                        <p className={`text-[8px] truncate font-bold uppercase tracking-widest opacity-60 ${active ? 'text-blue-600' : 'text-slate-500'}`}>{conv.lastMessage}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Chat View */}
            <div className="flex-1 flex flex-col bg-white relative">
              {selectedConvId ? (
                <>
                  <div className="px-8 py-6 border-b border-slate-100 bg-white/90 backdrop-blur-lg flex justify-between items-center shadow-sm relative z-20">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl shadow-blue-200">
                          {selectedConv?.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow-lg shadow-emerald-200" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-xl uppercase tracking-tighter leading-none mb-1.5">{selectedConv?.name}</p>
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                             <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> En ligne
                           </span>
                           <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Généralement réactif</span>
                        </div>
                      </div>
                    </div>
                    {/* Icons removed per user request */}
                  </div>

                  {/* Chat Messages - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20 scrollbar-hide">
                    {[...(selectedConv?.messages || [])].reverse().map((msg, i) => {
                      const isMine = Number(msg.expediteur_id) === Number(user?.id);
                      return (
                        <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fadeInUp group`}>
                          <div className={`max-w-[70%] space-y-2`}>
                            <div className={`relative px-7 py-4 rounded-[2rem] shadow-xl transition-all hover:scale-[1.01] ${
                              isMine 
                              ? "bg-blue-600 text-white rounded-tr-none shadow-blue-200/40" 
                              : "bg-slate-50 border border-slate-100 text-slate-900 rounded-tl-none"
                            }`}>
                              <p className="text-[13px] font-bold leading-relaxed">{msg.contenu}</p>
                            </div>
                            <div className={`flex items-center gap-3 text-[8px] font-black uppercase tracking-widest ${isMine ? "justify-end text-slate-400" : "text-slate-300"}`}>
                              {new Date(msg.created_at).toLocaleTimeString().substring(0,5)}
                              {isMine && (
                                <div className="flex items-center gap-1">
                                   {Number(msg.lu) === 1 ? (
                                     <>
                                       <CheckCheck className="w-3 h-3 text-blue-500" />
                                       <span className="text-blue-500">Lu</span>
                                     </>
                                   ) : (
                                     <>
                                       <Check className="w-3 h-3 text-slate-300" />
                                       <span className="text-slate-300 italic">Envoyé</span>
                                     </>
                                   )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-8 py-6 bg-white border-t border-slate-100 relative z-20">
                    <div className="flex gap-4 p-3 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] items-center pr-4 focus-within:border-blue-500/20 focus-within:bg-white focus-within:ring-[10px] focus-within:ring-blue-500/5 transition-all shadow-inner">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100 text-slate-400 cursor-pointer hover:text-blue-600 transition-colors">
                          <MessageSquarePlus className="w-5 h-5" />
                       </div>
                       <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Votre message ici..."
                        className="flex-1 bg-transparent px-2 text-sm font-bold text-slate-900 focus:outline-none placeholder-slate-300"
                      />
                      <button 
                        onClick={handleSend}
                        className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-300 hover:scale-110 hover:-rotate-12 active:scale-95 transition-all group"
                      >
                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-24 bg-slate-50/20 overflow-hidden relative">
                  <div className="w-40 h-40 bg-white border border-slate-100 rounded-[4.5rem] flex items-center justify-center mb-10 shadow-2xl relative">
                    <div className="absolute inset-0 bg-blue-600/5 rounded-full animate-ping" />
                    <Mail className="w-16 h-16 text-slate-200 relative z-10" />
                  </div>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-sm leading-relaxed opacity-70">Sélectionnez un collaborateur ou un administrateur pour engager une conversation sécurisée.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* New Discussion Modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
            >
              <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Nouveau Message</h3>
                 <button onClick={() => setShowNewChatModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">&times;</button>
              </div>
              <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sélectionnez un collaborateur</p>
                 {availableDoctors.length === 0 && (
                   <p className="text-xs text-slate-500 italic px-2">Aucun collaborateur trouvé dans votre établissement.</p>
                 )}
                 {availableDoctors.map((doc) => (
                   <div 
                    key={doc.id}
                    onClick={() => startNewChat(doc)}
                    className="p-6 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-[2rem] border border-slate-100 cursor-pointer transition-all group flex items-center gap-6"
                   >
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 font-black text-xl shadow-md group-hover:scale-110 transition-transform relative">
                        {doc.name.charAt(4)}
                        {doc.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-50" />}
                     </div>
                     <div>
                        <p className="font-black text-sm uppercase tracking-tight">{doc.name}</p>
                        <p className="text-[10px] font-bold uppercase opacity-60 group-hover:text-blue-100">{doc.specialty}</p>
                     </div>
                     <ChevronRight className="ml-auto w-6 h-6 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                   </div>
                 ))}
              </div>
              <div className="p-10 bg-slate-50 text-center">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Vous ne trouvez pas votre collaborateur ? <br/><span className="text-blue-600 cursor-pointer">Contactez le support</span></p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
