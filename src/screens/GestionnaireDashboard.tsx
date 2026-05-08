import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as "tous" | "envois" | "receptions";
  const [activeTab, setActiveTab]   = useState<"tous"|"envois"|"receptions">("tous");
  const [showModal, setShowModal]   = useState(false);

  useEffect(() => {
    if (tabFromUrl && ["tous", "envois", "receptions"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

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
    <div className="flex h-screen bg-slate-200 items-center justify-center">
      <div className="text-center p-14 bg-white rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"/>
        <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Chargement des transferts…</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-200">
      <Sidebar role="gestionnaire" activePath="/gestionnaire"/>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b-2 border-slate-200 px-10 py-8 flex items-center justify-between sticky top-0 z-20 animate-slideDown shadow-2xl shadow-slate-200/50">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-orange-200 border-2 border-white">
              <ArrowLeftRight className="w-8 h-8 text-white"/>
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Gestionnaire de Transferts</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 mt-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"/>
                Lionel Kpossou <span className="text-slate-200 mx-1">•</span> Hôpital Central de Cotonou
              </p>
            </div>
          </div>
          <button onClick={()=>setShowModal(true)}
            className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-200 transition-all shadow-xl shadow-orange-500/20 active:scale-95 border-2 border-orange-400">
            <Plus className="w-6 h-6"/> Nouveau Transfert
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
          <Card animated delay={300} className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-white rounded-[3rem]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-4">
                {[{key:"tous",label:"Tous"},{key:"envois",label:"Envois"},{key:"receptions",label:"Réceptions"}].map(({key,label})=>(
                  <button key={key} onClick={()=>setActiveTab(key as any)}
                    className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all border-2 shadow-sm ${activeTab===key ? "bg-orange-500 border-orange-400 text-white shadow-xl shadow-orange-200 scale-105" : "bg-white border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-600"}`}>
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">{filtered.length} dossier{filtered.length>1?"s":""}</span>
            </div>

            <div className="space-y-4">
              {filtered.map((t,i) => {
                const sc = statutConfig[t.statut];
                const Icon = sc.icon;
                return (
                  <div key={t.id} className={`p-8 rounded-[2rem] border-2 transition-all cursor-pointer animate-fadeInUp group hover:scale-[1.01] hover:shadow-2xl hover:shadow-orange-200/50 ${t.priorite==="urgente" ? "border-rose-400 bg-rose-50/50" : (i % 2 === 0 ? "border-slate-200 bg-white" : "border-blue-100 bg-blue-50/30")}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-sm ${t.type==="envoi" ? "bg-blue-100 border-blue-200" : "bg-emerald-100 border-emerald-200"}`}>
                          {t.type==="envoi" ? <Send className="w-7 h-7 text-blue-600"/> : <Inbox className="w-7 h-7 text-emerald-600"/>}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-black text-slate-900 text-xl uppercase tracking-tight group-hover:text-orange-600 transition-colors">{t.patient_nom}</h3>
                            <span className="text-[10px] font-black text-slate-500 font-mono bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg uppercase tracking-widest">{t.numero_dossier}</span>
                            {t.priorite==="urgente" && (
                              <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-200 px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">
                                <AlertTriangle className="w-3.5 h-3.5"/> URGENT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 font-bold uppercase tracking-wide">
                            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                               <Building2 className="w-3.5 h-3.5 text-blue-500"/>
                               <span>{t.etab_source}</span>
                            </div>
                            <ArrowLeftRight className="w-4 h-4 text-slate-300"/>
                            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                               <Building2 className="w-3.5 h-3.5 text-emerald-500"/>
                               <span>{t.etab_dest}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed italic mb-2">"{t.motif}"</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(t.date_demande).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${sc.color}`}>
                          <Icon className="w-4 h-4"/> {sc.label}
                        </span>
                        <div className="flex gap-2 mt-2">
                          {t.statut==="en_attente" && (
                            <>
                              <button onClick={(e)=>{e.stopPropagation(); handleAction(t.id,"accepte")}}
                                className="px-6 py-3 bg-emerald-600 text-white border-2 border-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-emerald-200 transition-all shadow-md active:scale-95">
                                Accepter
                              </button>
                              <button onClick={(e)=>{e.stopPropagation(); handleAction(t.id,"refuse")}}
                                className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 border-2 border-rose-200 transition-all shadow-sm active:scale-95">
                                Refuser
                              </button>
                            </>
                          )}
                          {t.statut==="accepte" && (
                            <button onClick={(e)=>{e.stopPropagation(); handleAction(t.id,"transfere")}}
                              className="px-6 py-3 bg-blue-600 text-white border-2 border-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-blue-200 transition-all flex items-center gap-2 shadow-md active:scale-95">
                              <Send className="w-4 h-4"/> Transférer
                            </button>
                          )}
                          <button className="px-6 py-3 bg-white text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 border-2 border-slate-200 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                            Détails <ChevronRight className="w-4 h-4"/>
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl animate-scaleIn border-2 border-slate-200 overflow-hidden">
        <div className="p-10 border-b-2 border-slate-100">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Demande de transfert</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Remplissez les informations du dossier</p>
        </div>
        <div className="p-10 space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-3">Sélectionner le patient <span className="text-rose-500 text-base">*</span></label>
            <select value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})}
              className="w-full px-6 py-5 border-2 border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white text-sm font-bold bg-slate-50 transition-all appearance-none cursor-pointer shadow-inner">
              <option value="">Choisir un patient…</option>
              {patients.map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom} ({p.numero_dossier})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-3">Type de transfert</label>
            <div className="grid grid-cols-2 gap-4">
              {["envoi","reception"].map(t=>(
                <button key={t} onClick={()=>setForm({...form,type:t})}
                  className={`p-6 rounded-[2rem] border-2 flex items-center gap-4 transition-all ${form.type===t ? "border-orange-500 bg-orange-50/60 shadow-lg shadow-orange-100" : "border-slate-200 bg-slate-50 hover:border-orange-300"}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${form.type===t ? 'bg-white border-orange-200 shadow-sm' : 'bg-white border-slate-100'}`}>
                    {t==="envoi" ? <Send className="w-6 h-6 text-orange-600"/> : <Inbox className="w-6 h-6 text-emerald-600"/>}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{t==="envoi"?"Envoi":"Réception"}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-3">Établissement destinataire <span className="text-rose-500 text-base">*</span></label>
            <select value={form.etab_dest_id} onChange={e=>setForm({...form,etab_dest_id:e.target.value})}
              className="w-full px-6 py-5 border-2 border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white text-sm font-bold bg-slate-50 transition-all appearance-none cursor-pointer shadow-inner">
              <option value="">Sélectionner l'établissement…</option>
              {etabs.map(e=><option key={e.id} value={e.id}>{e.nom} — {e.ville}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-3">Motif du transfert <span className="text-rose-500 text-base">*</span></label>
            <textarea value={form.motif} onChange={e=>setForm({...form,motif:e.target.value})}
              rows={3} className="w-full px-6 py-5 border-2 border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white text-sm font-bold bg-slate-50 transition-all resize-none placeholder-slate-300 shadow-inner" placeholder="Raison médicale du transfert…"/>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-3">Priorité</label>
            <div className="grid grid-cols-2 gap-4">
              {["normale","urgente"].map(p=>(
                <button key={p} onClick={()=>setForm({...form,priorite:p})}
                  className={`p-6 rounded-[2rem] border-2 flex items-center gap-4 transition-all ${form.priorite===p ? (p==="urgente"?"border-rose-500 bg-rose-50/60 shadow-lg shadow-rose-100":"border-orange-500 bg-orange-50/60 shadow-lg shadow-orange-100") : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${form.priorite===p ? (p==="urgente"?'bg-white border-rose-200':'bg-white border-orange-200') : 'bg-white border-slate-100'}`}>
                    {p==="urgente" ? <AlertTriangle className="w-6 h-6 text-rose-500"/> : <CheckCircle className="w-6 h-6 text-orange-500"/>}
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${p==="urgente"&&form.priorite===p?"text-rose-700":"text-slate-700"}`}>{p==="urgente"?"Urgente":"Normale"}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-10 border-t-2 border-slate-100 flex gap-6">
          <button onClick={handleCreate} disabled={loading || !form.patient_id || !form.etab_dest_id}
            className="flex-1 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-orange-200 transition-all disabled:opacity-50 shadow-xl shadow-orange-500/20 border-2 border-orange-400 active:scale-[0.99]">
            {loading ? "Création en cours…" : "Créer la demande de transfert"}
          </button>
          <button onClick={onClose} className="px-10 py-5 bg-white text-slate-400 border-2 border-slate-200 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
