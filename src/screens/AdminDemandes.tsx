import { useState, useEffect } from "react";
import { Building2, Search, CheckCircle2, XCircle, Clock, Mail, MapPin, User, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { adhesionsAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export function AdminDemandes() {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("en_attente");

  useEffect(() => {
    loadDemandes();
  }, []);

  const loadDemandes = async () => {
    setLoading(true);
    try {
      const data = await adhesionsAPI.list();
      setDemandes(data);
    } catch (err) {
      console.error("Erreur chargement adhésions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, statut: string) => {
    try {
      const res: any = await adhesionsAPI.updateStatus(id, statut);
      setDemandes(demandes.map(d => d.id === id ? { ...d, statut } : d));
      
      if (statut === 'approuve') {
        alert("Succès ! L'établissement a été créé et le compte gestionnaire a été activé.\n\nSIMULATION EMAIL :\n" + (res.debug_email || "Email de bienvenue envoyé."));
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const filteredDemandes = demandes.filter(d => {
    const matchesSearch = 
      d.nom_etablissement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email_contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "tous" || d.statut === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: demandes.length,
    en_attente: demandes.filter(d => d.statut === "en_attente").length,
    approuve: demandes.filter(d => d.statut === "approuve").length,
  };

  return (
    <div className="animate-fadeIn bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl px-8 lg:px-12 py-6 border-b border-slate-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Demandes d'Adhésion</h1>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500"/>
            Validation des nouveaux établissements du réseau
          </p>
        </div>
        <button 
          onClick={loadDemandes}
          className="p-4 bg-white border-4 border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm group active:scale-95"
        >
          <RefreshCw className={`w-6 h-6 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="px-8 lg:px-12 pb-12 space-y-10">
      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "En Attente", count: stats.en_attente, color: "orange", icon: Clock },
          { label: "Approuvées", count: stats.approuve, color: "emerald", icon: CheckCircle2 },
          { label: "Total Reçues", count: stats.total, color: "blue", icon: Building2 },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-100 shadow-sm group hover:border-blue-500/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${s.color}-50 rounded-2xl flex items-center justify-center text-${s.color}-600 border-2 border-${s.color}-100`}>
                <s.icon className="w-6 h-6" />
              </div>
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{s.count}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2.5rem] border-4 border-slate-100 shadow-sm">
        <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border-2 border-slate-100 w-full lg:w-auto">
          {["en_attente", "approuve", "rejete", "tous"].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-1 lg:px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                activeFilter === f 
                  ? 'bg-white text-slate-900 shadow-md border-2 border-slate-100 scale-105' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher un établissement..." 
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-4 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white font-bold text-sm transition-all"
          />
        </div>
      </div>

      {/* Grid of Demandes */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white rounded-[3rem] border-4 border-slate-50 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredDemandes.length > 0 ? (
              filteredDemandes.map((d, i) => (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[2rem] border-2 border-slate-100 p-6 group hover:border-blue-200 transition-all flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-slate-200/40 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <div className={`px-3 py-1 rounded-full border-2 text-[8px] font-black uppercase tracking-widest ${
                      d.statut === 'en_attente' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      d.statut === 'approuve' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {d.statut.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                        <Building2 className="w-7 h-7" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors">{d.nom_etablissement}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[7px] font-black uppercase tracking-widest border border-blue-100">{d.type_structure}</span>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase tracking-tight">{d.ville}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                          <User className="w-2.5 h-2.5"/> Responsable
                        </p>
                        <p className="text-[11px] font-bold text-slate-700 truncate">{d.nom_responsable}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                          <Mail className="w-2.5 h-2.5"/> Email
                        </p>
                        <p className="text-[11px] font-bold text-slate-700 truncate">{d.email_contact}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    {d.statut === 'en_attente' ? (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(d.id, 'approuve')}
                          className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approuver
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(d.id, 'rejete')}
                          className="flex-1 py-3.5 bg-white border-2 border-rose-50 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <XCircle className="w-4 h-4" /> Rejeter
                        </button>
                      </>
                    ) : (
                      <div className="w-full p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          Traitée le {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                <Clock className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <h3 className="text-slate-400 font-black text-xl uppercase tracking-widest">Aucune demande trouvée</h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
      </div>
    </div>
  );
}
