import { motion } from "framer-motion";
import { 
  Activity, Shield, Zap, Users, Heart, ArrowRight, 
  CheckCircle2, Globe, MessageSquare, Bot, 
  Stethoscope, TestTube, BarChart3, Building2,
  ChevronRight, Star, Play, Layers, TrendingUp,
  Award, ShieldCheck, Sparkles, Smartphone, UserCheck
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const features = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Sécurité de Niveau Bancaire",
    description: "Données cryptées de bout en bout, conformes aux normes internationales HDS.",
    color: "blue"
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "Diagnostics Assistés par IA",
    description: "Algorithmes de pointe pour aider les praticiens à détecter les anomalies précocement.",
    color: "indigo"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instantanéité Totale",
    description: "Zéro attente. Les résultats sont transmis dès validation par le laboratoire.",
    color: "teal"
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Accès Patient Universel",
    description: "Votre historique médical complet dans votre poche, disponible à tout moment.",
    color: "emerald"
  }
];

export function Landing() {
  const navigate = useNavigate();
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-600 scroll-smooth scrollbar-hide">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer shrink-0" onClick={() => navigate('/')}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Activity className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="font-black text-lg md:text-xl tracking-tighter uppercase">CarnetPlus</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            <button onClick={() => scrollToSection('features')} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Solutions</button>
            <button onClick={() => scrollToSection('pro')} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Établissements</button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/login" className="text-[10px] md:text-sm font-black md:font-bold text-slate-600 hover:text-blue-600 px-2 md:px-4 py-2 transition-colors uppercase tracking-widest">
              Connexion
            </Link>
            <Link to="/rejoindre" className="bg-slate-900 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-sm font-black md:font-bold hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95 uppercase tracking-widest text-center">
              Rejoindre <span className="hidden sm:inline">le Réseau</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100/50 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-6 md:mb-8 mx-auto lg:mx-0">
                <Sparkles className="w-3 h-3" />
                Plateforme de Santé N°1 en Afrique
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6 md:mb-8">
                Digitalisez votre <br />
                <span className="text-blue-600">Établissement.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-8 md:mb-10 max-w-lg font-medium mx-auto lg:mx-0">
                La solution complète pour les cliniques, hôpitaux et laboratoires souhaitant offrir une expérience patient d'excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button 
                  onClick={() => navigate('/rejoindre')}
                  className="w-full sm:w-auto bg-blue-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                >
                  Démarrez maintenant <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mx-auto max-w-lg lg:max-w-none"
            >
              <div className="relative z-10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border-4 md:border-8 border-white">
                <img src="/images/landing/hero.png" alt="Interface Pro" className="w-full h-auto" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEW: Patient Focus Section (Right after Hero) */}
      <section className="py-16 md:py-24 bg-blue-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Pour Tous les Citoyens</h2>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
                Plus qu'un logiciel de gestion, <br />
                votre <span className="text-blue-600">compagnon de santé personnel.</span>
              </h3>
              <p className="text-slate-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed mx-auto">
                CarnetPlus n'est pas seulement destiné aux hôpitaux. C'est une plateforme conçue pour vous donner le plein contrôle sur votre santé, celle de vos enfants et de vos parents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16 md:mb-20">
          <h2 className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Solutions 360°</h2>
          <p className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Une plateforme interconnectée.</p>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 group transition-all"
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl mb-6 md:mb-8 flex items-center justify-center transition-all ${
                f.color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                f.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' :
                f.color === 'teal' ? 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white' :
                'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
              }`}>
                {f.icon}
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 mb-3 md:mb-4">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* IA Section Preview */}
      <section id="ia" className="py-20 md:py-32 overflow-hidden bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-6 md:mb-8 mx-auto lg:mx-0">
                <Bot className="w-4 h-4" />
                CarnetPlus AI
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 md:mb-8 leading-tight">L'intelligence artificielle <br /> qui veille sur vous.</h2>
              <p className="text-slate-600 text-lg md:text-xl mb-10 md:mb-12 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Analyse de symptômes, aide au diagnostic et interprétation des résultats. Découvrez comment notre IA révolutionne la médecine préventive.
              </p>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-slate-900 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-3 mx-auto lg:mx-0">
                En savoir plus <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 md:border-8 border-white/5 shadow-2xl">
                 <img src="/images/landing/features.png" alt="IA Santé" className="w-full h-auto opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pro Value Proposition */}
      <section id="pro" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="order-2 lg:order-1 relative mx-auto max-w-lg lg:max-w-none">
               <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 md:border-8 border-slate-50 shadow-2xl">
                 <img src="/images/landing/establishments.png" alt="Hospital Management" className="w-full h-auto" />
               </div>
            </div>
            
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-6">Établissements & Partenaires</h2>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 md:mb-10 leading-tight">
                Gérez votre établissement avec une précision absolue.
              </h3>
              
              <div className="space-y-6 md:space-y-8 text-left max-w-xl mx-auto lg:mx-0">
                {[
                  { icon: <BarChart3 className="w-6 h-6" />, title: "Analytics Avancés", desc: "Suivez vos flux de patients et vos revenus en temps réel." },
                  { icon: <Layers className="w-6 h-6" />, title: "Centralisation Totale", desc: "Fini les dossiers papier. Tout est synchronisé entre vos services." },
                  { icon: <Award className="w-6 h-6" />, title: "Conformité & Audit", desc: "Répondez aux exigences réglementaires sans effort." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 md:gap-6 items-start">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-base md:text-lg font-black mb-1 leading-tight">{item.title}</h4>
                      <p className="text-slate-500 text-xs md:text-sm font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => navigate('/rejoindre')}
                className="mt-10 md:mt-12 bg-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-3 mx-auto lg:mx-0"
              >
                Devenir Partenaire <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 md:py-32 bg-blue-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-8 md:10 text-blue-100" />
          <h2 className="text-3xl md:text-5xl font-black mb-6 md:mb-8 leading-tight">Vos données sont sacrées.</h2>
          <p className="text-blue-100/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 md:mb-12 font-medium leading-relaxed">
            CarnetPlus utilise le chiffrement AES-256 et respecte les normes HDS pour garantir la confidentialité absolue de votre vie privée.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
             <div className="px-5 md:px-6 py-2 md:py-3 rounded-full border border-white/20 text-[8px] md:text-[10px] font-black tracking-widest uppercase">ISO 27001 Certified</div>
             <div className="px-5 md:px-6 py-2 md:py-3 rounded-full border border-white/20 text-[8px] md:text-[10px] font-black tracking-widest uppercase">RGPD / HDS Compliant</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-20 md:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-20 mb-16 md:mb-20">
            <div className="col-span-1 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="font-black text-xl tracking-tighter uppercase">CarnetPlus</span>
              </div>
              <p className="text-slate-500 leading-relaxed font-medium max-w-sm">La première plateforme de santé interconnectée d'Afrique. Redéfinir le soin par l'innovation.</p>
            </div>
            {[
              { title: "Plateforme", items: ["Patients", "Médecins", "Laboratoires", "Établissements"] },
              { title: "IA Santé", items: ["Diagnostics", "Prévention", "Assistance 24/7", "Données"] },
              { title: "Légal", items: ["Confidentialité", "Sécurité", "Mentions Légales", "Cookies"] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-black text-slate-900 mb-6 md:mb-8 uppercase text-[10px] md:text-xs tracking-widest">{col.title}</h4>
                <ul className="space-y-3 md:space-y-4">
                  {col.items.map(item => (
                    <li key={item}><a href="#" className="text-xs md:text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">{item}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <p className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-widest">© 2026 CarnetPlus Health. Tout droit réservé.</p>
            <div className="flex gap-6">
              <div className="w-5 h-5 bg-slate-200 rounded-full" />
              <div className="w-5 h-5 bg-slate-200 rounded-full" />
              <div className="w-5 h-5 bg-slate-200 rounded-full" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

