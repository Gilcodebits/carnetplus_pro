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
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="patient" activePath="/patient" />
      <div className="flex-1 overflow-auto p-8">
        <button onClick={() => navigate("/patient/recherche-rdv")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" /> Retour à la recherche
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Choisir un créneau</h1>
          <p className="text-gray-600 mt-2">Dr. Alain Rousseau — Médecine Générale</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Mai 2026</h2>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-6">
                {datesDisponibles.map((date) => (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                    className={`p-4 rounded-lg border-2 transition-all ${selectedDate === date ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                  >
                    <div className="text-center">
                      <p className="text-xs text-gray-600">{date.split(" ")[0]}</p>
                      <p className="font-bold text-lg">{date.split(" ")[1]}</p>
                      <p className="text-xs text-gray-600">{date.split(" ")[2]}</p>
                    </div>
                  </button>
                ))}
              </div>

              {selectedDate && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <h3 className="font-bold">Matin</h3>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {horairesMatin.map((heure) => (
                        <button
                          key={heure}
                          onClick={() => setSelectedTime(heure)}
                          className={`p-3 rounded-lg border text-sm transition-all ${selectedTime === heure ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}`}
                        >{heure}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <h3 className="font-bold">Après-midi</h3>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {horairesAprem.map((heure) => (
                        <button
                          key={heure}
                          onClick={() => setSelectedTime(heure)}
                          className={`p-3 rounded-lg border text-sm transition-all ${selectedTime === heure ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}`}
                        >{heure}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card>
              <h3 className="font-bold mb-4">Récapitulatif</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Médecin</p>
                  <p className="font-medium">Dr. Alain Rousseau</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className={`font-medium ${selectedDate ? "text-gray-900" : "text-gray-400"}`}>{selectedDate || "Non sélectionné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Heure</p>
                  <p className={`font-medium ${selectedTime ? "text-blue-600" : "text-gray-400"}`}>{selectedTime || "Non sélectionné"}</p>
                </div>
                <div className="pt-4 border-t">
                  <label className="text-sm text-gray-600 block mb-2">Motif</label>
                  <select
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Consultation générale</option>
                    <option>Contrôle</option>
                    <option>Renouvellement ordonnance</option>
                    <option>Urgence</option>
                  </select>
                </div>
                <Button onClick={handleConfirm} variant="primary" fullWidth disabled={!selectedDate || !selectedTime}>
                  Confirmer le RDV
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
