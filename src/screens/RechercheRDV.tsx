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

  if (loading) return (
    <div className="flex h-screen bg-slate-50 items-center justify-center font-sans">
      <div className="text-center animate-pulse">
        <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-blue-200">
           <Search className="w-10 h-10 text-white animate-bounce" />
        </div>
        <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-[10px]">Recherche des praticiens certifiés...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col relative pt-6 px-10 pb-10">
        
        {/* Compact Header */}
        <div className="sticky top-0 z-40 bg-slate-50/90 backdrop-blur-xl -mx-10 px-10 py-6 border-b border-slate-200/50 mb-10">
          <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-200 border-2 border-white/20">
                <Stethoscope className="w-8 h-8 text-white animate-pulse"/>
              </div>
              <div>
                <div className="flex items-center gap-3">
                   <span className="w-6 h-1.5 bg-blue-500 rounded-full" />
                   <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Trouver un Praticien</h1>
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">Prenez rendez-vous en quelques clics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="px-5 py-2.5 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center gap-3 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Médecins Vérifiés</span>
               </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full space-y-10">
          {/* Search Card */}
          <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-12 bg-white rounded-[4rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 transition-all group-hover:scale-110 opacity-50 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-end gap-8 relative z-10">
              <div className="flex-1 space-y-4">
                <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                   <Filter className="w-4 h-4 text-blue-600" /> Spécialité ou Nom
                </label>
                <div className="relative group/input">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={specialite} 
                    onChange={e => setSpecialite(e.target.value)} 
                    placeholder="Ex: Cardiologue, Dr. Rousseau..." 
                    className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all outline-none font-bold text-slate-900 text-base shadow-inner"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-rose-500" /> Ville ou Quartier
                </label>
                <div className="relative group/input">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-rose-500 transition-colors" />
                  <input 
                    type="text" 
                    value={localisation} 
                    onChange={e => setLocalisation(e.target.value)} 
                    placeholder="Ex: Cotonou, Haie Vive..." 
                    className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all outline-none font-bold text-slate-900 text-base shadow-inner"
                  />
                </div>
              </div>
              <button className="px-10 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:shadow-blue-400/50 hover:-translate-y-1 transition-all border-2 border-blue-400 active:scale-95 flex items-center gap-4">
                <span>RECHERCHER</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8 px-4">
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  Praticiens disponibles ({medecins.length})
               </h2>
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Trier par : <span className="text-blue-600 cursor-pointer">Pertinence</span>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {medecins.map((medecin, i) => (
                  <motion.div
                    key={medecin.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate("/patient/calendrier-rdv")}
                    className="group bg-white p-8 rounded-[4rem] border-2 border-slate-100 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-200/50 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-full bg-blue-50 -mr-32 -skew-x-12 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
                    
                    <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-10 relative z-10">
                      <div className="flex flex-col md:flex-row items-center gap-10 flex-1">
                        <div className="relative">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200 border-4 border-white group-hover:scale-110 transition-transform duration-500">
                            {medecin.prenom[0]}{medecin.nom[0]}
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center shadow-lg">
                             <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          </div>
                        </div>

                        <div className="text-center md:text-left space-y-3">
                          <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                             <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">Dr. {medecin.prenom} {medecin.nom}</h3>
                             <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-yellow-100 flex items-center gap-1.5">
                               <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" /> 4.9
                             </span>
                          </div>
                          <p className="text-blue-500 font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-3">
                             Médecine Générale · <span className="text-slate-400">12 ans d'exp.</span>
                          </p>
                          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 pt-2">
                             <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                <MapPin className="w-4 h-4 text-rose-500" /> Clinique CarnetPlus, Cotonou
                             </div>
                             <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl">
                                <Sparkles className="w-4 h-4" /> Libre aujourd'hui
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-4">
                         <div className="text-center mb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Premier créneau</p>
                            <p className="text-xl font-black text-blue-600 tracking-tight">14:30 aujourd'hui</p>
                         </div>
                         <button className="px-14 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-95 border-2 border-white/10 group/btn">
                           PRENDRE RDV
                         </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {medecins.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 shadow-inner">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-slate-100">
                     <Search className="w-12 h-12 text-slate-200"/>
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Aucun praticien ne correspond à ces critères</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
