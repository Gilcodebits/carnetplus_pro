import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../components/Card";
import { 
  Activity, Heart, Brain, 
  TrendingUp, CheckCircle, Sparkles, 
  ShieldCheck, ArrowRight, Zap, Info, Clock, Pill, FlaskConical,
  BarChart3, Scale, Droplets
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BilanSante() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"questionnaire" | "resultats">("questionnaire");
  const [reponses, setReponses] = useState({ sommeil: "", activite: "", alimentation: "", stress: "" });

  // Calcul dynamique des scores basé sur les réponses
  const stats = useMemo(() => {
    const weights: Record<string, number> = {
      "Excellent": 95, "Bon": 80, "Moyen": 60, "Mauvais": 40,
      "Intense": 95, "Modéré": 80, "Léger": 60, "Sédentaire": 30,
      "Faible": 95, "Élevé": 40, "Critique": 20
    };

    const s = weights[reponses.sommeil] || 0;
    const a = weights[reponses.activite] || 0;
    const al = weights[reponses.alimentation] || 0;
    const st = weights[reponses.stress] || 0;

    const global = Math.round((s + a + al + st) / 4);
    return { global, sommeil: s, activite: a, alimentation: al, stress: st };
  }, [reponses]);

  const handleSubmit = () => {
    // Simulation d'une analyse intensive par l'IA
    setTimeout(() => setStep("resultats"), 1500);
  };

  return (
    <div className="flex flex-col relative pt-6 px-10 pb-10 bg-slate-50 min-h-screen">
        
        {/* Advanced Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl -mx-10 px-10 py-6 border-b border-slate-200/50 mb-10">
          <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl border border-white/20">
                <Activity className="w-8 h-8 text-emerald-500 animate-pulse"/>
              </div>
              <div>
                <div className="flex items-center gap-3">
                   <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Bilan Santé <span className="text-emerald-600">Bio-IA</span></h1>
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">Analyse de biomarqueurs & habitudes de vie • v2.0</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="px-5 py-2.5 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-3 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Données Chiffrées AES-256</span>
               </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            {step === "questionnaire" ? (
              <motion.div 
                key="q"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <Card className="border border-slate-200 shadow-2xl p-10 bg-white rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 transition-all group-hover:scale-110 opacity-50 pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-12 relative z-10">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                      <Sparkles className="w-6 h-6 text-emerald-500" /> 
                      Analyse de Style de Vie
                    </h2>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression</span>
                       <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${Object.values(reponses).filter(v => v !== "").length * 25}%` }}
                          />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-8 relative z-10">
                    {[
                      { key: "sommeil", label: "Qualité du Sommeil", desc: "Cycles de repos et récupération nocturne", icon: Clock, options: ["Excellent", "Bon", "Moyen", "Mauvais"], accent: "emerald" },
                      { key: "activite", label: "Indice d'Activité", desc: "Mouvement quotidien et exercices cardios", icon: TrendingUp, options: ["Intense", "Modéré", "Léger", "Sédentaire"], accent: "emerald" },
                      { key: "alimentation", label: "Apport Nutritionnel", desc: "Équilibre vitamines et macronutriments", icon: Droplets, options: ["Excellent", "Bon", "Moyen", "Mauvais"], accent: "emerald" },
                      { key: "stress", label: "Charge Mentale", desc: "Niveau de cortisol et gestion émotionnelle", icon: Brain, options: ["Faible", "Modéré", "Élevé", "Critique"], accent: "emerald" },
                    ].map((q) => (
                      <div key={q.key} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem] transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                           <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100">
                              <q.icon className="w-7 h-7 text-emerald-600" />
                           </div>
                           <div>
                             <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase">{q.label}</h3>
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{q.desc}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {q.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setReponses({ ...reponses, [q.key]: opt })}
                              className={`py-4 px-4 rounded-xl border-2 font-black text-[11px] uppercase tracking-wider transition-all ${
                                (reponses as any)[q.key] === opt 
                                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-lg scale-105" 
                                  : "border-white bg-white text-slate-400 hover:border-emerald-200"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={handleSubmit}
                      disabled={!reponses.sommeil || !reponses.activite || !reponses.alimentation || !reponses.stress}
                      className="w-full py-7 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-slate-300 hover:bg-emerald-600 transition-all disabled:opacity-20 active:scale-95 mt-6 flex items-center justify-center gap-4 group"
                    >
                      <Zap className="w-5 h-5 text-emerald-400 group-hover:animate-pulse" />
                      LANCER L'ANALYSE PRÉDICTIVE
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div 
                key="r"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-10"
              >
                {/* Result Hero Card */}
                <Card className="border border-slate-200 shadow-2xl p-10 lg:p-16 bg-white rounded-[3rem] relative overflow-hidden">
                   {/* Animated Background SVG */}
                   <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                         <motion.path 
                           d="M0 50 Q 25 30 50 50 T 100 50 V 100 H 0 Z" 
                           fill="#10b981"
                           animate={{ d: ["M0 50 Q 25 30 50 50 T 100 50 V 100 H 0 Z", "M0 50 Q 25 70 50 50 T 100 50 V 100 H 0 Z", "M0 50 Q 25 30 50 50 T 100 50 V 100 H 0 Z"] }}
                           transition={{ duration: 10, repeat: Infinity }}
                         />
                      </svg>
                   </div>

                   <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                     {/* Global Score Circle */}
                     <div className="relative w-64 h-64 shrink-0">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                           <circle cx="50" cy="50" r="45" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                           <motion.circle 
                             cx="50" cy="50" r="45" stroke="#10b981" strokeWidth="8" fill="none"
                             strokeDasharray="283"
                             initial={{ strokeDashoffset: 283 }}
                             animate={{ strokeDashoffset: 283 - (283 * stats.global) / 100 }}
                             transition={{ duration: 2, ease: "easeOut" }}
                             strokeLinecap="round"
                           />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <motion.span 
                             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                             className="text-6xl font-black text-slate-900 tracking-tighter"
                           >{stats.global}</motion.span>
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Score Vital</span>
                        </div>
                     </div>

                     <div className="flex-1 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                           <div className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" /> Rapport IA Généré
                           </div>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: CP-{Math.floor(Math.random()*90000)}</span>
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-black text-slate-900 uppercase tracking-tight leading-[0.9] mb-6">
                           {stats.global > 80 ? "Performance" : stats.global > 60 ? "Équilibre" : "Attention"} <br/>
                           <span className="text-emerald-600">{stats.global > 80 ? "Optimale" : stats.global > 60 ? "Stable" : "Requise"}</span>
                        </h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xl opacity-70">
                           Votre profil biométrique indique une {stats.global > 80 ? "excellente résilience" : "vigueur modérée"}. L'IA a détecté des opportunités d'optimisation sur vos cycles de {stats.sommeil < 80 ? "sommeil" : "nutrition"}.
                        </p>
                     </div>
                   </div>

                   {/* Sub-Stats Grid */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 relative z-10">
                      {[
                        { label: "Sommeil", score: stats.sommeil, icon: Clock, color: "text-blue-500" },
                        { label: "Vigueur", score: stats.activite, icon: Activity, color: "text-rose-500" },
                        { label: "Nutrition", score: stats.alimentation, icon: Droplets, color: "text-emerald-500" },
                        { label: "Mental", score: stats.stress, icon: Brain, color: "text-purple-500" },
                      ].map((s, i) => (
                        <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                           <div className="flex items-center justify-between mb-4">
                              <s.icon className={`w-6 h-6 ${s.color}`} />
                              <span className="text-xl font-black text-slate-900 tracking-tighter">{s.score}%</span>
                           </div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                           <div className="w-full h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                              <motion.div 
                                className={`h-full ${s.color.replace('text-', 'bg-')}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${s.score}%` }}
                                transition={{ duration: 1.5, delay: 0.5 + i*0.1 }}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </Card>

                {/* IA Insights & Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                   <Card className="lg:col-span-8 border border-slate-200 shadow-xl p-10 bg-white rounded-[2.5rem]">
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-4">
                         <BarChart3 className="w-6 h-6 text-emerald-600" />
                         Tendances Vitales
                      </h3>
                      <div className="h-48 w-full flex items-end gap-3 px-4">
                         {[60, 45, 80, 55, 90, 75, 88].map((h, i) => (
                           <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 1, delay: i*0.1 }}
                                className={`w-full rounded-t-xl transition-all ${i === 6 ? 'bg-emerald-600 shadow-lg shadow-emerald-200' : 'bg-slate-100 group-hover:bg-emerald-200'}`}
                              />
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{['L','M','M','J','V','S','D'][i]}</span>
                           </div>
                         ))}
                      </div>
                      <div className="mt-10 p-6 bg-slate-50 rounded-2xl flex items-center gap-6 border border-slate-100">
                         <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                         </div>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                            Votre score vital a progressé de <span className="text-emerald-600 font-black">+12%</span> par rapport à la semaine dernière.
                         </p>
                      </div>
                   </Card>

                   <Card className="lg:col-span-4 bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                          <Zap className="w-6 h-6 text-emerald-400"/>
                        </div>
                        <h4 className="text-xl font-black uppercase tracking-tight mb-4">Focus IA</h4>
                        <div className="space-y-6">
                           <div>
                              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Conseil Prioritaire</p>
                              <p className="text-xs font-bold leading-relaxed text-slate-400">
                                {stats.sommeil < 80 ? "Optimisez votre exposition à la lumière bleue avant 22h." : "Continuez vos 30min d'activité matinale."}
                              </p>
                           </div>
                           <div className="pt-6 border-t border-white/10">
                              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Micro-Objectif</p>
                              <p className="text-xs font-bold leading-relaxed text-slate-400">
                                Augmentez votre hydratation de 500ml/jour.
                              </p>
                           </div>
                        </div>
                        <button onClick={() => navigate("/patient/calendrier-rdv")} className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-10 hover:bg-emerald-500 hover:text-white transition-all">
                           PLANIFIER UN CHECK-UP
                        </button>
                      </div>
                   </Card>
                </div>

                <div className="flex justify-center gap-6 pt-10">
                   <button onClick={() => setStep("questionnaire")} className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-emerald-600 hover:text-emerald-600 transition-all active:scale-95">REFAIRE L'ANALYSE</button>
                   <button onClick={() => navigate("/patient")} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-xl">RETOUR AU PORTAIL</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
}
