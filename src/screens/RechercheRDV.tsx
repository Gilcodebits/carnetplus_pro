import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { utilisateursAPI } from "../services/api";
import { ArrowLeft, Search, MapPin, Star } from "lucide-react";

export function RechercheRDV() {
  const navigate = useNavigate();
  const [specialite, setSpecialite] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [medecins, setMedecins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedecins();
  }, []);

  const loadMedecins = async () => {
    setLoading(true);
    try {
      const data = await utilisateursAPI.list("medecin");
      setMedecins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500 font-medium">Recherche des médecins…</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="patient" activePath="/patient" />
      <div className="flex-1 overflow-auto p-8 animate-fadeIn">
        <button onClick={() => navigate("/patient")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group transition-all">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-all" /> Retour à l'accueil
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Prendre un rendez-vous</h1>

        <Card className="mb-6">
          <h2 className="text-xl font-bold mb-6">Rechercher un médecin</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Spécialité" value={specialite} onChange={setSpecialite} placeholder="Ex: Médecin généraliste, Cardiologue..." icon={<Search className="w-5 h-5" />} />
            <Input label="Localisation" value={localisation} onChange={setLocalisation} placeholder="Ville ou code postal" icon={<MapPin className="w-5 h-5" />} />
          </div>
          <Button variant="primary" className="mt-4">Rechercher</Button>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-6">Médecins disponibles</h2>
          <div className="space-y-4">
            {medecins.map((medecin) => (
              <div
                key={medecin.id}
                className="p-6 bg-white border border-gray-100 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer group animate-fadeInUp"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
                        {medecin.prenom[0]}{medecin.nom[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">Dr. {medecin.prenom} {medecin.nom}</h3>
                        <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">{medecin.role === 'medecin' ? 'Médecine Générale' : medecin.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2 ml-18">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{medecin.etablissement_nom || "Hôpital Central"}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 rounded-lg">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-yellow-700 text-sm">4.9</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">120+ avis</span>
                        <div className="flex items-center gap-1.5 text-green-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
                          <span className="text-xs font-bold uppercase tracking-tighter">Disponible aujourd'hui</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => navigate("/patient/calendrier-rdv")} variant="primary" className="shadow-lg shadow-blue-100">
                    Prendre RDV
                  </Button>
                </div>
              </div>
            ))}
            {medecins.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
                <p className="text-gray-500 font-medium">Aucun médecin ne correspond à votre recherche</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
