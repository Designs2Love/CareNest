import React, { useState } from 'react';
import {
  Pill,
  Clock,
  Package,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  Calendar,
} from 'lucide-react';
import {
  PatientProfile,
  MedicationDefinition,
  Regimen,
  MedicationPackage,
  ScheduleEntry,
} from '../types';

interface AddMedicationPageProps {
  patient: PatientProfile;
  onSaveMedication: (
    med: Omit<MedicationDefinition, 'id' | 'createdAt' | 'updatedAt'>,
    regimen: Omit<Regimen, 'id' | 'medicationId' | 'patientId'>,
    pkg?: Omit<MedicationPackage, 'id' | 'medicationId' | 'patientId'>
  ) => void;
  onCancel: () => void;
}

export const AddMedicationPage: React.FC<AddMedicationPageProps> = ({
  patient,
  onSaveMedication,
  onCancel,
}) => {
  // Step 1: Medication Identity
  const [medicationName, setMedicationName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [composition, setComposition] = useState('');
  const [strengthValue, setStrengthValue] = useState('10');
  const [strengthUnit, setStrengthUnit] = useState('mg');
  const [form, setForm] = useState('Tablet');
  const [route, setRoute] = useState('Oral');
  const [isGeneric, setIsGeneric] = useState(true);

  // Step 2: Schedule & Regimen
  const [frequencyType, setFrequencyType] = useState<'daily' | 'prn'>('daily');
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([
    { id: '1', localTime: '08:00', doseQuantity: '1', doseUnit: 'tablet', label: 'Morning' },
  ]);
  const [prnInstructions, setPrnInstructions] = useState('');
  const [prnMaxPerDay, setPrnMaxPerDay] = useState('');

  // Step 3: Clinical Context & Indication
  const [reasonForUse, setReasonForUse] = useState('');
  const [instructionsLabel, setInstructionsLabel] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [pharmacy, setPharmacy] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Step 4: Package Batch & Expiry
  const [hasPackage, setHasPackage] = useState(true);
  const [lotNumber, setLotNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [packageQuantity, setPackageQuantity] = useState('30');
  const [packageUnit, setPackageUnit] = useState('tablets');
  const [refillThreshold, setRefillThreshold] = useState('7');

  // Fractional dose presets helper
  const DOSE_PRESETS = ['0.25', '0.5', '1', '1.5', '2'];

  const handleAddScheduleEntry = () => {
    const defaultTime = scheduleEntries.length === 1 ? '20:00' : '13:00';
    setScheduleEntries([
      ...scheduleEntries,
      {
        id: crypto.randomUUID(),
        localTime: defaultTime,
        doseQuantity: '1',
        doseUnit: form.toLowerCase().includes('tablet') ? 'tablet' : 'capsule',
        label: scheduleEntries.length === 1 ? 'Evening' : 'Midday',
      },
    ]);
  };

  const handleRemoveScheduleEntry = (index: number) => {
    if (scheduleEntries.length <= 1) return;
    setScheduleEntries(scheduleEntries.filter((_, i) => i !== index));
  };

  const handleUpdateEntry = (index: number, field: keyof ScheduleEntry, val: string) => {
    const updated = [...scheduleEntries];
    updated[index] = { ...updated[index], [field]: val };
    setScheduleEntries(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicationName.trim()) return;

    const medData: Omit<MedicationDefinition, 'id' | 'createdAt' | 'updatedAt'> = {
      patientId: patient.id,
      medicationName: medicationName.trim(),
      brandName: brandName.trim() || undefined,
      composition: composition.trim() || `${medicationName.trim()} ${strengthValue}${strengthUnit}`,
      strengthValue,
      strengthUnit,
      form,
      route,
      isGeneric,
      prescribedBy: prescribedBy.trim() || undefined,
      pharmacy: pharmacy.trim() || undefined,
      reasonForUse: reasonForUse.trim() || undefined,
      instructionsLabel: instructionsLabel.trim() || undefined,
      notes: notes.trim() || undefined,
      status: 'active',
      startDate,
    };

    const regimenData: Omit<Regimen, 'id' | 'medicationId' | 'patientId'> = {
      frequencyType,
      scheduleEntries: frequencyType === 'daily' ? scheduleEntries : [],
      prnInstructions: frequencyType === 'prn' ? prnInstructions : undefined,
      prnMaxPerDay: frequencyType === 'prn' ? prnMaxPerDay : undefined,
      effectiveStartDate: startDate,
    };

    let pkgData: Omit<MedicationPackage, 'id' | 'medicationId' | 'patientId'> | undefined = undefined;
    if (hasPackage && expirationDate) {
      pkgData = {
        lotNumber: lotNumber.trim() || undefined,
        expirationDate,
        initialQuantity: packageQuantity,
        remainingQuantity: packageQuantity,
        unit: packageUnit,
        refillThreshold: refillThreshold || undefined,
        status: 'in_use',
      };
    }

    onSaveMedication(medData, regimenData, pkgData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 font-mono">
              New Medication Record
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              For {patient.preferredName}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            Add Medication to Vault
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-medium transition"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Section 1: Medication Identity & Composition */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Pill className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              1. Medication Identity & Active Composition
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Generic / Chemical Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Medication / Generic Name *
              </label>
              <input
                type="text"
                required
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                placeholder="e.g. Lisinopril, Metformin Hydrochloride"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Brand / Trade Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Brand Name (if applicable)
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Zestril, Glucophage, Lipitor"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Strength per unit */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Strength ("Power" per unit) *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={strengthValue}
                  onChange={(e) => setStrengthValue(e.target.value)}
                  placeholder="e.g. 10, 500, 25"
                  className="w-2/3 px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <select
                  value={strengthUnit}
                  onChange={(e) => setStrengthUnit(e.target.value)}
                  className="w-1/3 px-2 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-medium"
                >
                  <option value="mg">mg</option>
                  <option value="mcg">mcg</option>
                  <option value="g">g</option>
                  <option value="mg/5mL">mg/5mL</option>
                  <option value="IU">IU</option>
                  <option value="%">%</option>
                </select>
              </div>
            </div>

            {/* Form & Route */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Form
                </label>
                <select
                  value={form}
                  onChange={(e) => setForm(e.target.value)}
                  className="w-full px-2 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-medium"
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Oral Liquid">Oral Liquid</option>
                  <option value="Inhaler">Inhaler</option>
                  <option value="Injection">Injection</option>
                  <option value="Topical Cream">Topical Cream</option>
                  <option value="Eye Drops">Eye Drops</option>
                  <option value="Patch">Patch</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Route
                </label>
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="w-full px-2 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-medium"
                >
                  <option value="Oral">Oral</option>
                  <option value="Inhaled">Inhaled</option>
                  <option value="Topical">Topical</option>
                  <option value="Subcutaneous">Subcutaneous</option>
                  <option value="Ophthalmic">Ophthalmic</option>
                </select>
              </div>
            </div>

            {/* Exact Active Composition */}
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Active Ingredients & Composition
              </label>
              <textarea
                rows={2}
                value={composition}
                onChange={(e) => setComposition(e.target.value)}
                placeholder="e.g. Lisinopril dihydrate 10mg, mannitol, dibasic calcium phosphate"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Displayed directly below the medication name on Today's schedule.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Dosage & Scheduled Times */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                2. Dosage & Schedule
              </h3>
            </div>
            
            {/* Frequency Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFrequencyType('daily')}
                className={`px-3 py-1 rounded-md transition ${
                  frequencyType === 'daily'
                    ? 'bg-white text-teal-800 shadow-2xs font-bold'
                    : 'text-slate-600'
                }`}
              >
                Scheduled Daily
              </button>
              <button
                type="button"
                onClick={() => setFrequencyType('prn')}
                className={`px-3 py-1 rounded-md transition ${
                  frequencyType === 'prn'
                    ? 'bg-white text-teal-800 shadow-2xs font-bold'
                    : 'text-slate-600'
                }`}
              >
                PRN (As Needed)
              </button>
            </div>
          </div>

          {frequencyType === 'daily' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Daily administration times & fractional dose amounts:</span>
                <button
                  type="button"
                  onClick={handleAddScheduleEntry}
                  className="flex items-center gap-1 text-teal-700 font-semibold hover:text-teal-600 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Time
                </button>
              </div>

              {scheduleEntries.map((entry, index) => (
                <div
                  key={entry.id || index}
                  className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5 text-xs"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 items-end">
                    {/* Time input */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={entry.localTime}
                        onChange={(e) =>
                          handleUpdateEntry(index, 'localTime', e.target.value)
                        }
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-xs"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={entry.doseUnit}
                        onChange={(e) =>
                          handleUpdateEntry(index, 'doseUnit', e.target.value)
                        }
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs"
                      />
                    </div>

                    {/* Meal / Note */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Meal / Note
                      </label>
                      <input
                        type="text"
                        value={entry.label || ''}
                        onChange={(e) =>
                          handleUpdateEntry(index, 'label', e.target.value)
                        }
                        placeholder="e.g. Morning meal"
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs"
                      />
                    </div>
                  </div>

                  {/* Dose Quantity with Presets Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Dose:</span>
                      <input
                        type="text"
                        value={entry.doseQuantity}
                        onChange={(e) =>
                          handleUpdateEntry(index, 'doseQuantity', e.target.value)
                        }
                        className="w-14 px-1.5 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-center text-xs"
                      />
                      <div className="flex items-center gap-1 flex-wrap">
                        {DOSE_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              handleUpdateEntry(index, 'doseQuantity', preset)
                            }
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                              entry.doseQuantity === preset
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {scheduleEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveScheduleEntry(index)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Remove time"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  PRN / As-Needed Instructions
                </label>
                <input
                  type="text"
                  value={prnInstructions}
                  onChange={(e) => setPrnInstructions(e.target.value)}
                  placeholder="e.g. Inhale 2 puffs every 4-6 hours as needed for wheezing"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Maximum Prescribed Limit per Day
                </label>
                <input
                  type="text"
                  value={prnMaxPerDay}
                  onChange={(e) => setPrnMaxPerDay(e.target.value)}
                  placeholder="e.g. Maximum 8 puffs in 24 hours"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Reason for Use & Clinical Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              3. Clinical Indication & Label Instructions
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Reason for Use / Health Issue (Searchable) *
              </label>
              <input
                type="text"
                required
                value={reasonForUse}
                onChange={(e) => setReasonForUse(e.target.value)}
                placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Verbatim Label Instructions from Pharmacy
              </label>
              <input
                type="text"
                value={instructionsLabel}
                onChange={(e) => setInstructionsLabel(e.target.value)}
                placeholder="e.g. Take 1 tablet by mouth twice daily with meals."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Prescribing Clinician
              </label>
              <input
                type="text"
                value={prescribedBy}
                onChange={(e) => setPrescribedBy(e.target.value)}
                placeholder="e.g. Dr. Reed, MD"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Dispensing Pharmacy
              </label>
              <input
                type="text"
                value={pharmacy}
                onChange={(e) => setPharmacy(e.target.value)}
                placeholder="e.g. CVS Pharmacy #4128"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Physical Package, Lot & Expiration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                4. Package Batch & Expiry Tracking
              </h3>
            </div>
            
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPackage}
                onChange={(e) => setHasPackage(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Track physical bottle / package expiry</span>
            </label>
          </div>

          {hasPackage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Package Expiration Date *
                </label>
                <input
                  type="date"
                  required={hasPackage}
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Triggers automatic header expiry alert within 30 days.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Manufacturer Lot / Batch Number
                </label>
                <input
                  type="text"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  placeholder="e.g. LOT-9042"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Quantity in Package
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={packageQuantity}
                    onChange={(e) => setPackageQuantity(e.target.value)}
                    placeholder="e.g. 30, 60, 100"
                    className="w-2/3 px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900"
                  />
                  <input
                    type="text"
                    value={packageUnit}
                    onChange={(e) => setPackageUnit(e.target.value)}
                    placeholder="tablets"
                    className="w-1/3 px-2 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Low-Stock Refill Warning Threshold
                </label>
                <input
                  type="text"
                  value={refillThreshold}
                  onChange={(e) => setRefillThreshold(e.target.value)}
                  placeholder="e.g. 7 remaining units"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition active:scale-95"
          >
            Save Medication to Vault
          </button>
        </div>

      </form>
    </div>
  );
};
