import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ChevronDown, CheckCircle2, AlertCircle, Info, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useSearch } from "../contexts/SearchContext";

export function Header() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="h-20 bg-blue-600 border-b border-blue-500/30 px-8 flex items-center justify-between sticky top-0 z-50 shadow-lg shadow-blue-600/10">
      <div className="flex-1" />

      <div className="flex items-center gap-8">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className={`relative p-3 rounded-2xl transition-all group ${
              showNotifications ? "bg-white/20 text-white" : "text-blue-100 hover:text-white hover:bg-white/10"
            }`}
          >
            <Bell className="w-7 h-7" />
            {unreadCount > 0 && (
              <div className="absolute top-2.5 right-2.5 min-w-[20px] h-5 bg-red-500 border-2 border-blue-600 rounded-full flex items-center justify-center shadow-lg px-1">
                <span className="text-[10px] text-white font-black">{unreadCount}</span>
              </div>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-96 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden animate-fadeInUp z-[60]">
              <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-gray-900 text-lg">Notifications</h3>
                {unreadCount > 0 && <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">{unreadCount} Nouvelles</span>}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => { if(!n.lu) markAsRead(n.id); }}
                      className={`p-5 hover:bg-slate-50 transition-all border-b border-slate-100 cursor-pointer group ${!n.lu ? 'bg-blue-50/40' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          n.type === 'success' ? 'bg-green-50 text-green-600' : 
                          n.type === 'warning' ? 'bg-orange-50 text-orange-600' : 
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {n.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : 
                           n.type === 'warning' ? <AlertCircle className="w-6 h-6" /> : 
                           <Info className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-sm text-gray-900 truncate">{n.titre}</p>
                            {!n.lu && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-400 text-sm italic">Aucune notification</div>
                )}
              </div>
              <button 
                onClick={() => { setShowNotifications(false); navigate(`/${user?.role}/notifications`); }}
                className="w-full p-4 text-xs font-bold text-blue-600 hover:bg-slate-50 transition-all text-center border-t border-slate-100 uppercase tracking-widest"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-10 bg-white/20" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-4 pl-2 group cursor-pointer outline-none"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-white leading-none">{user?.prenom} {user?.nom}</p>
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mt-1.5 flex items-center justify-end gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                {user?.role === 'admin' ? 'Administrateur' : user?.role}
              </p>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 font-black text-lg shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform ring-4 ring-white/20">
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-blue-600 rounded-full" />
            </div>
            <ChevronDown className={`w-5 h-5 text-blue-200 transition-transform duration-300 ${showProfileMenu ? 'rotate-180 text-white' : 'group-hover:text-white'}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden animate-fadeInUp z-[60]">
              <div className="p-5 bg-slate-50/50 border-b border-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Connecté en tant que</p>
                <p className="font-black text-gray-900 truncate">{user?.prenom} {user?.nom}</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all group">
                  <User className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  Mon Profil
                </button>
                <button onClick={() => { setShowProfileMenu(false); navigate(`/${user?.role}/settings`); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all group">
                  <Settings className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  Paramètres
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
