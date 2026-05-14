import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { patientsAPI, dashboardAPI, examensAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useSearch } from "../contexts/SearchContext";
import {
  Users, Activity, ChevronRight, Stethoscope,
  Pill, TestTube, Search, Clock, UserCircle,
  AlertTriangle, HeartPulse, ArrowRight, FileText
} from "lucide-react";
import { formatDate } from "../utils/format";

const getInitiales = (prenom: string, nom: string) =>
  `${prenom?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();

const calculateAge = (date_naissance: string) => {
  if (!date_naissance) return "—";
  const birthDate = new Date(date_naissance);
  const diff = Date.now() - birthDate.getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

export function AgentSanteDashboard() {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();

  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [recentConsultations, setRecentConsultations] = useState<any[]>([]);
  const [pendingExamens, setPendingExamens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientsData, statsData, examensData] = await Promise.all([
        patientsAPI.list(),
        dashboardAPI.stats(),
        examensAPI.list({ statut: "demande" }),
      ]);

      setPatients(patientsData);
      setStats(statsData);
      setPendingExamens(examensData.slice(0, 4));

      // Build recent consultation list from nested patient data
      const allConsultations: any[] = [];
      patientsData.forEach((p: any) => {
        if (p.consultations && Array.isArray(p.consultations)) {
          p.consultations.forEach((c: any) => {
            allConsultations.push({
              ...c,
              patient_prenom: p.prenom,
              patient_nom: p.nom,
              patient_id: p.id,
            });
          });
        }
      });
      allConsultations.sort(
        (a, b) =>
          new Date(b.date_consultation).getTime() -
          new Date(a.date_consultation).getTime()
      );
      setRecentConsultations(allConsultations.slice(0, 5));
    } catch (err) {
      console.error("Erreur chargement dashboard agent:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const s = searchQuery.toLowerCase();
    return (
      p.nom?.toLowerCase().includes(s) ||
      p.prenom?.toLowerCase().includes(s) ||
      p.numero_dossier?.toLowerCase().includes(s)
    );
  });

  // Compute real stats
  const totalConsultations = patients.reduce(
    (acc, p) => acc + (p.consultations?.length || 0),
    0
  );
  const totalPrescriptions = patients.reduce(
    (acc, p) => acc + (p.prescriptions?.length || 0),
    0
  );
  const patientsWithAllergies = patients.filter(
    (p) => p.allergies && p.allergies.trim() !== ""
  ).length;

  const kpis = [
    {
      label: "Patients suivis",
      value: patients.length,
      icon: Users,
      color: "blue",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Consultations",
      value: totalConsultations,
      icon: Stethoscope,
      color: "emerald",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: "Traitements actifs",
      value: totalPrescriptions,
      icon: Pill,
      color: "purple",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      label: "Alertes allergies",
      value: patientsWithAllergies,
      icon: AlertTriangle,
      color: "rose",
      bg: "bg-rose-50",
      text: "text-rose-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-16 rounded-[3rem] border-2 border-slate-200 shadow-2xl">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fadeIn bg-slate-50 min-h-screen">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, i) => (
          <Card
            key={i}
            className="p-6 md:p-8 rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/40 bg-white group hover:scale-[1.02] transition-all"
          >
            <div
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${kpi.bg} flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform`}
            >
              <kpi.icon className={`w-6 h-6 md:w-7 md:h-7 ${kpi.text}`} />
            </div>
            <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {kpi.label}
            </p>
            <p className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
              {kpi.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Patient Search & List */}
        <div className="lg:col-span-8">
          <Card
            noPadding
            className="rounded-[2.5rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white h-full flex flex-col"
          >
            {/* Header */}
            <div className="p-6 md:p-10 border-b-2 border-slate-50 flex flex-col md:flex-row justify-between items-center gap-5">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Accès aux Dossiers
                </h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                  {filteredPatients.length} patient
                  {filteredPatients.length !== 1 ? "s" : ""} trouvé
                  {filteredPatients.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="w-full md:max-w-sm relative">
                <Search
                  className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? "text-blue-600" : "text-slate-400"}`}
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="NOM, PRÉNOM OU N° DOSSIER..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Patient Rows */}
            <div className="flex-1 p-4 md:p-6 space-y-3 overflow-y-auto scrollbar-hide max-h-[500px]">
              {filteredPatients.length > 0 ? (
                filteredPatients.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/agent-sante/dossier/${p.id}`)}
                    className="p-4 md:p-5 rounded-[1.5rem] border-2 border-slate-100 hover:border-blue-200 bg-white hover:bg-blue-50/30 transition-all cursor-pointer group flex items-center gap-4 hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-100/40"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                      {getInitiales(p.prenom, p.nom)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-sm uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors">
                        {p.prenom} {p.nom}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          N° {p.numero_dossier}
                        </span>
                        <span className="text-[9px] font-black text-blue-500 uppercase bg-blue-50 px-2 py-0.5 rounded-lg">
                          {calculateAge(p.date_naissance)} ans
                        </span>
                        {p.allergies && (
                          <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Allergie
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <UserCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">
                    Aucun patient trouvé
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 md:p-6 bg-slate-50/50 border-t-2 border-slate-50">
              <button
                onClick={() => navigate("/agent-sante/patients")}
                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Voir tout le répertoire
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">

          {/* Recent Consultations */}
          <Card className="rounded-[2.5rem] border-2 border-slate-200 shadow-2xl p-7 bg-white">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              Consultations récentes
            </h3>
            <div className="space-y-4">
              {recentConsultations.length > 0 ? (
                recentConsultations.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/agent-sante/dossier/${c.patient_id}`)}
                    className="flex gap-3 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0 cursor-pointer group hover:bg-slate-50 -mx-2 px-2 py-2 rounded-xl transition-all"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-black text-xs">
                      {getInitiales(c.patient_prenom, c.patient_nom)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-xs uppercase truncate group-hover:text-blue-600 transition-colors">
                        {c.patient_prenom} {c.patient_nom}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5 truncate italic">
                        {c.motif || "Consultation"}
                      </p>
                      <p className="text-[9px] font-black text-emerald-600 mt-1 uppercase tracking-widest flex items-center gap-1">
                        <Activity className="w-2.5 h-2.5" />
                        {formatDate(c.date_consultation)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] font-bold text-slate-400 text-center py-6 uppercase tracking-widest">
                  Aucune consultation récente
                </p>
              )}
            </div>
          </Card>

          {/* Pending Exams */}
          <Card className="rounded-[2.5rem] border-2 border-amber-100 shadow-2xl p-7 bg-amber-50/30">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 border border-amber-200 shrink-0">
                <TestTube className="w-4 h-4" />
              </div>
              Examens en attente
              {pendingExamens.length > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-lg font-black">
                  {pendingExamens.length}
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {pendingExamens.length > 0 ? (
                pendingExamens.map((e, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border-2 bg-white flex items-center gap-3 ${e.urgence ? "border-rose-200" : "border-amber-100"}`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${e.urgence ? "bg-rose-500 animate-pulse" : "bg-amber-400"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black text-slate-900 uppercase truncate">
                        {e.type_examen}
                      </p>
                      {e.urgence && (
                        <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest">
                          URGENT
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] font-bold text-slate-400 text-center py-6 uppercase tracking-widest">
                  Aucun examen en attente
                </p>
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
