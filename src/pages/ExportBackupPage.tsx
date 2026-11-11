import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  Upload,
  Lock,
  ShieldCheck,
  HardDrive,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Key,
} from 'lucide-react';
import {
  PatientProfile,
  MedicationDefinition,
  Regimen,
  VaccinationRecord,
} from '../types';
import {
  vaultStorage,
  encryptVaultData,
  decryptVaultData,
  hashPasscode,
} from '../services/storage';
import { generateMedicationListPDF } from '../services/pdfGenerator';

interface ExportBackupPageProps {
  patient: PatientProfile;
  medications: MedicationDefinition[];
  regimens: Regimen[];
  vaccinations: VaccinationRecord[];
  onVaultRestored: () => void;
}

export const ExportBackupPage: React.FC<ExportBackupPageProps> = ({
  patient,
  medications,
  regimens,
  vaccinations,
  onVaultRestored,
}) => {
  const [backupPassphrase, setBackupPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [backupError, setBackupError] = useState('');
  const [backupSuccess, setBackupSuccess] = useState('');

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPassphrase, setImportPassphrase] = useState('');
  const [importPreview, setImportPreview] = useState<any | null>(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  // Vault Lock passcode setup
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState('');
  const hasExistingPasscode = !!vaultStorage.getPasscodeHash();

  // Storage Persistence
  const [isPersisted, setIsPersisted] = useState<boolean | null>(null);

  useEffect(() => {
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(setIsPersisted).catch(() => {});
    }
  }, []);

  const handleRequestPersistence = async () => {
    if (navigator.storage && navigator.storage.persist) {
      const granted = await navigator.storage.persist();
      setIsPersisted(granted);
    }
  };

  const regimenMap = new Map(regimens.map((r) => [r.medicationId, r]));
  const activeMeds = medications.filter((m) => m.status === 'active');

  // Generate & Download PDF document
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const handleDownloadPdf = () => {
    try {
      setPdfGenerating(true);
      generateMedicationListPDF({
        patient,
        medications,
        regimens,
        vaccinations,
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Fallback to window.print if pdf generation hits an unexpected issue
      window.print();
    } finally {
      setTimeout(() => setPdfGenerating(false), 800);
    }
  };

  // Trigger browser print for clinician report
  const handlePrint = () => {
    window.print();
  };

  // Plain JSON export
  const handleExportJson = () => {
    const data = vaultStorage.getFullVaultState();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medvault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Encrypted .medvault export
  const handleExportEncrypted = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackupError('');
    setBackupSuccess('');

    if (backupPassphrase.length < 6) {
      setBackupError('Passphrase must be at least 6 characters.');
      return;
    }
    if (backupPassphrase !== confirmPassphrase) {
      setBackupError('Passphrase confirmation does not match.');
      return;
    }

    try {
      const data = vaultStorage.getFullVaultState();
      const encryptedStr = await encryptVaultData(data, backupPassphrase);
      const blob = new Blob([encryptedStr], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medvault-backup-encrypted-${new Date().toISOString().split('T')[0]}.medvault`;
      a.click();
      URL.revokeObjectURL(url);

      setBackupSuccess('Encrypted backup successfully created and downloaded!');
      setBackupPassphrase('');
      setConfirmPassphrase('');
    } catch (err: any) {
      setBackupError('Encryption failed: ' + (err.message || String(err)));
    }
  };

  // File selection for restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportError('');
      setImportSuccess('');
      setImportPreview(null);
    }
  };

  // Decrypt and preview import file
  const handlePreviewImport = async () => {
    if (!importFile) return;
    setImportError('');

    try {
      const text = await importFile.text();
      let parsedData: any;

      if (importFile.name.endsWith('.medvault')) {
        if (!importPassphrase) {
          setImportError('Please enter the decryption passphrase for this .medvault file.');
          return;
        }
        parsedData = await decryptVaultData(text, importPassphrase);
      } else {
        parsedData = JSON.parse(text);
      }

      if (!parsedData || !Array.isArray(parsedData.patients)) {
        throw new Error('Invalid vault file: Missing patient records array.');
      }

      setImportPreview({
        patientCount: parsedData.patients.length,
        medicationCount: parsedData.medications?.length || 0,
        vaccineCount: parsedData.vaccinations?.length || 0,
        exportedAt: parsedData.exportedAt || 'Unknown date',
        raw: parsedData,
      });
    } catch (err: any) {
      setImportError('Failed to read or decrypt file: ' + (err.message || String(err)));
    }
  };

  // Confirm restore
  const handleConfirmRestore = () => {
    if (!importPreview?.raw) return;
    try {
      vaultStorage.restoreFullVaultState(importPreview.raw);
      setImportSuccess('Vault successfully restored! Reloading patient records...');
      setTimeout(() => {
        onVaultRestored();
      }, 1000);
    } catch (err: any) {
      setImportError('Restore failed: ' + err.message);
    }
  };

  // Passcode setup
  const handleSavePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode) {
      vaultStorage.setPasscode(null);
      setPasscodeSuccess('Passcode removed. Vault is unlocked.');
      return;
    }
    const hash = await hashPasscode(newPasscode);
    vaultStorage.setPasscode(hash);
    setPasscodeSuccess('Passcode lock configured successfully.');
    setNewPasscode('');
  };

  return (
    <div className="space-y-6">
      
      {/* Clinician Printable Report (Screen View + Print Optimized) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 font-mono">
                Doctor / Pharmacist Ready
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">
                {patient.preferredName}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Printable Medication Reconciliation Summary
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Formatted document to print or save as PDF for appointments, hospital visits, or emergency folders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Direct PDF File Generation */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfGenerating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{pdfGenerating ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>

            {/* Browser Print / System Dialog */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition active:scale-95 cursor-pointer"
              title="Open browser print dialog"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Preview */}
        <div className="p-4 sm:p-6 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Patient Medication Record: {patient.name}
              </h3>
              <div className="text-xs text-slate-600 font-mono mt-1 space-x-2">
                <span>DOB / Age: {patient.birthDate || 'Unspecified'}</span>
                <span>·</span>
                <span>Gender: {patient.gender}</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400 font-mono">
              Generated: {new Date().toLocaleString()}
            </div>
          </div>

          {/* Allergies Notice */}
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs">
            <span className="font-bold text-rose-800 uppercase tracking-wider text-[11px] block mb-1">
              Documented Drug Allergies:
            </span>
            <span className="text-rose-900 font-medium">
              {patient.allergies.join(', ') || 'No Known Drug Allergies (NKDA)'}
            </span>
          </div>

          {/* Current Active Regimens: Desktop Table + Mobile Cards */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Current Active Regimens ({activeMeds.length})
            </h4>

            {/* Mobile Stacked Card View (No horizontal scroll) */}
            <div className="block sm:hidden space-y-2">
              {activeMeds.map((med) => {
                const reg = regimenMap.get(med.id);
                return (
                  <div key={med.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900">
                        {med.brandName ? `${med.brandName} (${med.medicationName})` : med.medicationName}
                      </span>
                      <span className="font-mono font-semibold text-slate-700 shrink-0">
                        {med.strengthValue} {med.strengthUnit}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <span>Dose: </span>
                      <strong className="text-slate-800 font-mono">
                        {reg?.frequencyType === 'prn'
                          ? `PRN (${reg.prnMaxPerDay || 'As needed'})`
                          : reg?.scheduleEntries.map((s) => `${s.doseQuantity} ${s.doseUnit} @ ${s.localTime}`).join(', ')}
                      </strong>
                    </div>
                    {med.reasonForUse && (
                      <div className="text-[11px] text-slate-500">
                        Indication: {med.reasonForUse}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-hidden border border-slate-200 rounded-lg bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Medication & Brand</th>
                    <th className="p-2.5">Strength</th>
                    <th className="p-2.5">Dose & Route</th>
                    <th className="p-2.5">Scheduled Times</th>
                    <th className="p-2.5">Indication</th>
                    <th className="p-2.5">Start Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {activeMeds.map((med) => {
                    const reg = regimenMap.get(med.id);
                    return (
                      <tr key={med.id}>
                        <td className="p-2.5 font-sans font-bold text-slate-900">
                          {med.brandName ? `${med.brandName} (${med.medicationName})` : med.medicationName}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-700">
                          {med.strengthValue} {med.strengthUnit}
                        </td>
                        <td className="p-2.5 text-slate-700 font-sans">
                          {med.form} ({med.route})
                        </td>
                        <td className="p-2.5 text-slate-800 font-bold">
                          {reg?.frequencyType === 'prn'
                            ? `PRN (${reg.prnMaxPerDay || 'As needed'})`
                            : reg?.scheduleEntries
                                .map((s) => `${s.doseQuantity} ${s.doseUnit} @ ${s.localTime}`)
                                .join(', ')}
                        </td>
                        <td className="p-2.5 font-sans text-slate-600">
                          {med.reasonForUse || 'N/A'}
                        </td>
                        <td className="p-2.5 text-slate-500">
                          {med.startDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Patient / Caregiver Safety Caveat */}
          <p className="text-[10px] text-slate-400 italic pt-2">
            Notice: This record is maintained by the patient/caregiver for personal tracking and clinical communication. Always verify dosages and instructions with the prescribing physician or dispensing pharmacist before administration.
          </p>
        </div>
      </div>

      {/* Grid: Encrypted Vault Backup & Portability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Backup Vault Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Lock className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Encrypted Backup (.medvault)
            </h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Download an authenticated, AES-256-GCM encrypted backup containing all patient profiles, medications, dose logs, and immunizations. Store safely on a USB drive or cloud drive.
          </p>

          <form onSubmit={handleExportEncrypted} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Backup Passphrase *
              </label>
              <input
                type="password"
                required
                value={backupPassphrase}
                onChange={(e) => setBackupPassphrase(e.target.value)}
                placeholder="Enter a strong passphrase..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Confirm Passphrase *
              </label>
              <input
                type="password"
                required
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Confirm passphrase..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            {backupError && (
              <p className="text-rose-600 font-medium text-[11px]">{backupError}</p>
            )}
            {backupSuccess && (
              <p className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {backupSuccess}
              </p>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition"
              >
                <Download className="w-4 h-4" />
                Export Encrypted .medvault
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition"
                title="Plain unencrypted JSON for data portability"
              >
                Plain JSON
              </button>
            </div>
          </form>
        </div>

        {/* Restore Vault Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Upload className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Restore Vault from Backup
            </h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Select a <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">.medvault</code> or JSON file to restore records. Records will be validated before replacing current vault contents.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Select Backup File
              </label>
              <input
                type="file"
                accept=".medvault,.json"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
            </div>

            {importFile?.name.endsWith('.medvault') && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Decryption Passphrase
                </label>
                <input
                  type="password"
                  value={importPassphrase}
                  onChange={(e) => setImportPassphrase(e.target.value)}
                  placeholder="Enter file passphrase..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            )}

            {importError && (
              <p className="text-rose-600 font-medium text-[11px]">{importError}</p>
            )}

            {importPreview ? (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 space-y-2">
                <span className="font-bold text-teal-900 block text-xs">
                  Backup File Verified:
                </span>
                <ul className="text-teal-800 space-y-0.5 text-[11px] font-mono">
                  <li>· Patients: {importPreview.patientCount}</li>
                  <li>· Medications: {importPreview.medicationCount}</li>
                  <li>· Vaccinations: {importPreview.vaccineCount}</li>
                  <li>· Exported on: {importPreview.exportedAt}</li>
                </ul>
                <button
                  type="button"
                  onClick={handleConfirmRestore}
                  className="w-full mt-2 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition"
                >
                  Confirm & Replace Vault Data
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!importFile}
                onClick={handlePreviewImport}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition ${
                  importFile
                    ? 'bg-teal-600 hover:bg-teal-500 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>Verify & Preview Backup</span>
              </button>
            )}

            {importSuccess && (
              <p className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {importSuccess}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Storage Health & Durability Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-slate-400 shrink-0" />
          <div>
            <h4 className="font-bold text-slate-800">
              Browser Storage Durability
            </h4>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {isPersisted
                ? 'Persistent storage granted by browser. Data will not be automatically cleared under low storage.'
                : 'Storage is non-persistent. Request persistence to protect against browser cache eviction.'}
            </p>
          </div>
        </div>

        {!isPersisted && (
          <button
            onClick={handleRequestPersistence}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shrink-0"
          >
            Request Persistent Storage
          </button>
        )}
      </div>

    </div>
  );
};
