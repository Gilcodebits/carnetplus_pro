import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { CheckCircle, Calendar, Clock, MapPin, User } from "lucide-react";

export function ConfirmationRDV() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="patient" activePath="/patient"/>
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full animate-scaleIn">
          <Card>
            <div className="text-center mb-8">
              {/* Animated check */}
              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"/>
                <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-30"/>
                <div className="relative w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-14 h-14 text-green-600 animate-bounceIn"/>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-fadeInUp delay-200">Rendez-vous confirmé !</h1>
              <p className="text-gray-500 animate-fadeInUp delay-300">Votre rendez-vous a été enregistré avec succès</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100 animate-fadeInUp delay-400">
              <div className="space-y-4">
                {[
                  { icon:User, label:"Médecin", value:"Dr. Alain Rousseau — Médecine Générale" },
                  { icon:Calendar, label:"Date", value:"Lundi 5 Mai 2026" },
                  { icon:Clock, label:"Heure", value:"10:30" },
                  { icon:MapPin, label:"Lieu", value:"15 Rue de la Paix, 75002 Paris" },
                ].map(({icon:Icon,label,value},i)=>(
                  <div key={label} className={`flex items-center gap-4 animate-fadeInLeft delay-${(i+5)*100}`}>
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600"/>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="font-semibold text-gray-900">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 animate-fadeInUp delay-600">
              <p className="text-sm text-amber-800">
                📧 <strong>Rappel :</strong> Un email et un SMS de confirmation vous ont été envoyés. Pensez à arriver 10 minutes avant votre rendez-vous.
              </p>
            </div>

            <div className="flex gap-4 animate-fadeInUp delay-700">
              <Button onClick={()=>navigate("/patient")} variant="primary" fullWidth>Retour à l'accueil</Button>
              <Button onClick={()=>navigate("/patient/recherche-rdv")} variant="secondary" fullWidth>Prendre un autre RDV</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
