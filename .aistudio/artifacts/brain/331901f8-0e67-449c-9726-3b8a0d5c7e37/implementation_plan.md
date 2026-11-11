# Medication Vault - Multi-Patient Medication & Vaccination PWA

A privacy-first, offline-ready Progressive Web App (PWA) built with React, TypeScript, and Tailwind CSS. Enables household caregivers and individuals to manage isolated medication and vaccination records for up to 6 patient profiles, monitor real-time expiration alerts, log daily doses with one-tap undo, and safely export clinical records—all stored locally in the browser with no server dependency.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been aligned based on your preferences and technical specification:
> - **Pre-loaded Demo Data**: The app will launch seeded with 3 realistic family patient profiles (e.g., senior with chronic regimens, adult with allergy alerts, child with vaccination records) so all features—Today's dosing, expiry alerts, tables, and search—can be tested immediately, with full ability to add, edit, or reset.
> - **Vault Access & Passcode**: Optional passcode lock with fast trusted-device access. Users can set a passcode to lock the vault or use direct instant access, with complete browser-side Web Crypto AES-GCM data encryption.
> - **Visual Theme**: **Clinical Slate** aesthetic—refined slate backgrounds, calm teal accents, crisp card elevations, tabular typography, and accessible status indicators.
> - **Single-Page Navigation**: Strict adherence to the header contract: App wordmark, clickable Expiry Alert dropdown, Patient Info & Allergies dropdown, "+ Add Medication" CTA, and Hamburger Menu to switch between single-view pages.

---

### 1. Overview & Core Concept

- **What It Does**: A standalone medication and vaccination management app that runs 100% offline in any modern browser or installed as a PWA on mobile/desktop. It maintains strict data isolation across patient profiles, tracks fractional doses (e.g., 0.25, 0.5, 1.5 tablets), monitors multiple inventory packages with lot numbers and expiry dates, logs daily dose adherence, and archives full treatment histories.
- **Target Audience / Persona**: Family caregivers managing medications for multiple relatives, individuals managing complex chronic regimens, and patients preparing verified medication lists for doctor visits.
- **Key Value**: 100% private and offline-capable; zero cloud backend; no patient health data sent across the network or published to GitHub Pages. All records live safely in local browser storage (IndexedDB + Web Crypto).

---

### 2. User Experience & Visual Design

#### A. Header Architecture & Control Contract
The top header provides instant awareness and quick access across mobile and desktop without taking more than 60px vertical height:
1. **Brand Wordmark & Logo**: Sleek medical cross/shield emblem with "MedVault" in crisp display type.
2. **Medication Expiry Alert Button & Dropdown**:
   - Shows badge counter of items expiring within 30 days or already expired.
   - Clicking opens a dropdown card with categorized lists: *Expired* (urgent warning) and *Expiring Soon* (with remaining days counter and package lot).
3. **Patient Info & Allergies Button & Dropdown**:
   - Shows active patient name and avatar initial.
   - Clicking opens a patient summary card showing age (calculated from birthdate), gender, listed medication allergies (prominently styled with high contrast), emergency caregiver notes, and a "Switch Profile" shortcut.
4. **"+ Add Medication" CTA Button**: Direct access button with teal accent to record a new medicine for the active patient.
5. **Hamburger Menu**:
   - Triggers the slide-over drawer to switch between the 6 single-page views:
     1. *Patient Profiles* (manage & switch between up to 6 patient profiles)
     2. *Add Medication* (comprehensive 4-step guided form)
     3. *Today's Medications* (daily adherence dashboard with taken/pending & undo)
     4. *Medication History* (searchable tabular treatment log)
     5. *Vaccination History* (immunization registry with side-effect tracking)
     6. *Export & Backup* (printable clinician report, JSON export, and encrypted .medvault backup/restore)

#### B. Page Views & Interactions

- **Today's Medications Page**:
  - **Adherence Summary Card**: Sleek compact progress strip at the top showing doses completed (e.g., "3 of 5 doses taken · 60%"), remaining doses, and a visual progress bar.
  - **Compact Dose Cards**: Grouped chronologically by scheduled time (Morning 08:00, Afternoon 13:00, Evening 20:00, Bedtime 22:00, and PRN / As Needed).
  - **Medication Item Details**: Displays bold Brand/Trade name, generic name, active ingredients & composition underneath, exact dose quantity (e.g., "0.5 tablet" or "10 mL"), route, and food directions.
  - **Action Controls**: "Mark as Taken" button with instant tactile feedback. Once taken, displays a clear emerald checkmark and an **"Undo" button** to revert accidental taps without friction.
- **Medication History Page**:
  - **Search & Filter Bar**: Instant search filtering by drug name, brand, active ingredients, or health issue / indication.
  - **Structured Tabular Layout**: Responsive data table with columns:
    - *Status*: Active (green badge) vs Completed / Stopped / Paused (muted text).
    - *Medication & Brand*: Primary name and brand/generic classification.
    - *Strength / Power*: Active strength per unit (e.g., 20 mg/tablet).
    - *Dosage & Route*: Fractional dose schedule (e.g., 0.5 tablet oral twice daily).
    - *Timeline*: Start date and stop/completion date.
    - *Reason / Indication*: Health condition or symptom recorded.
    - *Actions*: View full regimen version history, manage packages, or edit.
- **Vaccination History Page**:
  - Immunization log showing: Vaccine Name, Formulation/Antigen Composition, Vaccination Date, Provider/Facility Location, Lot Number, and Reported Side Effects / Reactions.
  - Quick "+ Log Vaccination" dialog.
- **Patient Profiles Page**:
  - Switch active patient with 1 click.
  - View patient cards (name, relationship label, age, gender, allergies, active med count).
  - Add new patient profile (max 6), edit details, or archive profile safely.
- **Export & Vault Backup Page**:
  - Clinician-ready formatted Medication Reconciliation Sheet ready for printing or PDF export.
  - One-click encrypted `.medvault` export file generation.
  - Secure `.medvault` file import with schema validation and conflict resolution.

#### C. Visual Aesthetics & Styling
- **Palette**: Neutral Slate (`#0f172a` canvas, `#1e293b` borders, `#ffffff` card surfaces, `#f8fafc` app background) paired with Calm Teal (`#0d9488` primary accent, `#14b8a6` hover).
- **Semantics**: Emerald (`#059669`) for confirmed doses, Amber (`#d97706`) for impending expiries, Crimson (`#dc2626`) for expired packages and critical allergy warnings.
- **Typography**: Clean sans display and UI text paired with `font-mono tabular-nums` for precise dose quantities and times.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Zero Cloud Backend vs. Local Encrypted IndexedDB**:
  - *Chosen Approach*: Store 100% of patient records in client-side IndexedDB with Web Crypto AES-256-GCM encryption.
  - *Why*: Guarantees total privacy and compliance with GitHub Pages static hosting limitations. No personal health information is ever stored in Git or cloud servers.
  - *Mitigation*: Built-in regular encrypted `.medvault` backup download prompts and storage persistence requests (`navigator.storage.persist()`).
- **Decision 2: Strict Patient Data Isolation Boundary**:
  - *Chosen Approach*: Every medication, regimen version, package batch, dose administration, and vaccine record has an immutable `patientId`. All repository read/write methods filter at the database level.
  - *Why*: Switching profiles guarantees 0% cross-patient leakage in the UI, dropdowns, and export files.
- **Decision 3: String Decimals for Fractional Dosages**:
  - *Chosen Approach*: Store doses as normalized decimal strings (`"0.25"`, `"0.5"`, `"1.5"`) rather than IEEE floating-point numbers.
  - *Why*: Eliminates floating-point rounding errors (e.g., `0.1 + 0.2 = 0.30000000000000004`) in critical medical recording.
- **Decision 4: Per-Package Expiry Tracking**:
  - *Chosen Approach*: Medications do not have a single expiration date; instead, each physical bottle, box, or blister pack has its own lot number and expiration date.
  - *Why*: Reflects real-world pharmacy dispensing where patients possess multiple bottles with different expiry dates.

---

### 4. Technical Architecture & Data Strategy

#### A. System & Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Top App Bar Header                                │
│ [Logo]  [Expiry Alert v]  [Patient Info v]  [+ Add Med]  [Hamburger Menu]   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Active Page Selection
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│ Today's Meds     │          │ Med History      │          │ Vaccine History  │
│ - Adherence Bar  │          │ - Search Input   │          │ - Vaccine Cards  │
│ - Due Dose Cards │          │ - Filter Tabs    │          │ - Provider Info  │
│ - Taken / Undo   │          │ - Data Table     │          │ - Side Effects   │
└──────────────────┘          └──────────────────┘          └──────────────────┘
        │                              │                              │
        ├──────────────────────────────┴──────────────────────────────┤
        ▼                                                             ▼
┌─────────────────────────────────┐               ┌───────────────────────────┐
│ Patient Profiles & Switcher     │               │ Export & Encrypted Backup │
└─────────────────────────────────┘               └───────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Patient Data Isolation Layer                          │
│        (Patient Context Hook: activePatientId, auto-scoped queries)         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       IndexedDB / Vault Storage Layer                       │
│  - PatientProfiles   - MedicationDefinitions   - RegimenVersions            │
│  - MedicationPackages (Expiry)                 - Administrations (Logs)     │
│  - VaccinationRecords                          - AuditEvents                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Offline PWA & Service Worker                           │
│  - vite-plugin-pwa (AutoUpdate, precaching shell assets, manifest)          │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### B. Core Data Schemas

1. **PatientProfile**:
   `{ id: string, name: string, preferredName: string, birthDate?: string, gender: string, allergies: string[], careNotes?: string, avatarColor: string, isArchived: boolean }`
2. **MedicationDefinition**:
   `{ id: string, patientId: string, medicationName: string, brandName?: string, composition: string, form: string, route: string, reasonForUse?: string, instructionsLabel?: string, status: 'active' | 'paused' | 'completed' | 'stopped', createdAt: string }`
3. **RegimenVersion**:
   `{ id: string, medicationId: string, patientId: string, versionNumber: number, effectiveStartDate: string, effectiveEndDate?: string, frequencyType: 'daily' | 'prn' | 'interval', scheduleEntries: Array<{ localTime: string, doseQuantity: string, doseUnit: string }>, notes?: string }`
4. **MedicationPackage (Inventory & Expiry)**:
   `{ id: string, medicationId: string, patientId: string, lotNumber?: string, expirationDate: string, remainingQuantity: string, unit: string, status: 'in_use' | 'unopened' | 'consumed' | 'expired' }`
5. **DoseAdministration**:
   `{ id: string, medicationId: string, patientId: string, scheduledDate: string, scheduledTime: string, outcome: 'taken' | 'pending' | 'skipped', takenAt?: string }`
6. **VaccinationRecord**:
   `{ id: string, patientId: string, vaccineName: string, composition: string, dateAdministered: string, administeredAt: string, lotNumber?: string, sideEffectsNotes?: string }`

#### C. Implementation Steps
1. **PWA Setup**: Configure `vite-plugin-pwa`, `manifest.webmanifest`, app icons, and offline service worker precaching.
2. **Storage & Security Core**: Build indexed storage layer with initial seed data, active patient context, and export/import serializers.
3. **Header Controls**: Implement the sticky responsive top bar with clickable Expiry Alert dropdown, Patient Info & Allergies dropdown, Add Medication CTA, and Hamburger Drawer.
4. **Today's Medications**: Implement the adherence summary metric, compact dose card layout, "Mark Taken" handler, and "Undo" toggle.
5. **Medication History**: Implement full tabular overview with search by medication name or indication, brand/generic indicators, and timeline.
6. **Vaccination History**: Implement immunization cards and new vaccine recording dialog.
7. **Patient Profiles**: Implement 6-profile manager, profile switcher, and profile editor.
8. **Export & Portability**: Build printable clinician summary report and encrypted `.medvault` export/import.
