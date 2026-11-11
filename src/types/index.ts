export type Gender = 'Female' | 'Male' | 'Non-binary' | 'Other';

export interface PatientProfile {
  id: string;
  name: string;
  preferredName: string;
  birthDate?: string; // YYYY-MM-DD
  gender: Gender;
  allergies: string[]; // e.g. ["Penicillin (Anaphylaxis)", "Sulfa drugs (Rash)"]
  careNotes?: string;
  avatarColor: string; // Tailwind color class or hex
  isArchived: boolean;
  createdAt: string;
}

export type MedicationStatus = 'active' | 'paused' | 'completed' | 'stopped';

export interface ScheduleEntry {
  id: string;
  localTime: string; // "08:00", "13:00", "20:00"
  doseQuantity: string; // Exact decimal string: "0.25", "0.5", "1", "1.5", "2"
  doseUnit: string; // "tablet", "capsule", "mL", "puff", "drops"
  label?: string; // "Morning with breakfast", "Night before sleep"
}

export interface Regimen {
  id: string;
  medicationId: string;
  patientId: string;
  frequencyType: 'daily' | 'prn' | 'weekdays' | 'interval';
  scheduleEntries: ScheduleEntry[];
  prnMaxPerDay?: string;
  prnInstructions?: string;
  effectiveStartDate: string; // YYYY-MM-DD
  effectiveEndDate?: string;
  changeReason?: string;
}

export interface MedicationDefinition {
  id: string;
  patientId: string;
  medicationName: string;
  brandName?: string;
  composition: string; // Exact active ingredients & strengths
  strengthValue: string; // e.g. "500", "10", "25"
  strengthUnit: string; // e.g. "mg", "mcg", "mg/5mL", "%"
  form: string; // "Tablet", "Capsule", "Oral Liquid", "Inhaler", "Patch", "Injection"
  route: string; // "Oral", "Inhaled", "Topical", "Subcutaneous", "Ophthalmic"
  isGeneric: boolean;
  prescribedBy?: string;
  pharmacy?: string;
  reasonForUse?: string; // Indication / health issue (e.g. "Hypertension", "Diabetes", "Allergic Rhinitis")
  instructionsLabel?: string; // Verbatim label instructions
  notes?: string;
  status: MedicationStatus;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export type PackageStatus = 'in_use' | 'unopened' | 'consumed' | 'discarded' | 'expired';

export interface MedicationPackage {
  id: string;
  medicationId: string;
  patientId: string;
  lotNumber?: string;
  expirationDate: string; // YYYY-MM-DD
  initialQuantity: string;
  remainingQuantity: string;
  unit: string;
  refillThreshold?: string;
  storageNotes?: string;
  status: PackageStatus;
}

export interface DoseLog {
  id: string;
  patientId: string;
  medicationId: string;
  scheduleTime: string; // "08:00"
  date: string; // YYYY-MM-DD
  takenAt?: string; // ISO string
  status: 'taken' | 'pending' | 'skipped';
  quantityTaken?: string;
  notes?: string;
}

export interface VaccinationRecord {
  id: string;
  patientId: string;
  vaccineName: string;
  composition: string;
  dateAdministered: string; // YYYY-MM-DD
  administeredAt: string; // Clinic, Pharmacy, Hospital
  lotNumber?: string;
  routeAndSite?: string;
  sideEffectsNotes?: string;
  administeredBy?: string;
  nextDoseDate?: string;
  createdAt: string;
}

export type ActivePage =
  | 'today'
  | 'history'
  | 'vaccines'
  | 'patients'
  | 'add-medication'
  | 'export';

export interface ExpiryAlertItem {
  packageId: string;
  medicationId: string;
  medicationName: string;
  brandName?: string;
  lotNumber?: string;
  expirationDate: string;
  daysRemaining: number;
  isExpired: boolean;
  remainingQuantity: string;
  unit: string;
}
