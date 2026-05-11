import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard, Card } from "../components/Card";
import { dashboardAPI } from "../services/api";
import { Users, Activity, TrendingUp, AlertCircle, BarChart3, CheckCircle2, Info } from "lucide-react";
import { formatDateTime } from "../utils/format";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.stats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-200">
      <div className="text-center bg-white p-14 rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-blue-200" />
        <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Initialisation des systèmes...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 animate-fadeIn bg-slate-200 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Dashboard Admin</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Vue d'ensemble et état de la plateforme en temps réel.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 border-2 border-emerald-100 rounded-2xl shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Système Opérationnel</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard title="Médecins Actifs" value={stats.medecins || 0} icon={<Users className="w-6 h-6" />} trend="Total plateforme" color="blue" delay={100} />
        <StatCard title="Patients Total" value={stats.patients || 0} icon={<Activity className="w-6 h-6" />} trend="Dossiers numériques" color="green" delay={200} />
        <StatCard title="Consultations" value={stats.consultations || 0} icon={<TrendingUp className="w-6 h-6" />} trend="Total cumulé" color="purple" delay={300} />
        <StatCard title="Satisfaction" value="94%" icon={<BarChart3 className="w-6 h-6" />} trend="Indice patient" color="orange" delay={400} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card animated delay={500} className="border-slate-200 shadow-2xl shadow-slate-200/50">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Journal d'Audit</h2>
            <button onClick={() => navigate('/admin/reports')} className="px-6 py-3 bg-blue-50 border-2 border-blue-100 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95">Tout consulter</button>
          </div>
          <div className="space-y-4">
            {stats.logs?.map((log: any, i: number) => (
              <div key={log.id || i} className={`p-5 rounded-[2rem] border-2 transition-all flex items-center gap-5 group hover:scale-[1.01] hover:shadow-xl ${i % 2 === 0 ? "border-slate-200 bg-white" : "border-blue-50 bg-blue-50/20"}`}>
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-blue-200 transition-all">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{log.action.replace('_', ' ')}</p>
                    <p className="text-[10px] text-slate-400 font-black tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{formatDateTime(log.created_at)}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Utilisateur : <span className="text-blue-600">{log.utilisateur_nom || 'Système'}</span>
                  </p>
                </div>
              </div>
            ))}
            {(!stats.logs || stats.logs.length === 0) && (
              <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                <Activity className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">Aucune activité récente enregistrée</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="border-slate-200 shadow-2xl shadow-slate-200/50">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Alertes Systèmes</h2>
          <div className="space-y-4">
            {stats.system?.alerts?.map((alert: any, i: number) => (
              <div key={i} className={`p-5 ${alert.bg} border-2 ${alert.border} rounded-[2rem] flex items-start gap-4 shadow-sm`}>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0">
                  {alert.type === 'warning' ? <AlertCircle className="w-6 h-6 text-orange-600" /> : <Activity className="w-6 h-6 text-blue-600" />}
                </div>
                <div>
                  <p className={`text-sm font-black ${alert.text} uppercase tracking-tight`}>{alert.title}</p>
                  <p className={`text-[10px] ${alert.subtext} font-bold uppercase tracking-widest mt-1 opacity-80`}>{alert.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-blue-600"/> Performances Plateforme
              </h3>
              <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Moniteur Direct</span>
            </div>
            <div className="space-y-6">
              {stats.system?.performance?.map((item: any) => (
                <div key={item.label} className="group">
                  <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2.5">
                    <span>{item.label}</span>
                    <span className="text-slate-900">{item.pct}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner p-[1px]">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-sm`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
