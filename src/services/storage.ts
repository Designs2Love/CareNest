import {
  PatientProfile,
  MedicationDefinition,
  Regimen,
  MedicationPackage,
  DoseLog,
  VaccinationRecord,
  ExpiryAlertItem,
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_MEDICATIONS,
  INITIAL_REGIMENS,
  INITIAL_PACKAGES,
  INITIAL_DOSE_LOGS,
  INITIAL_VACCINATIONS,
} from '../data/seedData';

const STORAGE_KEYS = {
  PATIENTS: 'medvault_patients_v1',
  MEDICATIONS: 'medvault_medications_v1',
  REGIMENS: 'medvault_regimens_v1',
  PACKAGES: 'medvault_packages_v1',
  DOSE_LOGS: 'medvault_dose_logs_v1',
  VACCINATIONS: 'medvault_vaccinations_v1',
  ACTIVE_PATIENT: 'medvault_active_patient_v1',
  VAULT_PASSCODE: 'medvault_passcode_hash_v1',
  IS_LOCKED: 'medvault_is_locked_v1',
  ONBOARDING_COMPLETED: 'carenest_onboarding_completed_v1',
};

// Web Crypto PBKDF2 + AES-GCM Key Derivation & Encryption helpers
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function hashPasscode(passcode: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(passcode));
  const hashArray = Array.from(new Uint8Array(buf));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function encryptVaultData(data: object, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const enc = new TextEncoder();
  const plaintext = enc.encode(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    plaintext
  );

  const exportPayload = {
    formatVersion: 'medvault-1.0',
    cipher: 'AES-256-GCM',
    kdf: 'PBKDF2-SHA256',
    iterations: 100000,
    salt: Array.from(salt),
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext)),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportPayload, null, 2);
}

export async function decryptVaultData(jsonStr: string, passphrase: string): Promise<any> {
  const payload = JSON.parse(jsonStr);
  if (payload.formatVersion !== 'medvault-1.0') {
    throw new Error('Unsupported vault backup format version');
  }

  const salt = new Uint8Array(payload.salt);
  const iv = new Uint8Array(payload.iv);
  const ciphertext = new Uint8Array(payload.data);

  const key = await deriveKey(passphrase, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    ciphertext as unknown as BufferSource
  );

  const dec = new TextDecoder();
  return JSON.parse(dec.decode(decrypted));
}

// Storage Manager
class VaultStorage {
  private initialized = false;

  public init() {
    if (this.initialized) return;

    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      this.resetToSeedData();
    }
    this.initialized = true;
  }

  // Onboarding / Get Started state (Only for first-time visitors)
  public isOnboardingCompleted(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
  }

  public completeOnboarding(): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  }

  public resetOnboarding(): void {
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
  }

  // Erase all demo records and start with user's custom patient
  public clearAllDemoDataAndStart(firstPatient: Omit<PatientProfile, 'id' | 'createdAt' | 'isArchived'>): PatientProfile {
    const newPatient: PatientProfile = {
      ...firstPatient,
      id: 'pat-' + crypto.randomUUID().slice(0, 8),
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([newPatient]));
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REGIMENS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, newPatient.id);
    this.completeOnboarding();

    return newPatient;
  }

  // Erase ALL patient profiles and all medications/records (Complete Blank Slate)
  public eraseAllData() {
    // Create an initial blank default profile so the app structure is valid
    const defaultPatient: PatientProfile = {
      id: 'pat-' + crypto.randomUUID().slice(0, 8),
      name: 'Primary Patient',
      preferredName: 'Patient',
      gender: 'Female',
      allergies: [],
      avatarColor: 'bg-rose-600',
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([defaultPatient]));
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REGIMENS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, defaultPatient.id);
    return defaultPatient;
  }

  // Erase only Demo Data (Leaves custom non-demo patients intact, or creates clean patient if only demo existed)
  public eraseDemoDataOnly(): string {
    const demoPatientIds = new Set(['pat-eleanor', 'pat-michael', 'pat-sophia']);

    const allPatients = this.getPatients(true);
    const nonDemoPatients = allPatients.filter((p) => !demoPatientIds.has(p.id));

    let activePatId = '';

    if (nonDemoPatients.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(nonDemoPatients));
      activePatId = nonDemoPatients[0].id;
    } else {
      // If only demo patients existed, initialize with a clean personal profile
      const cleanPat: PatientProfile = {
        id: 'pat-' + crypto.randomUUID().slice(0, 8),
        name: 'My Profile',
        preferredName: 'Me',
        gender: 'Female',
        allergies: [],
        avatarColor: 'bg-rose-600',
        isArchived: false,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([cleanPat]));
      activePatId = cleanPat.id;
    }

    // Filter out medications, regimens, packages, logs, and vaccines belonging to demo patient IDs
    const filterOutDemo = (key: string, idField: string) => {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const list = JSON.parse(raw);
          const filtered = list.filter((item: any) => !demoPatientIds.has(item[idField]));
          localStorage.setItem(key, JSON.stringify(filtered));
        } catch {
          // ignore
        }
      }
    };

    filterOutDemo(STORAGE_KEYS.MEDICATIONS, 'patientId');
    filterOutDemo(STORAGE_KEYS.REGIMENS, 'patientId');
    filterOutDemo(STORAGE_KEYS.PACKAGES, 'patientId');
    filterOutDemo(STORAGE_KEYS.DOSE_LOGS, 'patientId');
    filterOutDemo(STORAGE_KEYS.VACCINATIONS, 'patientId');

    localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, activePatId);
    return activePatId;
  }

  public resetToSeedData() {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(INITIAL_MEDICATIONS));
    localStorage.setItem(STORAGE_KEYS.REGIMENS, JSON.stringify(INITIAL_REGIMENS));
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(INITIAL_PACKAGES));
    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(INITIAL_DOSE_LOGS));
    localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify(INITIAL_VACCINATIONS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, INITIAL_PATIENTS[0].id);
  }

  // Passcode Security
  public getPasscodeHash(): string | null {
    return localStorage.getItem(STORAGE_KEYS.VAULT_PASSCODE);
  }

  public setPasscode(hash: string | null) {
    if (hash) {
      localStorage.setItem(STORAGE_KEYS.VAULT_PASSCODE, hash);
    } else {
      localStorage.removeItem(STORAGE_KEYS.VAULT_PASSCODE);
      localStorage.removeItem(STORAGE_KEYS.IS_LOCKED);
    }
  }

  public isVaultLocked(): boolean {
    const hasCode = !!this.getPasscodeHash();
    if (!hasCode) return false;
    return localStorage.getItem(STORAGE_KEYS.IS_LOCKED) === 'true';
  }

  public setVaultLocked(locked: boolean) {
    localStorage.setItem(STORAGE_KEYS.IS_LOCKED, locked ? 'true' : 'false');
  }

  // Active Patient
  public getActivePatientId(): string {
    this.init();
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT);
    if (stored) return stored;
    const patients = this.getPatients();
    const firstActive = patients.find((p) => !p.isArchived) || patients[0];
    return firstActive?.id || 'pat-eleanor';
  }

  public setActivePatientId(patientId: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, patientId);
  }

  // Patients (Up to 6 max)
  public getPatients(includeArchived = false): PatientProfile[] {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      const list: PatientProfile[] = raw ? JSON.parse(raw) : [];
      return includeArchived ? list : list.filter((p) => !p.isArchived);
    } catch {
      return [];
    }
  }

  public getPatientById(id: string): PatientProfile | undefined {
    return this.getPatients(true).find((p) => p.id === id);
  }

  public addPatient(profile: Omit<PatientProfile, 'id' | 'createdAt' | 'isArchived'>): PatientProfile {
    const all = this.getPatients(true);
    const activeCount = all.filter((p) => !p.isArchived).length;
    if (activeCount >= 6) {
      throw new Error('Maximum limit of 6 active patient profiles reached for this device.');
    }

    const newPatient: PatientProfile = {
      ...profile,
      id: 'pat-' + crypto.randomUUID().slice(0, 8),
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    all.push(newPatient);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(all));
    return newPatient;
  }

  public updatePatient(patient: PatientProfile) {
    const all = this.getPatients(true);
    const index = all.findIndex((p) => p.id === patient.id);
    if (index !== -1) {
      all[index] = patient;
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(all));
    }
  }

  public archivePatient(id: string) {
    const all = this.getPatients(true);
    const target = all.find((p) => p.id === id);
    if (target) {
      target.isArchived = true;
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(all));
      // If active patient is archived, switch to next available active
      if (this.getActivePatientId() === id) {
        const next = all.find((p) => !p.isArchived);
        if (next) {
          this.setActivePatientId(next.id);
        }
      }
    }
  }

  public restorePatient(id: string) {
    const all = this.getPatients(true);
    const activeCount = all.filter((p) => !p.isArchived).length;
    if (activeCount >= 6) {
      throw new Error('Cannot restore profile: limit of 6 active patient profiles reached.');
    }
    const target = all.find((p) => p.id === id);
    if (target) {
      target.isArchived = false;
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(all));
    }
  }

  // Medications (Strict Patient Isolation)
  public getMedications(patientId: string): MedicationDefinition[] {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
      const all: MedicationDefinition[] = raw ? JSON.parse(raw) : [];
      return all.filter((m) => m.patientId === patientId);
    } catch {
      return [];
    }
  }

  public addMedication(
    med: Omit<MedicationDefinition, 'id' | 'createdAt' | 'updatedAt'>,
    regimenData: Omit<Regimen, 'id' | 'medicationId' | 'patientId'>,
    packageData?: Omit<MedicationPackage, 'id' | 'medicationId' | 'patientId'>
  ): MedicationDefinition {
    const medId = 'med-' + crypto.randomUUID().slice(0, 8);
    const nowIso = new Date().toISOString();

    const newMed: MedicationDefinition = {
      ...med,
      id: medId,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const allMeds: MedicationDefinition[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.MEDICATIONS) || '[]'
    );
    allMeds.push(newMed);
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(allMeds));

    // Regimen creation
    const newRegimen: Regimen = {
      ...regimenData,
      id: 'reg-' + crypto.randomUUID().slice(0, 8),
      medicationId: medId,
      patientId: med.patientId,
    };
    const allRegimens: Regimen[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.REGIMENS) || '[]'
    );
    allRegimens.push(newRegimen);
    localStorage.setItem(STORAGE_KEYS.REGIMENS, JSON.stringify(allRegimens));

    // Optional Package Creation
    if (packageData && packageData.expirationDate) {
      const newPkg: MedicationPackage = {
        ...packageData,
        id: 'pkg-' + crypto.randomUUID().slice(0, 8),
        medicationId: medId,
        patientId: med.patientId,
      };
      const allPackages: MedicationPackage[] = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.PACKAGES) || '[]'
      );
      allPackages.push(newPkg);
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(allPackages));
    }

    return newMed;
  }

  public updateMedication(med: MedicationDefinition) {
    const all: MedicationDefinition[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.MEDICATIONS) || '[]'
    );
    const idx = all.findIndex((m) => m.id === med.id && m.patientId === med.patientId);
    if (idx !== -1) {
      all[idx] = { ...med, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(all));
    }
  }

  public stopMedication(medId: string, patientId: string, stopDate?: string) {
    const all: MedicationDefinition[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.MEDICATIONS) || '[]'
    );
    const target = all.find((m) => m.id === medId && m.patientId === patientId);
    if (target) {
      target.status = 'stopped';
      target.endDate = stopDate || new Date().toISOString().split('T')[0];
      target.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(all));
    }
  }

  public deleteMedication(medId: string, patientId: string) {
    // 1. Remove medication definition
    const allMeds: MedicationDefinition[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.MEDICATIONS) || '[]'
    );
    const remainingMeds = allMeds.filter(
      (m) => !(m.id === medId && m.patientId === patientId)
    );
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(remainingMeds));

    // 2. Remove associated regimens
    const allRegimens: Regimen[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.REGIMENS) || '[]'
    );
    const remainingRegimens = allRegimens.filter(
      (r) => !(r.medicationId === medId && r.patientId === patientId)
    );
    localStorage.setItem(STORAGE_KEYS.REGIMENS, JSON.stringify(remainingRegimens));

    // 3. Remove associated packages
    const allPackages: MedicationPackage[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PACKAGES) || '[]'
    );
    const remainingPackages = allPackages.filter(
      (p) => !(p.medicationId === medId && p.patientId === patientId)
    );
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(remainingPackages));

    // 4. Remove associated dose logs
    const allLogs: DoseLog[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.DOSE_LOGS) || '[]'
    );
    const remainingLogs = allLogs.filter(
      (l) => !(l.medicationId === medId && l.patientId === patientId)
    );
    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(remainingLogs));
  }

  // Regimens
  public getRegimens(patientId: string): Regimen[] {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.REGIMENS);
      const all: Regimen[] = raw ? JSON.parse(raw) : [];
      return all.filter((r) => r.patientId === patientId);
    } catch {
      return [];
    }
  }

  public getRegimenForMedication(medicationId: string, patientId: string): Regimen | undefined {
    return this.getRegimens(patientId).find((r) => r.medicationId === medicationId);
  }

  // Packages (Inventory & Expiry)
  public getPackages(patientId: string): MedicationPackage[] {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      const all: MedicationPackage[] = raw ? JSON.parse(raw) : [];
      return all.filter((p) => p.patientId === patientId);
    } catch {
      return [];
    }
  }

  public addPackage(pkg: Omit<MedicationPackage, 'id'>): MedicationPackage {
    const newPkg: MedicationPackage = {
      ...pkg,
      id: 'pkg-' + crypto.randomUUID().slice(0, 8),
    };
    const all: MedicationPackage[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PACKAGES) || '[]'
    );
    all.push(newPkg);
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(all));
    return newPkg;
  }

  // Expiry Alerts for Active Patient
  public getExpiryAlerts(patientId: string): ExpiryAlertItem[] {
    const pkgs = this.getPackages(patientId);
    const meds = this.getMedications(patientId);
    const medMap = new Map(meds.map((m) => [m.id, m]));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alerts: ExpiryAlertItem[] = [];

    for (const pkg of pkgs) {
      if (!pkg.expirationDate) continue;
      const expDate = new Date(pkg.expirationDate + 'T00:00:00');
      const diffTime = expDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const med = medMap.get(pkg.medicationId);

      // Alert if expired or within 30 days
      if (daysRemaining <= 30) {
        alerts.push({
          packageId: pkg.id,
          medicationId: pkg.medicationId,
          medicationName: med?.medicationName || 'Unknown Medication',
          brandName: med?.brandName,
          lotNumber: pkg.lotNumber,
          expirationDate: pkg.expirationDate,
          daysRemaining,
          isExpired: daysRemaining < 0,
          remainingQuantity: pkg.remainingQuantity,
          unit: pkg.unit,
        });
      }
    }

    // Sort: expired first (most overdue), then expiring soonest
    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  // Dose Logs (Today's Adherence)
  public getDoseLogs(patientId: string, date: string): DoseLog[] {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DOSE_LOGS);
      const all: DoseLog[] = raw ? JSON.parse(raw) : [];
      return all.filter((l) => l.patientId === patientId && l.date === date);
    } catch {
      return [];
    }
  }

  public markDoseTaken(
    patientId: string,
    medicationId: string,
    scheduleTime: string,
    date: string,
    quantityTaken?: string
  ) {
    const raw = localStorage.getItem(STORAGE_KEYS.DOSE_LOGS);
    const all: DoseLog[] = raw ? JSON.parse(raw) : [];

    const existingIndex = all.findIndex(
      (l) =>
        l.patientId === patientId &&
        l.medicationId === medicationId &&
        l.scheduleTime === scheduleTime &&
        l.date === date
    );

    if (existingIndex !== -1) {
      all[existingIndex].status = 'taken';
      all[existingIndex].takenAt = new Date().toISOString();
      if (quantityTaken) all[existingIndex].quantityTaken = quantityTaken;
    } else {
      all.push({
        id: 'dose-' + crypto.randomUUID().slice(0, 8),
        patientId,
        medicationId,
        scheduleTime,
        date,
        status: 'taken',
        takenAt: new Date().toISOString(),
        quantityTaken,
      });
    }

    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(all));
  }

  public undoDose(
    patientId: string,
    medicationId: string,
    scheduleTime: string,
    date: string
  ) {
    const raw = localStorage.getItem(STORAGE_KEYS.DOSE_LOGS);
    const all: DoseLog[] = raw ? JSON.parse(raw) : [];

    const existingIndex = all.findIndex(
      (l) =>
        l.patientId === patientId &&
        l.medicationId === medicationId &&
        l.scheduleTime === scheduleTime &&
        l.date === date
    );

    if (existingIndex !== -1) {
      all[existingIndex].status = 'pending';
      all[existingIndex].takenAt = undefined;
      localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(all));
    }
  }

  // Vaccinations
  public getVaccinations(patientId: string): VaccinationRecord[] {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.VACCINATIONS);
      const all: VaccinationRecord[] = raw ? JSON.parse(raw) : [];
      return all
        .filter((v) => v.patientId === patientId)
        .sort((a, b) => (b.dateAdministered > a.dateAdministered ? 1 : -1));
    } catch {
      return [];
    }
  }

  public addVaccination(
    record: Omit<VaccinationRecord, 'id' | 'createdAt'>
  ): VaccinationRecord {
    const newRecord: VaccinationRecord = {
      ...record,
      id: 'vac-' + crypto.randomUUID().slice(0, 8),
      createdAt: new Date().toISOString(),
    };
    const all: VaccinationRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.VACCINATIONS) || '[]'
    );
    all.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify(all));
    return newRecord;
  }

  // Vault Full Export / Import
  public getFullVaultState() {
    this.init();
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      patients: JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]'),
      medications: JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDICATIONS) || '[]'),
      regimens: JSON.parse(localStorage.getItem(STORAGE_KEYS.REGIMENS) || '[]'),
      packages: JSON.parse(localStorage.getItem(STORAGE_KEYS.PACKAGES) || '[]'),
      doseLogs: JSON.parse(localStorage.getItem(STORAGE_KEYS.DOSE_LOGS) || '[]'),
      vaccinations: JSON.parse(localStorage.getItem(STORAGE_KEYS.VACCINATIONS) || '[]'),
      activePatientId: this.getActivePatientId(),
    };
  }

  public restoreFullVaultState(state: any) {
    if (!state || !Array.isArray(state.patients)) {
      throw new Error('Invalid vault file structure: missing patient records.');
    }
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(state.patients));
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(state.medications || []));
    localStorage.setItem(STORAGE_KEYS.REGIMENS, JSON.stringify(state.regimens || []));
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(state.packages || []));
    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(state.doseLogs || []));
    localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify(state.vaccinations || []));
    if (state.activePatientId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, state.activePatientId);
    }
  }
}

export const vaultStorage = new VaultStorage();
