import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { prescriptionsAPI } from "../services/api";
import { Printer, ArrowLeft, Pill, Calendar, User, Hospital, ShieldCheck, Download, FileText } from "lucide-react";
import { formatDate } from "../utils/format";

export function PrescriptionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      prescriptionsAPI.get(Number(id))
        .then(data => {
            // L'API GET /prescriptions.php?id=X renvoie l'objet directement ou un tableau
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

  if (!prescription && loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"/>
          <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-[8px]">Sécurisation du flux...</p>
        </div>
      </div>
    );
  }

  if (!prescription && !loading) return (
    <div className="p-10 text-center bg-slate-50 min-h-screen flex flex-col items-center justify-center">
      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl text-slate-200">
         <FileText className="w-10 h-10" />
      </div>
      <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Ordonnance introuvable.</p>
      <button onClick={() => navigate(-1)} className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all">Retour</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-3 md:p-12 print:bg-white print:p-0 w-full max-w-full overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 1cm; size: A4; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white !important; }
          
          /* CRITICAL: Allow parents to expand */
          html, body, #root, [class*="overflow-hidden"], .flex-1, main { 
            overflow: visible !important; 
            height: auto !important; 
            display: block !important;
          }

          /* Force hide everything except the card */
          body * { visibility: hidden !important; }
          #prescription-card, #prescription-card * { visibility: visible !important; }

          #prescription-card { 
            display: block !important;
            position: absolute !important; 
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            opacity: 1 !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          /* Restore layouts */
          #prescription-card .flex { display: flex !important; }
          #prescription-card .grid { display: grid !important; }
        }
      `}} />
      {/* Top Controls - Hidden on Print */}
      <div className="max-w-5xl mx-auto mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-slate-500 hover:text-emerald-600 transition-all font-black uppercase text-[10px] tracking-widest group self-start md:self-auto">
           <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
             <ArrowLeft className="w-4 h-4"/>
           </div>
           Retour
        </button>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={handlePrint} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-[1.5rem] font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-300 hover:bg-emerald-600 hover:-translate-y-1 transition-all active:scale-95">
                <Printer className="w-4 h-4 md:w-5 md:h-5 text-emerald-400"/> <span className="hidden sm:inline">Télécharger</span> <span className="inline sm:hidden">Imprimer</span>
            </button>
        </div>
      </div>

      {/* The Prescription Document */}
      <Card id="prescription-card" noPadding className="max-w-5xl mx-auto bg-white shadow-xl border border-slate-200 rounded-2xl print:shadow-none print:border-none print:rounded-none relative overflow-hidden flex flex-col min-h-fit">
        
        {/* Header Section: Clinical Identity - COMPACT */}
        <div className="p-5 md:p-8 border-b-2 border-emerald-500 bg-slate-50/30">
          <div className="flex flex-row justify-between items-center gap-4">
            <div className="min-w-0">
               <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none italic print-title truncate">Carnet<span className="text-emerald-600">Plus</span></h1>
               <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1.5 md:mt-2">
                  <p className="text-[8px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest">Dr. {prescription.medecin_nom}</p>
                  <span className="hidden sm:inline text-[9px] font-bold text-slate-600 uppercase tracking-widest">{prescription.medecin_tel}</span>
               </div>
            </div>
            <div className="text-right shrink-0">
               <p className="text-sm md:text-xl font-black text-slate-900 tracking-tighter leading-none">N° {prescription.id?.toString().padStart(6, '0')}</p>
               <p className="text-[7px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Le {formatDate(prescription.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Patient & Doctor Context - ULTRA COMPACT SINGLE ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-100 md:divide-x divide-slate-100">
           <div className="px-5 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 border-b md:border-b-0 border-slate-100">
              <span className="text-[7px] md:text-[8px] font-black text-emerald-600 uppercase tracking-widest">Praticien:</span>
              <p className="text-[9px] md:text-[11px] font-black text-slate-900 uppercase">{prescription.medecin_nom}</p>
           </div>
           <div className="px-5 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4">
              <span className="text-[7px] md:text-[8px] font-black text-emerald-600 uppercase tracking-widest">Patient:</span>
              <p className="text-[9px] md:text-[11px] font-black text-slate-900 uppercase truncate">{prescription.patient_nom}</p>
              <p className="text-[7px] md:text-[9px] font-bold text-slate-600 uppercase ml-auto">Dossier: {prescription.numero_dossier}</p>
           </div>
        </div>

        {/* Prescription List */}
        <div className="flex-1 p-6 md:p-10 relative">
           <div className="absolute top-20 right-20 opacity-[0.03] pointer-events-none print:hidden">
              <Pill className="w-96 h-96 rotate-12" />
           </div>

           <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12 relative z-10">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter print-title">Traitement</h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-full" />
           </div>

           <div className="space-y-8 relative z-10">
              {prescription.medicaments?.map((med: any, i: number) => (
                 <div key={i} className="flex gap-4 md:gap-8 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-lg md:rounded-[1.2rem] flex items-center justify-center text-emerald-400 font-black text-base md:text-lg shadow-xl shrink-0 print:w-10 print:h-10">
                       {i+1}
                    </div>
                    <div className="flex-1 pb-4 md:pb-6 border-b border-slate-50 group-last:border-0">
                       <div className="flex flex-col sm:flex-row justify-between items-start mb-3 md:mb-4 gap-2">
                          <div className="min-w-0">
                            <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1 print-text truncate">{med.nom_medicament}</h3>
                            <p className="text-[8px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest opacity-90 print-small">Pharma-Standard</p>
                          </div>
                          <div className="px-3 md:px-4 py-1 md:py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                            <p className="text-[7px] md:text-[9px] font-black text-emerald-700 uppercase tracking-widest print-small">{med.duree || "Traitement continu"}</p>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
                             <p className="text-[7px] md:text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 md:mb-2 print-small">Posologie</p>
                             <p className="font-black text-slate-900 text-sm md:text-base leading-snug uppercase tracking-tight print-text">{med.posologie || "À définir"}</p>
                          </div>
                          {med.instructions && (
                             <div className="p-3 md:p-4 bg-emerald-50/30 rounded-xl md:rounded-2xl border border-emerald-100/50">
                                <p className="text-[7px] md:text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1 md:mb-2 italic print-small">Instructions</p>
                                <p className="text-[10px] md:text-xs text-slate-700 font-bold leading-relaxed print-text">{med.instructions}</p>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Footer: Legal & Verification */}
        <div className="p-10 md:p-16 bg-slate-50/50 border-t-2 border-slate-100">
           <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-16">
              <div className="flex items-center gap-4 md:gap-10">
                 {/* Real QR Code using public API */}
                 <div className="w-20 h-20 md:w-28 md:h-28 bg-white p-2 rounded-xl md:rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-center relative overflow-hidden group shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`} 
                      alt="QR"
                      className="w-full h-full object-contain"
                    />
                 </div>
                 <div className="min-w-0">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-1 md:mb-2 print-small">Authenticité</p>
                    <p className="text-[7px] text-slate-600 font-bold max-w-xs leading-relaxed uppercase tracking-widest print-small truncate sm:whitespace-normal">
                       Ordonnance certifiée CarnetPlus.
                    </p>
                 </div>
              </div>
              
              <div className="text-center md:text-right">
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-12 print-small">Signature & Cachet Numérique</p>
                 <div className="relative inline-block">
                    <div className="absolute -top-10 -left-14 w-28 h-28 border-4 border-blue-600 rounded-full flex items-center justify-center -rotate-12 pointer-events-none opacity-80 print:opacity-100 bg-white/10 backdrop-blur-[1px]">
                       <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter text-center leading-tight">CERTIFIÉ<br/>CARNETPLUS<br/><span className="text-[7px]">ORIGINAL</span></p>
                    </div>
                    <div className="w-56 h-0.5 bg-slate-200 rounded-full" />
                    <p className="text-sm font-black text-slate-900 mt-4 uppercase italic tracking-widest print-text">Dr. {prescription.medecin_nom}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Global Print Footer */}
        <div className="hidden print:flex absolute bottom-12 left-20 right-20 justify-between items-center text-[9px] text-slate-500 font-black uppercase tracking-[0.4em]">
           <span>CarnetPlus Health Ecosystem</span>
           <span>Page 01/01</span>
           <span>Cotonou, Bénin</span>
        </div>
      </Card>
    </div>
  );
}

