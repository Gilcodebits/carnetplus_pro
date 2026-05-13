import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard, Card } from "../components/Card";
import { dashboardAPI } from "../services/api";
import { 
  Calendar, Bot, Activity, FileText, MapPin, Heart,
  ChevronRight, Zap, ArrowUpRight, Sparkles, TrendingUp, Pill, FlaskConical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../utils/format";
import { useAuth } from "../contexts/AuthContext";



export function PatientPortal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % healthTips.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    dashboardAPI.stats()
      .then(data => {
        if (mounted) setStats(data);
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);


  // Dynamiser le score de santé depuis le dernier bilan enregistré localement
  // Key is namespaced per user to prevent cross-patient contamination
  const savedReport = localStorage.getItem(`last_bilan_sante_${user?.id ?? 'anonymous'}`);
  const localHealthScore = savedReport ? JSON.parse(savedReport).score : null;

  const currentStats = stats ? {
    ...stats,
    score_sante: localHealthScore || stats.score_sante || 85
  } : { 
    patient: { prenom: "Ami" }, 
    prochain_rdv: null, 
    prescriptions: [], 
    examens: [], 
    documents_count: 0, 
    score_sante: localHealthScore || 85,
    derniere_analyse: "Janvier 2024"
  };

  const prochainRdv = stats?.rdv_liste?.filter((r: any) => r.statut !== 'annule' && r.date_rdv >= new Date().toISOString().split('T')[0]).sort((a: any, b: any) => a.date_rdv.localeCompare(b.date_rdv) || a.heure_rdv.localeCompare(b.heure_rdv)).slice(0, 1) || [];
  
  const documentsRecents = [
    ...(currentStats.prescriptions || []).map((p: any) => ({ id: p.id, type: "Ordonnance", date: p.created_at, medecin: p.medecin_nom, icon: <Pill className="w-5 h-5 text-emerald-500"/>, color: "bg-emerald-50" })),
    ...(currentStats.examens || []).map((e: any) => ({ id: e.id, type: e.type_examen, date: e.date_demande, medecin: e.medecin_nom, icon: <FlaskConical className="w-5 h-5 text-purple-500"/>, color: "bg-purple-50" }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  return (
    <div className="animate-fadeIn bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">


      <div className="flex-1 px-4 md:px-10 pb-12 pt-2 md:pt-4 space-y-4">
        <div className="flex justify-end items-center">
          <button onClick={()=>navigate("/patient/calendrier-rdv")} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> <span>Prendre RDV</span>
          </button>
        </div>
        
        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Prochain RDV", val: currentStats.prochain_rdv ? formatDate(currentStats.prochain_rdv.date_rdv) : "Aucun", icon: Calendar, color: "from-blue-500 to-blue-600", path: "/patient/calendrier-rdv" },
            { label: "Assistant IA", val: "Actif", icon: Bot, color: "from-purple-500 to-purple-600", path: "/patient/assistant-ia" },
            { label: "Bilan Santé", val: `${currentStats.score_sante || 85}/100`, icon: Activity, color: "from-emerald-500 to-emerald-600", path: "/patient/bilan-sante" },
            { label: "Documents", val: currentStats.documents_count || 4, icon: FileText, color: "from-orange-500 to-orange-600", path: "/patient/dossier" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              onClick={() => stat.path && navigate(stat.path)}
              className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br ${stat.color} rounded-lg md:rounded-xl flex items-center justify-center text-white mb-3 md:mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <h3 className="text-base md:text-2xl font-black text-slate-900 mb-0.5 tracking-tighter truncate">{stat.val}</h3>
                <p className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Health Tips Section - WOW Animation Carousel */}
        <div className="pt-4">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center border-2 border-emerald-100 shadow-sm"><Sparkles className="w-6 h-6 md:w-7 md:h-7"/></div>
                 Conseils Santé du Jour
              </h2>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">IA en action</span>
              </div>
           </div>

           <div className="relative h-64 sm:h-40">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentTipIndex}
                  initial={{ opacity: 0, scale: 0.9, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.1, y: -30, filter: "blur(10px)" }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  <div className="h-full flex flex-col sm:flex-row items-center gap-6 md:gap-10 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-slate-50 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    
                    <div className={`w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br ${healthTips[currentTipIndex].color} rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-200 shrink-0`}>
                       {healthTips[currentTipIndex].icon}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-lg md:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2 md:mb-3">
                         {healthTips[currentTipIndex].text.split(":")[0]}
                      </p>
                      <p className="text-sm md:text-base font-bold text-slate-600 leading-relaxed line-clamp-3 sm:line-clamp-none">
                         {healthTips[currentTipIndex].text.split(":")[1]}
                      </p>
                    </div>

                    <div className="hidden lg:flex gap-1">
                      {healthTips.map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === currentTipIndex ? 'w-6 bg-emerald-500' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12">
          
          {/* Planning Médical */}
          <div className="xl:col-span-7">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center border-2 border-blue-100 shadow-sm"><Calendar className="w-6 h-6 md:w-7 md:h-7"/></div>
                 Calendrier
              </h2>
              <button onClick={()=>navigate("/patient/calendrier-rdv")} className="px-4 md:px-6 py-2 md:py-3 bg-white border-2 border-slate-100 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 shadow-sm">Tout voir</button>
            </div>

            <div className="space-y-4 md:space-y-6">
              {prochainRdv.length > 0 ? prochainRdv.map((rdv: any, i: number) => (
                <div key={rdv.id || i} className="p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-slate-100 bg-white hover:bg-blue-600 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-200/50 transition-all group cursor-pointer relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6 md:gap-8">
                      <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-slate-100 text-slate-900 group-hover:bg-white group-hover:text-blue-600 transition-all shadow-inner group-hover:border-white shrink-0">
                         <span className="text-[8px] md:text-[10px] font-black uppercase opacity-90 mb-1 tracking-widest">Heure</span>
                         <span className="text-lg md:text-2xl font-black">{rdv.heure_rdv?.substring(0,5)}</span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                           <span className="px-2 md:px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest group-hover:bg-white/20 group-hover:text-white transition-all">Consultation</span>
                           <span className={`px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${
                             rdv.statut === 'confirme' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-400/20 group-hover:text-emerald-100' : 
                             rdv.statut === 'en_attente' ? 'bg-orange-50 text-orange-600 group-hover:bg-orange-400/20 group-hover:text-orange-100' :
                             'bg-blue-50 text-blue-600 group-hover:bg-white/20 group-hover:text-white'
                           }`}>
                             {rdv.statut === 'en_attente' ? 'En attente' : rdv.statut === 'confirme' ? 'Confirmé' : 'Planifié'}
                           </span>
                        </div>
                        <h3 className="text-lg md:text-2xl font-black text-slate-900 uppercase tracking-tight group-hover:text-white transition-colors">Dr. {rdv.medecin_nom}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                           <p className="text-[10px] md:text-[11px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-2 group-hover:text-white transition-all">
                             <Calendar className="w-3.5 h-3.5" />
                             {formatDate(rdv.date_rdv)}
                           </p>
                           <p className="text-[10px] md:text-[11px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-2 group-hover:text-blue-100 transition-all">
                             <MapPin className="w-3.5 h-3.5 text-rose-500 group-hover:text-white" /> 
                             Secteur A
                           </p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="hidden sm:block w-8 h-8 text-slate-200 group-hover:text-white transition-all group-hover:translate-x-2" />
                  </div>
                </div>
              )) : (
                <div className="py-16 md:py-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem] md:rounded-[3rem] bg-white shadow-inner">
                  <Calendar className="w-12 h-12 md:w-16 md:h-16 text-slate-100 mx-auto mb-6" />
                  <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-[10px]">Aucun rendez-vous planifié</p>
                  <button onClick={()=>navigate("/patient/calendrier-rdv")} className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-105 transition-all">Prendre RDV</button>
                </div>
              )}
            </div>
          </div>

          {/* Historique Médical */}
          <div className="xl:col-span-5">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 text-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center border-2 border-orange-100 shadow-sm"><FileText className="w-6 h-6 md:w-7 md:h-7"/></div>
                 Historique
              </h2>
              <button onClick={()=>navigate("/patient/dossier")} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">Voir plus</button>
            </div>
            <div className="space-y-4">
              {documentsRecents.length > 0 ? documentsRecents.map((doc, i) => (
                <div key={i} 
                  onClick={() => doc.type === "Ordonnance" && navigate(`/patient/dossier`)} 
                  className="p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border-2 border-slate-50 bg-white hover:border-blue-600 hover:shadow-xl hover:shadow-blue-200/30 transition-all cursor-pointer group flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className={`w-12 h-12 md:w-14 md:h-14 ${doc.color || 'bg-slate-50'} rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform shrink-0`}>
                      {doc.icon}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-xs md:text-sm uppercase tracking-tight group-hover:text-blue-600 transition-colors">{doc.type}</p>
                      <p className="text-[8px] md:text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Dr. {doc.medecin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 shrink-0">
                     <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase hidden md:block">{formatDate(doc.date)}</span>
                     <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-slate-200 group-hover:text-blue-600 transition-all"/>
                  </div>
                </div>
              )) : (
                 <div className="py-12 md:py-16 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] md:rounded-[3rem]">
                    <FileText className="w-10 h-10 md:w-12 md:h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Votre dossier est encore vierge</p>
                 </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const healthTips = [
  { icon: <Zap className="w-8 h-8"/>, text: "Hydratez-vous : Buvez au moins 1.5L d'eau par jour pour une peau éclatante.", color: "from-blue-500 to-indigo-600" },
  { icon: <TrendingUp className="w-8 h-8"/>, text: "Activité : Une marche de 30 min réduit le risque cardiovasculaire de 20%.", color: "from-emerald-500 to-teal-600" },
  { icon: <Heart className="w-8 h-8"/>, text: "Sommeil : Évitez les écrans 1h avant de dormir pour un repos réparateur.", color: "from-rose-500 to-orange-600" },
  { icon: <Activity className="w-8 h-8"/>, text: "Nutrition : Privilégiez les fruits de saison pour faire le plein de vitamines.", color: "from-amber-500 to-orange-600" },
  { icon: <Heart className="w-8 h-8"/>, text: "Respiration : Pratiquez la cohérence cardiaque 5 min pour réduire votre stress.", color: "from-indigo-500 to-purple-600" },
  { icon: <Zap className="w-8 h-8"/>, text: "Posture : Gardez le dos droit devant votre écran pour éviter les tensions.", color: "from-slate-500 to-slate-700" },
  { icon: <Sparkles className="w-8 h-8"/>, text: "Soleil : Exposez-vous 15 min par jour pour synthétiser la Vitamine D.", color: "from-yellow-500 to-orange-500" },
  { icon: <Heart className="w-8 h-8"/>, text: "Dents : Le brossage du soir est le plus important pour prévenir les caries.", color: "from-blue-400 to-cyan-500" },
];

