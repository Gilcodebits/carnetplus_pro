import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../components/Card";
import { utilisateursAPI } from "../services/api";
import { 
  ArrowLeft, Search, MapPin, Star, 
  Stethoscope, Users, Filter, ArrowRight,
  Sparkles, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function RechercheRDV() {
  const navigate = useNavigate();
  const [specialite, setSpecialite] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [medecins, setMedecins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedecins();
  }, []);

  const loadMedecins = async () => {
    setLoading(true);
    try {
      const data = await utilisateursAPI.list("medecin");
      setMedecins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Modern FIXED Header - Premium White */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-50 bg-white border-b-2 border-slate-200 shadow-md h-[90px] flex items-center shrink-0">
        <div className="px-6 md:px-10 flex flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-1.5 h-10 bg-blue-600 rounded-full shrink-0 shadow-sm shadow-blue-200" />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Praticiens</h1>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Prenez rendez-vous en quelques clics</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <div className="px-5 py-2.5 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center gap-3 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Médecins Vérifiés</span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full space-y-6 md:space-y-10 pt-[130px] md:pt-[140px]">
          {/* Search Card */}
          <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-6 md:p-12 bg-white rounded-[2rem] md:rounded-[4rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 transition-all group-hover:scale-110 opacity-50 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-8 relative z-10">
              <div className="flex-1 space-y-2 md:space-y-4">
                <label className="text-[9px] md:text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                   <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" /> Spécialité
                </label>
                <div className="relative group/input">
                  <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-500 group-focus-within/input:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={specialite} 
                    onChange={e => setSpecialite(e.target.value)} 
                    placeholder="Cardiologue, Dr..." 
                    className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-3.5 md:py-6 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-[2rem] focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all outline-none font-bold text-slate-900 text-xs md:text-base shadow-inner"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2 md:space-y-4">
                <label className="text-[9px] md:text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                   <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-500" /> Ville
                </label>
                <div className="relative group/input">
                  <MapPin className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-500 group-focus-within/input:text-rose-500 transition-colors" />
                  <input 
                    type="text" 
                    value={localisation} 
                    onChange={e => setLocalisation(e.target.value)} 
                    placeholder="Cotonou..." 
                    className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-3.5 md:py-6 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-[2rem] focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all outline-none font-bold text-slate-900 text-xs md:text-base shadow-inner"
                  />
                </div>
              </div>
              <button className="px-6 md:px-10 py-4 md:py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:shadow-blue-400/50 hover:-translate-y-1 transition-all border-2 border-blue-400 active:scale-95 flex items-center justify-center gap-3 md:gap-4">
                <span>CHERCHER</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </Card>

          {/* Results Section */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between mb-4 md:mb-8 px-4">
               <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 md:gap-3">
                  <div className="w-1 h-5 md:w-1.5 md:h-6 bg-blue-600 rounded-full" />
                  Praticiens ({medecins.length})
               </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
                  <p className="text-slate-600 font-black uppercase tracking-widest text-[9px]">Recherche en cours...</p>
                </div>
              ) : (
                <AnimatePresence>
                  {medecins.map((medecin, i) => (
                    <motion.div
                      key={medecin.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => navigate("/patient/calendrier-rdv")}
                      className="group bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[4rem] border-2 border-slate-100 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-200/50 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-64 h-full bg-blue-50 -mr-32 -skew-x-12 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
                      
                      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 md:gap-10 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 flex-1">
                          <div className="relative shrink-0">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-xl shadow-blue-200 border-4 border-white group-hover:scale-110 transition-transform duration-500">
                              {medecin.prenom[0]}{medecin.nom[0]}
                            </div>
                            <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-8 h-8 md:w-10 md:h-10 bg-emerald-500 border-4 border-white rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg">
                               <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse" />
                            </div>
                          </div>

                          <div className="text-center md:text-left space-y-2 md:space-y-3 flex-1 min-w-0">
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-3">
                               <h3 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors truncate">Dr. {medecin.prenom} {medecin.nom}</h3>
                               <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-yellow-100 flex items-center gap-1">
                                 <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> 4.9
                               </span>
                            </div>
                            <p className="text-blue-500 font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center justify-center md:justify-start gap-2 md:gap-3">
                               Médecine Générale · <span className="text-slate-600">12 ans exp.</span>
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-4 pt-1 md:pt-2">
                               <div className="flex items-center gap-2 text-slate-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest bg-slate-50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                  <MapPin className="w-3 h-3 md:w-4 md:h-4 text-rose-500" /> Clinique CarnetPlus
                               </div>
                               <div className="flex items-center gap-2 text-emerald-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl">
                                  <Sparkles className="w-3 h-3 md:w-4 md:h-4" /> Libre
                               </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                           <div className="text-center sm:text-left lg:text-center shrink-0">
                              <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Premier créneau</p>
                              <p className="text-lg md:text-xl font-black text-blue-600 tracking-tight">14:30 aujourd'hui</p>
                           </div>
                           <button className="w-full sm:w-auto px-8 md:px-14 py-4 md:py-6 bg-slate-900 text-white rounded-xl md:rounded-[2.5rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-95 border-2 border-white/10">
                             PRENDRE RDV
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {medecins.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 shadow-inner">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-slate-100">
                     <Search className="w-12 h-12 text-slate-200"/>
                  </div>
                  <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-xs">Aucun praticien ne correspond à ces critères</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

