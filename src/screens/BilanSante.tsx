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
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="patient" activePath="/patient/bilan-sante" />
      <div className="flex-1 overflow-auto p-8">
        <button onClick={() => navigate("/patient")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" /> Retour à l'accueil
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bilan Santé Intelligent</h1>
              <p className="text-gray-600">Évaluez votre état de santé global</p>
            </div>
          </div>

          {step === "questionnaire" ? (
            <Card>
              <h2 className="text-2xl font-bold mb-6">Questionnaire Santé</h2>
              <div className="space-y-6">
                {[
                  { key: "sommeil", label: "Comment évaluez-vous votre sommeil ?", options: ["Excellent", "Bon", "Moyen", "Mauvais"] },
                  { key: "activite", label: "Niveau d'activité physique par semaine ?", options: ["Intense", "Modéré", "Léger", "Sédentaire"] },
                  { key: "alimentation", label: "Qualité de votre alimentation ?", options: ["Excellente", "Bonne", "Moyenne", "Mauvaise"] },
                  { key: "stress", label: "Niveau de stress ?", options: ["Faible", "Modéré", "Élevé", "Très élevé"] },
                ].map(({ key, label, options }) => (
                  <div key={key}>
                    <label className="block font-medium mb-3">{label}</label>
                    <div className="grid grid-cols-4 gap-3">
                      {options.map((option) => (
                        <button
                          key={option}
                          onClick={() => setReponses({ ...reponses, [key]: option })}
                          className={`p-4 rounded-lg border-2 transition-all ${(reponses as any)[key] === option ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <Button
                  onClick={handleSubmit}
                  variant="success"
                  size="lg"
                  fullWidth
                  disabled={!reponses.sommeil || !reponses.activite || !reponses.alimentation || !reponses.stress}
                >
                  Générer mon bilan
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <div className="text-center mb-8">
                  <div className="w-36 h-36 mx-auto mb-4 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle cx="64" cy="64" r="56" stroke="#10b981" strokeWidth="12" fill="none"
                        strokeDasharray={`${85 * 3.52} ${100 * 3.52}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-green-600">85/100</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Très bon état de santé !</h2>
                  <p className="text-gray-600">Continuez vos efforts, vous êtes sur la bonne voie</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Heart className="w-6 h-6 text-green-600" />
                      <h3 className="font-bold">Santé Physique</h3>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-green-600">88</span>
                      <span className="text-sm text-gray-600 mb-1">/100</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Activité physique régulière détectée</p>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Brain className="w-6 h-6 text-blue-600" />
                      <h3 className="font-bold">Santé Mentale</h3>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-blue-600">82</span>
                      <span className="text-sm text-gray-600 mb-1">/100</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Bon équilibre mental global</p>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-bold mb-4">Recommandations personnalisées</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Continuez votre activité physique</p>
                      <p className="text-sm text-gray-600">Vous maintenez un bon niveau d'exercice hebdomadaire</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Améliorez la gestion du stress</p>
                      <p className="text-sm text-gray-600">Essayez la méditation 10 minutes par jour</p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button onClick={() => navigate("/patient")} variant="primary" fullWidth>Retour à l'accueil</Button>
                <Button onClick={() => setStep("questionnaire")} variant="secondary" fullWidth>Refaire le bilan</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
