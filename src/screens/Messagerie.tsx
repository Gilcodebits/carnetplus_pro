import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { messagesAPI, notificationAPI, utilisateursAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Send, Bell, Mail, Search, User, Clock, Check, CheckCheck, MoreVertical, MessageSquarePlus, ChevronRight, ShieldCheck, X } from "lucide-react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedConvId) {
      scrollToBottom();
    }
  }, [allMessages, selectedConvId]);


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
    setSelectedConvId(doc.id);
    setShowNewChatModal(false);
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
  
  // Interleave and sort messages by time ASC
  conversationsMap.forEach(conv => {
    conv.messages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const lastMsg = conv.messages[conv.messages.length - 1];
    if (lastMsg) {
      conv.lastMessage = lastMsg.contenu;
      conv.time = new Date(lastMsg.created_at).toLocaleTimeString().substring(0, 5);
    }
  });
  const conversations = Array.from(conversationsMap.values()).filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConv = conversations.find(c => Number(c.id) === Number(selectedConvId));

  // If we are starting a new chat, we might not have a conversation in the map yet
  const newChatUser = selectedConvId && !selectedConv 
    ? availableDoctors.find(d => Number(d.id) === Number(selectedConvId))
    : null;

  const activeName = selectedConv ? selectedConv.name : (newChatUser ? newChatUser.name : "");


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
      console.error("Erreur envoi:", err);
    }
  };

  return (
    <div className="animate-fadeIn h-screen flex flex-col bg-slate-50 w-full max-w-full overflow-x-hidden">
      <div className="flex-1 px-6 md:px-10 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden min-h-0 pt-6">
        <div className="lg:col-span-12 flex flex-col min-h-0 h-full">
          <Card noPadding className="rounded-[3.5rem] border-0 shadow-2xl shadow-slate-200/60 flex-1 flex overflow-hidden bg-white">
            <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/40 backdrop-blur-md ${selectedConvId ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-6 border-b border-slate-100 bg-white/80">
                <div className="relative group">
                  <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-blue-600' : 'text-slate-500'}`} />
                  <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Chercher..." 
                    className="w-full bg-slate-100/50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all"
                  />
                </div>
                <button onClick={() => setShowNewChatModal(true)} className="w-full mt-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                  <MessageSquarePlus className="w-4 h-4" /> Nouveau Chat
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {conversations.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aucune conversation</p>
                  </div>
                )}
                {conversations.map((conv) => {
                  const isActive = Number(selectedConvId) === Number(conv.id);
                  const initials = conv.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                  const colors = ['from-blue-500 to-blue-600', 'from-indigo-500 to-purple-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600'];
                  const colorIdx = conv.name.charCodeAt(0) % colors.length;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`px-4 py-3.5 cursor-pointer transition-all duration-200 border-b border-slate-50/80 ${isActive ? 'bg-blue-50 border-l-[3px] border-l-blue-600 pl-3.5' : 'hover:bg-slate-50/80 border-l-[3px] border-l-transparent'}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white text-[11px] font-black shadow-md`}>
                            {initials}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className={`text-[11px] font-black uppercase tracking-tight truncate ${isActive ? 'text-blue-700' : 'text-slate-900'}`}>{conv.name}</h4>
                            <span className="text-[8px] font-bold text-slate-400 shrink-0 ml-2">{conv.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate font-medium leading-tight">{conv.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`flex-1 flex flex-col bg-white ${!selectedConvId ? 'hidden md:flex' : 'flex'}`}>
              {(selectedConv || newChatUser) ? (
                <>
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedConvId(null)} className="md:hidden p-2 text-slate-400"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
                        {activeName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{activeName}</h3>
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">En ligne</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><MoreVertical className="w-5 h-5" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20">
                    {selectedConv?.messages.map((m: any, i: number) => {
                      const isMine = Number(m.expediteur_id) === Number(user?.id);
                      return (
                        <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-5 rounded-[2rem] shadow-sm ${isMine ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'}`}>
                            <p className="text-[11px] font-medium leading-relaxed">{m.contenu}</p>
                            <div className={`flex items-center gap-2 mt-3 ${isMine ? 'justify-end text-blue-100' : 'justify-start text-slate-400'}`}>
                              <span className="text-[8px] font-black uppercase">{new Date(m.created_at).toLocaleTimeString().substring(0,5)}</span>
                              {isMine && <CheckCheck className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-6 border-t border-slate-100 bg-white">
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border-2 border-slate-100 focus-within:border-blue-600/20 transition-all shadow-inner">
                      <input 
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Votre message..." 
                        className="flex-1 bg-transparent border-none outline-none px-6 py-2 text-xs font-black text-slate-900 placeholder:text-slate-300"
                      />
                      <button 
                        onClick={handleSend}
                        className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-90"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/10">
                  <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-200 shadow-xl mb-8 border-2 border-slate-50">
                    <Mail className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Messagerie</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-xs leading-relaxed">
                    Sélectionnez une conversation pour commencer à échanger en toute sécurité.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border-2 border-slate-100">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Nouveau Chat</h2>
                <button onClick={() => setShowNewChatModal(false)} className="p-2 hover:bg-rose-50 text-slate-400 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {availableDoctors.map(doc => (
                  <div key={doc.id} onClick={() => startNewChat(doc)} className="p-4 rounded-[1.5rem] hover:bg-blue-50 cursor-pointer transition-all flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-center text-blue-600 font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{doc.name}</h4>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{doc.specialty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
