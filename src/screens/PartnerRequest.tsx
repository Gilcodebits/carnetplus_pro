import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Building2, Mail, Phone, MapPin, Send, 
  ArrowLeft, CheckCircle2, Shield, Activity
} from "lucide-react";
import { adhesionsAPI } from "../services/api";

export function PartnerRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom_etablissement: "", 
    type_structure: "clinique", 
    adresse: "",
    ville: "", 
    nom_responsable: "", 
    email_contact: "", 
    telephone: "", 
    motif: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adhesionsAPI.submit(form);
      setSuccess(true);
    } catch (err) {
      alert("Erreur lors de l'envoi de la demande. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100"
        >
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Demande Envoyée !</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            Merci pour votre intérêt ! Notre équipe examine votre demande d'adhésion et vous contactera sous 24h à 48h.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-blue-600 transition-all"
          >
            Retour à l'accueil
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-slate-50 flex flex-col scrollbar-hide">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
               <Activity className="w-6 h-6 text-white" />
             </div>
             <span className="font-black text-xl tracking-tighter uppercase text-slate-900">CarnetPlus</span>
          </div>
          <Link to="/" className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Annuler
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-5 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          {/* Sidebar info */}
          <div className="lg:col-span-2 bg-blue-50/50 p-12 text-slate-900 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-8 leading-tight">Rejoignez le premier réseau de santé.</h2>
              <p className="text-slate-500 mb-12 font-medium">
                Complétez ce formulaire pour initier l'intégration de votre établissement à la plateforme CarnetPlus.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Sécurité</p>
                    <p className="text-sm font-black text-slate-900">Données HDS / RGPD</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Accompagnement</p>
                    <p className="text-sm font-black text-slate-900">Installation en 48h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Type de Structure</label>
                  <select 
                    value={form.type_structure}
                    onChange={e => setForm({...form, type_structure: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-700"
                  >
                    <option value="clinique">Clinique</option>
                    <option value="hopital">Hôpital</option>
                    <option value="laboratoire">Laboratoire</option>
                    <option value="pharmacie">Pharmacie</option>
                    <option value="cabinet">Cabinet Médical</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nom de l'Établissement</label>
                  <input 
                    required
                    type="text"
                    value={form.nom_etablissement}
                    onChange={e => setForm({...form, nom_etablissement: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-700"
                    placeholder="Ex: Clinique du Soleil"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ville / Pays</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      required
                      type="text"
                      value={form.ville}
                      onChange={e => setForm({...form, ville: e.target.value})}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-700"
                      placeholder="Ex: Cotonou, Bénin"
                    />
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nom du Responsable</label>
                  <input 
                    required
                    type="text"
                    value={form.nom_responsable}
                    onChange={e => setForm({...form, nom_responsable: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-700"
                    placeholder="Ex: Dr. Kouamé"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Pro</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      required
                      type="email"
                      value={form.email_contact}
                      onChange={e => setForm({...form, email_contact: e.target.value})}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-700"
                      placeholder="direction@votreclinique.com"
                    />
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      required
                      type="tel"
                      value={form.telephone}
                      onChange={e => setForm({...form, telephone: e.target.value})}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-700"
                      placeholder="+229 XX XX XX XX"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Adresse Physique</label>
                  <input 
                    required
                    type="text"
                    value={form.adresse}
                    onChange={e => setForm({...form, adresse: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-700"
                    placeholder="Ex: Rue 123, Quartier Saint-Michel"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Informations Complémentaires & Besoins</label>
                  <textarea 
                    required
                    value={form.motif}
                    onChange={e => setForm({...form, motif: e.target.value})}
                    rows={3}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-700"
                    placeholder="Décrivez brièvement vos besoins et vos attentes..."
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-lg transition-all shadow-2xl shadow-blue-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Soumettre ma demande d'adhésion
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
