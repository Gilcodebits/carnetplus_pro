import { useState, useEffect } from "react";
import { etablissementsAPI } from "../services/api";
import { 
  Building2, MapPin, Phone, Globe, ShieldCheck, 
  Search, Filter, ChevronRight, Activity, Users,
  ExternalLink, Mail, ArrowLeftRight, X, Info, PhoneCall
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../contexts/ToastContext";

export function GestionnaireEtablissements() {
  const [etablissements, setEtablissements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEtab, setSelectedEtab] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadEtablissements();
  }, []);

  const loadEtablissements = async () => {
    setLoading(true);
    try {
      const data = await etablissementsAPI.list();
      setEtablissements(data);
    } catch (err) {
      showToast("Impossible de charger le réseau médical", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = etablissements.filter(e => 
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.ville.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="animate-fadeIn bg-slate-50/50 min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Modern FIXED Header - Premium White */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-50 bg-white border-b-2 border-slate-200 shadow-md h-[90px] flex items-center shrink-0">
        <div className="px-6 md:px-10 flex flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-blue-600 rounded-full shrink-0 shadow-sm shadow-blue-200" />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Réseau Médical</h1>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Partenaires interconnectés</p>
            </div>
          </div>
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher une structure..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 md:pl-12 pr-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-900 text-xs shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 pb-12 pt-[130px] md:pt-[140px] space-y-10">

      {/* Grid of Establishments */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-white rounded-[3rem] border-2 border-slate-100 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((etab, i) => (
            <motion.div
              key={etab.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[2rem] md:rounded-[3rem] border-2 md:border-4 border-slate-100 p-6 md:p-8 group hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-200/20 transition-all flex flex-col h-full relative overflow-hidden"
            >
              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                 <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[8px] font-black uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/>
                    Connecté
                 </div>
              </div>

              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 md:w-8 md:h-8"/>
              </div>
              
              <div className="mb-4 md:mb-6 flex-1">
                <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight mb-2">
                  {etab.nom}
                </h3>
                <div className="flex items-center gap-2 text-slate-900 opacity-70">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide">{etab.ville}</span>
                </div>
              </div>

              {/* Stats Compactes */}
              <div className="grid grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8">
                <div className="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 text-center">
                  <p className="text-[7px] md:text-[8px] font-black text-slate-900 uppercase tracking-widest opacity-90 mb-1">Membres</p>
                  <p className="text-base md:text-lg font-black text-slate-900">{etab.membres_count || 0}</p>
                </div>
                <div className="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 text-center">
                  <p className="text-[7px] md:text-[8px] font-black text-slate-900 uppercase tracking-widest opacity-90 mb-1">Flux</p>
                  <p className="text-xs md:text-lg font-black text-blue-600">ACTIF</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                <div className="flex gap-2">
                  <a 
                    href={`tel:${etab.telephone}`}
                    title="Appeler"
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                  >
                    <Phone className="w-4 h-4"/>
                  </a>
                  <a 
                    href={`mailto:${etab.email}`}
                    title="Envoyer un email"
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <Mail className="w-4 h-4"/>
                  </a>
                </div>
                <button 
                  onClick={() => setSelectedEtab(etab)}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg"
                >
                  Détails <ChevronRight className="w-3.5 h-3.5"/>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Détails Établissement */}
      <AnimatePresence>
        {selectedEtab && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                    <Building2 className="w-8 h-8"/>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedEtab.nom}</h2>
                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mt-1">Établissement Interconnecté</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEtab(null)} className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all text-slate-900 shadow-sm">
                  <X className="w-6 h-6"/>
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-1 no-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-90">Localisation</p>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">{selectedEtab.ville}, {selectedEtab.adresse}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-90">ID Plateforme</p>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">CP-00{selectedEtab.id}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-90">Actions de contact direct</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a href={`tel:${selectedEtab.telephone}`} className="flex-1 flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                      <PhoneCall className="w-4 h-4"/> Appeler l'accueil
                    </a>
                    <a href={`mailto:${selectedEtab.email}`} className="flex-1 flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                      <Mail className="w-4 h-4"/> Envoyer un Email
                    </a>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
                <button 
                  onClick={() => setSelectedEtab(null)} 
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl md:rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                >
                  Fermer les détails
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

