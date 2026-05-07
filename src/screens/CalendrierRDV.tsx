import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock } from "lucide-react";

export function CalendrierRDV() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [motif, setMotif] = useState("Consultation générale");

  const datesDisponibles = ["Lun 5 Mai", "Mar 6 Mai", "Mer 7 Mai", "Jeu 8 Mai", "Ven 9 Mai"];
  const horairesMatin = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  const horairesAprem = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

  const handleConfirm = () => {
    if (selectedDate && selectedTime) navigate("/patient/confirmation-rdv");
  };

  return (
    <div className="flex h-screen bg-slate-200">
      <Sidebar role="patient" activePath="/patient" />
      <div className="flex-1 overflow-auto p-10">
        <button onClick={() => navigate("/patient/recherche-rdv")} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-8 transition-all font-black text-[10px] uppercase tracking-widest bg-white px-5 py-2.5 rounded-xl border-2 border-slate-100 shadow-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour à la recherche
        </button>

        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Choisir un créneau</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Dr. Alain Rousseau — <span className="text-blue-600">Médecine Générale</span></p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-white">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Mai 2026</h2>
                <div className="flex gap-3">
                  <button className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                  <button className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 mb-10">
                {datesDisponibles.map((date) => (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                    className={`p-6 rounded-[2rem] border-2 transition-all group hover:scale-[1.02] ${selectedDate === date ? "border-blue-600 bg-blue-50 shadow-xl shadow-blue-100" : "border-slate-100 bg-slate-50/30 hover:border-blue-200"}`}
                  >
                    <div className="text-center">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${selectedDate === date ? "text-blue-600" : "text-slate-400"}`}>{date.split(" ")[0]}</p>
                      <p className={`text-2xl font-black tracking-tighter my-1 ${selectedDate === date ? "text-blue-700" : "text-slate-900"}`}>{date.split(" ")[1]}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${selectedDate === date ? "text-blue-600" : "text-slate-400"}`}>{date.split(" ")[2]}</p>
                    </div>
                  </button>
                ))}
              </div>

              {selectedDate && (
                <div className="space-y-10 animate-fadeInUp">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Matin</h3>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {horairesMatin.map((heure) => (
                        <button
                          key={heure}
                          onClick={() => setSelectedTime(heure)}
                          className={`p-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${selectedTime === heure ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105" : "border-slate-100 bg-slate-50/50 text-slate-400 hover:border-blue-200 hover:text-blue-600"}`}
                        >{heure}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
                        <Clock className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Après-midi</h3>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {horairesAprem.map((heure) => (
                        <button
                          key={heure}
                          onClick={() => setSelectedTime(heure)}
                          className={`p-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${selectedTime === heure ? "border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105" : "border-slate-100 bg-slate-50/50 text-slate-400 hover:border-indigo-200 hover:text-indigo-600"}`}
                        >{heure}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-8 bg-white">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Récapitulatif</h3>
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Médecin sélectionné</p>
                  <p className="font-black text-slate-900 text-base uppercase tracking-tight">Dr. Alain Rousseau</p>
                </div>
                <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date choisie</p>
                  <p className={`font-black text-base uppercase tracking-tight ${selectedDate ? "text-blue-600" : "text-slate-300 italic"}`}>{selectedDate || "Non sélectionné"}</p>
                </div>
                <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Horaire</p>
                  <p className={`font-black text-base uppercase tracking-tight ${selectedTime ? "text-indigo-600" : "text-slate-300 italic"}`}>{selectedTime || "Non sélectionné"}</p>
                </div>
                <div className="pt-6 border-t-2 border-slate-100">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">Motif de consultation</label>
                  <select
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option>Consultation générale</option>
                    <option>Contrôle</option>
                    <option>Renouvellement ordonnance</option>
                    <option>Urgence</option>
                  </select>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.01] transition-all border-2 border-blue-500 disabled:opacity-30 mt-4"
                >
                  Confirmer le rendez-vous
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
