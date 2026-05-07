import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card } from "../components/Card";
import { prescriptionsAPI, patientsAPI } from "../services/api";
import { ArrowLeft, Save, Plus, Trash2, Pill, CheckCircle, AlertCircle, Info, ChevronRight, ListPlus } from "lucide-react";

interface Medicament { id: string; nom: string; posologie: string; duree: string; instructions: string; }

export function Prescription() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get("consultation_id");

  // Liste des médicaments validés
  const [meds, setMeds] = useState<Medicament[]>([]);
  // Médicament en cours de saisie
  const [currentMed, setCurrentMed] = useState<Medicament>({
    id: Date.now().toString(),
    nom: "",
    posologie: "",
    duree: "",
    instructions: ""
  });

  const [patient, setPatient] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (id) {
      patientsAPI.get(Number(id)).then(setPatient).catch(console.error);
    }
  }, [id]);

  const handleAddMed = () => {
    if (!currentMed.nom.trim()) {
      setErrors(["Le nom du médicament est requis pour l'ajouter."]);
      return;
    }
    setErrors([]);
    setIsAdding(true);
    
    // Simuler un léger délai pour l'effet de "glisse"
    setTimeout(() => {
      setMeds(prev => {
        // Si on éditait un médicament existant (même ID), on le remplace
        const exists = prev.find(m => m.id === currentMed.id);
        if (exists) {
          return prev.map(m => m.id === currentMed.id ? currentMed : m);
        }
        return [...prev, currentMed];
      });
      setCurrentMed({
        id: Date.now().toString(),
        nom: "",
        posologie: "",
        duree: "",
        instructions: ""
      });
      setIsAdding(false);
    }, 400);
  };

  const editMed = (m: Medicament) => {
    // Si le formulaire actuel est déjà rempli et différent de ce qu'on clique
    if (currentMed.nom.trim() && currentMed.id !== m.id) {
       // On peut soit l'ajouter auto, soit demander, mais ici on va juste écraser
       // (ou mieux: on l'ajoute à la liste s'il n'y est pas)
       const exists = meds.find(item => item.id === currentMed.id);
       if (!exists) setMeds(prev => [...prev, currentMed]);
    }
    setCurrentMed(m);
  };

  const removeMed = (mid: string) => {
    setMeds(prev => prev.filter(m => m.id !== mid));
  };

  const handleSave = async () => {
    // Si la liste est vide, on essaie d'ajouter le courant s'il est rempli
    let finalMeds = [...meds];
    if (finalMeds.length === 0) {
      if (currentMed.nom.trim()) {
        finalMeds = [currentMed];
      } else {
        setErrors(["Veuillez ajouter au moins un médicament à l'ordonnance."]);
        return;
      }
    }

    setLoading(true);
    try {
      await prescriptionsAPI.create({
        patient_id: Number(id),
        consultation_id: consultationId ? Number(consultationId) : null,
        medicaments: finalMeds.map(m => ({
          nom_medicament: m.nom,
          posologie: m.posologie,
          duree: m.duree,
          instructions: m.instructions
        }))
      });
      setSaved(true);
      setTimeout(() => navigate(`/medecin/dossier/${id}`), 1800);
    } catch (err: any) {
      setErrors([err.message || "Erreur lors de l'enregistrement de la prescription"]);
    } finally {
      setLoading(false);
    }
  };

  if (saved) return (
    <div className="p-8 animate-scaleIn flex items-center justify-center min-h-[80vh] bg-slate-200">
      <Card className="max-w-md w-full p-12 rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 text-center bg-white">
        <div className="w-24 h-24 bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 uppercase tracking-tight">Ordonnance Validée !</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-8 opacity-80">Le traitement a été ajouté au dossier patient.</p>
        
        <div className="space-y-4">
           <button onClick={() => navigate(`/medecin/dossier/${id}`)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl transition-all shadow-lg shadow-emerald-200">
             Retour au dossier
           </button>
           <button className="w-full py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
             Imprimer l'ordonnance
           </button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="p-10 animate-fadeIn bg-slate-200 min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-slate-400 hover:text-emerald-600 transition-all cursor-pointer group" onClick={() => navigate(`/medecin/dossier/${id}`)}>
            <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-sm group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-all" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Prescription Médicale</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 bg-white px-3 py-1 rounded-lg border border-slate-100 inline-block">
              {patient ? `${patient.prenom} ${patient.nom} · ${patient.numero_dossier}` : "Chargement du dossier..."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden lg:flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Édition d'ordonnance active</span>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar: Récapitulatif */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-8 bg-white h-fit sticky top-10">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4 uppercase tracking-tight">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm">
                <ListPlus className="w-5 h-5 text-emerald-600"/>
              </div>
              Contenu de l'ordonnance
            </h3>

            {meds.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                <Pill className="w-12 h-12 text-slate-200 mx-auto mb-4"/>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic px-6">Aucun médicament ajouté pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                {meds.map((m, idx) => (
                  <div key={m.id} 
                    onClick={() => editMed(m)}
                    className={`p-5 border-2 transition-all cursor-pointer group rounded-[1.8rem] animate-slideInRight ${currentMed.id === m.id ? 'border-emerald-500 bg-emerald-50' : 'bg-slate-50 border-slate-100 hover:border-emerald-200 hover:bg-white'}`}>
                    <div className="flex justify-between items-start gap-4 mb-2">
                       <p className="font-black text-slate-900 text-sm uppercase leading-tight">{m.nom}</p>
                       <button onClick={(e) => { e.stopPropagation(); removeMed(m.id); }} className="text-slate-300 hover:text-rose-500 transition-colors">
                         <Trash2 className="w-4 h-4"/>
                       </button>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{m.posologie || "Posologie libre"}</p>
                    <div className="mt-3 flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded uppercase">{m.duree || "N/A"}</span>
                       <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter truncate">{m.instructions || ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 space-y-4">
              <button 
                onClick={handleSave} 
                disabled={loading || (meds.length === 0 && !currentMed.nom)}
                className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-emerald-300 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 border-2 border-emerald-400 active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle className="w-5 h-5"/> VALIDER TOUT</>}
              </button>
              <button onClick={() => navigate(`/medecin/dossier/${id}`)}
                className="w-full py-4 bg-white text-slate-400 border-2 border-slate-100 rounded-[2rem] font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                Tout annuler
              </button>
            </div>
          </Card>
        </div>

        {/* Main Form: Saisie en cours */}
        <div className="lg:col-span-8 space-y-8">
          {errors.length > 0 && (
            <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-[2rem] flex items-center gap-4 animate-slideDown shadow-lg shadow-rose-200/20">
              <AlertCircle className="w-6 h-6 text-rose-500"/>
              <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest">{errors[0]}</p>
            </div>
          )}

          <div className={`transition-all duration-500 ${isAdding ? 'opacity-0 scale-95 translate-x-[-100px]' : 'opacity-100 scale-100 translate-x-0'}`}>
            <Card className="rounded-[4rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-12 bg-white relative overflow-hidden group">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 transition-all group-hover:scale-110 opacity-50" />
              
              <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-[1.8rem] flex items-center justify-center shadow-sm">
                    <Pill className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-1.5 bg-emerald-500 rounded-full" />
                      <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                        {meds.find(m => m.id === currentMed.id) ? "Modification Médicament" : "Saisie d'un Médicament"}
                      </h3>
                    </div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 ml-9">Élément de prescription actif</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Nom du médicament <span className="text-rose-500 text-lg">*</span></label>
                  <input 
                    value={currentMed.nom} 
                    onChange={e => setCurrentMed(p => ({...p, nom: e.target.value}))}
                    placeholder="Ex: Paracétamol 1g, Amoxicilline 500mg..."
                    className="w-full px-8 py-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 text-base font-bold transition-all placeholder-slate-300 shadow-inner"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Posologie / Fréquence</label>
                  <input 
                    value={currentMed.posologie} 
                    onChange={e => setCurrentMed(p => ({...p, posologie: e.target.value}))}
                    placeholder="Ex: 1 comp. matin et soir"
                    className="w-full px-8 py-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 text-base font-bold transition-all placeholder-slate-300 shadow-inner"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Durée du traitement</label>
                  <input 
                    value={currentMed.duree} 
                    onChange={e => setCurrentMed(p => ({...p, duree: e.target.value}))}
                    placeholder="Ex: 7 jours, 1 mois..."
                    className="w-full px-8 py-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 text-base font-bold transition-all placeholder-slate-300 shadow-inner"
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Instructions particulières</label>
                  <textarea 
                    value={currentMed.instructions} 
                    onChange={e => setCurrentMed(p => ({...p, instructions: e.target.value}))}
                    rows={3}
                    placeholder="Ex: À prendre au milieu des repas..."
                    className="w-full px-8 py-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 text-base font-bold transition-all placeholder-slate-300 shadow-inner resize-none"
                  />
                </div>
              </div>

              <div className="mt-12 flex justify-end">
                <button 
                  onClick={handleAddMed}
                  className="group flex items-center gap-6 px-14 py-7 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-emerald-300 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 border-2 border-emerald-400"
                >
                  <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-500" />
                  {meds.find(m => m.id === currentMed.id) ? "METTRE À JOUR" : "AJOUTER À L'ORDONNANCE"}
                </button>
              </div>
            </Card>

            <div className="mt-12 p-10 bg-blue-50/50 border-2 border-blue-100 border-dashed rounded-[3rem] flex items-center gap-8 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-2 border-blue-200 shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                <Info className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Aide au praticien</p>
                <p className="text-sm font-bold text-blue-700 leading-relaxed max-w-xl">Une fois vos médicaments ajoutés à la liste de gauche, cliquez sur le bouton <span className="font-black uppercase tracking-tighter">Valider Tout</span> pour enregistrer définitivement la prescription.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
