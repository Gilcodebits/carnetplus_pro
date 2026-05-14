import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { patientsAPI, dashboardAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useSearch } from "../contexts/SearchContext";
import {
  Users, Calendar, Activity, ChevronRight, Stethoscope,
  Pill, TestTube, Search, Clock, Plus, UserCircle
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
  confirme:   "bg-emerald-50 text-emerald-700 border-emerald-100",
  planifie:   "bg-blue-50 text-blue-700 border-blue-100",
  en_attente: "bg-orange-50 text-orange-700 border-orange-100",
  annule:     "bg-rose-50 text-rose-700 border-rose-100",
};

const statutRdvLabel: Record<string,string> = {
  confirme:"Confirmé", planifie:"Planifié", en_attente:"En attente", annule:"Annulé"
};

export function MedecinDashboard() {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientsData, statsData] = await Promise.all([
        patientsAPI.list(),
        dashboardAPI.stats(),
      ]);
      setPatients(patientsData);
      setStats(statsData);
      setRdvs(statsData.rdv_liste || []);
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.numero_dossier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-200 items-center justify-center p-6">
        <div className="bg-white p-10 md:p-14 rounded-[2.5rem] md:rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 text-center animate-scaleIn w-full max-w-sm">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Ouverture du cabinet médical...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8 animate-fadeIn bg-slate-200 min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Stats Cards - Soft UI Theme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {[
          { label: "Mes Patients", val: stats.mes_patients || 0, icon: Users, color: "blue", tag: "Suivis" },
          { label: "Consultations", val: stats.rdv_today || 0, icon: Calendar, color: "emerald", tag: "Auj." },
          { label: "Suivi Hebdo", val: stats.consultations_semaine || 0, icon: Activity, color: "purple", tag: "Hebdo" },
          { label: "Traitement", val: stats.prescriptions_actives || 0, icon: Pill, color: "orange", tag: "Actives" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-3 md:p-5 rounded-xl md:rounded-[1.5rem] shadow-xl shadow-slate-200/50 border-2 border-slate-200 flex flex-col justify-between group hover:border-blue-400 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className={`w-7 h-7 md:w-10 md:h-10 bg-${stat.color}-50 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-${stat.color}-100 shadow-sm`}>
                <stat.icon className={`w-3.5 h-3.5 md:w-5 md:h-5 text-${stat.color}-600`} />
              </div>
              <span className={`hidden sm:block text-[7px] md:text-[8px] font-black text-${stat.color}-700 bg-${stat.color}-50 px-2 py-1 rounded-md uppercase tracking-widest border border-${stat.color}-100 shadow-sm`}>{stat.tag}</span>
            </div>
            <div>
              <h3 className="text-lg md:text-2xl font-black text-slate-900 mb-0 md:mb-0.5 tracking-tight">{stat.val}</h3>
              <p className="text-[6px] md:text-[8px] font-black text-slate-700 uppercase tracking-widest leading-tight">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Agenda Card */}
        <div className="lg:col-span-2">
          <Card noPadding className="rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
            <div className="p-6 md:p-8 border-b-2 border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-lg md:text-2xl font-black text-slate-900 uppercase tracking-tight">Agenda</h2>
                <p className="text-[8px] md:text-[10px] text-slate-700 font-black uppercase tracking-widest mt-1">{rdvs.length} rendez-vous</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center border-2 border-slate-100 shadow-sm">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {rdvs.length > 0 ? (
                rdvs.map((rdv, index) => (
                  <div 
                    key={rdv.id}
                    onClick={() => navigate(`/medecin/consultation/${rdv.patient_id}`)}
                    className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all cursor-pointer group flex items-center gap-3 md:gap-5 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-200/40 ${index % 2 === 0 ? 'bg-white border-slate-200' : 'bg-blue-50/30 border-blue-100'}`}
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-lg md:rounded-2xl flex items-center justify-center font-black text-slate-900 text-sm md:text-xl shadow-inner border-2 border-slate-100 group-hover:border-blue-200 transition-colors shrink-0">
                      {rdv.heure_rdv?.substring(0,5)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-sm md:text-base truncate uppercase tracking-tight group-hover:text-blue-600 transition-colors">{rdv.patient_nom}</p>
                      <p className="text-[9px] md:text-[10px] text-slate-600 font-black uppercase tracking-widest truncate mt-0.5">{rdv.motif}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-1.5 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                      <div className={`w-2 h-2 rounded-full ${rdv.statut === 'confirme' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'}`} />
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-700">{statutRdvLabel[rdv.statut] || rdv.statut}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                  <p className="text-slate-700 font-bold uppercase tracking-widest text-xs italic">Aucun rendez-vous pour aujourd'hui</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-6 md:p-8 bg-slate-50/30 border-t-2 border-slate-100 space-y-3 md:space-y-4">
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-2 mb-2">Cabinet</p>
              <button 
                onClick={() => navigate("/medecin/patients")}
                className="w-full flex items-center gap-4 md:gap-5 p-3 md:p-5 bg-white border-2 border-slate-200 rounded-xl md:rounded-[2rem] hover:border-blue-400 hover:shadow-xl hover:shadow-blue-200/30 transition-all group shadow-sm active:scale-95"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-100 shadow-sm shrink-0">
                  <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-slate-700 text-left">Consultation</span>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-slate-500 ml-auto group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
              <button 
                onClick={() => navigate("/medecin/patients")}
                className="w-full flex items-center gap-4 md:gap-5 p-4 md:p-5 bg-white border-2 border-slate-200 rounded-[1.5rem] md:rounded-[2rem] hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-200/30 transition-all group shadow-sm active:scale-95"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-100 shadow-sm shrink-0">
                  <Pill className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                </div>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-700 text-left">Rédiger une ordonnance</span>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-slate-500 ml-auto group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            </div>
          </Card>
        </div>

        {/* Patients List Card */}
        <div className="lg:col-span-3">
          <Card noPadding className="rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
            <div className="p-6 md:p-8 border-b-2 border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Dossiers Patients</h2>
                <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest mt-1">Accès rapide aux historiques cliniques</p>
              </div>
              <div className="max-w-md w-full">
                <div className="relative group">
                  <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-blue-600' : 'text-slate-400'}`} />
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="CHERCHER UN PATIENT..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 overflow-hidden">
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                {filteredPatients.length > 0 ? (
                  <>
                    {filteredPatients.slice(0, 5).map((p, index) => (
                      <div 
                      key={p.id}
                      onClick={() => navigate(`/medecin/dossier/${p.id}`)}
                      className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all cursor-pointer group flex items-center gap-3 md:gap-6 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-200/40 ${index % 2 === 0 ? 'bg-white border-slate-200' : 'bg-blue-50/20 border-blue-50'}`}
                    >
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg md:rounded-2xl flex items-center justify-center text-white font-black text-sm md:text-xl shadow-lg group-hover:scale-105 transition-transform duration-300 border-2 border-white/20 shrink-0">
                        {getInitiales(p.prenom, p.nom)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1 md:mb-2">
                          <p className="font-black text-slate-900 text-sm md:text-lg leading-none uppercase tracking-tight group-hover:text-blue-600 transition-colors truncate">{p.prenom} {p.nom}</p>
                          <span className="w-max px-2 md:px-3 py-1 bg-white border-2 border-slate-100 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black text-slate-500 font-mono uppercase tracking-widest shadow-sm">{p.numero_dossier}</span>
                        </div>
                        <div className="flex items-center gap-3 md:gap-5">
                          <p className="text-[9px] md:text-[10px] text-slate-700 font-black uppercase tracking-widest">{calculateAge(p.date_naissance)} ans</p>
                          <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-slate-50 border-2 border-slate-100 rounded-lg md:rounded-xl">
                            <Activity className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-500" />
                            <span className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest">Groupe {p.groupe_sanguin || '—'}</span>
                          </div>
                        </div>
                      </div>
                      <button className="hidden sm:block p-3 md:p-4 bg-white rounded-xl md:rounded-2xl text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all border-2 border-slate-100 group-hover:border-blue-200 shadow-sm active:scale-90 shrink-0">
                        <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
                      </button>
                    </div>
                    ))}
                    {filteredPatients.length > 5 && (
                      <button 
                        onClick={() => navigate("/medecin/patients")}
                        className="w-full mt-4 py-4 bg-blue-50 text-blue-600 rounded-[1.5rem] md:rounded-[2rem] font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 group"
                      >
                        Voir tous les patients ({filteredPatients.length})
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="py-24 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                      <UserCircle className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-gray-900 font-black text-lg">Aucun patient trouvé</h3>
                    <p className="text-slate-700 text-sm font-bold uppercase tracking-widest opacity-90 mt-2">Vérifiez l'orthographe ou la recherche globale</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

