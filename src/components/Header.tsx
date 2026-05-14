import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ChevronDown, CheckCircle2, AlertCircle, Info, User, Settings, LogOut, Calendar, X, Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useSearch } from "../contexts/SearchContext";
import { rdvAPI } from "../services/api";
import { ConfirmModal } from "./ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../utils/format";

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ onMenuClick, title, subtitle, actions }: HeaderProps) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, deleteNotification, deleteAll } = useNotifications();
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (n: any) => {
    if (!n.lu) markAsRead(n.id);
    setShowNotifications(false);

    const titre = n.titre.toLowerCase();
    const role = user?.role;

    if (titre.includes("message")) {
      navigate(`/${role}/messagerie`);
    } else if (titre.includes("rendez-vous") || titre.includes("rdv")) {
      if (role === 'patient') navigate('/patient/calendrier-rdv');
      else if (role === 'medecin') navigate('/medecin/agenda');
      else if (role === 'secretaire') {
        if (n.patient_id) navigate(`/secretaire/patients/${n.patient_id}`);
        else navigate('/secretaire');
      }
      else navigate(`/${role}`);
    } else if (titre.includes("ordonnance") || titre.includes("analyse") || titre.includes("bilan")) {
      if (role === 'patient') navigate('/patient/dossier');
    }
  };

  const handleConfirmRDV = async (e: React.MouseEvent, n: any) => {
    e.stopPropagation();
    try {
      const rdvId = n.rdv_id || n.id;
      await rdvAPI.update(rdvId, { statut: 'confirme' });
      markAsRead(n.id);
      setShowNotifications(false);
      navigate('/secretaire');
    } catch (err) {
      console.error("Erreur confirmation RDV:", err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 5) return "Bonsoir";
    if (hour >= 12) return "Bon après-midi";
    return "Bonjour";
  };

  const roleLabels: Record<string, string> = {
    admin: "Administrateur", medecin: "Médecin", secretaire: "Secrétaire",
    labo: "Laboratoire", patient: "Patient", gestionnaire: "Gestionnaire"
  };

  return (
    <header className="h-[90px] bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-[45] border-b-2 border-slate-200 shadow-md shrink-0">
      <div className="flex items-center gap-2 md:gap-8 flex-1 overflow-hidden">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors shrink-0"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-1.5 h-10 bg-blue-600 rounded-full shrink-0 shadow-sm shadow-blue-200" />
            <div className="flex flex-col">
              {title ? (
                <>
                  <h1 className="text-lg md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{title}</h1>
                  {subtitle && <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-1">{subtitle}</p>}
                </>
              ) : (
                <>
                  <p className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none mb-1 md:mb-1.5">
                    {formatDate(new Date())}
                  </p>
                  <p className="text-slate-900 text-[10px] md:text-xl font-black tracking-tight leading-none uppercase truncate max-w-[120px] md:max-w-none">
                    {getGreeting()}, <span className="text-blue-600">{user?.role === 'medecin' ? `Dr. ${user?.nom}` : user?.prenom}</span> 👋
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {actions && <div className="hidden sm:flex items-center ml-4">{actions}</div>}

        {!title && user?.role !== 'patient' && user?.role !== 'secretaire' && user?.role !== 'medecin' && (
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un patient..."
                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all shadow-inner"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 md:p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-rose-500 text-white text-[9px] md:text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown (kept original logic) */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-72 md:w-80 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-blue-900/20 border border-slate-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                  {notifications.length > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); deleteAll(); }} className="text-[9px] text-rose-500 font-bold uppercase tracking-widest hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors">Tout effacer</button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`relative p-4 hover:bg-slate-50 transition-all border-b border-slate-50 cursor-pointer group ${!n.lu ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className="flex gap-3 pr-6">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                            n.type === 'warning' ? 'bg-orange-50 text-orange-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                            {n.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                              n.type === 'warning' ? <AlertCircle className="w-4 h-4" /> :
                                <Info className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">{n.titre}</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 mt-0.5">{n.message}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-slate-400 text-xs italic">Aucune notification</div>
                  )}
                </div>
                <button
                  onClick={() => { setShowNotifications(false); navigate(`/${user?.role}/notifications`); }}
                  className="w-full p-3 text-[10px] font-bold text-blue-600 hover:bg-slate-50 transition-all text-center border-t border-slate-100 uppercase tracking-widest"
                >
                  Voir tout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-slate-200" />

        {/* User Profile */}
        <button
          onClick={() => navigate(`/${user?.role}/profil`)}
          className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-all group"
        >
          <div className="hidden md:block text-right">
            <p className="text-xs font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors uppercase tracking-tight">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-80">
              {roleLabels[user?.role || ''] || user?.role}
            </p>
          </div>
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] md:text-xs font-black shadow-lg group-hover:scale-105 transition-transform ring-4 ring-slate-100">
            {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
          </div>
        </button>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          logout();
          navigate("/login");
        }}
        title="Fin de session"
        message="Voulez-vous vraiment vous déconnecter ?"
        confirmText="Déconnexion"
        type="danger"
      />
    </header>
  );
}
