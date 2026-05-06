import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card, StatCard } from "../components/Card";
import { Button } from "../components/Button";
import { dashboardAPI, transfertsAPI, etablissementsAPI, patientsAPI } from "../services/api";
import { ArrowLeftRight, Send, Inbox, Clock, AlertTriangle, Plus, ChevronRight, Building2, User, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const statutConfig: Record<string,{label:string,color:string,icon:any}> = {
  en_attente: { label:"En attente", color:"bg-orange-100 text-orange-700 border-orange-200", icon:Clock },
  accepte:    { label:"Accepté",    color:"bg-blue-100 text-blue-700 border-blue-200",       icon:CheckCircle },
  refuse:     { label:"Refusé",     color:"bg-red-100 text-red-700 border-red-200",           icon:XCircle },
  transfere:  { label:"Transféré",  color:"bg-green-100 text-green-700 border-green-200",    icon:ArrowLeftRight },
};

export function GestionnaireDashboard() {
  const navigate = useNavigate();
  const [transferts, setTransferts] = useState<any[]>([]);
  const [stats, setStats]           = useState<any>({});
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<"tous"|"envois"|"receptions">("tous");
  const [showModal, setShowModal]   = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dashboardAPI.stats();
      setStats(data);
      setTransferts(data.transfert_liste || []);
    } catch (err) {
      console.error("Erreur gestionnaire:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transferts.filter(t =>
    activeTab === "tous" ? true :
    activeTab === "envois" ? t.type === "envoi" :
    t.type === "reception"
  );

  const handleAction = async (id:number, statut:string) => {
    try {
      await transfertsAPI.update(id, { statut });
      loadData();
    } catch (err) {
      alert("Erreur lors de la mise à jour du transfert");
    }
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500 font-medium">Chargement des transferts…</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="gestionnaire" activePath="/gestionnaire"/>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10 animate-slideDown shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <ArrowLeftRight className="w-6 h-6 text-white"/>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Gestionnaire de Transferts</h1>
              <p className="text-gray-400 text-sm">Lionel Kpossou — Hôpital Central de Cotonou</p>
            </div>
          </div>
          <button onClick={()=>setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200 transition-all">
            <Plus className="w-4 h-4"/> Nouveau Transfert
          </button>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-5 mb-8">
            <StatCard title="En attente" value={stats.en_attente || 0} icon={<Clock className="w-6 h-6"/>} color="orange" delay={100}/>
            <StatCard title="Acceptés"   value={stats.acceptes || 0}   icon={<CheckCircle className="w-6 h-6"/>} color="blue" delay={200}/>
            <StatCard title="Transférés" value={stats.transferes || 0} icon={<ArrowLeftRight className="w-6 h-6"/>} color="green" delay={300}/>
            <StatCard title="Urgents"    value={stats.urgents || 0}    icon={<AlertTriangle className="w-6 h-6"/>} color="purple" delay={400}/>
          </div>

          {/* Flux schema */}
          <Card animated delay={200} className="mb-6 overflow-hidden">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-orange-500"/> Flux de transfert
            </h2>
            <div className="flex items-center justify-around py-4">
              {[
                {icon:Building2, label:"Établissement source", color:"bg-blue-500", sub:"Hôpital Central"},
                {icon:Send, label:"Envoi dossier", color:"bg-orange-500", sub:"Sécurisé & Chiffré"},
                {icon:ArrowLeftRight, label:"Validation", color:"bg-purple-500", sub:"Gestionnaire"},
                {icon:Inbox, label:"Réception", color:"bg-green-500", sub:"Établissement dest."},
                {icon:Building2, label:"Établissement dest.", color:"bg-teal-500", sub:"Clinique Sainte-Marie"},
              ].map(({icon:Icon,label,color,sub},i)=>(
                <div key={i} className="flex items-center gap-3">
                  <div className="text-center">
                    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg animate-fadeInUp delay-${(i+2)*100}`}>
                      <Icon className="w-6 h-6 text-white"/>
                    </div>
                    <p className="text-xs font-semibold text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                  {i<4 && <div className="flex items-center gap-1 mx-2">
                    <div className="w-8 h-0.5 bg-gray-300"/>
                    <div className="w-0 h-0 border-l-4 border-l-gray-400 border-y-2 border-y-transparent"/>
                  </div>}
                </div>
              ))}
            </div>
          </Card>

          {/* Tabs + Liste */}
          <Card animated delay={300}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-2">
                {[{key:"tous",label:"Tous"},{key:"envois",label:"Envois"},{key:"receptions",label:"Réceptions"}].map(({key,label})=>(
                  <button key={key} onClick={()=>setActiveTab(key as any)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab===key ? "bg-orange-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-400">{filtered.length} dossier{filtered.length>1?"s":""}</span>
            </div>

            <div className="space-y-3">
              {filtered.map((t,i) => {
                const sc = statutConfig[t.statut];
                const Icon = sc.icon;
                return (
                  <div key={t.id} className={`p-5 rounded-2xl border-2 hover:shadow-md transition-all cursor-pointer animate-fadeInUp delay-${(i+2)*100} ${t.priorite==="urgente" ? "border-red-200 bg-red-50" : "border-gray-100 bg-white hover:border-orange-200"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type==="envoi" ? "bg-blue-100" : "bg-green-100"}`}>
                          {t.type==="envoi" ? <Send className="w-5 h-5 text-blue-600"/> : <Inbox className="w-5 h-5 text-green-600"/>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">{t.patient_nom}</h3>
                            <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">{t.numero_dossier}</span>
                            {t.priorite==="urgente" && (
                              <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3"/> URGENT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Building2 className="w-3.5 h-3.5"/>
                            <span className="font-medium">{t.etab_source}</span>
                            <span>→</span>
                            <span className="font-medium">{t.etab_dest}</span>
                          </div>
                          <p className="text-sm text-gray-600">{t.motif}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(t.date_demande).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${sc.color}`}>
                          <Icon className="w-3.5 h-3.5"/> {sc.label}
                        </span>
                        <div className="flex gap-2 mt-1">
                          {t.statut==="en_attente" && (
                            <>
                              <button onClick={()=>handleAction(t.id,"accepte")}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all">
                                Accepter
                              </button>
                              <button onClick={()=>handleAction(t.id,"refuse")}
                                className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-all">
                                Refuser
                              </button>
                            </>
                          )}
                          {t.statut==="accepte" && (
                            <button onClick={()=>handleAction(t.id,"transfere")}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1">
                              <Send className="w-3 h-3"/> Transférer
                            </button>
                          )}
                          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all flex items-center gap-1">
                            Détails <ChevronRight className="w-3 h-3"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Nouveau Transfert */}
      {showModal && <NouveauTransfertModal onClose={()=>setShowModal(false)} onSave={()=>{loadData(); setShowModal(false);}}/>}
    </div>
  );
}

function NouveauTransfertModal({onClose, onSave}: {onClose:()=>void, onSave:()=>void}) {
  const [form, setForm] = useState({
    patient_id: "", etab_dest_id: "", motif: "", type: "envoi", priorite: "normale"
  });
  const [etabs, setEtabs]       = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    Promise.all([
      etablissementsAPI.list(),
      patientsAPI.list()
    ]).then(([e, p]) => {
      setEtabs(e);
      setPatients(p);
    }).catch(console.error);
  }, []);

  const handleCreate = async () => {
    if (!form.patient_id || !form.etab_dest_id || !form.motif) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setLoading(true);
    try {
      await transfertsAPI.create({
        ...form,
        patient_id: Number(form.patient_id),
        etab_dest_id: Number(form.etab_dest_id),
        etab_source_id: 1 // TODO: Get from current user establishment
      });
      onSave();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-scaleIn">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900">Nouvelle demande de transfert</h2>
          <p className="text-gray-400 text-sm mt-1">Remplissez les informations du dossier à transférer</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sélectionner le patient <span className="text-red-500">*</span></label>
            <select value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-gray-50">
              <option value="">Choisir un patient…</option>
              {patients.map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom} ({p.numero_dossier})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Type de transfert</label>
            <div className="grid grid-cols-2 gap-3">
              {["envoi","reception"].map(t=>(
                <button key={t} onClick={()=>setForm({...form,type:t})}
                  className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${form.type===t ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"}`}>
                  {t==="envoi" ? <Send className="w-4 h-4 text-orange-600"/> : <Inbox className="w-4 h-4 text-green-600"/>}
                  <span className="text-sm font-semibold capitalize">{t==="envoi"?"Envoi":"Réception"}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Établissement destinataire <span className="text-red-500">*</span></label>
            <select value={form.etab_dest_id} onChange={e=>setForm({...form,etab_dest_id:e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-gray-50">
              <option value="">Sélectionner l'établissement…</option>
              {etabs.map(e=><option key={e.id} value={e.id}>{e.nom} — {e.ville}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Motif du transfert <span className="text-red-500">*</span></label>
            <textarea value={form.motif} onChange={e=>setForm({...form,motif:e.target.value})}
              rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none" placeholder="Raison médicale du transfert…"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Priorité</label>
            <div className="grid grid-cols-2 gap-3">
              {["normale","urgente"].map(p=>(
                <button key={p} onClick={()=>setForm({...form,priorite:p})}
                  className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${form.priorite===p ? (p==="urgente"?"border-red-500 bg-red-50":"border-orange-500 bg-orange-50") : "border-gray-200 hover:border-gray-300"}`}>
                  {p==="urgente" && <AlertTriangle className="w-4 h-4 text-red-500"/>}
                  <span className={`text-sm font-semibold capitalize ${p==="urgente"&&form.priorite===p?"text-red-600":""}`}>{p==="urgente"?"Urgente":"Normale"}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={handleCreate} disabled={loading || !form.patient_id || !form.etab_dest_id}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-sm hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50">
            {loading ? "Création…" : "Créer la demande"}
          </button>
          <button onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
