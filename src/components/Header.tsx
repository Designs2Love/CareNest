import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldAlert,
  User,
  Plus,
  Menu,
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  FileDown,
  History,
  Syringe,
  Users,
  ChevronDown,
  Lock,
  Unlock,
  Download,
  RotateCcw,
  LogOut,
  Shield,
  Palette,
  Trash2,
  Sparkles,
} from 'lucide-react';
import {
  PatientProfile,
  ActivePage,
  ExpiryAlertItem,
} from '../types';
import { ThemeId, COLOR_THEMES } from '../services/theme';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  activePatient: PatientProfile;
  patients: PatientProfile[];
  activePage: ActivePage;
  expiryAlerts: ExpiryAlertItem[];
  currentTheme?: ThemeId;
  onSelectTheme?: (themeId: ThemeId) => void;
  onSelectPage: (page: ActivePage) => void;
  onSelectPatient: (patientId: string) => void;
  onResetDemo?: () => void;
  onEraseAllData?: () => void;
  onEraseDemoData?: () => void;
  onOpenWelcome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePatient,
  patients,
  activePage,
  expiryAlerts,
  currentTheme = 'rose',
  onSelectTheme,
  onSelectPage,
  onSelectPatient,
  onResetDemo,
  onEraseAllData,
  onEraseDemoData,
  onOpenWelcome,
}) => {
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const alertRef = useRef<HTMLDivElement>(null);
  const patientRef = useRef<HTMLDivElement>(null);
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (alertRef.current && !alertRef.current.contains(event.target as Node)) {
        setShowAlertDropdown(false);
      }
      if (patientRef.current && !patientRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate age helper
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'Age unspecified';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} yrs`;
  };

  const expiredCount = expiryAlerts.filter((a) => a.isExpired).length;
  const expiringSoonCount = expiryAlerts.filter((a) => !a.isExpired).length;
  const totalAlerts = expiryAlerts.length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md w-full">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Brand / Logo */}
        <div
          onClick={() => onSelectPage('today')}
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer shrink-0 select-none group min-w-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-3H8v-2h3V8h2v3h3v2h-3v3z"/>
            </svg>
          </div>
          <div className="leading-tight truncate">
            <span className="font-bold text-sm sm:text-lg tracking-tight text-white block truncate">
              Care<span className="text-teal-400">Nest</span>
            </span>
            <span className="text-[9px] text-slate-400 font-mono tracking-wider hidden md:block">
              HIPAA SECURE · OFFLINE
            </span>
          </div>
        </div>

        {/* Center / Right Control Cluster */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          
          {/* 1. Medication Expiry Alert Dropdown */}
          <div className="relative" ref={alertRef}>
            <button
              onClick={() => {
                setShowAlertDropdown(!showAlertDropdown);
                setShowPatientDropdown(false);
              }}
              aria-label="Medication expiry alerts"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                totalAlerts > 0
                  ? expiredCount > 0
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${totalAlerts > 0 ? (expiredCount > 0 ? 'text-rose-400 animate-pulse' : 'text-amber-400') : 'text-slate-400'}`} />
              <span className="hidden sm:inline font-medium">Alerts</span>
              {totalAlerts > 0 ? (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${expiredCount > 0 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-900'}`}>
                  {totalAlerts}
                </span>
              ) : (
                <span className="hidden sm:inline text-[11px] text-slate-400">0</span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu (Guaranteed no mobile overflow) */}
            {showAlertDropdown && (
              <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto top-16 sm:top-auto sm:right-0 mt-1 w-auto sm:w-88 md:w-96 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 p-3 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-xs tracking-wide uppercase text-slate-300">
                      Medication Expiry Alerts
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    For {activePatient.preferredName}
                  </span>
                </div>

                {totalAlerts === 0 ? (
                  <div className="py-6 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400/80 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-300">All medications within shelf life</p>
                    <p className="text-[11px] text-slate-500 mt-1">No batches are expired or expiring within 30 days.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {expiryAlerts.map((alert) => (
                      <div
                        key={alert.packageId}
                        className={`p-2.5 rounded-lg border text-xs ${
                          alert.isExpired
                            ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                            : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-white block truncate">
                              {alert.brandName ? `${alert.brandName} (${alert.medicationName})` : alert.medicationName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
                              Lot: {alert.lotNumber || 'N/A'} · Remaining: {alert.remainingQuantity} {alert.unit}
                            </span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold shrink-0 ${
                              alert.isExpired
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {alert.isExpired
                              ? `Expired ${Math.abs(alert.daysRemaining)}d ago`
                              : `Expires in ${alert.daysRemaining}d`}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Expiry: {alert.expirationDate}</span>
                          <button
                            onClick={() => {
                              setShowAlertDropdown(false);
                              onSelectPage('history');
                            }}
                            className="text-teal-400 hover:text-teal-300 hover:underline font-medium"
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Patient Info Dropdown */}
          <div className="relative" ref={patientRef}>
            <button
              onClick={() => {
                setShowPatientDropdown(!showPatientDropdown);
                setShowAlertDropdown(false);
              }}
              aria-label="Active patient information"
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${activePatient.avatarColor}`}>
                {activePatient.preferredName[0]}
              </div>
              <span className="font-medium max-w-[65px] sm:max-w-[100px] truncate hidden xs:inline sm:inline">
                {activePatient.preferredName}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block shrink-0" />
            </button>

            {/* Dropdown Menu (Guaranteed no mobile overflow) */}
            {showPatientDropdown && (
              <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto top-16 sm:top-auto sm:right-0 mt-1 w-auto sm:w-88 md:w-96 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 p-4 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-xs shrink-0 ${activePatient.avatarColor}`}>
                    {activePatient.preferredName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white truncate">
                      {activePatient.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                      <span>{calculateAge(activePatient.birthDate)}</span>
                      <span>·</span>
                      <span>{activePatient.gender}</span>
                    </div>
                  </div>
                </div>

                {/* Allergies list */}
                <div className="mt-3">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-rose-400 block mb-1">
                    Current Drug Allergies
                  </span>
                  {activePatient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {activePatient.allergies.map((allergy, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-200 text-[11px] font-medium"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No known drug allergies reported.</p>
                  )}
                </div>

                {/* Notes */}
                {activePatient.careNotes && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <span className="font-medium text-slate-300 block mb-0.5 text-[11px]">Caregiver Notes:</span>
                    <p className="line-clamp-2 text-slate-400 text-[10px]">{activePatient.careNotes}</p>
                  </div>
                )}

                {/* Switch profile shortcut */}
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Profiles ({patients.length})</span>
                  <button
                    onClick={() => {
                      setShowPatientDropdown(false);
                      onSelectPage('patients');
                    }}
                    className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition"
                  >
                    Manage Profiles →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Add Medication Button */}
          <button
            onClick={() => onSelectPage('add-medication')}
            aria-label="Add medication"
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Med</span>
          </button>


          {/* 5. Hamburger Menu Button */}
          <button
            onClick={() => setShowMobileMenu(true)}
            aria-label="Open navigation menu"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition shrink-0 cursor-pointer"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Hamburger Drawer Overlay - 1. NO SCROLLING, COMPACT VERTICAL LAYOUT */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Drawer Content: FIXED COMPACT HEIGHT WITH ZERO SCROLLING */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-slate-900 border-l border-slate-800 h-full p-4 sm:p-5 flex flex-col justify-between shadow-2xl z-10 text-slate-200 animate-in slide-in-from-right duration-200 overflow-hidden">
            
            {/* Top section: Header + Switcher + Menu Items (Continuous, no gap) */}
            <div className="shrink-0 flex-1 flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                    CN
                  </div>
                  <span className="font-bold text-white text-sm">CareNest Menu</span>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Patient Switcher Dropdown */}
              <div className="mt-2.5 p-2.5 rounded-lg bg-slate-800/60 border border-slate-800">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Active Patient
                </label>
                <select
                  value={activePatient.id}
                  onChange={(e) => {
                    onSelectPatient(e.target.value);
                    setShowMobileMenu(false);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({calculateAge(p.birthDate)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Below Active Patient before all menu items */}
              <div className="border-b border-slate-800 my-2.5" />

              {/* Menu Items: Immediately following with no gap */}
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    onSelectPage('today');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    activePage === 'today'
                      ? 'bg-teal-500/15 text-teal-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Today's Medications</span>
                </button>

                <button
                  onClick={() => {
                    onSelectPage('add-medication');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    activePage === 'add-medication'
                      ? 'bg-teal-500/15 text-teal-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Plus className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Add Medication</span>
                </button>

                <button
                  onClick={() => {
                    onSelectPage('history');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    activePage === 'history'
                      ? 'bg-teal-500/15 text-teal-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <History className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Medication History</span>
                </button>

                <button
                  onClick={() => {
                    onSelectPage('vaccines');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    activePage === 'vaccines'
                      ? 'bg-teal-500/15 text-teal-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Syringe className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Vaccination History</span>
                </button>

                <button
                  onClick={() => {
                    onSelectPage('export');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    activePage === 'export'
                      ? 'bg-teal-500/15 text-teal-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileDown className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Export & Vault Backup</span>
                </button>
              </nav>

              {/* 6 Color Themes Dropdown Selector */}
              {onSelectTheme && (
                <div className="mt-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <label
                      htmlFor="theme-selector-dropdown"
                      className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Palette className="w-3 h-3 text-teal-400" />
                      <span>Color Theme (6 Themes)</span>
                    </label>
                    <span
                      className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20 shrink-0"
                      style={{
                        backgroundColor:
                          COLOR_THEMES.find((t) => t.id === currentTheme)?.previewColor ||
                          '#0d9488',
                      }}
                      title="Current theme accent"
                    />
                  </div>
                  <div className="relative">
                    <select
                      id="theme-selector-dropdown"
                      value={currentTheme}
                      onChange={(e) => onSelectTheme(e.target.value as ThemeId)}
                      className="w-full appearance-none bg-slate-950/80 border border-slate-700 hover:border-slate-600 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden cursor-pointer transition shadow-2xs"
                    >
                      {COLOR_THEMES.map((theme) => (
                        <option
                          key={theme.id}
                          value={theme.id}
                          className="bg-slate-900 text-white py-1"
                        >
                          {theme.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}
            </div>

          {/* Bottom section: Compact Utilities (zero scrollbar) */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5 shrink-0">
              {/* PWA Install Button */}
              {isInstallable && (
                <button
                  onClick={() => {
                    install();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-teal-600/30 border border-teal-500/40 text-teal-300 hover:bg-teal-600/40 text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
              )}

              {isIOS && (
                <button
                  onClick={() => setShowIOSModal(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install on iOS
                </button>
              )}

              {/* Erase All Data Button (Above Restore Demo Data) */}
              {onEraseAllData && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('⚠️ Erase ALL Data? This will permanently wipe all patient records, medications, logs, and vaccines.')) {
                      onEraseAllData();
                      setShowMobileMenu(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 border border-rose-900/50 text-[11px] font-semibold transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 text-rose-400" />
                  <span>Erase All Data</span>
                </button>
              )}

              {/* Reset / Restore Demo Data Button */}
              {onResetDemo && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Restore all profiles and medications back to initial demo data?')) {
                      onResetDemo();
                      setShowMobileMenu(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-teal-300 border border-slate-700/60 text-[11px] font-semibold transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-teal-400" />
                  <span>Restore Demo Data</span>
                </button>
              )}

              {/* Erase Demo Data Button (Below Restore Demo Data) */}
              {onEraseDemoData && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Erase all demo records (Eleanor, Michael, Sophia)?')) {
                      onEraseDemoData();
                      setShowMobileMenu(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 text-amber-300 border border-amber-900/50 text-[11px] font-medium transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 text-amber-400" />
                  <span>Erase Demo Data</span>
                </button>
              )}

              {/* Welcome Screen Opener */}
              {onOpenWelcome && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenWelcome();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-[10px] transition cursor-pointer"
                >
                  <Sparkles className="w-2.5 h-2.5 text-teal-400" />
                  <span>Open Welcome Tour</span>
                </button>
              )}

              {/* App Version Info */}
              <div className="text-center pt-1 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-400 font-mono">
                  Developed by Designs2Love Version 1.0
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 p-5 text-white shadow-2xl">
            <h3 className="text-sm font-bold">Install CareNest on iOS</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              1. Tap the <strong className="text-teal-400">Share</strong> button in Safari's bottom toolbar.<br />
              2. Scroll down and tap <strong className="text-teal-400">Add to Home Screen</strong>.<br />
              3. CareNest will launch fullscreen and work completely offline!
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-3.5 w-full rounded-lg bg-teal-600 hover:bg-teal-500 py-1.5 text-xs font-semibold text-white transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
