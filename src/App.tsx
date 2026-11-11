import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PatientProfile,
  MedicationDefinition,
  Regimen,
  MedicationPackage,
  DoseLog,
  VaccinationRecord,
  ActivePage,
  ExpiryAlertItem,
} from './types';
import { vaultStorage } from './services/storage';
import { Header } from './components/Header';
import { TodaysMedicationsPage } from './pages/TodaysMedicationsPage';
import { MedicationHistoryPage } from './pages/MedicationHistoryPage';
import { VaccinationHistoryPage } from './pages/VaccinationHistoryPage';
import { PatientProfilesPage } from './pages/PatientProfilesPage';
import { AddMedicationPage } from './pages/AddMedicationPage';
import { ExportBackupPage } from './pages/ExportBackupPage';
import { GetStartedModal } from './components/GetStartedModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { WifiOff, Heart, AlertTriangle } from 'lucide-react';
import { ThemeId, getSavedTheme, applyTheme } from './services/theme';

export default function App() {
  const isOnline = useOnlineStatus();

  // Welcome / Onboarding state: Always shows on initial visit or refresh; users can click 'Skip to App'
  const [showGetStarted, setShowGetStarted] = useState<boolean>(true);

  // Color Theme State (Coral Rose is default)
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    const saved = getSavedTheme();
    applyTheme(saved);
    return saved;
  });

  const handleSelectTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
  };

  // Initialize storage & theme
  useEffect(() => {
    vaultStorage.init();
    applyTheme(getSavedTheme());
  }, []);

  // Active Navigation State (Strictly one page viewable at a time)
  const [activePage, setActivePage] = useState<ActivePage>('today');

  // Active Patient State
  const [activePatientId, setActivePatientId] = useState<string>(() =>
    vaultStorage.getActivePatientId()
  );

  // Data State triggers
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const reloadData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Loaded Data
  const patients = useMemo(() => vaultStorage.getPatients(), [refreshTrigger]);
  const allPatients = useMemo(() => vaultStorage.getPatients(true), [refreshTrigger]);

  const activePatient = useMemo(() => {
    const found = patients.find((p) => p.id === activePatientId);
    if (found) return found;
    return patients[0] || allPatients[0];
  }, [patients, allPatients, activePatientId]);

  // Synchronize active patient ID if changed or archived
  useEffect(() => {
    if (activePatient && activePatient.id !== activePatientId) {
      setActivePatientId(activePatient.id);
      vaultStorage.setActivePatientId(activePatient.id);
    }
  }, [activePatient, activePatientId]);

  // Scoped Data for Active Patient (Strict Patient Boundary)
  const currentPatientId = activePatient?.id || '';

  const medications = useMemo(
    () => (currentPatientId ? vaultStorage.getMedications(currentPatientId) : []),
    [currentPatientId, refreshTrigger]
  );

  const regimens = useMemo(
    () => (currentPatientId ? vaultStorage.getRegimens(currentPatientId) : []),
    [currentPatientId, refreshTrigger]
  );

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const doseLogs = useMemo(
    () => (currentPatientId ? vaultStorage.getDoseLogs(currentPatientId, todayStr) : []),
    [currentPatientId, todayStr, refreshTrigger]
  );

  const vaccinations = useMemo(
    () => (currentPatientId ? vaultStorage.getVaccinations(currentPatientId) : []),
    [currentPatientId, refreshTrigger]
  );

  const expiryAlerts = useMemo(
    () => (currentPatientId ? vaultStorage.getExpiryAlerts(currentPatientId) : []),
    [currentPatientId, refreshTrigger]
  );

  // Active med counts for patient switcher cards
  const activeMedicationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allPatients) {
      const pMeds = vaultStorage.getMedications(p.id);
      counts[p.id] = pMeds.filter((m) => m.status === 'active').length;
    }
    return counts;
  }, [allPatients, refreshTrigger]);

  // Patient switch handler
  const handleSelectPatient = (newPatientId: string) => {
    setActivePatientId(newPatientId);
    vaultStorage.setActivePatientId(newPatientId);
    reloadData();
  };

  // Dose logging handlers (Mark Taken & Undo)
  const handleMarkTaken = (
    medicationId: string,
    scheduleTime: string,
    quantity?: string
  ) => {
    vaultStorage.markDoseTaken(
      currentPatientId,
      medicationId,
      scheduleTime,
      todayStr,
      quantity
    );
    reloadData();
  };

  const handleUndoDose = (medicationId: string, scheduleTime: string) => {
    vaultStorage.undoDose(currentPatientId, medicationId, scheduleTime, todayStr);
    reloadData();
  };

  // Add Medication handler
  const handleSaveMedication = (
    medData: Omit<MedicationDefinition, 'id' | 'createdAt' | 'updatedAt'>,
    regimenData: Omit<Regimen, 'id' | 'medicationId' | 'patientId'>,
    pkgData?: Omit<MedicationPackage, 'id' | 'medicationId' | 'patientId'>
  ) => {
    vaultStorage.addMedication(medData, regimenData, pkgData);
    reloadData();
    setActivePage('today');
  };

  // Stop Medication handler
  const handleStopMedication = (medId: string, stopDate?: string) => {
    vaultStorage.stopMedication(medId, currentPatientId, stopDate);
    reloadData();
  };

  // Delete Medication handler
  const handleDeleteMedication = (medId: string) => {
    vaultStorage.deleteMedication(medId, currentPatientId);
    reloadData();
  };

  // Patient profile handlers
  const handleAddPatient = (
    profile: Omit<PatientProfile, 'id' | 'createdAt' | 'isArchived'>
  ) => {
    const created = vaultStorage.addPatient(profile);
    handleSelectPatient(created.id);
    reloadData();
  };

  const handleUpdatePatient = (profile: PatientProfile) => {
    vaultStorage.updatePatient(profile);
    reloadData();
  };

  const handleArchivePatient = (patientId: string) => {
    vaultStorage.archivePatient(patientId);
    reloadData();
  };

  const handleRestorePatient = (patientId: string) => {
    vaultStorage.restorePatient(patientId);
    reloadData();
  };

  // Vaccination handler
  const handleAddVaccination = (
    rec: Omit<VaccinationRecord, 'id' | 'createdAt'>
  ) => {
    vaultStorage.addVaccination(rec);
    reloadData();
  };

  // Reset to demo data (Fixed: thoroughly resets seed data, updates active patient state, and reloads vault)
  const handleResetDemo = () => {
    vaultStorage.resetToSeedData();
    setActivePatientId('pat-eleanor');
    reloadData();
    setActivePage('today');
  };

  // Erase ALL data (Complete blank slate)
  const handleEraseAllData = () => {
    const cleanPatient = vaultStorage.eraseAllData();
    setActivePatientId(cleanPatient.id);
    reloadData();
    setActivePage('today');
  };

  // Erase only Demo Data (Eleanor, Michael, Sophia)
  const handleEraseDemoData = () => {
    const newActiveId = vaultStorage.eraseDemoDataOnly();
    setActivePatientId(newActiveId);
    reloadData();
    setActivePage('today');
  };

  // Onboarding action handlers
  const handleKeepDemoData = () => {
    vaultStorage.completeOnboarding();
    setShowGetStarted(false);
  };

  const handleClearAndCreatePatient = (
    patientData: Omit<PatientProfile, 'id' | 'createdAt' | 'isArchived'>
  ) => {
    const newPat = vaultStorage.clearAllDemoDataAndStart(patientData);
    setActivePatientId(newPat.id);
    reloadData();
    setShowGetStarted(false);
    setActivePage('today');
  };

  if (!activePatient) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center">
          <p className="text-sm text-slate-400">Loading patient vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-500/20 selection:text-teal-900 w-full max-w-full overflow-x-hidden">
      
      {/* First-Time User Onboarding Modal */}
      {showGetStarted && (
        <GetStartedModal
          onKeepDemoData={handleKeepDemoData}
          onClearAndCreatePatient={handleClearAndCreatePatient}
        />
      )}

      {/* 3, 4, 5, 9. Sticky Header */}
      <Header
        activePatient={activePatient}
        patients={patients}
        activePage={activePage}
        expiryAlerts={expiryAlerts}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        onSelectPage={setActivePage}
        onSelectPatient={handleSelectPatient}
        onResetDemo={handleResetDemo}
        onEraseAllData={handleEraseAllData}
        onEraseDemoData={handleEraseDemoData}
        onOpenWelcome={() => setShowGetStarted(true)}
      />

      {/* Main Single-View Page Container (Zero horizontal overflow) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 py-3.5 sm:py-6 overflow-x-hidden">
        {activePage === 'today' && (
          <TodaysMedicationsPage
            patient={activePatient}
            medications={medications}
            regimens={regimens}
            doseLogs={doseLogs}
            onMarkTaken={handleMarkTaken}
            onUndoDose={handleUndoDose}
            onNavigateAddMed={() => setActivePage('add-medication')}
          />
        )}

        {activePage === 'history' && (
          <MedicationHistoryPage
            patient={activePatient}
            medications={medications}
            regimens={regimens}
            onStopMedication={handleStopMedication}
            onDeleteMedication={handleDeleteMedication}
            onNavigateAddMed={() => setActivePage('add-medication')}
          />
        )}

        {activePage === 'vaccines' && (
          <VaccinationHistoryPage
            patient={activePatient}
            vaccinations={vaccinations}
            onAddVaccination={handleAddVaccination}
          />
        )}

        {activePage === 'patients' && (
          <PatientProfilesPage
            patients={patients}
            allPatients={allPatients}
            activePatientId={activePatient.id}
            onSelectPatient={handleSelectPatient}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            onArchivePatient={handleArchivePatient}
            onRestorePatient={handleRestorePatient}
            activeMedicationCounts={activeMedicationCounts}
          />
        )}

        {activePage === 'add-medication' && (
          <AddMedicationPage
            patient={activePatient}
            onSaveMedication={handleSaveMedication}
            onCancel={() => setActivePage('today')}
          />
        )}

        {activePage === 'export' && (
          <ExportBackupPage
            patient={activePatient}
            medications={medications}
            regimens={regimens}
            vaccinations={vaccinations}
            onVaultRestored={reloadData}
          />
        )}
      </main>

      {/* Offline Mode Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2 text-xs font-medium text-white shadow-xl animate-bounce">
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Offline Mode: Local vault active without internet</span>
        </div>
      )}

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <span className="font-semibold text-slate-900">CareNest</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600 font-normal">Offline Progressive Web App</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-[11px] text-slate-500">
            <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60 font-mono">
              Developed by Designs2Love Version 1.0
            </span>
            <span className="text-slate-400 font-mono hidden sm:inline">·</span>
            <span className="text-slate-400 font-mono">
              All records stored locally in browser
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
