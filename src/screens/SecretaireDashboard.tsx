import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { StatCard, Card } from "../components/Card";
import { Button } from "../components/Button";
import { dashboardAPI, patientsAPI, rdvAPI } from "../services/api";
import { Calendar, Phone, Mail, Plus, Search, Clock, User, ChevronRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export function SecretaireDashboard() {
  const navigate = useNavigate();
  const [rdvList, setRdvList]   = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats]       = useState<any>({});
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [activeTab, setActiveTab] = useState<"rdv"|"patients">("rdv");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, patientsData] = await Promise.all([
        dashboardAPI.stats(),
        patientsAPI.list()
      ]);
      setStats(statsData);
      setRdvList(statsData.rdv_liste || []);
      setPatients(patientsData);
    } catch (err) {
      console.error("Erreur chargement dashboard secrétaire:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id:number) => {
    try {
      await rdvAPI.update(id, { statut: "confirme" });
      loadData();
    } catch (err) { alert("Erreur confirmation"); }
  };

  const handleCancel  = async (id:number) => {
    if (!confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;
    try {
      await rdvAPI.cancel(id);
      loadData();
    } catch (err) { alert("Erreur annulation"); }
  };

  const statColor: any = {confirme:"bg-green-100 text-green-700",planifie:"bg-blue-100 text-blue-700",en_attente:"bg-orange-100 text-orange-700",annule:"bg-red-100 text-red-700"};
  const statLabel: any = {confirme:"Confirmé",planifie:"Planifié",en_attente:"En attente",annule:"Annulé"};

  const filteredPatients = patients.filter(p=>
    p.nom.toLowerCase().includes(search.toLowerCase()) || 
    p.prenom.toLowerCase().includes(search.toLowerCase()) || 
    p.numero_dossier.includes(search)
  );

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500 font-medium">Chargement du secrétariat…</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="secretaire" activePath="/secretaire"/>
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10 animate-slideDown shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Secrétariat Médical</h1>
            <p className="text-gray-400 text-sm">Carine Adjovi — Hôpital Central de Cotonou</p>
          </div>
          <button onClick={()=>setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-200 transition-all">
            <Plus className="w-4 h-4"/> Nouveau RDV
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-3 gap-5 mb-8">
            <StatCard title="RDV Aujourd'hui" value={stats.rdv_today || 0} icon={<Calendar className="w-6 h-6"/>} color="blue"   delay={100}/>
            <StatCard title="En attente"       value={stats.rdv_attente || 0} icon={<Clock className="w-6 h-6"/>}    color="orange" delay={200}/>
            <StatCard title="Patients total"   value={stats.patients_total || 0} icon={<User className="w-6 h-6"/>}      color="green"  delay={300}/>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {[{key:"rdv",label:"Rendez-vous du jour"},{key:"patients",label:"Gestion patients"}].map(({key,label})=>(
              <button key={key} onClick={()=>setActiveTab(key as any)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab===key ? "bg-violet-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-violet-300"}`}>
                {label}
              </button>
            ))}
          </div>

          {activeTab==="rdv" && (
            <Card animated delay={200}>
              <div className="space-y-3">
                {rdvList.map((rdv,i)=>(
                  <div key={rdv.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all animate-fadeInUp delay-${(i+2)*100} ${rdv.statut==="en_attente"?"border-orange-100 bg-orange-50":"border-gray-100 bg-white hover:border-violet-100"}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-violet-600"/>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">{rdv.patient_nom}</p>
                          <span className="text-blue-600 font-mono font-bold">{rdv.heure_rdv?.substring(0,5)}</span>
                        </div>
                        <p className="text-sm text-gray-500">{rdv.medecin_nom} — {rdv.motif}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${(statColor as any)[rdv.statut]}`}>
                        {(statLabel as any)[rdv.statut]}
                      </span>
                      {rdv.statut==="en_attente" && (
                        <button onClick={()=>handleConfirm(rdv.id)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all">
                          <CheckCircle className="w-4 h-4"/>
                        </button>
                      )}
                      <button onClick={()=>handleCancel(rdv.id)}
                        className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-all">
                        <XCircle className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab==="patients" && (
            <Card animated delay={200}>
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input value={search} onChange={e=>setSearch(e.target.value)}
                    placeholder="Rechercher un patient…"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm bg-gray-50"/>
                </div>
                <Button onClick={()=>navigate("/medecin/nouveau-patient")} variant="primary" size="sm" icon={<Plus className="w-4 h-4"/>}>
                  Nouveau patient
                </Button>
              </div>
              <div className="space-y-2">
                {filteredPatients.map((p,i)=>(
                  <div key={p.id} className={`p-4 rounded-xl flex items-center justify-between hover:bg-violet-50 cursor-pointer transition-all border border-transparent hover:border-violet-100 animate-fadeInUp delay-${(i+2)*100}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {p.prenom[0]}{p.nom[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{p.prenom} {p.nom}</p>
                        <p className="text-xs text-gray-400 font-mono">{p.numero_dossier} · {p.telephone || "Pas de tel"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Inscrit le</p>
                        <p className="text-sm font-medium text-gray-700">{new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300"/>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal Nouveau RDV */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-scaleIn">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-black">Nouveau Rendez-vous</h2>
              <p className="text-gray-400 text-sm mt-1">Planifier un RDV pour un patient</p>
            </div>
            <div className="p-6 space-y-4">
              {[
                {label:"Patient",type:"text",placeholder:"Nom du patient"},
                {label:"Médecin",type:"text",placeholder:"Dr. Rousseau"},
                {label:"Date",type:"date",placeholder:""},
                {label:"Heure",type:"time",placeholder:""},
                {label:"Motif",type:"text",placeholder:"Motif de consultation"},
              ].map(({label,type,placeholder})=>(
                <div key={label}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
                  <input type={type} placeholder={placeholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm bg-gray-50"/>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={()=>setShowModal(false)}
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-xl font-bold text-sm hover:from-violet-700 hover:to-violet-800 transition-all">
                Planifier le RDV
              </button>
              <button onClick={()=>setShowModal(false)} className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
