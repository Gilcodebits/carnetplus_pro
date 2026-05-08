import { useState } from "react";
import { Card } from "../components/Card";
import { Bell, CheckCircle2, AlertCircle, Info, Trash2, Filter } from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";

export function Notifications() {
  const { 
    notifications, loading, unreadCount,
    markAsRead, markAllAsRead, deleteNotification, deleteAll 
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('Toutes');

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'Toutes') return true;
    if (activeFilter === 'Non lues') return !n.lu;
    if (activeFilter === 'Alerte') return n.type === 'warning' || n.type === 'error';
    if (activeFilter === 'Info') return n.type === 'info' || n.type === 'success';
    return true;
  });

  if (loading && notifications.length === 0) return (
    <div className="p-8 text-center py-20 flex items-center justify-center">
      <div className="bg-white p-12 rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Chargement du centre d'alertes...</p>
      </div>
    </div>
  );

  return (
    <div className="pt-6 px-10 pb-10 animate-fadeIn">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Centre de Notifications</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Gérez vos alertes et l'activité du système CarnetPlus.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-3 px-6 py-4 text-slate-600 bg-white border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xl shadow-slate-200/50 active:scale-95 disabled:opacity-30 disabled:scale-100"
          >
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Tout marquer comme lu
          </button>
          <button 
            onClick={deleteAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-3 px-6 py-4 text-rose-600 bg-white border-2 border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:border-rose-300 transition-all shadow-xl shadow-slate-200/50 active:scale-95 disabled:opacity-30 disabled:scale-100"
          >
            <Trash2 className="w-5 h-5" />
            Vider le centre
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8">
        <div className="col-span-1">
          <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-8 bg-white">
            <div className="flex items-center gap-3 mb-8 text-slate-900 border-b-2 border-slate-50 pb-4">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Filtres Rapides</h3>
            </div>
            <div className="space-y-3">
              {['Toutes', 'Non lues', 'Alerte', 'Info'].map((filter) => (
                <button 
                  key={filter} 
                  onClick={() => setActiveFilter(filter)}
                  className={`w-full text-left px-5 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all border-2 shadow-sm ${
                    activeFilter === filter 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-200 scale-105' 
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200 hover:text-slate-900'
                  }`}
                >
                  {filter}
                  {filter === 'Non lues' && unreadCount > 0 && (
                    <span className={`ml-3 px-2 py-0.5 rounded-lg text-[9px] ${activeFilter === filter ? 'bg-white/20 text-white' : 'bg-blue-600 text-white shadow-sm'}`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-3 space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n, index) => (
              <div key={n.id} className={`p-8 rounded-[2rem] border-2 transition-all flex gap-6 group relative hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-200/50 ${
                n.lu 
                  ? (index % 2 === 0 ? 'bg-white border-slate-200' : 'bg-blue-50/20 border-blue-100') 
                  : 'bg-blue-50/40 border-blue-200 shadow-xl shadow-blue-500/5'
              }`}>
                {!n.lu && (
                  <div className="absolute top-8 right-8 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Nouveau</span>
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
                  n.type === 'success' ? 'bg-green-100 text-green-600 border-green-200' : 
                  n.type === 'warning' ? 'bg-orange-100 text-orange-600 border-orange-200' : 
                  n.type === 'error' ? 'bg-red-100 text-red-600 border-red-200' :
                  'bg-blue-100 text-blue-600 border-blue-200'
                }`}>
                  {n.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : 
                   (n.type === 'warning' || n.type === 'error') ? <AlertCircle className="w-8 h-8" /> : 
                   <Info className="w-8 h-8" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2 pr-20">
                    <h4 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">{n.titre}</h4>
                    <span className="text-xs text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-3xl">{n.message}</p>
                  
                  <div className="mt-6 flex gap-8 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                    {!n.lu && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="flex items-center gap-2 text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Marquer comme lu
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="flex items-center gap-2 text-[10px] font-black text-rose-600 hover:text-rose-700 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-rose-100 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border-4 border-dashed border-slate-200 rounded-[3rem] p-32 text-center shadow-inner">
              <div className="w-24 h-24 bg-slate-50 border-2 border-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Bell className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">Centre à jour</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Vous n'avez aucune nouvelle alerte pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
