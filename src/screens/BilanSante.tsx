import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../components/Card";
import { 
  ArrowLeft, Activity, Heart, Brain, 
  TrendingUp, CheckCircle, Sparkles, 
  ShieldCheck, ArrowRight, Zap, Info, Clock, Pill, FlaskConical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BilanSante() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"questionnaire" | "resultats">("questionnaire");
  const [reponses, setReponses] = useState({ sommeil: "", activite: "", alimentation: "", stress: "" });

  const handleSubmit = () => setStep("resultats");

  return (
    <div className="overflow-auto scrollbar-hide flex flex-col relative pt-6 px-10 pb-10">
        
        {/* Compact Header */}
        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-emerald-200 border-2 border-white/20">
              <Activity className="w-8 h-8 text-white animate-pulse"/>
            </div>
            <div>
              <div className="flex items-center gap-3">
                 <span className="w-6 h-1.5 bg-emerald-500 rounded-full" />
                 <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Bilan Santé Intelligent</h1>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">Évaluation multidimensionnelle par IA</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-5 py-2.5 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-3 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Confidentialité Maximale</span>
             </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            {step === "questionnaire" ? (
              <motion.div 
                key="q"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-12 bg-white rounded-[4rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 transition-all group-hover:scale-110 opacity-50 pointer-events-none" />
                  
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-12 flex items-center gap-4 relative z-10">
                    <div className="w-1.5 h-10 bg-emerald-500 rounded-full" /> 
                    Analyse de vos Habitudes
                  </h2>

                  <div className="space-y-10 relative z-10">
                    {[
                      { key: "sommeil", num: "01", label: "Qualité habituelle de votre sommeil", desc: "Évaluez la qualité moyenne de vos nuits", icon: "🌙", options: ["Excellent", "Bon", "Moyen", "Mauvais"], colors: ["emerald", "teal", "amber", "rose"] },
                      { key: "activite", num: "02", label: "Activité physique par semaine", desc: "Fréquence et intensité de vos exercices", icon: "🏃", options: ["Intense", "Modéré", "Léger", "Sédentaire"], colors: ["emerald", "teal", "amber", "rose"] },
                      { key: "alimentation", num: "03", label: "Équilibre nutritionnel quotidien", desc: "Qualité de votre alimentation au quotidien", icon: "🥗", options: ["Excellent", "Bon", "Moyen", "Mauvais"], colors: ["emerald", "teal", "amber", "rose"] },
                      { key: "stress", num: "04", label: "Niveau de stress ressenti", desc: "Votre état émotionnel et mental général", icon: "🧠", options: ["Faible", "Modéré", "Élevé", "Critique"], colors: ["emerald", "teal", "amber", "rose"] },
                    ].map(({ key, num, label, desc, icon, options, colors }) => (
                      <div key={key} className="rounded-[2.5rem] border-2 border-slate-100 bg-slate-50/30 overflow-hidden">
                        
                        {/* Question Title — visually distinct from options */}
                        <div className="px-10 pt-8 pb-6 border-b-2 border-slate-100 bg-white flex items-center gap-6">
                          <div className="flex-shrink-0 w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-200">
                            {num}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-2xl">{icon}</span>
                              <h3 className="text-xl font-black text-slate-900 tracking-tight">{label}</h3>
                            </div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{desc}</p>
                          </div>
                          {(reponses as any)[key] && (
                            <div className="flex-shrink-0 px-4 py-2 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                                ✓ {(reponses as any)[key]}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Answer Options — clearly different style */}
                        <div className="px-10 py-8">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5">Sélectionnez votre réponse ↓</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {options.map((option, idx) => {
                              const isSelected = (reponses as any)[key] === option;
                              const colorMap: Record<string, string> = {
                                emerald: isSelected ? "border-emerald-500 bg-emerald-600 text-white shadow-emerald-200/60" : "border-emerald-100 bg-white text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50",
                                teal:    isSelected ? "border-teal-500 bg-teal-600 text-white shadow-teal-200/60"     : "border-teal-100 bg-white text-teal-700 hover:border-teal-400 hover:bg-teal-50",
                                amber:   isSelected ? "border-amber-500 bg-amber-600 text-white shadow-amber-200/60"  : "border-amber-100 bg-white text-amber-700 hover:border-amber-400 hover:bg-amber-50",
                                rose:    isSelected ? "border-rose-500 bg-rose-600 text-white shadow-rose-200/60"     : "border-rose-100 bg-white text-rose-700 hover:border-rose-400 hover:bg-rose-50",
                              };
                              return (
                                <button
                                  key={option}
                                  onClick={() => setReponses({ ...reponses, [key]: option })}
                                  className={`relative py-4 px-4 rounded-[1.5rem] border-2 transition-all font-black text-sm tracking-wide shadow-sm ${isSelected ? "shadow-xl scale-105" : "hover:scale-[1.03]"} ${colorMap[colors[idx]]}`}
                                >
                                  {isSelected && (
                                    <CheckCircle className="absolute top-2 right-2 w-4 h-4 opacity-70" />
                                  )}
                                  <span className="block text-center">{option}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    ))}

                    <button
                      onClick={handleSubmit}
                      disabled={!reponses.sommeil || !reponses.activite || !reponses.alimentation || !reponses.stress}
                      className="w-full py-7 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-400/50 hover:-translate-y-1 transition-all border-2 border-emerald-400 disabled:opacity-30 active:scale-95 mt-4 flex items-center justify-center gap-4 group"
                    >
                      <span>Générer mon bilan personnalisé</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div 
                key="r"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-16 bg-white rounded-[5rem] relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-full h-[500px] pointer-events-none overflow-hidden opacity-5">
                    <svg viewBox="0 0 1440 320" className="absolute top-0 right-0 w-full">
                      <path fill="#10b981" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,218.7C960,235,1056,213,1152,186.7C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
                    </svg>
                  </div>

                  <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-shrink-0 w-64 h-64 relative group">
                      <svg className="w-full h-full transform -rotate-90 filter drop-shadow-2xl" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r="58" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                        <motion.circle 
                          cx="64" cy="64" r="58" stroke="#10b981" strokeWidth="10" fill="none"
                          strokeDasharray={`${88 * 3.64} 364`} strokeLinecap="round" 
                          initial={{ strokeDasharray: "0 364" }}
                          animate={{ strokeDasharray: `${88 * 3.64} 364` }}
                          transition={{ duration: 2, delay: 0.5 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-black text-slate-900 tracking-tighter">88</span>
                        <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mt-1">Score Global</span>
                      </div>
                    </div>

                    <div className="flex-1 text-center lg:text-left">
                       <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                          <span className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm flex items-center gap-2">
                             <Sparkles className="w-4 h-4" /> Analyse Optimale
                          </span>
                       </div>
                       <h2 className="text-5xl lg:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-6">Excellent <br/> État Vital !</h2>
                       <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed opacity-80 max-w-xl">Vos paramètres vitaux et vos habitudes de vie montrent une résilience remarquable. Continuez sur cette lancée.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 relative z-10">
                    {[
                      { label: "Santé Physique", score: 92, icon: Heart, color: "text-rose-500", bg: "bg-rose-50/50", border: "border-rose-100", desc: "Excellente mobilité et tonus." },
                      { label: "Équilibre Mental", score: 84, icon: Brain, color: "text-blue-500", bg: "bg-blue-50/50", border: "border-blue-100", desc: "Gestion du stress sous contrôle." },
                    ].map((item, i) => (
                      <div key={i} className={`p-10 ${item.bg} ${item.border} border-2 rounded-[3.5rem] group hover:scale-[1.02] transition-all`}>
                        <div className="flex items-center justify-between mb-8">
                          <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center border-2 ${item.border} shadow-sm group-hover:scale-110 transition-all`}>
                            <item.icon className={`w-8 h-8 ${item.color}`} />
                          </div>
                          <div className="text-right">
                             <span className={`text-4xl font-black ${item.color} tracking-tighter`}>{item.score}</span>
                             <span className="text-[10px] font-black text-slate-400 uppercase ml-1">%</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{item.label}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-12 bg-slate-900 text-white rounded-[4rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-10 flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-sm"><Zap className="w-6 h-6 text-emerald-400"/></div>
                       Recommandations Personnalisées
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { title: "Sommeil Profond", text: "Maintenez une heure de coucher fixe pour stabiliser votre cycle circadien.", icon: Clock, accent: "text-blue-400" },
                        { title: "Nutrition Active", text: "Augmentez votre apport en antioxydants pour favoriser la récupération cellulaire.", icon: Activity, accent: "text-emerald-400" },
                      ].map((rec, i) => (
                        <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all">
                           <rec.icon className={`w-8 h-8 ${rec.accent} mb-6`} />
                           <h4 className="text-lg font-black uppercase tracking-tight mb-2">{rec.title}</h4>
                           <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">{rec.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <button onClick={() => navigate("/patient")} className="py-6 bg-white border-2 border-slate-200 text-slate-500 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xl shadow-slate-200/50 active:scale-95">RETOUR AU PORTAIL</button>
                  <button onClick={() => setStep("questionnaire")} className="py-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-emerald-300 transition-all shadow-xl shadow-emerald-500/30 border-2 border-emerald-500 active:scale-95">REFAIRE LE BILAN COMPLET</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
}
