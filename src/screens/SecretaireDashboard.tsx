import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { StatCard, Card } from "../components/Card";
import { dashboardAPI, patientsAPI, rdvAPI, utilisateursAPI } from "../services/api";
import { Calendar, Phone, Mail, Plus, Search, Clock, User, ChevronRight, CheckCircle, XCircle, AlertCircle, MapPin, UserPlus, ArrowUpRight, Filter, Printer, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { PageTransition } from "../components/PageTransition";
import { motion } from "framer-motion";
import { formatDate } from "../utils/format";

export function SecretaireDashboard({ tab = "rdv" }: { tab?: "rdv" | "patients" }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rdvList, setRdvList] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [medecins, setMedecins] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"rdv" | "patients">(tab);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rdvToCancel, setRdvToCancel] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    medecin_id: "", // Médecin
    date_rdv: "",
    heure_rdv: "",
    motif: ""
  });

  useEffect(() => {
    loadData();
    loadMedecins();
  }, []);

  const loadMedecins = async () => {
    try {
      const data = await utilisateursAPI.list('medecin');
      setMedecins(data);
    } catch (err) { console.error(err); }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, patientsData, allRdvs] = await Promise.all([
        dashboardAPI.stats(),
        patientsAPI.list(),
        rdvAPI.list()
      ]);
      setStats(statsData);
      // Sort RDVs by date then time
      const sorted = (allRdvs || []).sort((a: any, b: any) => {
        const dateCompare = a.date_rdv.localeCompare(b.date_rdv);
        if (dateCompare !== 0) return dateCompare;
        return a.heure_rdv.localeCompare(b.heure_rdv);
      });
      setRdvList(sorted);
      setPatients(patientsData);
    } catch (err) {
      console.error("Erreur chargement dashboard secrétaire:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = (patients || []).filter(p =>
    (p.nom || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.prenom || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.numero_dossier || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = async (id: number) => {
    try {
      await rdvAPI.update(id, { statut: "confirme" });
      loadData();
    } catch (err) { alert("Erreur confirmation"); }
  };

  const handleCancelClick = (id: number) => {
    setRdvToCancel(id);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!rdvToCancel) return;
    try {
      await rdvAPI.cancel(rdvToCancel);
      setShowCancelModal(false);
      setRdvToCancel(null);
      loadData();
      setSuccessMsg("Rendez-vous supprimé avec succès.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) { alert("Erreur suppression"); }
  };

  const statColor: any = {
    confirme: "bg-emerald-50 text-emerald-600 border-emerald-100",
    planifie: "bg-blue-50 text-blue-600 border-blue-100",
    en_attente: "bg-amber-50 text-amber-600 border-amber-100",
    annule: "bg-rose-50 text-rose-600 border-rose-100"
  };

  const statLabel: any = {
    confirme: "Confirmé",
    planifie: "Planifié",
    en_attente: "En attente",
    annule: "Annulé"
  };

  const handleSaveRDV = async () => {
    setTouched(true);
    const { patient_id, medecin_id, date_rdv, heure_rdv } = formData;

    if (!patient_id || !medecin_id || !date_rdv || !heure_rdv) {
      setFormError("Certains champs obligatoires sont vides");
      return;
    }

    setFormError(null);
    try {
      if (editingId) {
        await rdvAPI.update(editingId, formData);
        setSuccessMsg("Rendez-vous modifié avec succès !");
      } else {
        await rdvAPI.create(formData);
        setSuccessMsg("Rendez-vous enregistré avec succès !");
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ patient_id: "", medecin_id: "", date_rdv: "", heure_rdv: "", motif: "" });
      setTouched(false);
      setTimeout(() => setSuccessMsg(null), 5000);
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Erreur lors de l'enregistrement du RDV");
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const handleEditClick = (rdv: any) => {
    setFormData({
      patient_id: rdv.patient_id.toString(),
      medecin_id: rdv.medecin_id.toString(),
      date_rdv: rdv.date_rdv,
      heure_rdv: rdv.heure_rdv,
      motif: rdv.motif || ""
    });
    setEditingId(rdv.id);
    setShowModal(true);
  };

  if (loading) return (
    <div className="flex h-screen bg-slate-200 items-center justify-center">
      <div className="text-center p-14 bg-white rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Chargement du secrétariat…</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto flex flex-col p-12 space-y-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Tableau de Bord</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Gestion du Secrétariat en temps réel
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-4 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-blue-300 transition-all shadow-xl shadow-blue-600/20 active:scale-95 border-2 border-blue-500">
          <Plus className="w-6 h-6" /> Nouveau RDV
        </button>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-emerald-500 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-between shadow-xl shadow-emerald-200"
        >
          <div className="flex items-center gap-4">
            <CheckCircle className="w-6 h-6" />
            {successMsg}
          </div>
          <button onClick={() => setSuccessMsg(null)} className="opacity-50 hover:opacity-100">Fermer</button>
        </motion.div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="RDV du jour"
          value={stats.rdv_today || 0}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
          trend="+12% vs hier"
          delay={100}
        />
        <StatCard
          title="Salle d'attente"
          value={stats.rdv_attente || 0}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
          trend="Charge élevée"
          delay={200}
        />
        <StatCard
          title="Dossiers Patients"
          value={stats.patients_total || 0}
          icon={<User className="w-6 h-6" />}
          color="emerald"
          trend="Base à jour"
          delay={300}
        />
      </div>

      {/* Navigation Tabs Container */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
          <div className="flex gap-12">
            {[
              { key: "rdv", label: "Rendez-vous", count: stats.rdv_today },
              { key: "patients", label: "Répertoire Patient", count: stats.patients_total }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`relative pb-6 text-sm font-black uppercase tracking-widest transition-all ${activeTab === key ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                <span className="flex items-center gap-3">
                  {label}
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                    {count}
                  </span>
                </span>
                {activeTab === key && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">
              <Filter className="w-4 h-4" /> Filtrer
            </button>
          </div>
        </div>

        {activeTab === "rdv" ? (
          <div className="space-y-12">
            {/* Section Demandes en attente */}
            {rdvList.filter(r => r.statut === "en_attente" && r.date_rdv >= today).length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Demandes à confirmer</h2>
                  <span className="bg-amber-500 text-white text-[10px] px-3 py-1 rounded-full font-black animate-pulse shadow-lg shadow-amber-200">
                    {rdvList.filter(r => r.statut === "en_attente" && r.date_rdv >= today).length} Nouvelles
                  </span>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {rdvList.filter(r => r.statut === "en_attente" && r.date_rdv >= today).map((rdv, i) => (
                    <div
                      key={rdv.id}
                      className="group p-8 rounded-[3rem] border-2 bg-amber-50/40 border-amber-200 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-200/30 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex gap-6">
                          <div className="w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center border-2 bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-200/50">
                            <span className="text-[10px] font-black uppercase opacity-60">Heure</span>
                            <span className="text-xl font-black">{rdv.heure_rdv?.substring(0, 5)}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{rdv.patient_nom}</h3>
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${statColor[rdv.statut]}`}>
                                {statLabel[rdv.statut]}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-amber-700 font-black uppercase tracking-widest flex items-center gap-2 mb-1">
                                <Calendar className="w-3.5 h-3.5" /> {rdv.date_rdv === today ? "Aujourd'hui" : formatDate(rdv.date_rdv)}
                              </p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-blue-500" /> Dr. {rdv.medecin_nom}
                              </p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-orange-500" /> {rdv.motif}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => handleConfirm(rdv.id)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 font-black text-[9px] uppercase tracking-widest">
                            <CheckCircle className="w-4 h-4" /> Confirmer
                          </button>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditClick(rdv)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95 font-black text-[9px] uppercase tracking-widest">
                              <Edit className="w-4 h-4" /> Modifier
                            </button>
                            <button onClick={() => handleCancelClick(rdv.id)} className="flex-1 px-4 py-3 bg-white border-2 border-amber-200 text-rose-500 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95 font-black text-[9px] uppercase tracking-widest">
                              <XCircle className="w-4 h-4" /> Annuler
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/secretaire/patients/${rdv.patient_id}`)}
                        className="absolute bottom-6 right-8 text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Détails Dossier <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section Agenda Global */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Agenda Global</h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
                  {rdvList.filter(r => r.statut !== "en_attente" && r.date_rdv >= today).length} Rendez-vous à venir
                </span>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {rdvList.filter(r => r.statut !== "en_attente" && r.date_rdv >= today).map((rdv, i) => (
                  <div
                    key={rdv.id}
                    className="group p-8 rounded-[3rem] border-2 bg-white border-slate-100 shadow-sm transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-200 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex gap-6">
                        <div className="w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center border-2 bg-slate-50 border-slate-100 text-slate-400 shadow-sm">
                          <span className="text-[10px] font-black uppercase opacity-60">Heure</span>
                          <span className="text-xl font-black">{rdv.heure_rdv?.substring(0, 5)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{rdv.patient_nom}</h3>
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${statColor[rdv.statut]}`}>
                              {statLabel[rdv.statut]}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-1 ${rdv.date_rdv === today ? "text-blue-600" : "text-slate-400"}`}>
                              <Calendar className="w-3.5 h-3.5" /> {rdv.date_rdv === today ? "Aujourd'hui" : formatDate(rdv.date_rdv)}
                            </p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-blue-500" /> Dr. {rdv.medecin_nom}
                            </p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                              <AlertCircle className="w-3.5 h-3.5 text-orange-500" /> {rdv.motif}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          {rdv.statut !== "confirme" && (
                            <button onClick={() => handleConfirm(rdv.id)} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-sm border border-emerald-100">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button onClick={() => handleEditClick(rdv)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 shadow-sm border border-slate-100">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleCancelClick(rdv.id)} className="p-3 bg-white border-2 border-slate-100 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95 shadow-sm">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/secretaire/patients/${rdv.patient_id}`)}
                      className="absolute bottom-6 right-8 text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Détails Dossier <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-6">
            {/* Patients Search Bar */}
            <div className="flex gap-6 mb-12">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher par nom, prénom ou n° de dossier..."
                  className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[2.5rem] focus:outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 text-sm font-bold shadow-sm transition-all"
                />
              </div>
              <button
                onClick={() => navigate("/secretaire/nouveau-patient")}
                className="px-8 bg-emerald-600 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-3"
              >
                <Plus className="w-5 h-5" /> Nouveau Patient
              </button>
              <button className="px-8 bg-white border-2 border-slate-100 rounded-[2.5rem] text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest">
                Export
              </button>
            </div>

            {/* Patients List - Refined Compact Version */}
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b-2 border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">N° Dossier</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-50">
                  {filteredPatients.map((p, i) => (
                    <tr 
                      key={p.id} 
                      onClick={() => navigate(`/secretaire/patients/${p.id}`)}
                      className="group hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-sm border-2 border-white shadow-sm">
                            {p.prenom[0]}{p.nom[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{p.prenom} {p.nom}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Né(e) le {formatDate(p.date_naissance)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-lg">
                          {p.numero_dossier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-[11px] font-bold">{p.telephone || "—"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={(e) => { e.stopPropagation(); navigate(`/secretaire/modifier-patient/${p.id}`); }}
                             className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                           >
                             <Edit className="w-3.5 h-3.5" />
                           </button>
                           <button className="p-2.5 bg-slate-900 text-white rounded-lg hover:scale-110 transition-all shadow-md">
                             <ChevronRight className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nouveau RDV */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] animate-fadeIn p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl border-2 border-slate-100 overflow-hidden"
          >
            <div className="p-12 border-b-2 border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">{editingId ? "Modifier le RDV" : "Nouveau RDV"}</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">{editingId ? "Mise à jour des détails du rendez-vous" : "Enregistrement d'une nouvelle visite"}</p>
              </div>
              <button onClick={() => { setShowModal(false); setEditingId(null); setFormData({ patient_id: "", medecin_id: "", date_rdv: "", heure_rdv: "", motif: "" }); }} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100">
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            <div className="p-12 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <select
                      value={formData.patient_id}
                      onChange={e => setFormData({ ...formData, patient_id: e.target.value })}
                      className={`w-full pl-16 pr-6 py-5 bg-slate-50 border-2 rounded-[2rem] focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all appearance-none ${touched && !formData.patient_id ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-100'}`}
                    >
                      <option value="">Sélectionner un patient...</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({p.numero_dossier})</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Médecin</label>
                  <div className="relative">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <select
                      value={formData.medecin_id}
                      onChange={e => setFormData({ ...formData, medecin_id: e.target.value })}
                      className={`w-full pl-16 pr-6 py-5 bg-slate-50 border-2 rounded-[2rem] focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all appearance-none ${touched && !formData.medecin_id ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-100'}`}
                    >
                      <option value="">Sélectionner un médecin...</option>
                      {medecins.map(m => <option key={m.id} value={m.id}>Dr. {m.nom} {m.prenom}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input
                    type="date"
                    value={formData.date_rdv}
                    onChange={e => setFormData({ ...formData, date_rdv: e.target.value })}
                    className={`w-full px-8 py-5 bg-slate-50 border-2 rounded-[2rem] focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all ${touched && !formData.date_rdv ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-100'}`}
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Heure</label>
                  <input
                    type="time"
                    value={formData.heure_rdv}
                    onChange={e => setFormData({ ...formData, heure_rdv: e.target.value })}
                    className={`w-full px-8 py-5 bg-slate-50 border-2 rounded-[2rem] focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all ${touched && !formData.heure_rdv ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-100'}`}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motif de consultation</label>
                <textarea
                  placeholder="Décrivez le motif..."
                  value={formData.motif}
                  onChange={e => setFormData({ ...formData, motif: e.target.value })}
                  className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all h-32 resize-none"
                />
              </div>
              {formError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{formError}</p>
                </div>
              )}
            </div>
            <div className="p-12 border-t-2 border-slate-50 flex gap-6">
              <button
                onClick={handleSaveRDV}
                className="flex-1 py-6 bg-blue-600 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Confirmer le Rendez-vous
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Annulation avec Motif */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg border-2 border-slate-100 overflow-hidden"
          >
            <div className="p-10 border-b-2 border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Annuler le RDV</h2>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Veuillez préciser le motif de l'annulation</p>
              </div>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motif d'annulation</label>
                <textarea
                  placeholder="Ex: Patient indisponible, Médecin absent..."
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-rose-500 outline-none text-sm font-bold transition-all h-32 resize-none"
                />
              </div>
            </div>
            <div className="p-10 border-t-2 border-slate-50 flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Ignorer
              </button>
              <button
                onClick={confirmCancel}
                disabled={!cancelReason.trim()}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all disabled:opacity-30"
              >
                Confirmer l'annulation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
