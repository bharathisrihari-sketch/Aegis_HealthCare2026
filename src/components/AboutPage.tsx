import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  HeartPulse,
  Send,
  CheckCircle2,
  Users,
  FileText,
  Zap,
  Globe2,
  HelpCircle,
  Truck,
  AlertTriangle,
  Server,
  Bot,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface AboutPageProps {
  lang: LanguageCode;
}

export const AboutPage: React.FC<AboutPageProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    state: 'Tamil Nadu',
    subject: 'Emergency Stock Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;
    setSubmitted(true);
  };

  const emergencyHotlines = [
    {
      title: '24x7 Anti-Snake Venom (ASV) Rapid Dispatch Line',
      number: '1800-110-8899',
      subtitle: 'Toll-Free National Hotline for Urgent ASV & Anti-Rabies Transfers',
      iconColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
    },
    {
      title: '24x7 Essential Vaccine & Cold-Chain Emergency Line',
      number: '1800-110-7788',
      subtitle: 'Cold-chain failure alerts, oxytocin & vaccine refrigeration support',
      iconColor: 'text-sky-400 bg-sky-950/60 border-sky-800',
    },
    {
      title: 'National Control Tower Operations Desk',
      number: '+91 11 2306 1234',
      subtitle: 'Central Ministry of Health & Family Welfare Command Room',
      iconColor: 'text-teal-400 bg-teal-950/60 border-teal-800',
    },
  ];

  const stateCells = [
    {
      state: 'Tamil Nadu Health Mission Logistics',
      code: 'TN-HMLC',
      phone: '+91 44 2829 5678',
      email: 'tn.logistics@aegishealth.gov.in',
      location: 'DMS Complex, Teynampet, Chennai — 600018',
      head: 'Dr. Priya Ananthakrishnan',
    },
    {
      state: 'Uttar Pradesh Medical Supplies Corp',
      code: 'UP-MSC',
      phone: '+91 522 223 9012',
      email: 'up.supplies@aegishealth.gov.in',
      location: 'SUDA Bhawan, Sector-7, Gomti Nagar, Lucknow — 226010',
      head: 'Er. Alok K. Verma',
    },
    {
      state: 'Assam State Health Mission Cold-Chain Unit',
      code: 'AS-SHM',
      phone: '+91 361 226 3456',
      email: 'assam.coldchain@aegishealth.gov.in',
      location: 'Saikia Commercial Complex, Christian Basti, Guwahati — 781005',
      head: 'Dr. Himanta B. Baruah',
    },
    {
      state: 'Rajasthan Rural Health Fleet Operations',
      code: 'RJ-RHF',
      phone: '+91 141 238 7890',
      email: 'rj.fleet@aegishealth.gov.in',
      location: 'Swasthya Bhawan, C-Scheme, Jaipur — 302005',
      head: 'Smt. Sunita Rajawat',
    },
  ];

  const keyOfficers = [
    {
      name: 'Dr. Rajesh V. Sharma',
      designation: 'National Director, Health Mission Control',
      phone: '+91 98765 43210',
      email: 'r.sharma@nhm.aegishealth.gov.in',
      jurisdiction: 'National Coverage (All States)',
    },
    {
      name: 'Dr. Priya Ananthakrishnan',
      designation: 'State Mission Director',
      phone: '+91 98765 43211',
      email: 'p.ananth@tn.aegishealth.gov.in',
      jurisdiction: 'Tamil Nadu State Network',
    },
    {
      name: 'Er. Alok K. Verma',
      designation: 'Chief Medical Logistics Officer',
      phone: '+91 98765 43212',
      email: 'a.verma@up.aegishealth.gov.in',
      jurisdiction: 'Uttar Pradesh State Network',
    },
    {
      name: 'Dr. Himanta B. Baruah',
      designation: 'Northeast Emergency Response Lead',
      phone: '+91 98765 43213',
      email: 'h.baruah@as.aegishealth.gov.in',
      jurisdiction: 'Assam & Northeastern Belt',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Banner: Purpose of the App */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/80 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-4 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950 text-teal-300 border border-teal-800 text-xs font-mono rounded-full">
            <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
            <span>Federated AI Health Control Tower</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            About AegisHealth India & System Purpose
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans">
            AegisHealth India is a real-time, AI-driven national health control tower engineered to eliminate stockouts of life-saving medicines (such as Oral Rehydration Salts, Anti-Snake Venom, Paracetamol, and Antibiotics) across India’s network of Primary Health Centres (PHCs).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" /> 100% Privacy Preserving
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Uses Federated Learning (FL) so patient records never leave the local PHC node.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Truck className="w-4 h-4" /> Automated Logistics
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Predicts stockouts 14 days in advance and calculates optimal inter-PHC drug transfers.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Bot className="w-4 h-4" /> Role-Based Gemini AI
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Multilingual AI Assistant with role-based access control for PHC, District, State, and National officers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* App Objectives & Core Capabilities Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">The Core Challenge We Solve</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Rural Primary Health Centres (PHCs) across Tamil Nadu, Uttar Pradesh, Assam, and Rajasthan frequently encounter seasonal demand surges caused by monsoon floods, heatwaves, and vector-borne outbreaks.
          </p>
          <ul className="space-y-2 text-xs text-slate-300 font-sans">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <span><strong>Paper-based stock lag:</strong> Traditional manual reporting creates a 7–14 day visibility delay.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <span><strong>Uneven stock distribution:</strong> Neighboring PHCs may suffer a critical stockout while another holds 60 days of surplus.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <span><strong>High wastage risk:</strong> Unmonitored surplus stock near expiration leads to pharmaceutical disposal losses.</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe2 className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white">How AegisHealth Operates</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Our Control Tower unites data telemetry, predictive demand forecasting, and automated stock rebalancing into a single command deck.
          </p>
          <ul className="space-y-2 text-xs text-slate-300 font-sans">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span><strong>14-Day Stockout Early Warning:</strong> Algorithmic demand forecasting flags stock risks before depletion occurs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span><strong>Voice & Photo Inventory Capture:</strong> Rural medical officers report stock via local audio or quick carton snapshots.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span><strong>Zero-Downtime Gemini AI Proxy:</strong> Automatic failover and caching protect command room operations during network outages.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Emergency Hotlines Row (Dummy Phone Numbers) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Phone className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-bold text-white">24x7 Emergency Hotlines & Support Desk (Dummy Directory)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emergencyHotlines.map((h, idx) => (
            <div
              key={idx}
              className={`border rounded-xl p-4 space-y-2.5 shadow-lg ${h.iconColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-300">
                  HOTLINE #{idx + 1}
                </span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>

              <h3 className="font-bold text-sm text-white">{h.title}</h3>
              
              <div className="text-xl font-extrabold font-mono tracking-wider text-white">
                {h.number}
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {h.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* State Logistics Control Cells (Dummy Directory) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Building2 className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-white">State Health Mission Command Cells</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stateCells.map((sc, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white">{sc.state}</span>
                <span className="px-1.5 py-0.5 bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-mono rounded">
                  {sc.code}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 font-sans">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="font-mono text-white font-semibold">{sc.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-[11px] text-slate-400 truncate">{sc.email}</span>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[10px] text-slate-400 leading-snug">{sc.location}</span>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-300">
                  <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Head: <strong>{sc.head}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Officers & Emergency Contacts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Users className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Nodal Officers & Emergency Key Contacts</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Officer Name</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Jurisdiction</th>
                <th className="p-3">Contact Number (Dummy)</th>
                <th className="p-3">Official Email (Dummy)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {keyOfficers.map((ko, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-white">{ko.name}</td>
                  <td className="p-3 text-slate-300">{ko.designation}</td>
                  <td className="p-3 text-teal-400 font-mono">{ko.jurisdiction}</td>
                  <td className="p-3 font-mono font-bold text-slate-200">{ko.phone}</td>
                  <td className="p-3 font-mono text-slate-400 text-[11px]">{ko.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Support Inquiry Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Send className="w-5 h-5 text-teal-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Submit Command Support Request / Inquiry</h2>
            <p className="text-xs text-slate-400">
              Direct telemetry inquiry or drug dispatch request to National Health Control
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-200 space-y-2 flex flex-col items-center text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Inquiry Received Successfully</h3>
            <p className="text-xs text-slate-300 max-w-md">
              Thank you, {formState.name}. Your support query for <strong>{formState.state}</strong> has been logged into the AegisHealth dispatch queue (Ticket #AH-{Math.floor(100000 + Math.random() * 900000)}).
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormState({ name: '', email: '', phone: '', state: 'Tamil Nadu', subject: 'Emergency Stock Inquiry', message: '' });
              }}
              className="mt-2 px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="Dr. Rajesh Kumar"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                placeholder="rajesh.k@nhm.gov.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Phone Number (Optional)</label>
              <input
                type="text"
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Target State / Region</label>
              <select
                value={formState.state}
                onChange={(e) => setFormState({ ...formState, state: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Rajasthan">Rajasthan</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 font-mono mb-1">Inquiry Subject</label>
              <input
                type="text"
                value={formState.subject}
                onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 font-mono mb-1">Message / Stock Dispatch Request *</label>
              <textarea
                required
                rows={3}
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                placeholder="Describe your stock inquiry, PHC requirement, or emergency assistance request..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              >
                <Send className="w-4 h-4" /> Submit Inquiry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
