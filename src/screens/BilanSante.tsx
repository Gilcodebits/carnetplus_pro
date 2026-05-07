import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { ArrowLeft, Activity, Heart, Brain, TrendingUp, CheckCircle } from "lucide-react";

export function BilanSante() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"questionnaire" | "resultats">("questionnaire");
  const [reponses, setReponses] = useState({ sommeil: "", activite: "", alimentation: "", stress: "" });

  const handleSubmit = () => setStep("resultats");

  return (
    <div className="flex h-screen bg-slate-200">
      <Sidebar role="patient" activePath="/patient/bilan-sante" />
      <div className="flex-1 overflow-auto p-10">
        <button onClick={() => navigate("/patient")} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-8 transition-all font-black text-[10px] uppercase tracking-widest bg-white px-5 py-2.5 rounded-xl border-2 border-slate-100 shadow-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour à l'accueil
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-700 rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-100 border-2 border-white/20">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Bilan Santé Intelligent</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Évaluation multidimensionnelle de votre état de santé</p>
            </div>
          </div>

          {step === "questionnaire" ? (
            <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-white">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-3">
                <div className="w-2 h-8 bg-emerald-500 rounded-full" /> Questionnaire de Santé
              </h2>
              <div className="space-y-10">
                {[
                  { key: "sommeil", label: "Qualité habituelle de votre sommeil ?", options: ["Excellent", "Bon", "Moyen", "Mauvais"] },
                  { key: "activite", label: "Niveau d'activité physique par semaine ?", options: ["Intense", "Modéré", "Léger", "Sédentaire"] },
                  { key: "alimentation", label: "Équilibre nutritionnel quotidien ?", options: ["Excellent", "Bon", "Moyen", "Mauvais"] },
                  { key: "stress", label: "Niveau de stress ressenti ?", options: ["Faible", "Modéré", "Élevé", "Critique"] },
                ].map(({ key, label, options }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">{label}</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {options.map((option) => (
                        <button
                          key={option}
                          onClick={() => setReponses({ ...reponses, [key]: option })}
                          className={`p-5 rounded-[1.5rem] border-2 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm ${
                            (reponses as any)[key] === option 
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-emerald-100 scale-105" 
                              : "border-slate-100 bg-white text-slate-400 hover:border-emerald-200 hover:text-slate-600"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSubmit}
                  disabled={!reponses.sommeil || !reponses.activite || !reponses.alimentation || !reponses.stress}
                  className="w-full py-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.01] transition-all border-2 border-emerald-500 disabled:opacity-30 disabled:pointer-events-none mt-8"
                >
                  Générer mon bilan personnalisé
                </button>
              </div>
            </Card>
          ) : (
            <div className="space-y-8">
              <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-12 bg-white">
                <div className="text-center mb-12">
                  <div className="w-48 h-48 mx-auto mb-8 relative">
                    <svg className="w-full h-full transform -rotate-90 filter drop-shadow-lg" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r="56" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                      <circle cx="64" cy="64" r="56" stroke="#10b981" strokeWidth="12" fill="none"
                        strokeDasharray={`${85 * 3.52} ${100 * 3.52}`} strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-emerald-600 tracking-tighter">85/100</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Score Global</span>
                    </div>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-3">Excellent État !</h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-80">Continuez vos efforts, vous êtes sur la bonne voie.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 shadow-sm group hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-emerald-200 shadow-sm group-hover:scale-110 transition-all">
                        <Heart className="w-7 h-7 text-emerald-600" />
                      </div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tight">Santé Physique</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-emerald-600 tracking-tighter">88</span>
                      <span className="text-sm font-black text-slate-400 uppercase tracking-widest">/100</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4 opacity-80">Activité physique régulière détectée</p>
                  </div>
                  <div className="p-8 bg-blue-50 rounded-[2rem] border-2 border-blue-100 shadow-sm group hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-blue-200 shadow-sm group-hover:scale-110 transition-all">
                        <Brain className="w-7 h-7 text-blue-600" />
                      </div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tight">Santé Mentale</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-blue-600 tracking-tighter">82</span>
                      <span className="text-sm font-black text-slate-400 uppercase tracking-widest">/100</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4 opacity-80">Bon équilibre mental global</p>
                  </div>
                </div>
              </Card>

              <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-white">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Recommandations IA</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-5 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] shadow-sm hover:border-emerald-200 transition-all">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Maintenir l'activité physique</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-80">Vous maintenez un excellent niveau d'exercice hebdomadaire.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] shadow-sm hover:border-blue-200 transition-all">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-blue-100 shadow-sm flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Gestion du stress cognitif</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-80">Pratiquez la cohérence cardiaque 10 minutes par jour.</p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <button onClick={() => navigate("/patient")} className="py-5 bg-white border-2 border-slate-200 text-slate-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xl shadow-slate-200/50">Retour au portail</button>
                <button onClick={() => setStep("questionnaire")} className="py-5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-emerald-200 transition-all shadow-xl shadow-emerald-100 border-2 border-emerald-500">Refaire le bilan complet</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
