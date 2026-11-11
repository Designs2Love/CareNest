import React, { useState } from 'react';
import {
  Sparkles,
  Trash2,
  UserPlus,
  Play,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Pill,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { PatientProfile, Gender } from '../types';

interface GetStartedModalProps {
  onKeepDemoData: () => void;
  onClearAndCreatePatient: (
    patientData: Omit<PatientProfile, 'id' | 'createdAt' | 'isArchived'>
  ) => void;
}

const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-teal-600',
  'bg-sky-600',
  'bg-indigo-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-purple-600',
];

export const GetStartedModal: React.FC<GetStartedModalProps> = ({
  onKeepDemoData,
  onClearAndCreatePatient,
}) => {
  const [mode, setMode] = useState<'welcome' | 'clean_slate'>('welcome');

  // Form State for Clean Slate Patient
  const [name, setName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [birthDate, setBirthDate] = useState('1980-05-15');
  const [gender, setGender] = useState<Gender>('Female');
  const [allergiesText, setAllergiesText] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]); // Emerald / Green accent
  const [formError, setFormError] = useState('');

  const handleCreateCleanPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter patient legal or full name.');
      return;
    }

    const allergies = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onClearAndCreatePatient({
      name: name.trim(),
      preferredName: preferredName.trim() || name.trim(),
      birthDate: birthDate || undefined,
      gender,
      allergies,
      avatarColor,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between overflow-y-auto sm:overflow-hidden select-none">
      
      {/* Top App Bar */}
      <header className="w-full px-4 sm:px-8 py-3 sm:py-3.5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white font-bold text-xs sm:text-sm tracking-wider">
            CN
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>CareNest</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 tracking-wider font-mono">
                Vault Setup
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Privacy-first medication and immunization management
            </p>
          </div>
        </div>

        {mode === 'welcome' && (
          <button
            type="button"
            onClick={onKeepDemoData}
            className="text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 shadow-xs"
            title="Skip directly to the application"
          >
            <span>Skip to App</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </header>

      {/* Main Hero & Interaction Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-3 sm:py-4 flex flex-col justify-center items-center my-auto">
        {mode === 'welcome' ? (
          <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-3.5 sm:space-y-4 animate-in fade-in duration-150">
            
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Offline Progressive Web Application</span>
              <span className="text-slate-600">·</span>
              <span className="text-teal-400 font-mono">100% Private</span>
            </div>

            {/* Hero Heading */}
            <div className="space-y-1 sm:space-y-1.5">
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-teal-300 to-emerald-400">CareNest</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                Maintain accurate medication records, schedules, dose adherence, and vaccine histories for up to 6 patients without cloud transmission.
              </p>
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              
              {/* Option A: Start Fresh & Add Patient (Prominent Emerald Green CTA) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-emerald-500/80 hover:border-emerald-400 shadow-xl shadow-emerald-950/40 flex flex-col justify-between text-left transition">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-xs">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    Start Fresh & Add Patient
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-snug">
                    Erase all pre-loaded sample demo records and initialize your vault with your actual patient or family member.
                  </p>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => setMode('clean_slate')}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition active:scale-98 cursor-pointer"
                  >
                    <span>Start Fresh & Add Patient</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Option B: Explore with Demo Data */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 shadow-lg flex flex-col justify-between text-left transition">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 ml-0.5 text-slate-300" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    Explore with Sample Demo Data
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-snug">
                    Tour the app with pre-loaded sample profiles (Eleanor, Arthur, Liam) to test adherence and PDF generation.
                  </p>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={onKeepDemoData}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-800/80 text-slate-200 font-semibold text-xs border border-slate-700 transition active:scale-98 cursor-pointer"
                  >
                    <span>Explore Demo Profiles</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Feature Highlights Bar */}
            <div className="pt-1 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Encrypted Storage</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Daily Adherence Progress</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-rose-400" />
                <span>Up to 6 Patient Profiles</span>
              </span>
            </div>

          </div>
        ) : (
          /* Clean Slate Setup Form */
          <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div>
                <span className="text-[9px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                  Clean Slate Setup
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  Create First Patient Profile
                </h3>
              </div>
              <div className="px-2 py-0.5 rounded-md bg-amber-950/50 border border-amber-900/80 text-amber-300 text-[10px] flex items-center gap-1 font-medium">
                <Trash2 className="w-3 h-3 text-amber-400" />
                <span>Demo records will be erased</span>
              </div>
            </div>

            {formError && (
              <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCleanPatient} className="space-y-2.5 text-xs">
              
              {/* Names */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                    Legal / Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!preferredName) setPreferredName(e.target.value);
                    }}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                    Preferred Nickname
                  </label>
                  <input
                    type="text"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    placeholder="e.g. Mom, Eleanor"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden cursor-pointer text-xs"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  Allergies to Medication
                </label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa drugs (or leave blank if NKDA)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Avatar Accent Color */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-300 font-semibold text-[11px]">
                  Profile Avatar Color
                </span>
                <div className="flex items-center gap-1.5">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className={`w-5 h-5 rounded-full ${c} transition-transform cursor-pointer ${
                        avatarColor === c ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMode('welcome')}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Wipe Demo & Initialize Vault</span>
                </button>
              </div>

            </form>
          </div>
        )}
      </main>

      {/* Clean Bottom Attribution */}
      <footer className="w-full px-4 sm:px-8 py-2.5 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono shrink-0">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>CareNest · Local Offline Vault</span>
        </div>
        <span className="text-slate-400">Developed by Designs2Love Version 1.0</span>
      </footer>

    </div>
  );
};
