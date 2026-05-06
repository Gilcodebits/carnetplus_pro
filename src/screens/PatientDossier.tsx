import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card } from "../components/Card";
import { patientsAPI } from "../services/api";
import {
  ArrowLeft, Calendar, FileText, Pill, Activity,
  Stethoscope, TestTube, Phone, Mail, MapPin,
  Droplet, AlertTriangle, ChevronRight, Plus, User
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

export function PatientDossier() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const [patient, setPatient]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<"consultations"|"prescriptions"|"examens">("consultations");

  useEffect(() => {
    if (id) loadPatient(Number(id));
  }, [id]);

  const loadPatient = async (pid: number) => {
    setLoading(true);
    try {
      const data = await patientsAPI.get(pid);
      
      // Grouper les médicaments par prescription_id
      const groupedPrescriptions = data.prescriptions.reduce((acc: any[], curr: any) => {
        const existing = acc.find(p => p.id === curr.id);
        const med = `${curr.nom_medicament} (${curr.posologie || ""} - ${curr.duree || ""})`;
        if (existing) {
          existing.medicaments.push(med);
        } else {
          acc.push({
            ...curr,
            medicaments: [med]
          });
        }
        return acc;
      }, []);

      setPatient({
        ...data,
        prescriptions: groupedPrescriptions
      });
    } catch (err) {
      console.error("Erreur chargement dossier:", err);
    } finally {
      setLoading(false);
    }
  };

  const statutPrescription: Record<string,string> = {
    active:   "bg-green-100 text-green-700",
    terminee: "bg-gray-100 text-gray-500",
    annulee:  "bg-red-100 text-red-600",
  };
  const statutExamen: Record<string,string> = {
    demande:  "bg-orange-100 text-orange-700",
    en_cours: "bg-blue-100 text-blue-700",
    termine:  "bg-green-100 text-green-700",
    transmis: "bg-purple-100 text-purple-700",
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500 font-medium">Chargement du dossier…</p>
      </div>
    </div>
  );

  if (!patient) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4"/>
        <h2 className="text-xl font-bold">Dossier introuvable</h2>
        <button onClick={()=>navigate("/medecin")} className="mt-4 text-blue-600 font-bold underline">Retour au dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="medecin" activePath="/medecin"/>
      <div className="flex-1 overflow-auto">

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-10 shadow-sm animate-slideDown">
          <button onClick={()=>navigate("/medecin")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all mb-3 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-all"/> Retour dashboard
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-200">
                {getInitiales(patient.prenom, patient.nom)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-gray-900">{patient.prenom} {patient.nom}</h1>
                  <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100">{patient.numero_dossier}</span>
                  {(patient.antecedents || "").includes("Diabète") || (patient.antecedents || "").includes("Hypertension") ? (
                    <span className="flex items-center gap-1 text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-lg border border-orange-100">
                      <AlertTriangle className="w-3 h-3"/> Attention
                    </span>
                  ) : null}
                </div>
                <p className="text-gray-400 text-sm">{calculateAge(patient.date_naissance)} ans · {patient.sexe==="F"?"Femme":"Homme"} · Né(e) le {patient.date_naissance}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>navigate(`/medecin/consultation/${id}`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 transition-all">
                <Stethoscope className="w-4 h-4"/> Nouvelle consultation
              </button>
              <button onClick={()=>navigate(`/medecin/prescription/${id}`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-200 transition-all">
                <Pill className="w-4 h-4"/> Prescrire
              </button>
              <button onClick={()=>navigate(`/medecin/examen/${id}`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-200 transition-all">
                <TestTube className="w-4 h-4"/> Examen
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Info médicale */}
          <div className="grid grid-cols-4 gap-4 animate-fadeInUp">
            {/* Contact */}
            <Card className="col-span-2">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-blue-500"/> Informations personnelles
              </h3>
              <div className="space-y-3">
                {[
                  { icon:Phone, val:patient.telephone },
                  { icon:Mail,  val:patient.email },
                  { icon:MapPin,val:patient.adresse },
                ].map(({icon:Icon,val},i)=>(
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-500"/>
                    </div>
                    <span className="text-sm text-gray-700">{val}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Infos médicales critiques */}
            <Card className="col-span-2">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-red-500"/> Données médicales
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:"Groupe sanguin", val:patient.groupe_sanguin, color:"red",    icon:"🩸" },
                  { label:"Taille / Poids", val:`${patient.taille || "—"} cm · ${patient.poids || "—"} kg`, color:"blue", icon:"📏" },
                  { label:"Allergies",      val:patient.allergies || "Aucune",     color:"orange", icon:"⚠️" },
                  { label:"Antécédents",    val:patient.antecedents || "Aucun",   color:"purple", icon:"📋" },
                ].map(({label,val,color,icon})=>(
                  <div key={label} className={`p-3 bg-${color}-50 rounded-xl border border-${color}-100`}>
                    <p className="text-xs text-gray-500 mb-1">{icon} {label}</p>
                    <p className={`font-bold text-sm text-${color}-700`}>{val}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Onglets historique */}
          <Card animated delay={200}>
            <div className="flex items-center gap-2 mb-6">
              {[
                { key:"consultations", label:"Consultations", icon:Stethoscope, count:patient.consultations.length },
                { key:"prescriptions", label:"Prescriptions",  icon:Pill,        count:patient.prescriptions.length },
                { key:"examens",       label:"Examens",        icon:TestTube,    count:patient.examens.length },
              ].map(({key,label,icon:Icon,count})=>(
                <button key={key} onClick={()=>setActiveTab(key as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab===key ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  <Icon className="w-4 h-4"/>
                  {label}
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab===key ? "bg-white/30 text-white" : "bg-gray-200 text-gray-600"}`}>{count}</span>
                </button>
              ))}
            </div>

            {/* Consultations */}
            {activeTab==="consultations" && (
              <div className="space-y-3">
                {patient.consultations.length===0 && (
                  <div className="text-center py-10 text-gray-400">
                    <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                    <p className="text-sm">Aucune consultation enregistrée</p>
                    <button onClick={()=>navigate(`/medecin/consultation/${id}`)} className="mt-3 text-blue-600 text-sm font-semibold hover:underline">
                      + Nouvelle consultation
                    </button>
                  </div>
                )}
                {patient.consultations.map((c: any, i: number)=>(
                  <div key={c.id} onClick={()=>navigate(`/medecin/consultation/${id}`)}
                    className={`p-5 bg-gray-50 rounded-2xl hover:bg-blue-50 cursor-pointer transition-all border border-transparent hover:border-blue-100 animate-fadeInUp delay-${(i+1)*100}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{c.motif}</span>
                          <span className="text-xs text-gray-400">{new Date(c.date_consultation).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{c.diagnostic}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>🩺 {c.medecin_nom}</span>
                          <span>💊 Tension : {c.tension || "—"}</span>
                          <span>🌡️ {c.temperature || "—"}°C</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300"/>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Prescriptions */}
            {activeTab==="prescriptions" && (
              <div className="space-y-3">
                {patient.prescriptions.length===0 && (
                  <div className="text-center py-10 text-gray-400">
                    <Pill className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                    <p className="text-sm">Aucune prescription</p>
                  </div>
                )}
                {patient.prescriptions.map((p: any, i: number)=>(
                  <div key={p.id} className={`p-5 bg-gray-50 rounded-2xl animate-fadeInUp delay-${(i+1)*100}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-green-600"/>
                        <span className="font-bold text-sm">{new Date(p.created_at).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-400">· Prescrit par {p.medecin_nom}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${statutPrescription[p.statut] || "bg-gray-100"}`}>
                        {p.statut}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {p.medicaments.map((m: string, j: number)=>(
                        <p key={j} className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"/>
                          {m}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Examens */}
            {activeTab==="examens" && (
              <div className="space-y-3">
                {patient.examens.length===0 && (
                  <div className="text-center py-10 text-gray-400">
                    <TestTube className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                    <p className="text-sm">Aucun examen</p>
                  </div>
                )}
                {patient.examens.map((e: any, i: number)=>(
                  <div key={e.id} className={`p-5 bg-gray-50 rounded-2xl animate-fadeInUp delay-${(i+1)*100}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <TestTube className="w-5 h-5 text-purple-600"/>
                        </div>
                        <div>
                          <p className="font-bold text-sm">{e.type_examen}</p>
                          <p className="text-xs text-gray-400">{new Date(e.date_demande).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${statutExamen[e.statut]}`}>{e.statut}</span>
                        {e.resultat && <p className="text-xs text-gray-600 mt-1">{e.resultat}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
