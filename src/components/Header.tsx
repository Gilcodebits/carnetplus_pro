import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ChevronDown, CheckCircle2, AlertCircle, Info, User, Settings, LogOut, Calendar } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useSearch } from "../contexts/SearchContext";
import { ConfirmModal } from "./ConfirmModal";

export function Header() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour >= 18 ? "Bonsoir" : "Bonjour";
  };

  const roleLabels: Record<string,string> = {
    admin:"Administrateur", medecin:"Médecin", secretaire:"Secrétaire",
    labo:"Laboratoire", patient:"Patient", gestionnaire:"Gestionnaire"
  };

  return (
    <header className="h-20 bg-blue-600 px-8 flex items-center justify-between sticky top-0 z-50 shadow-lg shadow-blue-900/10">
      {user?.role === 'patient' ? (
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-80">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="text-white text-xl font-bold tracking-tight leading-none mt-0.5">
              {getGreeting()}, <span className="text-blue-200">{user?.prenom}</span> 👋
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-blue-200 group-focus-within:text-white transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="block w-full pl-12 pr-6 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-100 focus:outline-none focus:bg-white/20 focus:border-white/40 focus:ring-4 focus:ring-white/5 transition-all text-sm font-medium backdrop-blur-sm"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-6">
        {/* Date Display for Staff */}
        {user?.role !== 'patient' && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg text-blue-50 text-[10px] font-bold uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5 text-blue-200" />
            {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </div>
        )}

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className={`relative p-2 rounded-xl transition-all group ${
              showNotifications ? "bg-white/20 text-white" : "text-blue-100 hover:text-white hover:bg-white/10"
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 border-2 border-blue-600 rounded-full flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">{unreadCount}</span>
              </div>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-fadeInUp z-[60]">
              <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => { if(!n.lu) markAsRead(n.id); }}
                      className={`p-4 hover:bg-slate-50 transition-all border-b border-slate-50 cursor-pointer group ${!n.lu ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          n.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 
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
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-white/20" />

        {/* User Profile */}
        <button 
          onClick={() => navigate(`/${user?.role}/profil`)}
          className="flex items-center gap-3 hover:opacity-80 transition-all group"
        >
          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-white leading-none group-hover:text-blue-100 transition-colors">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-80">
              {roleLabels[user?.role || ''] || user?.role}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-xs shadow-lg group-hover:scale-105 transition-transform ring-4 ring-white/10">
            {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
          </div>
        </button>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          logout();
          navigate("/");
        }}
        title="Fin de session"
        message="Voulez-vous vraiment vous déconnecter ?"
        confirmText="Déconnexion"
        type="danger"
      />
    </header>
  );
}
