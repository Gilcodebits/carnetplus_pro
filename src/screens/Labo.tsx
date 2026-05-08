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
  const activityData = stats.activite_semaine.length > 0 
    ? stats.activite_semaine.map((item: any) => ({ day: item.jour, value: Math.min(item.total * 10, 100) }))
    : [
        { day: 'L', value: 0 }, { day: 'M', value: 0 }, { day: 'M', value: 0 },
        { day: 'J', value: 0 }, { day: 'V', value: 0 }, { day: 'S', value: 0 }, { day: 'D', value: 0 }
      ];

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
      <div className="text-center animate-pulse">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Synchronisation...</p>
      </div>
    </div>
  );

  return (
    <div className="p-12 space-y-12 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
            <LayoutDashboard className="w-10 h-10 text-teal-600" /> Dashboard Labo
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 ml-14">Performance & Monitoring Biomédical</p>
        </motion.div>
        <Link to="/labo/analyses" className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-teal-500/20 hover:shadow-2xl transition-all flex items-center gap-3">
          <Zap className="w-4 h-4" /> Gérer les Analyses
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <StatCard title="En cours" value={stats.en_cours || 0} icon={<Clock/>} color="orange" delay={100} />
        <StatCard title="Terminés" value={stats.termines || 0} icon={<CheckCircle/>} color="emerald" delay={200} />
        <StatCard title="Urgences" value={stats.urgents || 0} icon={<AlertCircle/>} color="rose" delay={300} />
        <StatCard title="Total Patients" value={stats.patients_total || 0} icon={<Users/>} color="teal" delay={400} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 bg-white p-12 rounded-[4rem] border-2 border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-16 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 uppercase flex items-center gap-3">
                <TrendingUp className="text-teal-600 w-8 h-8"/> Flux de Travail
              </h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Analyse de la charge hebdomadaire réelle</p>
            </div>
            <div className="px-6 py-3 bg-teal-50 rounded-2xl text-[10px] font-black text-teal-600 uppercase tracking-widest">
              Données en temps réel
            </div>
          </div>

          <div className="relative h-64 w-full">
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
            
            <div className="flex justify-between mt-12 px-2">
              {activityData.map((item: any, i: number) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.day}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-2xl font-black uppercase tracking-tight">Priorités</h3>
              <AlertCircle className="text-rose-500 w-8 h-8 relative z-10"/>
            </div>
            <div className="space-y-6">
              {recentExams.filter(e => e.urgence).map((e, i) => (
                <div key={i} className="group p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all">
                      <Activity className="w-6 h-6"/>
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{e.patient_nom}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 group-hover:text-slate-300">{e.type_examen}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/10 group-hover:text-white transition-all"/>
                </div>
              ))}
              {recentExams.filter(e => e.urgence).length === 0 && (
                <div className="text-center py-20 opacity-20">
                  <Activity className="w-16 h-16 mx-auto mb-6"/>
                  <p className="text-[10px] font-black uppercase">Service Fluide</p>
                </div>
              )}
            </div>
            <Link to="/labo/analyses" className="block w-full mt-12 py-5 bg-teal-600 hover:bg-teal-500 text-white text-center rounded-[1.5rem] font-black text-[10px] uppercase shadow-xl shadow-teal-500/20 transition-all">
              Planning Complet
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
