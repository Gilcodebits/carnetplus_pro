import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { StatCard, Card } from "../components/Card";
import { dashboardAPI } from "../services/api";
import { Users, Activity, TrendingUp, AlertCircle, BarChart3 } from "lucide-react";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.stats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500 font-medium">Chargement de la console admin…</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" activePath="/admin" />
      <div className="flex-1 overflow-auto p-8 animate-fadeIn">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Console d'Administration</h1>
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard title="Médecins Actifs" value={stats.medecins_count || 0} icon={<Users className="w-6 h-6" />} trend="+3 ce mois" color="blue" delay={100}/>
          <StatCard title="Patients Total" value={stats.patients_count || 0} icon={<Activity className="w-6 h-6" />} trend="+87 ce mois" color="green" delay={200}/>
          <StatCard title="Consultations" value={stats.consultations_count || 0} icon={<TrendingUp className="w-6 h-6" />} trend="Total cumulé" color="purple" delay={300}/>
          <StatCard title="Satisfaction" value="94%" icon={<BarChart3 className="w-6 h-6" />} trend="+2%" color="orange" delay={400}/>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Card animated delay={500}>
            <h2 className="text-xl font-black mb-6">Activités du système (Audit)</h2>
            <div className="space-y-4">
              {stats.logs?.map((log: any, i: number) => (
                <div key={log.id || i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-gray-900">{log.action.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-xs text-gray-400 font-mono">{new Date(log.created_at).toLocaleTimeString()}</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Utilisateur : <span className="font-semibold">{log.utilisateur_nom || 'Système'}</span>
                  </p>
                </div>
              ))}
              {(!stats.logs || stats.logs.length === 0) && (
                <p className="text-center text-gray-400 py-8 italic text-sm">Aucune activité récente enregistrée.</p>
              )}
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-bold mb-4">Alertes Système</h2>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Serveur de sauvegarde</p>
                  <p className="text-xs text-orange-700">Nécessite attention</p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-3">
                <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Mise à jour disponible v2.1</p>
                  <p className="text-xs text-blue-700">Planifier l'installation</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">Statistiques mensuelles</h3>
              <div className="space-y-2">
                {[
                  { label: "Consultations", pct: 78 },
                  { label: "Prescriptions", pct: 65 },
                  { label: "Analyses labo", pct: 45 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{item.label}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
