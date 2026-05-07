import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { prescriptionsAPI } from "../services/api";
import { Printer, ArrowLeft, Pill, Calendar, User, Hospital, ShieldCheck, Download } from "lucide-react";

export function PrescriptionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Note: On suppose qu'un endpoint exist pour récup une prescription par son ID
      // Dans api.ts, patientsAPI.getPrescription(id) ou similaire
      fetch(`http://localhost:8000/api/prescriptions.php?id=${id}`)
        .then(res => res.json())
        .then(data => {
            // L'API GET /prescriptions.php?id=X renvoie une liste, on prend le premier
            if (Array.isArray(data)) setPrescription(data[0]);
            else setPrescription(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex h-screen bg-slate-100 items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!prescription) return (
    <div className="p-10 text-center bg-slate-100 min-h-screen">
      <p className="text-slate-500 font-bold uppercase tracking-widest">Ordonnance introuvable.</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-emerald-600 font-black uppercase text-xs tracking-widest">Retour</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 print:bg-white print:p-0">
      {/* Top Controls - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-slate-500 hover:text-emerald-600 transition-all font-black uppercase text-[10px] tracking-widest">
           <ArrowLeft className="w-4 h-4"/> Retour
        </button>
        <div className="flex gap-4">
            <button onClick={handlePrint} className="flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all">
                <Printer className="w-4 h-4"/> Imprimer l'ordonnance
            </button>
            <button className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                <Download className="w-4 h-4"/> PDF
            </button>
        </div>
      </div>

      {/* The Prescription Document */}
      <Card className="max-w-4xl mx-auto p-12 md:p-20 bg-white shadow-2xl border-2 border-slate-100 rounded-[3rem] print:shadow-none print:border-none print:rounded-none relative overflow-hidden">
        
        {/* Decorative Background for screen only */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-30 print:hidden" />

        {/* Header: Hospital Info */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-4 border-emerald-500 pb-12 mb-12">
          <div className="flex items-center gap-6 mb-6 md:mb-0">
             <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Hospital className="w-10 h-10 text-white"/>
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">CarnetPlus</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Hôpital Central de Cotonou</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bénin • +229 21 30 01 00</p>
             </div>
          </div>
          <div className="text-right">
             <div className="bg-emerald-50 px-4 py-2 rounded-lg inline-block border border-emerald-100 mb-2">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">ORDONNANCE MÉDICALE</p>
             </div>
             <p className="text-sm font-black text-slate-900">N° {prescription.id?.toString().padStart(6, '0')}</p>
             <p className="text-xs font-bold text-slate-500 mt-1 flex items-center justify-end gap-2">
                <Calendar className="w-3 h-3"/> {new Date(prescription.created_at).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'})}
             </p>
          </div>
        </div>

        {/* Body: Patient & Doctor Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] border-b border-emerald-50 pb-2">Praticien</h4>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <User className="w-5 h-5 text-slate-400"/>
                 </div>
                 <div>
                    <p className="font-black text-slate-900 uppercase">Dr. {prescription.medecin_nom}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Médecin Généraliste</p>
                 </div>
              </div>
           </div>
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] border-b border-emerald-50 pb-2">Patient</h4>
              <div>
                 <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">{prescription.patient_nom}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Dossier: {prescription.numero_dossier}</p>
              </div>
           </div>
        </div>

        {/* Prescription Content */}
        <div className="mb-20">
           <div className="flex items-center gap-4 mb-10">
              <span className="w-12 h-1.5 bg-emerald-500 rounded-full"/>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Médicaments & Posologie</h2>
           </div>

           <div className="space-y-8">
              {prescription.medicaments?.map((med: any, i: number) => (
                 <div key={i} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                       <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-200 text-emerald-600 font-black text-xs">
                          {i+1}
                       </div>
                       {i < prescription.medicaments.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-2" />}
                    </div>
                    <div className="flex-1 pb-8">
                       <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{med.nom_medicament}</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Posologie</p>
                             <p className="font-bold text-slate-700 text-sm">{med.posologie || "À définir"}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Durée</p>
                             <p className="font-bold text-slate-700 text-sm">{med.duree || "N/A"}</p>
                          </div>
                       </div>
                       {med.instructions && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Instructions</p>
                             <p className="text-xs text-slate-600 font-medium leading-relaxed">{med.instructions}</p>
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Footer: Signature & Security */}
        <div className="flex flex-col md:flex-row justify-between items-end pt-12 border-t-2 border-slate-50 italic">
           <div className="flex items-center gap-3 text-slate-300">
              <ShieldCheck className="w-12 h-12 opacity-50"/>
              <div>
                 <p className="text-[8px] font-black uppercase tracking-widest">Document Certifié CarnetPlus</p>
                 <p className="text-[8px] font-bold">Authenticité vérifiable via code QR</p>
              </div>
           </div>
           <div className="text-center md:text-right mt-12 md:mt-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-12">Signature & Cachet du Praticien</p>
              <div className="w-48 h-20 border-b-2 border-slate-200 border-dashed mx-auto md:ml-auto" />
           </div>
        </div>

        {/* Print only footer */}
        <div className="hidden print:block absolute bottom-8 left-1/2 -translate-x-1/2 text-[8px] text-slate-400 font-bold uppercase tracking-widest">
           Généré par CarnetPlus — La Santé Connectée
        </div>
      </Card>
    </div>
  );
}
