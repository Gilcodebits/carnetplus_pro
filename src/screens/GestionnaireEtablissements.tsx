import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { etablissementsAPI } from "../services/api";
import { 
  Building2, MapPin, Phone, Globe, ShieldCheck, 
  Search, Filter, ChevronRight, Activity, Users,
  ExternalLink, Mail, ArrowLeftRight
} from "lucide-react";
import { motion } from "framer-motion";

export function GestionnaireEtablissements() {
  const [etablissements, setEtablissements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadEtablissements();
  }, []);

  const loadEtablissements = async () => {
    setLoading(true);
    try {
      const data = await etablissementsAPI.list();
      setEtablissements(data);
    } catch (err) {
      console.error("Erreur établissements:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = etablissements.filter(e => 
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.ville.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl px-8 lg:px-12 py-6 border-b-4 border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Réseau Médical</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
            Partenaires et établissements de santé interconnectés
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une clinique, un hôpital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="px-8 lg:px-12 pb-12 space-y-10">
      {/* Grid of Establishments */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-white rounded-[2.5rem] border-2 border-slate-50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((etab, i) => (
            <motion.div
              key={etab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[3.5rem] border-4 border-slate-100 p-10 group hover:border-blue-500/40 hover:shadow-[0_32px_64px_-16px_rgba(59,130,246,0.15)] transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20 group-hover:bg-blue-100 transition-colors duration-500" />
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Header: Icon & Status */}
                <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
                    <Building2 className="w-8 h-8"/>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/>
                      Connecté
                    </span>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">ID: CP-{etab.id}00</p>
                  </div>
                </div>

                {/* Info: Name & Location */}
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{etab.nom}</h3>
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                      <MapPin className="w-4 h-4 text-slate-400"/>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{etab.ville}, <span className="text-slate-300 font-medium">{etab.adresse}</span></span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-10 mt-auto">
                  <div className="p-5 bg-slate-50 rounded-3xl border-2 border-slate-100 group-hover:bg-white group-hover:border-blue-50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Activity className="w-4 h-4"/>
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Disponibilité</p>
                    </div>
                    <span className="text-lg font-black text-slate-900 tracking-tight">98% <span className="text-[10px] text-emerald-500 uppercase">Libre</span></span>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-3xl border-2 border-slate-100 group-hover:bg-white group-hover:border-blue-50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <ArrowLeftRight className="w-4 h-4"/>
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Flux Dossiers</p>
                    </div>
                    <span className="text-lg font-black text-slate-900 tracking-tight">Actif <span className="text-[10px] text-blue-500 uppercase">24/7</span></span>
                  </div>
                </div>

                {/* Footer: Contacts & Action */}
                <div className="flex items-center justify-between pt-8 border-t-2 border-slate-50">
                  <div className="flex gap-2">
                    <button className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 border-2 border-transparent hover:border-blue-100 transition-all group-hover:bg-white">
                      <Phone className="w-5 h-5"/>
                    </button>
                    <button className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 border-2 border-transparent hover:border-blue-100 transition-all group-hover:bg-white">
                      <Mail className="w-5 h-5"/>
                    </button>
                  </div>
                  <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg active:scale-95 flex items-center gap-3">
                    Détails <ChevronRight className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
