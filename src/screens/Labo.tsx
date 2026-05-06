import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card, StatCard } from "../components/Card";
import { Button } from "../components/Button";
import { dashboardAPI, examensAPI } from "../services/api";
import { TestTube, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function Labo() {
  const [activeTab, setActiveTab] = useState<"en-cours" | "termines">("en-cours");
  const [examens, setExamens]     = useState<any[]>([]);
  const [stats, setStats]         = useState<any>({});
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, listData] = await Promise.all([
        dashboardAPI.stats(),
        examensAPI.list()
      ]);
      setStats(statsData);
      setExamens(listData);
    } catch (err) {
      console.error("Erreur labo:", err);
    } finally {
      setLoading(false);
    }
  };

  const examensEnCours  = examens.filter(e => ["demande", "en_cours"].includes(e.statut));
  const examensTermines = examens.filter(e => ["termine", "transmis"].includes(e.statut));

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500 font-medium">Chargement du laboratoire…</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="labo" activePath="/labo" />
      <div className="flex-1 overflow-auto p-8 animate-fadeIn">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Laboratoire & Imagerie</h1>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <StatCard title="Examens en cours" value={stats.en_cours || 0} icon={<Clock className="w-6 h-6" />} color="orange" delay={100}/>
          <StatCard title="Examens terminés" value={stats.termines || 0} icon={<CheckCircle className="w-6 h-6" />} color="green" delay={200}/>
          <StatCard title="Examens urgents" value={stats.urgents || 0} icon={<AlertCircle className="w-6 h-6" />} color="purple" delay={300}/>
        </div>

        <Card>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setActiveTab("en-cours")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "en-cours" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              En cours ({examensEnCours.length})
            </button>
            <button
              onClick={() => setActiveTab("termines")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "termines" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Terminés ({examensTermines.length})
            </button>
          </div>

          <div className="space-y-3">
            {activeTab === "en-cours" && examensEnCours.map((examen) => (
              <div key={examen.id} className="p-4 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <TestTube className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-bold text-gray-900">{examen.patient_nom}</p>
                    <p className="text-sm text-gray-500">{examen.type_examen} — Demandé par {examen.medecin_nom}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">{new Date(examen.date_demande).toLocaleDateString()}</span>
                  {examen.urgence && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Urgent</span>
                  )}
                  <Button size="sm" variant="primary">Voir détails</Button>
                </div>
              </div>
            ))}

            {activeTab === "termines" && examensTermines.map((examen) => (
              <div key={examen.id} className="p-4 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-bold text-gray-900">{examen.patient_nom}</p>
                    <p className="text-sm text-gray-500">{examen.type_examen} — {examen.medecin_nom}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">{new Date(examen.date_demande).toLocaleDateString()}</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold capitalize">{examen.statut}</span>
                  <Button size="sm" variant="secondary">Télécharger</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
