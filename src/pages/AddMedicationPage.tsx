import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Sparkles,
  Search,
  ChevronDown,
  X,
  Zap,
} from 'lucide-react';
import {
  PatientProfile,
  MedicationDefinition,
  Regimen,
  MedicationPackage,
  ScheduleEntry,
} from '../types';
import {
  COMMON_PRESCRIPTIONS,
  PRESCRIPTION_CATEGORIES,
  PrescriptionTemplate,
  PrescriptionVariation,
} from '../data/commonPrescriptions';

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
  // Intelligent Prescription Search & Dropdown State
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PrescriptionTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Step 1: Medication Identity
  const [medicationName, setMedicationName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [composition, setComposition] = useState('');
  const [strengthValue, setStrengthValue] = useState('10');
  const [strengthUnit, setStrengthUnit] = useState('mg');
  const [form, setForm] = useState('Tablet');
  const [route, setRoute] = useState('Oral');
  const [isGeneric, setIsGeneric] = useState(true);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filtered prescription templates (matching generic name, display name, brand name, composition, or category)
  const filteredPrescriptions = useMemo(() => {
    const q = medicationName.trim().toLowerCase();
    return COMMON_PRESCRIPTIONS.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;
      return (
        p.genericName.toLowerCase().includes(q) ||
        p.displayName.toLowerCase().includes(q) ||
        p.brandNames.toLowerCase().includes(q) ||
        p.composition.toLowerCase().includes(q) ||
        p.strengthValue.toLowerCase().includes(q) ||
        p.commonIndication.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [medicationName, selectedCategory]);

  // Handle Intelligent Selection & Auto-fill
  const handleSelectPrescription = (template: PrescriptionTemplate) => {
    setSelectedPresetId(template.id);
    setSelectedTemplate(template);
    setMedicationName(template.genericName);
    setBrandName(template.brandNames);
    setComposition(template.composition);
    setStrengthValue(template.strengthValue);
    setStrengthUnit(template.strengthUnit);
    setForm(template.form);
    setRoute(template.route);
    setIsGeneric(true);

    if (template.commonIndication && !reasonForUse) {
      setReasonForUse(template.commonIndication);
    }
    if (template.defaultScheduleLabel) {
      setScheduleEntries([
        {
          id: '1',
          localTime: template.defaultTime || '08:00',
          doseQuantity: '1',
          doseUnit: template.form.toLowerCase().includes('capsule')
            ? 'capsule'
            : template.form.toLowerCase().includes('inhaler')
            ? 'puff'
            : 'tablet',
          label: template.defaultScheduleLabel,
        },
      ]);
    }

    setShowDropdown(false);
  };

  // Handle Switching Strength Variation with 1 click
  const handleSelectVariation = (v: PrescriptionVariation) => {
    setStrengthValue(v.strengthValue);
    setStrengthUnit(v.strengthUnit);
    setComposition(v.composition);
    if (v.brandNames) {
      setBrandName(v.brandNames);
    }
  };

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
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                1. Medication Identity & Active Composition
              </h3>
            </div>
            <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80 flex items-center gap-1">
              <Zap className="w-3 h-3 text-teal-600" />
              <span>Smart USA & India Prescriptions Active</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Generic / Chemical Name with Intelligent Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-semibold">
                  Medication / Generic Name *
                </label>
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-[10px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>Choose from Common Prescriptions</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={medicationName}
                  onChange={(e) => {
                    setMedicationName(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Type to search or select (e.g. Metformin, Atorvastatin, Amlodipine...)"
                  className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                {medicationName && (
                  <button
                    type="button"
                    onClick={() => {
                      setMedicationName('');
                      setSelectedPresetId(null);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Intelligent Prescriptions Dropdown List */}
              {showDropdown && (
                <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-80 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-2xl divide-y divide-slate-100 text-xs animate-in fade-in duration-100">
                  {/* Category Filter Bar */}
                  <div className="p-2 bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      <span>Prescriptions & Combinations ({filteredPrescriptions.length})</span>
                      <span className="text-teal-700 normal-case font-medium">USA & India Database</span>
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                      {PRESCRIPTION_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap font-medium transition cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-teal-700 text-white font-bold shadow-2xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredPrescriptions.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-[11px]">
                      <span className="font-semibold text-slate-700">No matching preset found in this category.</span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        You can continue typing any custom medication name, brand, and strength!
                      </p>
                    </div>
                  ) : (
                    filteredPrescriptions.map((p) => {
                      const isSelected = selectedPresetId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectPrescription(p)}
                          className={`p-3 hover:bg-teal-50/70 cursor-pointer transition flex items-start justify-between gap-3 ${
                            isSelected ? 'bg-teal-50 border-l-4 border-teal-600' : ''
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs">
                                {p.displayName}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-teal-100 text-teal-800 border border-teal-200">
                                {p.strengthValue} {p.strengthUnit}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-100 text-slate-600 font-medium">
                                {p.category}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 truncate mt-1">
                              <strong className="text-slate-800">Brands:</strong> {p.brandNames}
                            </p>

                            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              <strong className="text-slate-700">Composition:</strong> {p.composition}
                            </p>

                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 flex-wrap">
                              <span>{p.commonIndication}</span>
                              <span>·</span>
                              <span>{p.form} ({p.route})</span>
                              {p.availableVariations && p.availableVariations.length > 1 && (
                                <span className="text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                                  +{p.availableVariations.length} strength variations
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] text-teal-700 hover:text-teal-800 font-bold shrink-0 pt-0.5">
                            Select ↵
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Interactive Strength & Combination Variations Bar */}
              {selectedTemplate?.availableVariations && selectedTemplate.availableVariations.length > 0 && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-teal-50/90 border border-teal-200 shadow-2xs animate-in fade-in">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-teal-600" />
                      <span>Variations based on Strength & Combos ({selectedTemplate.availableVariations.length}):</span>
                    </span>
                    <span className="text-[10px] text-teal-700 font-medium">1-click switch</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.availableVariations.map((v, idx) => {
                      const isActive = strengthValue === v.strengthValue && strengthUnit === v.strengthUnit;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectVariation(v)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                            isActive
                              ? 'bg-teal-700 text-white shadow-xs scale-102 ring-2 ring-teal-400'
                              : 'bg-white hover:bg-teal-100 text-slate-700 border border-teal-200/90'
                          }`}
                        >
                          <span>{v.label}</span>
                          {isActive && <Check className="w-3 h-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
                  <option value="puff">puff</option>
                  <option value="drops">drops</option>
                  <option value="spray">spray</option>
                </select>
              </div>

              {/* Quick strength numeric presets */}
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                <span className="text-[10px] text-slate-400 font-medium">Quick:</span>
                {['2.5', '5', '10', '20', '25', '40', '50', '75', '100', '250', '500', '650', '850', '1000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setStrengthValue(val)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                      strengthValue === val
                        ? 'bg-teal-700 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
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
