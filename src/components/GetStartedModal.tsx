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
    <div className="fixed inset-0 z-50 bg-white text-slate-900 flex flex-col justify-between overflow-y-auto sm:overflow-hidden select-none">
      
      {/* Top App Bar (Clean White Healthcare Header) */}
      <header className="w-full px-4 sm:px-8 py-3.5 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-rose-500 flex items-center justify-center shadow-md shadow-rose-500/10 text-white font-bold text-xs sm:text-sm tracking-wider">
            CN
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>CareNest</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 tracking-wider font-mono">
                Vault Setup
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Privacy-first medication and immunization management
            </p>
          </div>
        </div>

        {mode === 'welcome' && (
          <button
            type="button"
            onClick={onKeepDemoData}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 shadow-2xs"
            title="Skip directly to the application"
          >
            <span>Skip to App</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        )}
      </header>

      {/* Main Hero & Interaction Area (White Background) */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 flex flex-col justify-center items-center my-auto">
        {mode === 'welcome' ? (
          <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-4 animate-in fade-in duration-150">
            
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-[11px] font-medium text-slate-700 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Offline Progressive Web Application</span>
              <span className="text-slate-300">·</span>
              <span className="text-teal-700 font-mono font-semibold">100% Private</span>
            </div>

            {/* Hero Heading */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-teal-600 to-emerald-600">CareNest</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Maintain accurate medication records, schedules, dose adherence, and vaccine histories for up to 6 patients without cloud transmission.
              </p>
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
              
              {/* Option A: Start Fresh & Add Patient (Prominent Emerald Green CTA) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-emerald-500 hover:border-emerald-600 shadow-lg shadow-emerald-500/5 flex flex-col justify-between text-left transition">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-2xs">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Start Fresh & Add Patient
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                    Erase all pre-loaded sample demo records and initialize your vault with your actual patient or family member.
                  </p>
                </div>

                <div className="pt-3.5">
                  <button
                    type="button"
                    onClick={() => setMode('clean_slate')}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-98 cursor-pointer"
                  >
                    <span>Start Fresh & Add Patient</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Option B: Explore with Demo Data */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 shadow-xs flex flex-col justify-between text-left transition">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 ml-0.5 text-slate-600" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Explore with Sample Demo Data
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                    Tour the app with pre-loaded sample profiles (Eleanor, Arthur, Liam) to test adherence and PDF generation.
                  </p>
                </div>

                <div className="pt-3.5">
                  <button
                    type="button"
                    onClick={onKeepDemoData}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 active:bg-white text-slate-700 font-semibold text-xs border border-slate-300 shadow-2xs transition active:scale-98 cursor-pointer"
                  >
                    <span>Explore Demo Profiles</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Feature Highlights Bar */}
            <div className="pt-1.5 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Encrypted Local Storage</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Daily Adherence Progress</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-rose-600" />
                <span>Up to 6 Patient Profiles</span>
              </span>
            </div>

          </div>
        ) : (
          /* Clean Slate Setup Form (White Theme) */
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3.5 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[9px] font-mono uppercase font-bold text-emerald-600 tracking-wider">
                  Clean Slate Setup
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                  Create First Patient Profile
                </h3>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] flex items-center gap-1.5 font-medium">
                <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo records will be erased</span>
              </div>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCleanPatient} className="space-y-3 text-xs">
              
              {/* Names */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Preferred Nickname
                  </label>
                  <input
                    type="text"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    placeholder="e.g. Mom, Eleanor"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-hidden transition"
                  />
                </div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono text-xs transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer text-xs transition"
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
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  Allergies to Medication
                </label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa drugs (or leave blank if NKDA)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-hidden transition"
                />
              </div>

              {/* Avatar Accent Color */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-700 font-semibold text-[11px]">
                  Profile Avatar Color
                </span>
                <div className="flex items-center gap-1.5">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className={`w-5 h-5 rounded-full ${c} transition-transform cursor-pointer ${
                        avatarColor === c ? 'scale-125 ring-2 ring-slate-900 shadow-md' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMode('welcome')}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
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
      <footer className="w-full px-4 sm:px-8 py-3 border-t border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 font-mono shrink-0">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>CareNest · Local Offline Vault</span>
        </div>
        <span className="text-slate-500">Developed by Designs2Love Version 1.0</span>
      </footer>

    </div>
  );
};
