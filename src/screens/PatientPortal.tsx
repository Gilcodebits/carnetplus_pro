import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { StatCard, Card } from "../components/Card";
import { Button } from "../components/Button";
import { dashboardAPI } from "../services/api";
import { Calendar, Bot, Activity, FileText, Clock, MapPin, Sparkles, TrendingUp } from "lucide-react";

function WaveGreeting() {
  return (
    <svg viewBox="0 0 600 120" fill="none" className="absolute top-0 right-0 w-72 opacity-20" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="400" cy="60" rx="250" ry="80" fill="url(#waveGrad)"/>
      <defs>
        <radialGradient id="waveGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

export function PatientPortal() {
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
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500 font-medium">Connexion à votre espace santé…</p>
      </div>
    </div>
  );

  const prochainRdv = stats.prochain_rdv ? [stats.prochain_rdv] : [];
  const documentsRecents = [
    ...(stats.prescriptions || []).map((p: any) => ({ type: "Ordonnance", date: p.created_at, medecin: p.medecin_nom, icon: "💊" })),
    ...(stats.examens || []).map((e: any) => ({ type: e.type_examen, date: e.date_demande, medecin: e.medecin_nom, icon: "🔬" }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="patient" activePath="/patient"/>
      <div className="flex-1 overflow-auto">
        {/* Hero greeting */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-8 overflow-hidden">
          <WaveGreeting/>
          <div className="relative z-10 animate-fadeInUp">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl animate-wave inline-block" style={{animationDuration:"1s",animationIterationCount:1}}>👋</span>
              <h1 className="text-3xl font-black text-white">Bonjour, {stats.patient?.prenom || "Patient"} !</h1>
            </div>
            <p className="text-blue-200">Votre espace santé personnel — {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</p>
          </div>
          {/* Mini health bar */}
          <div className="mt-4 flex items-center gap-3 relative z-10 animate-fadeInUp delay-200">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden max-w-xs">
              <div className="h-full bg-green-400 rounded-full animate-fadeIn delay-500" style={{width:`${stats.score_sante || 80}%`}}/>
            </div>
            <span className="text-white/80 text-sm font-medium">Score santé : <strong className="text-green-300">{stats.score_sante || 80}/100</strong></span>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-4 gap-5 mb-8">
            <StatCard title="Prochain RDV" value={stats.prochain_rdv ? new Date(stats.prochain_rdv.date_rdv).toLocaleDateString('fr-FR', {day:'numeric', month:'short'}) : "Aucun"} icon={<Calendar className="w-6 h-6"/>} color="blue" onClick={()=>navigate("/patient/calendrier-rdv")} delay={100}/>
            <StatCard title="Assistant IA" value="Actif" icon={<Bot className="w-6 h-6"/>} color="purple" onClick={()=>navigate("/patient/assistant-ia")} delay={200}/>
            <StatCard title="Score Santé" value={`${stats.score_sante || 80}/100`} icon={<Activity className="w-6 h-6"/>} color="green" onClick={()=>navigate("/patient/bilan-sante")} delay={300}/>
            <StatCard title="Documents" value={stats.documents_count || 0} icon={<FileText className="w-6 h-6"/>} color="orange" delay={400}/>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card animated delay={200}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500"/> Prochains rendez-vous
              </h2>
              <div className="space-y-3">
                {prochainRdv.map((rdv: any) => (
                  <div key={rdv.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{rdv.medecin_nom}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Clock className="w-3.5 h-3.5"/> <span>{new Date(rdv.date_rdv).toLocaleDateString()} à {rdv.heure_rdv?.substring(0,5)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5"/> <span>Hôpital Central de Cotonou</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${rdv.statut === 'confirme' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {rdv.statut}
                      </span>
                    </div>
                  </div>
                ))}
                {prochainRdv.length === 0 && (
                  <p className="text-center py-4 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-xl">Aucun rendez-vous à venir</p>
                )}
                <button
                  onClick={()=>navigate("/patient/recherche-rdv")}
                  className="w-full py-2.5 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 text-sm font-medium hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-lg">+</span> Prendre un nouveau rendez-vous
                </button>
              </div>
            </Card>

            <Card animated delay={300}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500"/> Documents récents
              </h2>
              <div className="space-y-2">
                {documentsRecents.map((doc, i) => (
                  <div key={i} className="p-3.5 bg-gray-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-all group flex items-center justify-between card-hover">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{doc.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{doc.type}</p>
                        <p className="text-xs text-gray-500">{doc.medecin}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">{new Date(doc.date).toLocaleDateString()}</span>
                      <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-all">Voir →</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-4 animate-fadeInUp delay-500">
            <button
              onClick={()=>navigate("/patient/assistant-ia")}
              className="p-5 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl font-semibold flex items-center gap-3 hover:-translate-y-1 transition-all shadow-lg shadow-purple-200 hover:shadow-purple-300"
            >
              <Bot className="w-7 h-7"/> <span>Assistant Vocal IA</span>
              <Sparkles className="w-4 h-4 ml-auto opacity-60"/>
            </button>
            <button
              onClick={()=>navigate("/patient/bilan-sante")}
              className="p-5 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl font-semibold flex items-center gap-3 hover:-translate-y-1 transition-all shadow-lg shadow-green-200 hover:shadow-green-300"
            >
              <Activity className="w-7 h-7"/> <span>Faire un Bilan</span>
              <TrendingUp className="w-4 h-4 ml-auto opacity-60"/>
            </button>
            <button
              onClick={()=>navigate("/messagerie")}
              className="p-5 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-2xl font-semibold flex items-center gap-3 hover:-translate-y-1 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300"
            >
              <FileText className="w-7 h-7"/> <span>Messagerie</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
