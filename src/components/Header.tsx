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
  Monitor,
  Tablet,
  Laptop,
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
  onOpenWelcome,
}) => {
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const alertRef = useRef<HTMLDivElement>(null);
  const patientRef = useRef<HTMLDivElement>(null);
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Generate and download a local offline desktop launcher file
  const handleDownloadLauncher = () => {
    const currentOrigin = window.location.origin;
    const currentPath = window.location.pathname;
    const appUrl = `${currentOrigin}${currentPath}`;
    const launcherHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CareNest - Local Desktop Launcher</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { max-width: 480px; width: 100%; background: #131b2e; border: 1px solid #1e293b; border-radius: 18px; padding: 32px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
    .badge { display: inline-block; font-size: 11px; background: rgba(13, 148, 136, 0.2); color: #2dd4bf; border: 1px solid rgba(13, 148, 136, 0.4); padding: 4px 12px; border-radius: 9999px; font-weight: 700; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    h1 { margin: 0 0 10px 0; font-size: 22px; color: #ffffff; font-weight: 700; }
    p { font-size: 13px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px 0; }
    .btn { display: inline-block; width: 100%; box-sizing: border-box; background: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-weight: 600; font-size: 14px; transition: background 0.2s; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); }
    .btn:hover { background: #14b8a6; }
    .note { font-size: 11px; margin-top: 16px; color: #64748b; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Offline Health Vault</div>
    <h1>CareNest Desktop & Tablet</h1>
    <p>Double-click this launcher anytime on your desktop, laptop, or tablet. CareNest is completely offline-first and private; your medication schedules and patient vault stay secure on your device.</p>
    <a href="${appUrl}" class="btn" target="_blank" rel="noopener noreferrer">Launch CareNest Vault</a>
    <div class="note">Keep this file on your Desktop, Documents, or Tablet Files folder for rapid 1-click access.</div>
  </div>
</body>
</html>`;

    const blob = new Blob([launcherHtml], { type: 'text/html' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'CareNest-App-Launcher.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

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

          {/* 4. Download App Button (Desktop & Tablet) */}
          <button
            type="button"
            onClick={() => setShowDownloadModal(true)}
            aria-label="Download App for Desktop or Tablet"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-teal-500/30 text-teal-300 hover:text-teal-200 text-xs font-medium shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
            title="Download & run CareNest locally on Desktop or Tablet"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">Download App</span>
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
              {/* Download App Button (Desktop & Tablet) */}
              <button
                type="button"
                onClick={() => {
                  setShowDownloadModal(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/40 text-xs font-semibold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                <span>Download App (Desktop & Tablet)</span>
              </button>

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

      {/* Download & Run App Locally Modal (Desktop & Tablet) */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 p-5 sm:p-6 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Download & Run CareNest Locally</h3>
                  <p className="text-xs text-slate-400">Run natively on your desktop, laptop, or tablet with 100% offline security</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct 1-Click Install if browser supports it */}
            {isInstallable && (
              <div className="mt-4 p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/40 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-teal-200">Instant One-Click Install Available</div>
                  <div className="text-[11px] text-teal-400/80">Install CareNest directly as a desktop or tablet application.</div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await install();
                    setShowDownloadModal(false);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition shrink-0 cursor-pointer"
                >
                  Install Now
                </button>
              </div>
            )}

            {/* Platform Guides */}
            <div className="mt-4 space-y-3">
              {/* Desktop Section */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2 text-teal-300 font-semibold text-xs mb-1.5">
                  <Monitor className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Desktop & Laptop (Windows, Mac, Linux, Chromebook)</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed pl-1">
                  <li>
                    <strong className="text-white">Chrome / Edge / Brave:</strong> Click the <strong className="text-teal-400">Install icon</strong> (⨁ or monitor with down arrow) in your browser address bar, or click browser menu (⋮) → <strong className="text-teal-400">"Save and Share" → "Install CareNest"</strong>.
                  </li>
                  <li>
                    <strong className="text-white">Safari on Mac:</strong> Click <strong className="text-teal-400">File</strong> in the top menu bar → <strong className="text-teal-400">"Add to Dock"</strong>.
                  </li>
                </ul>
              </div>

              {/* Tablet Section */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2 text-teal-300 font-semibold text-xs mb-1.5">
                  <Tablet className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Tablet (iPad & Android Tablets)</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed pl-1">
                  <li>
                    <strong className="text-white">iPad (Safari):</strong> Tap the <strong className="text-teal-400">Share button</strong> (box with up arrow) in the top Safari toolbar → scroll down and tap <strong className="text-teal-400">Add to Home Screen</strong>.
                  </li>
                  <li>
                    <strong className="text-white">Android Tablet (Chrome):</strong> Tap the <strong className="text-teal-400">three dots (⋮)</strong> at top right → tap <strong className="text-teal-400">Install app</strong> or <strong className="text-teal-400">Add to Home screen</strong>.
                  </li>
                </ul>
              </div>

              {/* Standalone Offline Launcher Download */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-300">
                    <Laptop className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Download Local Offline Launcher</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Save a standalone file to your Desktop or Tablet files to launch CareNest offline anytime.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadLauncher}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-teal-300 hover:text-white border border-slate-600 text-xs font-medium transition shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .html Launcher</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                CareNest runs 100% locally with zero cloud dependencies.
              </span>
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Got It
              </button>
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
