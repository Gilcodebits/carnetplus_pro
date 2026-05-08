import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard, Card } from "../components/Card";
import { dashboardAPI } from "../services/api";
import { 
  Calendar, Bot, Activity, FileText, MapPin, Heart,
  ChevronRight, Zap, ArrowUpRight, Sparkles, TrendingUp, Pill, FlaskConical
} from "lucide-react";
import { motion } from "framer-motion";



export function PatientPortal() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="flex h-screen bg-slate-50 items-center justify-center">
      <div className="text-center animate-pulse">
        <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-blue-200">
           <Heart className="w-10 h-10 text-white animate-bounce" />
        </div>
        <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-[10px]">Chargement de votre univers santé...</p>
      </div>
    </div>
  );

  const currentStats = stats || { 
    patient: { prenom: "Ami" }, 
    prochain_rdv: null, 
    prescriptions: [], 
    examens: [], 
    documents_count: 0, 
    score_sante: 85,
    derniere_analyse: "Janvier 2024"
  };

  const prochainRdv = currentStats.prochain_rdv ? [currentStats.prochain_rdv] : [];
  
  const documentsRecents = [
    ...(currentStats.prescriptions || []).map((p: any) => ({ id: p.id, type: "Ordonnance", date: p.created_at, medecin: p.medecin_nom, icon: <Pill className="w-5 h-5 text-emerald-500"/>, color: "bg-emerald-50" })),
    ...(currentStats.examens || []).map((e: any) => ({ id: e.id, type: e.type_examen, date: e.date_demande, medecin: e.medecin_nom, icon: <FlaskConical className="w-5 h-5 text-purple-500"/>, color: "bg-purple-50" }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
  return (
    <div className="overflow-auto scrollbar-hide flex flex-col relative">

      {/* Content Area */}
      <div className="p-8 lg:p-12 space-y-10">
        
        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Prochain RDV", val: currentStats.prochain_rdv ? new Date(currentStats.prochain_rdv.date_rdv).toLocaleDateString('fr-FR', {day:'numeric', month:'short'}) : "Aucun", icon: Calendar, color: "from-blue-500 to-blue-600", path: "/patient/calendrier-rdv" },
            { label: "Assistant IA", val: "Actif", icon: Bot, color: "from-purple-500 to-purple-600", path: "/patient/assistant-ia" },
            { label: "Bilan Santé", val: `${currentStats.score_sante || 85}/100`, icon: Activity, color: "from-emerald-500 to-emerald-600", path: "/patient/bilan-sante" },
            { label: "Documents", val: currentStats.documents_count || 4, icon: FileText, color: "from-orange-500 to-orange-600", path: "/patient/dossier" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              onClick={() => stat.path && navigate(stat.path)}
              className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border-2 border-transparent hover:border-blue-100 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{stat.val}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          
          {/* Planning Médical */}
          <div className="xl:col-span-7">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border-2 border-blue-100 shadow-sm"><Calendar className="w-7 h-7"/></div>
                 Calendrier Médical
              </h2>
              <button onClick={()=>navigate("/patient/calendrier-rdv")} className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 shadow-sm">Tout voir</button>
            </div>

            <div className="space-y-6">
              {prochainRdv.length > 0 ? prochainRdv.map((rdv: any, i: number) => (
                <div key={rdv.id || i} className="p-8 rounded-[3rem] border-2 border-slate-100 bg-white hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-200/50 transition-all group cursor-pointer relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-8">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-slate-100 text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner group-hover:border-blue-400">
                         <span className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest">Heure</span>
                         <span className="text-2xl font-black">{rdv.heure_rdv?.substring(0,5)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest group-hover:bg-white/20 group-hover:text-white transition-all">Consultation</span>
                           <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest group-hover:bg-emerald-400/20 group-hover:text-emerald-100 transition-all">Confirmé</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight group-hover:text-white transition-colors">Dr. {rdv.medecin_nom}</h3>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-2 flex items-center gap-3 group-hover:text-blue-100 transition-all">
                          <MapPin className="w-4 h-4 text-rose-500 group-hover:text-white transition-all" /> 
                          Clinique CarnetPlus · Secteur A
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-8 h-8 text-slate-200 group-hover:text-white transition-all group-hover:translate-x-2" />
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
                  <Calendar className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                  <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Aucun rendez-vous planifié</p>
                  <button onClick={()=>navigate("/patient/calendrier-rdv")} className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-105 transition-all">Prendre RDV</button>
                </div>
              )}
            </div>
          </div>

          {/* Documents Récents */}
          <div className="xl:col-span-5">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-4">
               <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center border-2 border-orange-100 shadow-sm"><FileText className="w-7 h-7"/></div>
               Historique Récent
            </h2>
            <div className="space-y-4">
              {documentsRecents.length > 0 ? documentsRecents.map((doc, i) => (
                <div key={i} 
                  onClick={() => doc.type === "Ordonnance" && navigate(`/patient/dossier`)} 
                  className="p-6 rounded-[2.5rem] border-2 border-slate-50 bg-white hover:border-blue-600 hover:shadow-xl hover:shadow-blue-200/30 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 ${doc.color || 'bg-slate-50'} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      {doc.icon}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm uppercase tracking-tight group-hover:text-blue-600 transition-colors">{doc.type}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Émis par Dr. {doc.medecin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-[9px] font-black text-slate-300 uppercase hidden sm:block">{new Date(doc.date).toLocaleDateString('fr-FR')}</span>
                     <ArrowUpRight className="w-5 h-5 text-slate-200 group-hover:text-blue-600 transition-all"/>
                  </div>
                </div>
              )) : (
                 <div className="py-16 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Votre dossier est encore vierge</p>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Services - Grid of 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.button 
            whileHover={{ y: -10 }}
            onClick={()=>navigate("/patient/assistant-ia")} 
            className="relative group p-12 bg-slate-900 rounded-[4rem] shadow-2xl overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
            <Bot className="w-16 h-16 text-blue-500 mb-8 group-hover:scale-110 transition-transform duration-500"/><h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Assistant IA</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-relaxed">Diagnostic vocal & Analyse intelligente de vos symptômes par Intelligence Artificielle.</p>
            <div className="mt-8 flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest">
               Démarrer <Sparkles className="w-4 h-4" />
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ y: -10 }}
            onClick={()=>navigate("/patient/bilan-sante")} 
            className="p-12 bg-white border-2 border-slate-100 rounded-[4rem] shadow-2xl text-left hover:border-emerald-500/30 transition-all group"
          >
            <Activity className="w-16 h-16 text-emerald-500 mb-8 group-hover:scale-110 transition-transform duration-500"/><h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Bilan de Santé</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed">Suivi détaillé de vos constantes biomédicales et graphiques d'évolution.</p>
            <div className="mt-8 flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
               Consulter <TrendingUp className="w-4 h-4" />
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ y: -10 }}
            onClick={()=>navigate("/patient/messagerie")} 
            className="p-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[4rem] shadow-2xl text-left border-2 border-white/10 group"
          >
            <Zap className="w-16 h-16 text-white mb-8 group-hover:scale-110 transition-transform duration-500"/><h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Messagerie</h3>
            <p className="text-[10px] text-blue-100/60 font-black uppercase tracking-[0.2em] leading-relaxed">Contactez vos médecins directement pour un avis ou une question urgente.</p>
            <div className="mt-8 flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest">
               Ouvrir <ArrowUpRight className="w-4 h-4" />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Floating AI Bubble for Premium Feel */}
      <div className="fixed bottom-10 right-10 z-[100]">
         <button 
           onClick={()=>navigate("/patient/assistant-ia")}
           className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-blue-500 shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-white group"
         >
            <Bot className="w-10 h-10 group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
         </button>
      </div>

    </div>
  );
}
