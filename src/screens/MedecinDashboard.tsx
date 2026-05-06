import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { StatCard, Card } from "../components/Card";
import { patientsAPI, rdvAPI, notificationsAPI, dashboardAPI } from "../services/api";
import {
  Users, Calendar, FileText, Plus, Search,
  Clock, Activity, ChevronRight, Stethoscope,
  Pill, TestTube, AlertCircle, CheckCircle, X
} from "lucide-react";

/* ── Helpers ──────────────────────────────────────────────── */
const getInitiales = (prenom: string, nom: string) => 
  `${prenom?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();

const calculateAge = (date_naissance: string) => {
  if (!date_naissance) return "—";
  const birthDate = new Date(date_naissance);
  const difference = Date.now() - birthDate.getTime();
  const age = new Date(difference);
  return Math.abs(age.getUTCFullYear() - 1970);
};

const statutRdvStyle: Record<string,string> = {
  confirme:   "bg-green-100 text-green-700 border-green-200",
  planifie:   "bg-blue-100 text-blue-700 border-blue-200",
  en_attente: "bg-orange-100 text-orange-700 border-orange-200",
  annule:     "bg-red-100 text-red-700 border-red-200",
};
const statutRdvLabel: Record<string,string> = {
  confirme:"Confirmé", planifie:"Planifié", en_attente:"En attente", annule:"Annulé"
};

/* ── Composant ────────────────────────────────────────────── */
export function MedecinDashboard() {
  const navigate = useNavigate();
  const [search, setSearch]         = useState("");
  const [patients, setPatients]     = useState<any[]>([]);
  const [rdvs, setRdvs]             = useState<any[]>([]);
  const [stats, setStats]           = useState<any>({});
  const [notifs, setNotifs]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientsData, statsData, notifsData] = await Promise.all([
        patientsAPI.list(),
        dashboardAPI.stats(),
        notificationsAPI.list().catch(() => ({ notifications: [] }))
      ]);
      setPatients(patientsData);
      setStats(statsData);
      setRdvs(statsData.rdv_liste || []);
      setNotifs(notifsData.notifications || []);
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.prenom.toLowerCase().includes(search.toLowerCase()) ||
    p.numero_dossier.toLowerCase().includes(search.toLowerCase())
  );

  const todayStr = new Date().toLocaleDateString("fr-FR", {
    weekday:"long", day:"numeric", month:"long", year:"numeric"
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-gray-500 font-medium">Chargement du tableau de bord…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="medecin" activePath="/medecin" />

      <div className="flex-1 overflow-auto">
        {/* ── Topbar ── */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm animate-slideDown">
          <div>
            <h1 className="text-xl font-black text-gray-900">Tableau de bord</h1>
            <p className="text-gray-400 text-sm capitalize">{todayStr}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Cloche notifs */}
            <div className="relative">
              <button onClick={()=>setShowNotifs(!showNotifs)}
                className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all relative">
                <AlertCircle className="w-5 h-5 text-gray-600"/>
                {notifs.length>0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {notifs.length}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-slideDown overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <p className="font-bold text-gray-900">Notifications</p>
                    <button onClick={async ()=>{
                      await notificationsAPI.markAll();
                      setNotifs([]);
                    }} className="text-xs text-blue-600 hover:underline">Tout effacer</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifs.map(n=>(
                      <div key={n.id} className="p-4 border-b border-gray-50 flex items-start gap-3 hover:bg-gray-50 transition-all">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type==="warning"?"bg-orange-500":n.type==="success"?"bg-green-500":"bg-blue-500"}`}/>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 font-medium">{n.titre}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    {notifs.length===0 && <p className="p-6 text-center text-sm text-gray-400">Aucune notification</p>}
                  </div>
                </div>
              )}
            </div>

            <button onClick={()=>navigate("/medecin/nouveau-patient")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 transition-all">
              <Plus className="w-4 h-4"/> Nouveau Patient
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* ── Stats ── */}
          <div className="grid grid-cols-4 gap-5">
            <StatCard title="Mes Patients"      value={stats.mes_patients || 0}  icon={<Users className="w-6 h-6"/>}       color="blue"   trend="Total suivis" delay={100}/>
            <StatCard title="RDV aujourd'hui"   value={stats.rdv_today || 0}     icon={<Calendar className="w-6 h-6"/>}    color="green"  delay={200}/>
            <StatCard title="Consultations/sem" value={stats.consultations_semaine || 0} icon={<Activity className="w-6 h-6"/>}    color="purple" delay={300}/>
            <StatCard title="Prescriptions"     value={stats.prescriptions_actives || 0} icon={<Pill className="w-6 h-6"/>}        color="orange" trend="actives" delay={400}/>
          </div>

          <div className="grid grid-cols-5 gap-6">
            {/* ── Agenda du jour ── */}
            <div className="col-span-2">
              <Card animated delay={200}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-black text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500"/> Agenda du jour
                  </h2>
                  <span className="text-xs text-gray-400">{rdvs.length} RDV</span>
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {rdvs.map((rdv,i)=>(
                    <div key={rdv.id}
                      onClick={()=>navigate(`/medecin/consultation/${rdv.patient_id}`)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all animate-fadeInUp delay-${(i+3)*100} ${statutRdvStyle[rdv.statut] || "bg-gray-50 border-gray-100"}`}>
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm truncate">{rdv.patient_nom}</p>
                          <p className="text-xs opacity-75 mt-0.5 truncate">{rdv.motif}</p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="font-black text-lg leading-none">{rdv.heure_rdv?.substring(0,5)}</p>
                          <span className="text-[10px] font-bold uppercase mt-1 block">{statutRdvLabel[rdv.statut] || rdv.statut}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {rdvs.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
                      <p className="text-sm text-gray-400">Aucun RDV aujourd'hui</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Actions rapides</p>
                  {[
                    { icon:Stethoscope, label:"Nouvelle consultation", path:"/medecin/consultation/new", color:"blue" },
                    { icon:Pill,        label:"Créer prescription",    path:"/medecin/prescription/new", color:"green" },
                    { icon:TestTube,    label:"Demander un examen",    path:"/medecin/examen/new",       color:"purple" },
                  ].map(({icon:Icon,label,path,color})=>(
                    <button key={label} onClick={()=>navigate(path)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-200">
                      <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center group-hover:bg-${color}-200 transition-all`}>
                        <Icon className={`w-4 h-4 text-${color}-600`}/>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-500 transition-all"/>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* ── Liste patients ── */}
            <div className="col-span-3">
              <Card animated delay={300}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-black text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500"/> Mes Patients
                  </h2>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                    <input value={search} onChange={e=>setSearch(e.target.value)}
                      placeholder="Nom ou n° dossier…"
                      className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 w-52"/>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 px-3 mb-2">
                  <p className="col-span-5 text-xs font-bold text-gray-400 uppercase">Patient</p>
                  <p className="col-span-3 text-xs font-bold text-gray-400 uppercase">Dossier</p>
                  <p className="col-span-3 text-xs font-bold text-gray-400 uppercase">Groupe Sanguin</p>
                  <p className="col-span-1"></p>
                </div>

                <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                  {filtered.map((p,i)=>(
                    <div key={p.id}
                      onClick={()=>navigate(`/medecin/dossier/${p.id}`)}
                      className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl cursor-pointer hover:bg-blue-50 transition-all group border border-transparent hover:border-blue-100 animate-fadeInUp delay-${(i+2)*100}`}>
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {getInitiales(p.prenom, p.nom)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{p.prenom} {p.nom}</p>
                          <p className="text-xs text-gray-400">{calculateAge(p.date_naissance)} ans</p>
                        </div>
                      </div>
                      <p className="col-span-3 text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg w-fit">{p.numero_dossier}</p>
                      <p className="col-span-3 text-sm text-gray-600 font-bold">{p.groupe_sanguin || "—"}</p>
                      <div className="col-span-1 flex items-center justify-end gap-2">
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-all"/>
                      </div>
                    </div>
                  ))}
                  {filtered.length===0 && (
                    <div className="text-center py-10 text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                      <p className="text-sm">Aucun patient trouvé</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
