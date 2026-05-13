import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, Mail, Lock, Heart, Stethoscope, Pill, Shield,
  FlaskConical, ArrowRight, User, Eye, EyeOff, AlertCircle, X,
  Building2, MapPin, Phone, Plus, Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adhesionsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function EcgLine() {
  return (
    <svg viewBox="0 0 500 80" className="w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
      <polyline
        points="0,40 60,40 80,40 95,10 110,65 125,5 140,55 155,40 220,40 240,30 255,50 270,40 500,40"
        stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 800, strokeDashoffset: 800, animation: "drawEcg 3s ease forwards 0.5s" }}
      />
      <style>{`@keyframes drawEcg{to{stroke-dashoffset:0}}`}</style>
    </svg>
  );
}

export function Login() {
  const navigate = useNavigate();
  const { user, login, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showAdhesion, setShowAdhesion] = useState(false);

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (user) {
      const routes = {
        admin: '/admin',
        medecin: '/medecin',
        secretaire: '/secretaire',
        labo: '/labo',
        patient: '/patient',
        gestionnaire: '/gestionnaire'
      };
      navigate(routes[user.role] || '/');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    if (!email || !password) { setLocalError("Veuillez remplir tous les champs."); return; }
    setLocalError("");
    clearError();
    setLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      setLocalError(e.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setLocalError("");
    clearError();
  };

  // Auto-close error after 5 seconds
  useEffect(() => {
    if (localError || error) {
      const timer = setTimeout(handleCloseError, 5000);
      return () => clearTimeout(timer);
    }
  }, [localError, error]);

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-white">
      {/* ── Top Floating Error (Toast Style) ── */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 transition-all duration-500 transform ${displayError ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0 pointer-events-none"
          }`}
      >
        <div className="bg-white rounded-2xl shadow-[0_20px_40px_rgba(225,29,72,0.15)] border border-rose-100 p-4 flex items-center gap-4 relative overflow-hidden">
          {/* Progress bar timer */}
          <div className="absolute bottom-0 left-0 h-1 bg-rose-500 transition-all duration-[5000ms] ease-linear"
            style={{ width: displayError ? '100%' : '0%' }} />

          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-rose-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-rose-900 font-bold text-sm">Action Requise</h4>
            <p className="text-rose-600/80 text-xs mt-0.5 font-medium">{displayError}</p>
          </div>
          <button
            onClick={handleCloseError}
            className="p-2 hover:bg-rose-50 rounded-lg transition-colors text-rose-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Left Panel (Original) ── */}
      <div className="hidden lg:flex flex-col w-[55%] bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-400/10 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float" />

        <div className="p-8 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-widest">CARNETPLUS</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-16 relative z-10">
          <svg viewBox="0 0 420 320" fill="none" className="w-full max-w-lg animate-fadeIn delay-300" xmlns="http://www.w3.org/2000/svg">
            <rect x="80" y="120" width="260" height="170" rx="8" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
            <rect x="120" y="100" width="180" height="190" rx="8" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
            <rect x="192" y="118" width="36" height="12" rx="6" fill="white" fillOpacity="0.8" />
            <rect x="202" y="108" width="16" height="32" rx="6" fill="white" fillOpacity="0.8" />
            {[140, 185, 230, 275].map((x, i) => (
              <rect key={i} x={x} y="160" width="28" height="28" rx="4" fill="white" fillOpacity={i % 2 === 0 ? 0.4 : 0.25} />
            ))}
            {[140, 185, 230, 275].map((x, i) => (
              <rect key={i + 4} x={x} y="205" width="28" height="28" rx="4" fill="white" fillOpacity={i % 2 === 0 ? 0.25 : 0.4} />
            ))}
            <rect x="186" y="250" width="48" height="40" rx="4" fill="white" fillOpacity="0.3" />
            <circle cx="228" cy="270" r="3" fill="white" fillOpacity="0.8" />
            <g className="animate-float" style={{ animationDelay: "0s" }}>
              <circle cx="330" cy="185" r="22" fill="white" fillOpacity="0.2" />
              <circle cx="330" cy="178" r="14" fill="white" fillOpacity="0.5" />
              <rect x="314" y="190" width="32" height="40" rx="8" fill="white" fillOpacity="0.35" />
              <rect x="319" y="198" width="22" height="2.5" rx="1" fill="white" fillOpacity="0.6" />
              <path d="M322 215 Q316 224 320 230" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              <circle cx="320" cy="231" r="4" fill="white" fillOpacity="0.5" />
            </g>
            <g className="animate-float" style={{ animationDelay: "0.7s" }}>
              <rect x="20" y="140" width="80" height="55" rx="8" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
              <text x="32" y="160" fill="white" fontSize="8" fontFamily="sans-serif" fillOpacity="0.7">Patients</text>
              <text x="32" y="176" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">1,247</text>
              <text x="32" y="188" fill="#86efac" fontSize="8" fontFamily="sans-serif">+87 ce mois</text>
            </g>
            <g className="animate-float" style={{ animationDelay: "1.3s" }}>
              <rect x="20" y="215" width="80" height="55" rx="8" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
              <text x="32" y="235" fill="white" fontSize="8" fontFamily="sans-serif" fillOpacity="0.7">Consultations</text>
              <text x="32" y="251" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">342</text>
              <text x="32" y="263" fill="#86efac" fontSize="8" fontFamily="sans-serif">Cette semaine</text>
            </g>
            <g className="animate-heartbeat" style={{ transformOrigin: "75px 80px" }}>
              <path d="M63 80 C63 70 73 65 78 72 C83 65 93 70 93 80 C93 91 78 101 78 101 C78 101 63 91 63 80Z" fill="#fca5a5" />
            </g>
            <g transform="translate(80,60)">
              <polyline
                points="0,20 30,20 45,5 58,32 70,2 82,25 95,20 260,20"
                stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeOpacity="0.6"
                style={{ strokeDasharray: 500, strokeDashoffset: 500, animation: "drawEcg2 2.5s ease forwards 0.8s" }}
              />
            </g>
          </svg>
          <div className="text-center mt-6 animate-fadeInUp delay-500">
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Plateforme de Santé</h2>
            <p className="text-blue-200 text-lg">Connectée · Sécurisée · Interopérable</p>
          </div>
          <div className="flex gap-3 mt-6 flex-wrap justify-center animate-fadeInUp delay-700">
            {[
              { icon: Heart, label: "Suivi patient" }, { icon: Stethoscope, label: "Consultations" },
              { icon: Pill, label: "Prescriptions" }, { icon: FlaskConical, label: "Labo" }, { icon: Shield, label: "Sécurisé" }
            ].map(({ icon: Icon, label }, i) => (
              <div key={label} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                <Icon className="w-3.5 h-3.5 text-blue-200" />
                <span className="text-white/80 text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 relative z-10"><EcgLine /></div>
      </div>

      {/* ── Right Panel (Professional Form) ── */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-50 overflow-auto">
        <div className="w-full max-w-[440px] animate-fadeInUp">
          <div className="bg-white rounded-[2rem] md:rounded-[32px] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="flex flex-col items-center mb-8 md:mb-10 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 md:mb-6 ring-4 md:ring-8 ring-blue-50/50">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                  <User className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Connexion</h2>
              <p className="text-slate-600 mt-2 text-xs md:text-sm max-w-[280px]">Connectez-vous pour accéder à vos services CarnetPlus.</p>
            </div>

            <div className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Adresse Email</label>
                <div className="group relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all text-slate-900 text-sm md:text-base"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Mot de passe</label>
                <div className="group relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className="w-full pl-12 pr-12 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all text-slate-900 text-sm md:text-base"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-end mt-2 mr-1">
                  <button onClick={() => navigate('/forgot-password')} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none uppercase tracking-widest">Mot de passe oublié ?</button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full mt-4 py-3.5 md:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group text-sm md:text-base"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                ) : (
                  <>
                    <span>Accéder à mon espace</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="relative flex items-center justify-center mt-6 mb-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative px-4 bg-white text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-600">Ou</div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowAdhesion(true)}
                className="w-full py-3.5 md:py-4 bg-slate-50 border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 group text-sm md:text-base"
              >
                <Building2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Rejoindre le réseau</span>
              </button>
            </div>
          </div>
          <p className="text-center text-[9px] md:text-[10px] text-slate-600 mt-8 font-bold uppercase tracking-widest opacity-50">
            CarnetPlus Shield · Plateforme Sécurisée
          </p>
        </div>
      </div>

      {/* Adhésion Modal */}
      <AnimatePresence>
        {showAdhesion && (
          <AdhesionModal onClose={() => setShowAdhesion(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function AdhesionModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    nom_etablissement: "", type_structure: "clinique", adresse: "",
    ville: "", nom_responsable: "", email_contact: "", telephone: "", motif: ""
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

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
      >
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Rejoindre CarnetPlus</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Demande d'adhésion partenaire</p>
          </div>
          <button onClick={onClose} className="p-2 md:p-3 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto">
          {success ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 uppercase">Demande Envoyée !</h3>
              <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto font-medium">Votre demande a été transmise. Notre équipe vous contactera pour finaliser l'adhésion.</p>
              <button onClick={onClose} className="mt-8 w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200">
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Type d'établissement</label>
                  <select
                    value={form.type_structure}
                    onChange={e => setForm({...form, type_structure: e.target.value})}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 appearance-none"
                  >
                    <option value="hopital">Hôpital</option>
                    <option value="clinique">Clinique</option>
                    <option value="cabinet">Cabinet Médical</option>
                    <option value="laboratoire">Laboratoire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Nom de la structure</label>
                  <input
                    required
                    type="text"
                    value={form.nom_etablissement}
                    onChange={e => setForm({...form, nom_etablissement: e.target.value})}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold placeholder:font-medium"
                    placeholder="Ex: Clinique Saint-Jean"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Ville</label>
                  <input
                    required
                    type="text"
                    value={form.ville}
                    onChange={e => setForm({...form, ville: e.target.value})}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold placeholder:font-medium"
                    placeholder="Ex: Cotonou"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Nom du responsable</label>
                  <input
                    required
                    type="text"
                    value={form.nom_responsable}
                    onChange={e => setForm({...form, nom_responsable: e.target.value})}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold placeholder:font-medium"
                    placeholder="Ex: Dr. Martin"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Email Contact</label>
                  <input
                    required
                    type="email"
                    value={form.email_contact}
                    onChange={e => setForm({...form, email_contact: e.target.value})}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold placeholder:font-medium"
                    placeholder="contact@clinique.bj"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Téléphone</label>
                  <input
                    required
                    type="tel"
                    value={form.telephone}
                    onChange={e => setForm({...form, telephone: e.target.value})}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold placeholder:font-medium"
                    placeholder="Ex: 90 00 00 00"
                  />
                </div>
              </div>
              <button
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-blue-200 active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <><Send className="w-4 h-4"/> Soumettre la demande</>}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

