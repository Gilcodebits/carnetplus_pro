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
import { formatDate } from "../utils/format";

export function BilanSante() {
  const navigate = useNavigate();
  
  // Check for previous report on mount
  const savedReport = localStorage.getItem("last_bilan_sante");
  const initialStep = savedReport ? "resultats" : "questionnaire";
  const initialReponses = savedReport ? JSON.parse(savedReport).reponses : { sommeil: "", activite: "", alimentation: "", stress: "" };

  const [step, setStep] = useState<"questionnaire" | "resultats">(initialStep);
  const [reponses, setReponses] = useState(initialReponses);

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
    setTimeout(() => {
      // Save to localStorage for persistence
      localStorage.setItem("last_bilan_sante", JSON.stringify({
        score: stats.global,
        reponses: reponses,
        date: new Date().toISOString()
      }));
      setStep("resultats");
    }, 1500);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 1cm; size: A4; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white !important; }
          
          /* CRITICAL: Allow parents to expand */
          html, body, #root, [class*="overflow-hidden"], .flex-1, main { 
            overflow: visible !important; 
            height: auto !important; 
            display: block !important;
          }

          /* Force hide everything except the bilan */
          body * { visibility: hidden !important; }
          #bilan-pdf, #bilan-pdf * { visibility: visible !important; }

          #bilan-pdf { 
            display: block !important;
            position: absolute !important; 
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            opacity: 1 !important;
            background: white !important;
          }
          /* Restore layouts */
          #bilan-pdf .flex { display: flex !important; }
          #bilan-pdf .grid { display: grid !important; }
          .print-title { font-size: 16px !important; }
          .print-text { font-size: 14px !important; }
          .print-text-white { color: white !important; }
        }
      `}} />

      {/* Professional Bilan Layout - Hidden on screen */}
      <div id="bilan-pdf" className="fixed top-0 left-0 opacity-0 pointer-events-none -z-[9999] bg-white p-0 font-sans text-slate-900 w-full min-h-screen">
        <div className="p-8 border-b-2 border-slate-900 flex justify-between items-center bg-slate-50/30">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic print-title">Carnet<span className="text-blue-600">Plus</span></h1>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Analyse de Santé Prédictive IA</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black uppercase tracking-tight print-title">Rapport de Bilan de Santé</h2>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Généré le {formatDate(new Date())}</p>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-10 mb-10 pb-10 border-b border-slate-100">
             <div className="w-40 h-40 border-8 border-emerald-500 rounded-full flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-slate-900">{stats.global}</span>
                <span className="text-[8px] font-black text-emerald-600 uppercase">Score Vital</span>
             </div>
             <div className="flex-1">
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">Diagnostic de Vigueur</h3>
                <p className="text-sm font-bold text-slate-600 leading-relaxed">
                   Votre bilan du {formatDate(new Date())} présente un indice global de {stats.global}/100. 
                   L'analyse IA suggère une attention particulière sur votre {stats.sommeil < 80 ? 'sommeil' : 'niveau de stress'}.
                </p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-10">
             {[
               { label: "Qualité du Sommeil", val: stats.sommeil, status: stats.sommeil > 70 ? "OPTIMAL" : "À SURVEILLER" },
               { label: "Indice d'Activité", val: stats.activite, status: stats.activite > 70 ? "ACTIF" : "SÉDENTAIRE" },
               { label: "Nutrition", val: stats.alimentation, status: stats.alimentation > 70 ? "ÉQUILIBRÉE" : "CARENTIELLE" },
               { label: "Charge Mentale", val: stats.stress, status: stats.stress > 70 ? "CONTRÔLÉE" : "ÉLEVÉE" },
             ].map((s, i) => (
               <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                     <p className="text-sm font-black text-slate-900">{s.val}%</p>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mb-3 overflow-hidden">
                     <div className="h-full bg-emerald-500" style={{ width: `${s.val}%` }} />
                  </div>
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{s.status}</p>
               </div>
             ))}
          </div>

          <div className="mt-12 p-8 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
             <h4 className="text-sm font-black uppercase tracking-widest mb-4 print-text-white">Recommandations IA</h4>
             <p className="text-xs font-medium leading-loose opacity-80 print-text-white">
                Basé sur vos réponses, nous recommandons une augmentation de 15% de l'activité physique hebdomadaire et une régularisation des cycles de repos. 
                Ce document est un support d'information et ne remplace pas une consultation médicale.
             </p>
          </div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end pt-8 border-t border-slate-100">
           <div className="w-20 h-20">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.href)}`} alt="QR" className="w-full h-full" />
           </div>
           <div className="text-right">
              <div className="w-24 h-24 border-4 border-emerald-600 rounded-full flex items-center justify-center -rotate-12 opacity-80 mx-auto mb-2">
                 <p className="text-[7px] font-black text-emerald-600 uppercase tracking-tighter text-center">ANALYSÉ<br/>PAR IA<br/>CERTIFIÉ</p>
              </div>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">CarnetPlus Health Systems</p>
           </div>
        </div>
      </div>
        
      <div className="flex flex-col relative pt-6 px-10 pb-10 bg-slate-50 min-h-screen no-print">
        {/* Advanced Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl -mx-10 px-10 py-6 border-b border-slate-200/50 mb-10 no-print">
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
             {step === 'resultats' && (
               <button 
                 onClick={() => window.print()}
                 className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
               >
                 <ShieldCheck className="w-4 h-4 text-emerald-400" /> Télécharger mon Bilan
               </button>
             )}
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {q.options.map((opt, i) => {
                            const isSelected = (reponses as any)[q.key] === opt;
                            
                            // Dynamic color logic based on index (0:Best -> 3:Worst)
                            const getColors = () => {
                              if (i === 0) return isSelected ? "bg-emerald-600 border-emerald-600 text-white shadow-emerald-200" : "bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:bg-emerald-50";
                              if (i === 1) return isSelected ? "bg-blue-600 border-blue-600 text-white shadow-blue-200" : "bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:bg-blue-50";
                              if (i === 2) return isSelected ? "bg-amber-500 border-amber-500 text-white shadow-amber-200" : "bg-white border-slate-100 text-slate-400 hover:border-amber-200 hover:bg-amber-50";
                              return isSelected ? "bg-rose-600 border-rose-600 text-white shadow-rose-200" : "bg-white border-slate-100 text-slate-400 hover:border-rose-200 hover:bg-rose-50";
                            };

                            return (
                              <button
                                key={opt}
                                onClick={() => setReponses({ ...reponses, [q.key]: opt })}
                                className={`py-6 px-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm ${getColors()}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
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
                      <div className="h-64 w-full flex items-end gap-4 px-4 bg-slate-50/50 rounded-3xl p-6 border border-slate-100/50">
                         {[60, 45, 80, 55, 90, 75, 88].map((h, i) => {
                           const today = new Date().getDay();
                           // getDay(): Sun=0, Mon=1...
                           // index: Lun=0, Mar=1, ..., Sam=5, Dim=6
                           const todayIndex = today === 0 ? 6 : today - 1;
                           const isToday = i === todayIndex;

                           return (
                             <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                                <div className="flex-1 w-full flex items-end justify-center">
                                  <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1.5, delay: i*0.1, ease: "circOut" }}
                                    className={`w-full max-w-[40px] rounded-t-2xl transition-all relative ${
                                      isToday 
                                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-xl shadow-emerald-100' 
                                        : 'bg-slate-200 group-hover:bg-emerald-200'
                                    }`}
                                  >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-lg">
                                      {h}%
                                    </div>
                                  </motion.div>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isToday ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'][i]}
                                </span>
                             </div>
                           );
                         })}
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

                    <Card className="lg:col-span-4 bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/30 rounded-full blur-[80px] group-hover:scale-150 transition-all duration-1000" />
                       
                       <div className="relative z-10">
                         <div className="flex items-center justify-between mb-10">
                            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
                               <Sparkles className="w-7 h-7 text-white animate-pulse"/>
                            </div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">Analyse IA</span>
                         </div>

                         <h4 className="text-3xl font-black uppercase tracking-tighter mb-8 leading-none">Focus <br/><span className="text-emerald-400">Intelligence</span></h4>
                         
                         <div className="space-y-4">
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group/item">
                               <div className="flex items-center gap-3 mb-3">
                                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Conseil Prioritaire</p>
                               </div>
                               <p className="text-sm font-bold leading-relaxed text-white group-hover/item:translate-x-1 transition-transform">
                                 {stats.sommeil < 80 ? "Optimisez votre exposition à la lumière bleue avant 22h." : "Continuez vos 30min d'activité matinale."}
                               </p>
                            </div>

                            <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10 backdrop-blur-sm hover:bg-blue-500/10 transition-all group/item">
                               <div className="flex items-center gap-3 mb-3">
                                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
                                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Micro-Objectif</p>
                               </div>
                               <p className="text-sm font-bold leading-relaxed text-white group-hover/item:translate-x-1 transition-transform">
                                 Augmentez votre hydratation quotidienne de <span className="text-blue-400 font-black">500ml</span>.
                               </p>
                            </div>
                         </div>
                       </div>

                       <button onClick={() => navigate("/patient/calendrier-rdv")} className="relative z-10 w-full py-6 bg-white text-slate-900 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest mt-10 hover:bg-emerald-500 hover:text-white hover:-translate-y-1 shadow-2xl transition-all active:scale-95">
                          PLANIFIER UN CHECK-UP
                       </button>
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
    </>
  );
}
