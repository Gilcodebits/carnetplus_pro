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
  const { searchQuery } = useSearch();
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
      <div className="flex h-screen bg-slate-200 items-center justify-center p-8">
        <div className="bg-white p-14 rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 text-center animate-scaleIn">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Ouverture du cabinet médical...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 animate-fadeIn bg-slate-200 min-h-screen">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-200 border-2 border-white/20">
             <Stethoscope className="w-8 h-8 text-white"/>
           </div>
           <div>
             <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Bonjour, Dr. {user?.nom}</h1>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">
               {new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
             </p>
           </div>
        </div>
      </div>

      {/* Stats Cards - Soft UI Theme */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-200 flex flex-col justify-between group hover:border-blue-400 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-[1.2rem] flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-blue-100 shadow-sm">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-[9px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border-2 border-blue-100 shadow-sm">Suivis</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{stats.mes_patients || 0}</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mes Patients Actifs</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-200 flex flex-col justify-between group hover:border-emerald-400 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-[1.2rem] flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-emerald-100 shadow-sm">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border-2 border-emerald-100 shadow-sm">Aujourd'hui</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{stats.rdv_today || 0}</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Consultations prévues</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-200 flex flex-col justify-between group hover:border-purple-400 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-[1.2rem] flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-purple-100 shadow-sm">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-[9px] font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border-2 border-purple-100 shadow-sm">Hebdo</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{stats.consultations_semaine || 0}</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Suivi Hebdomadaire</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-200 flex flex-col justify-between group hover:border-orange-400 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-[1.2rem] flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-orange-100 shadow-sm">
              <Pill className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-[9px] font-black text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border-2 border-orange-100 shadow-sm">Actives</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{stats.prescriptions_actives || 0}</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Traitement en cours</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Agenda Card */}
        <div className="lg:col-span-2">
          <Card noPadding className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
            <div className="p-8 border-b-2 border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Agenda du Jour</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{rdvs.length} rendez-vous programmés</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 shadow-sm">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {rdvs.length > 0 ? (
                rdvs.map((rdv, index) => (
                  <div 
                    key={rdv.id}
                    onClick={() => navigate(`/medecin/consultation/${rdv.patient_id}`)}
                    className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer group flex items-center gap-5 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-200/40 ${index % 2 === 0 ? 'bg-white border-slate-200' : 'bg-blue-50/30 border-blue-100'}`}
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-black text-slate-900 text-xl shadow-inner border-2 border-slate-100 group-hover:border-blue-200 transition-colors">
                      {rdv.heure_rdv?.substring(0,5)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-base truncate uppercase tracking-tight group-hover:text-blue-600 transition-colors">{rdv.patient_nom}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate mt-0.5">{rdv.motif}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                      <div className={`w-2 h-2 rounded-full ${rdv.statut === 'confirme' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'}`} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">{statutRdvLabel[rdv.statut] || rdv.statut}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">Aucun rendez-vous pour aujourd'hui</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-8 bg-slate-50/30 border-t-2 border-slate-100 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">Actions Rapides de Cabinet</p>
              <button 
                onClick={() => navigate("/medecin/patients")}
                className="w-full flex items-center gap-5 p-5 bg-white border-2 border-slate-200 rounded-[2rem] hover:border-blue-400 hover:shadow-xl hover:shadow-blue-200/30 transition-all group shadow-sm active:scale-95"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-100 shadow-sm">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-700">Lancer une consultation</span>
                <ChevronRight className="w-6 h-6 text-slate-300 ml-auto group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>
              <button 
                onClick={() => navigate("/medecin/patients")}
                className="w-full flex items-center gap-5 p-5 bg-white border-2 border-slate-200 rounded-[2rem] hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-200/30 transition-all group shadow-sm active:scale-95"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-100 shadow-sm">
                  <Pill className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-700">Rédiger une ordonnance</span>
                <ChevronRight className="w-6 h-6 text-slate-300 ml-auto group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </Card>
        </div>

        {/* Patients List Card */}
        <div className="lg:col-span-3">
          <Card noPadding className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
            <div className="p-8 border-b-2 border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Dossiers Patients</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Accès rapide aux historiques cliniques</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 shadow-sm">
                <Search className={`w-6 h-6 ${searchQuery ? 'text-blue-600' : 'text-slate-300'}`} />
              </div>
            </div>

            <div className="p-6 overflow-hidden">
              <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p, index) => (
                    <div 
                    key={p.id}
                    onClick={() => navigate(`/medecin/dossier/${p.id}`)}
                    className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer group flex items-center gap-6 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-200/40 ${index % 2 === 0 ? 'bg-white border-slate-200' : 'bg-blue-50/20 border-blue-50'}`}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform duration-300 border-2 border-white/20">
                      {getInitiales(p.prenom, p.nom)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-2">
                        <p className="font-black text-slate-900 text-lg leading-none uppercase tracking-tight group-hover:text-blue-600 transition-colors">{p.prenom} {p.nom}</p>
                        <span className="px-3 py-1 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-black text-slate-500 font-mono uppercase tracking-widest shadow-sm">{p.numero_dossier}</span>
                      </div>
                      <div className="flex items-center gap-5">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{calculateAge(p.date_naissance)} ans</p>
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border-2 border-slate-100 rounded-xl">
                          <Activity className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Groupe {p.groupe_sanguin || '—'}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-4 bg-white rounded-2xl text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all border-2 border-slate-100 group-hover:border-blue-200 shadow-sm active:scale-90">
                      <ChevronRight className="w-7 h-7" />
                    </button>
                  </div>
                  ))
                ) : (
                  <div className="py-24 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                      <UserCircle className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-gray-900 font-black text-lg">Aucun patient trouvé</h3>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest opacity-60 mt-2">Vérifiez l'orthographe ou la recherche globale</p>
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
