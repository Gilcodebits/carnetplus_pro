import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { CheckCircle, Calendar, Clock, MapPin, User } from "lucide-react";

export function ConfirmationRDV() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-slate-200">
      <Sidebar role="patient" activePath="/patient"/>
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-slate-200">
        <div className="max-w-2xl w-full animate-scaleIn">
          <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-12 bg-white rounded-[2.5rem]">
            <div className="text-center mb-10">
              <div className="relative w-28 h-28 mx-auto mb-8">
                <div className="absolute inset-0 bg-emerald-50 rounded-[2rem] animate-pulse border-2 border-emerald-100 shadow-inner"/>
                <div className="absolute inset-0 bg-emerald-200 rounded-[2rem] animate-ping opacity-20"/>
                <div className="relative w-28 h-28 bg-white border-2 border-emerald-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-100">
                  <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounceIn"/>
                </div>
              </div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-3 animate-fadeInUp delay-200">Rendez-vous confirmé !</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-fadeInUp delay-300 opacity-80">Votre rendez-vous a été enregistré avec succès dans nos systèmes.</p>
            </div>

            <div className="bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-8 mb-8 animate-fadeInUp delay-400 shadow-inner">
              <div className="space-y-6">
                {[
                  { icon:User, label:"Médecin Praticien", value:"Dr. Alain Rousseau", sub:"Médecine Générale" },
                  { icon:Calendar, label:"Date du Rendez-vous", value:"Lundi 5 Mai 2026" },
                  { icon:Clock, label:"Créneau Horaire", value:"10:30" },
                  { icon:MapPin, label:"Lieu de Consultation", value:"Hôpital Central — Cotonou" },
                ].map(({icon:Icon,label,value,sub},i)=>(
                  <div key={label} className={`flex items-center gap-5 animate-fadeInLeft delay-${(i+5)*100} group`}>
                    <div className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all">
                      <Icon className="w-7 h-7 text-blue-600"/>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
                      <p className="font-black text-slate-900 text-base uppercase tracking-tight">{value}</p>
                      {sub && <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mt-0.5">{sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-5 mb-10 animate-fadeInUp delay-600 flex gap-4 items-center shadow-sm">
              <span className="text-2xl">📧</span>
              <p className="text-[10px] text-amber-800 font-bold uppercase tracking-widest leading-relaxed">
                <strong>Rappel :</strong> Un email et un SMS de confirmation vous ont été envoyés. Pensez à arriver 10 minutes avant votre rendez-vous.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 animate-fadeInUp delay-700">
              <button onClick={()=>navigate("/patient")} className="py-5 bg-white border-2 border-slate-200 text-slate-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xl shadow-slate-200/50">Retour au portail</button>
              <button onClick={()=>navigate("/patient/recherche-rdv")} className="py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-blue-200 transition-all shadow-xl shadow-blue-100 border-2 border-blue-500">Prendre un autre RDV</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
