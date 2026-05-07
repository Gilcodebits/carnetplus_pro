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
    <div className="flex h-screen bg-slate-200 items-center justify-center">
      <div className="text-center p-12 bg-white rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"/>
        <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Recherche des médecins certifiés…</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-200">
      <Sidebar role="patient" activePath="/patient" />
      <div className="flex-1 overflow-auto p-10 animate-fadeIn">
        <button onClick={() => navigate("/patient")} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-8 transition-all font-black text-[10px] uppercase tracking-widest bg-white px-5 py-2.5 rounded-xl border-2 border-slate-100 shadow-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour au tableau de bord
        </button>

        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-10">Trouver un Praticien</h1>

        <Card className="mb-8 border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
            <div className="w-2 h-6 bg-blue-600 rounded-full" /> Paramètres de recherche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Spécialité Médicale</label>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={specialite} 
                  onChange={e => setSpecialite(e.target.value)} 
                  placeholder="Ex: Cardiologue, Pédiatre..." 
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-900 text-sm shadow-inner"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Localisation / Ville</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={localisation} 
                  onChange={e => setLocalisation(e.target.value)} 
                  placeholder="Ex: Cotonou, Porto-Novo..." 
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-900 text-sm shadow-inner"
                />
              </div>
            </div>
          </div>
          <button className="mt-8 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.01] transition-all border-2 border-blue-500">
            Lancer la recherche multicritères
          </button>
        </Card>

        <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-white">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Médecins disponibles ({medecins.length})</h2>
          <div className="space-y-6">
            {medecins.map((medecin) => (
              <div
                key={medecin.id}
                onClick={() => navigate("/patient/calendrier-rdv")}
                className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] hover:bg-white hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-200/30 transition-all cursor-pointer group animate-fadeInUp shadow-sm"
              >
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-200 border-2 border-white/20 group-hover:scale-110 transition-transform">
                        {medecin.prenom[0]}{medecin.nom[0]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Dr. {medecin.prenom} {medecin.nom}</h3>
                        <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                           {medecin.role === 'medecin' ? 'Médecine Générale' : medecin.role}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-0 md:ml-24">
                      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <MapPin className="w-5 h-5 text-slate-400" />
                        <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{medecin.etablissement_nom || "Hôpital Central de Cotonou"}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-black text-yellow-700 text-xs">4.9</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
                          <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Libre aujourd'hui</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full md:w-auto px-10 py-5 bg-white border-2 border-blue-600 text-blue-600 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-100 group-hover:scale-105 active:scale-95">
                    Prendre RDV
                  </button>
                </div>
              </div>
            ))}
            {medecins.length === 0 && (
              <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 shadow-inner">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                   <Search className="w-10 h-10 text-slate-200"/>
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Aucun praticien ne correspond à ces critères</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
