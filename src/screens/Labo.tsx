import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { StatCard } from "../components/Card";
import { dashboardAPI, examensAPI } from "../services/api";
import { Clock, CheckCircle, AlertCircle, Users, Activity, ArrowUpRight, TrendingUp, Calendar, Zap, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

export function Labo() {
  const [stats, setStats]     = useState<any>({ en_cours: 0, termines: 0, urgents: 0, patients_total: 0, activite_semaine: [] });
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, e] = await Promise.all([
        dashboardAPI.stats(),
        examensAPI.list()
      ]);
      setStats(s || {});
      setRecentExams((e || []).slice(0, 5));
    } catch (err) {
      console.error("Erreur Labo Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Préparation des données pour le graphique (si vide, mettre des zéros)
  const activityData = (stats.activite_semaine && stats.activite_semaine.length > 0)
    ? stats.activite_semaine.map((item: any) => ({ day: item.jour, value: Math.min(item.total * 10, 100) }))
    : [
        { day: 'L', value: 0 }, { day: 'M', value: 0 }, { day: 'M', value: 0 },
        { day: 'J', value: 0 }, { day: 'V', value: 0 }, { day: 'S', value: 0 }, { day: 'D', value: 0 }
      ];

  return (
    <div className="animate-fadeIn bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Modern FIXED Header - Premium White */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-50 bg-white border-b-2 border-slate-200 shadow-md h-[90px] flex items-center shrink-0">
        <div className="px-6 md:px-12 flex flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-teal-600 rounded-full shrink-0 shadow-sm shadow-teal-200" />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Centre d'Analyses</h1>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Plateau technique & résultats</p>
            </div>
          </div>
          <Link to="/labo/analyses" className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 flex items-center justify-center gap-2 active:scale-95">
            <Zap className="w-4 h-4" /> <span>Gérer les Analyses</span>
          </Link>
        </div>
      </div>

      <div className="p-4 md:p-12 space-y-8 md:space-y-12 w-full max-w-full overflow-x-hidden pt-[130px] md:pt-[140px]">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
        <StatCard title="En cours" value={stats.en_cours || 0} icon={<Clock/>} color="orange" delay={100} />
        <StatCard title="Terminés" value={stats.termines || 0} icon={<CheckCircle/>} color="emerald" delay={200} />
        <StatCard title="Urgences" value={stats.urgents || 0} icon={<AlertCircle/>} color="rose" delay={300} />
        <StatCard title="Patients" value={stats.patients_total || 0} icon={<Users/>} color="teal" delay={400} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border-2 border-slate-200 shadow-xl shadow-slate-200/20 relative overflow-hidden group"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-16 relative z-10 gap-4">
            <div className="min-w-0">
              <h3 className="text-lg md:text-2xl font-black text-slate-900 uppercase flex items-center gap-2 md:gap-3 truncate">
                <TrendingUp className="text-teal-600 w-5 h-5 md:w-8 md:h-8 shrink-0"/> Flux de Travail
              </h3>
              <p className="text-[8px] md:text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1 truncate">Charge hebdomadaire réelle</p>
            </div>
            <div className="px-4 py-2 bg-teal-50 rounded-xl text-[8px] md:text-[10px] font-black text-teal-600 uppercase tracking-widest w-max">
              Temps réel
            </div>
          </div>

          <div className="relative h-48 md:h-64 w-full">
            <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#0d9488', stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: '#0d9488', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d="M0,150 Q100,50 200,100 T400,20 T600,80 T700,100 V200 H0 Z"
                fill="url(#grad)"
              />
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d="M0,150 Q100,50 200,100 T400,20 T600,80 T700,100"
                fill="none"
                stroke="#0d9488"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {[100, 200, 400, 600, 700].map((x, i) => (
                <circle 
                  key={i} 
                  cx={x} 
                  cy={i === 0 ? 50 : i === 1 ? 100 : i === 2 ? 20 : i === 3 ? 80 : 100} 
                  r="8" 
                  fill="white" 
                  stroke="#0d9488" 
                  strokeWidth="4" 
                  className="hover:r-12 transition-all cursor-pointer"
                />
              ))}
            </svg>
            
            <div className="flex justify-between mt-8 md:mt-12 px-2">
              {activityData.map((item: any, i: number) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.day}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] text-white shadow-2xl relative"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 md:mb-12">
              <h3 className="text-base md:text-2xl font-black uppercase tracking-tight">Priorités</h3>
              <AlertCircle className="text-rose-500 w-5 h-5 md:w-8 md:h-8 relative z-10"/>
            </div>
            <div className="space-y-4 md:space-y-6">
              {recentExams.filter(e => e.urgence).map((e, i) => (
                <div key={i} className="group p-4 md:p-6 bg-white/5 rounded-xl md:rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-5">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-500/20 text-rose-500 rounded-lg md:rounded-2xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all">
                      <Activity className="w-4 h-4 md:w-6 md:h-6"/>
                    </div>
                    <div>
                      <p className="text-[11px] md:text-sm font-black uppercase tracking-tight">{e.patient_nom}</p>
                      <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 group-hover:text-slate-500">{e.type_examen}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-white/10 group-hover:text-white transition-all"/>
                </div>
              ))}
              {recentExams.filter(e => e.urgence).length === 0 && (
                <div className="text-center py-12 md:py-20 opacity-20">
                  <Activity className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6"/>
                  <p className="text-[10px] font-black uppercase">Service Fluide</p>
                </div>
              )}
            </div>
            <Link to="/labo/analyses" className="block w-full mt-8 md:mt-12 py-4 md:py-5 bg-teal-600 hover:bg-teal-500 text-white text-center rounded-xl md:rounded-[1.5rem] font-black text-[9px] md:text-[10px] uppercase shadow-xl shadow-teal-500/20 transition-all">
              Planning Complet
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);
}

