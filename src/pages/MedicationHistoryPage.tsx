import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  FileText,
  ChevronRight,
  Eye,
  Calendar,
  AlertCircle,
  Pill,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import {
  PatientProfile,
  MedicationDefinition,
  Regimen,
} from '../types';

interface MedicationHistoryPageProps {
  patient: PatientProfile;
  medications: MedicationDefinition[];
  regimens: Regimen[];
  onStopMedication: (medId: string, stopDate?: string) => void;
  onDeleteMedication: (medId: string) => void;
  onNavigateAddMed: () => void;
}

export const MedicationHistoryPage: React.FC<MedicationHistoryPageProps> = ({
  patient,
  medications,
  regimens,
  onStopMedication,
  onDeleteMedication,
  onNavigateAddMed,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedMed, setSelectedMed] = useState<MedicationDefinition | null>(null);
  const [medToDelete, setMedToDelete] = useState<MedicationDefinition | null>(null);

  const regimenMap = useMemo(() => {
    return new Map(regimens.map((r) => [r.medicationId, r]));
  }, [regimens]);

  // Filtered medications based on search query (name, brand, health issue/reason) and status
  const filteredMeds = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return medications.filter((med) => {
      // Status filter
      if (statusFilter === 'active' && med.status !== 'active') return false;
      if (statusFilter === 'inactive' && med.status === 'active') return false;

      if (!q) return true;

      // 4. Search by name or health issue
      const nameMatch = med.medicationName.toLowerCase().includes(q);
      const brandMatch = (med.brandName || '').toLowerCase().includes(q);
      const reasonMatch = (med.reasonForUse || '').toLowerCase().includes(q);
      const compositionMatch = med.composition.toLowerCase().includes(q);

      return nameMatch || brandMatch || reasonMatch || compositionMatch;
    });
  }, [medications, searchQuery, statusFilter]);

  const activeCount = medications.filter((m) => m.status === 'active').length;
  const historicalCount = medications.filter((m) => m.status !== 'active').length;

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full overflow-hidden">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 font-mono">
              Complete Record
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              {patient.preferredName}'s Vault
            </span>
          </div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 mt-0.5">
            Medication History & Regimens
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete audit record of past and current medications, strengths, dosages, and indications.
          </p>
        </div>

        <button
          onClick={onNavigateAddMed}
          className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition self-start sm:self-auto shrink-0"
        >
          + Add New Medication
        </button>
      </div>

      {/* 4. Search & Filter Bar (Mobile-friendly, no overflow) */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shadow-2xs w-full">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medication name, brand, or health issue..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs (Grid on mobile so it never scrolls horizontally) */}
        <div className="grid grid-cols-3 md:flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2 sm:px-3 py-1.5 rounded-md text-center transition truncate text-[11px] sm:text-xs ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({medications.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-2 sm:px-3 py-1.5 rounded-md text-center transition truncate text-[11px] sm:text-xs ${
              statusFilter === 'active'
                ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-2 sm:px-3 py-1.5 rounded-md text-center transition truncate text-[11px] sm:text-xs ${
              statusFilter === 'inactive'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past ({historicalCount})
          </button>
        </div>
      </div>

      {/* Medication List Container */}
      <div className="w-full">
        {filteredMeds.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-xs">
            <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No medications found</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery
                ? `No medications matching "${searchQuery}". Try a different keyword or clear search.`
                : 'No medications recorded under this filter.'}
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW (Screen width < 768px): Structured Responsive Cards, ZERO HORIZONTAL SCROLLING */}
            <div className="block md:hidden space-y-2.5">
              {filteredMeds.map((med) => {
                const regimen = regimenMap.get(med.id);
                const isCurrentlyActive = med.status === 'active';

                return (
                  <div
                    key={med.id}
                    onClick={() => setSelectedMed(med)}
                    className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:border-slate-300 transition active:scale-[0.99] cursor-pointer space-y-2"
                  >
                    {/* Card Header: Status & Brand/Generic */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {isCurrentlyActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : med.status === 'completed' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 border border-rose-200 text-rose-700">
                            Stopped
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            med.isGeneric
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {med.isGeneric ? 'Generic' : 'Brand'}
                        </span>
                      </div>

                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {med.strengthValue} {med.strengthUnit}
                      </span>
                    </div>

                    {/* Medication Names */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {med.medicationName}
                      </h4>
                      {med.brandName && (
                        <span className="text-[11px] text-slate-500 font-medium block">
                          Brand name: {med.brandName}
                        </span>
                      )}
                    </div>

                    {/* Dosage & Frequency */}
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs font-mono space-y-0.5">
                      {regimen ? (
                        regimen.frequencyType === 'prn' ? (
                          <span className="text-indigo-700 font-sans font-medium">
                            PRN: {regimen.prnMaxPerDay || 'As needed'}
                          </span>
                        ) : (
                          regimen.scheduleEntries.map((sch, i) => (
                            <div key={i} className="flex justify-between text-slate-700">
                              <span className="font-bold">{sch.doseQuantity} {sch.doseUnit}</span>
                              <span className="text-slate-500">@ {sch.localTime} ({sch.label || 'Scheduled'})</span>
                            </div>
                          ))
                        )
                      ) : (
                        <span className="text-slate-400 font-sans">Standard dose</span>
                      )}
                    </div>

                    {/* Reason / Indication */}
                    {med.reasonForUse && (
                      <div className="text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-700">For: </span>
                        <span>{med.reasonForUse}</span>
                      </div>
                    )}

                    {/* Timeline footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Started: {med.startDate}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMedToDelete(med);
                          }}
                          title="Delete medication from history"
                          aria-label={`Delete ${med.medicationName}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-teal-700 font-sans font-semibold">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW (Screen width >= 768px): Full Table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 sm:px-4">Status</th>
                    <th className="py-3 px-3 sm:px-4">Medication Name</th>
                    <th className="py-3 px-3 sm:px-4">Brand / Generic</th>
                    <th className="py-3 px-3 sm:px-4">Power / Strength</th>
                    <th className="py-3 px-3 sm:px-4">Dosage & Schedule</th>
                    <th className="py-3 px-3 sm:px-4">When Started / Stopped</th>
                    <th className="py-3 px-3 sm:px-4">Why Taken (Indication)</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMeds.map((med) => {
                    const regimen = regimenMap.get(med.id);
                    const isCurrentlyActive = med.status === 'active';

                    return (
                      <tr
                        key={med.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedMed(med)}
                      >
                        {/* Status */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          {isCurrentlyActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : med.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 border border-rose-200 text-rose-700">
                              Stopped
                            </span>
                          )}
                        </td>

                        {/* Medication Name */}
                        <td className="py-3 px-3 sm:px-4">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {med.medicationName}
                          </div>
                          {med.brandName && (
                            <div className="text-[11px] text-slate-500 font-medium">
                              Brand: {med.brandName}
                            </div>
                          )}
                        </td>

                        {/* Brand or Generic */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                              med.isGeneric
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {med.isGeneric ? 'Generic' : 'Brand Name'}
                          </span>
                        </td>

                        {/* Power / Strength */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap font-mono font-semibold text-slate-800 tabular-nums">
                          {med.strengthValue} {med.strengthUnit}
                        </td>

                        {/* Dosage */}
                        <td className="py-3 px-3 sm:px-4 min-w-[140px]">
                          {regimen ? (
                            regimen.frequencyType === 'prn' ? (
                              <span className="text-indigo-700 font-medium">
                                PRN / As Needed ({regimen.prnMaxPerDay || 'As directed'})
                              </span>
                            ) : (
                              <div className="space-y-0.5 font-mono text-[11px]">
                                {regimen.scheduleEntries.map((sch, i) => (
                                  <div key={i} className="text-slate-700">
                                    <span className="font-bold">{sch.doseQuantity} {sch.doseUnit}</span>{' '}
                                    <span className="text-slate-400">@ {sch.localTime}</span>
                                  </div>
                                ))}
                              </div>
                            )
                          ) : (
                            <span className="text-slate-400">Standard</span>
                          )}
                        </td>

                        {/* When Started and Stopped */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                          <div>Started: {med.startDate}</div>
                          <div>
                            Stopped:{' '}
                            {med.endDate ? (
                              <span className="text-rose-600 font-semibold">{med.endDate}</span>
                            ) : (
                              <span className="text-emerald-700 font-medium">Current (Ongoing)</span>
                            )}
                          </div>
                        </td>

                        {/* Why medication was being taken (health issue) */}
                        <td className="py-3 px-3 sm:px-4 min-w-[150px]">
                          <span className="font-medium text-slate-800 line-clamp-2">
                            {med.reasonForUse || 'Unspecified indication'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMed(med);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-medium transition shadow-2xs"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMedToDelete(med);
                              }}
                              title="Delete medication from history"
                              aria-label={`Delete ${med.medicationName}`}
                              className="p-1 rounded-lg border border-transparent hover:border-rose-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Medication Details Modal (Optimized for all phone screen widths) */}
      {selectedMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-start justify-between shrink-0">
              <div className="min-w-0 flex-1 mr-2">
                <span className="text-teal-400 font-mono text-xs font-semibold uppercase tracking-wider block">
                  {selectedMed.isGeneric ? 'Generic Medication' : 'Brand Name Medication'}
                </span>
                <h3 className="text-base sm:text-lg font-bold mt-0.5 truncate">
                  {selectedMed.brandName ? `${selectedMed.brandName} (${selectedMed.medicationName})` : selectedMed.medicationName}
                </h3>
                <span className="text-xs text-slate-300 font-mono block truncate">
                  Strength: {selectedMed.strengthValue} {selectedMed.strengthUnit} · Form: {selectedMed.form} ({selectedMed.route})
                </span>
              </div>
              <button
                onClick={() => setSelectedMed(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto text-xs flex-1">
              {/* Full Composition */}
              <div>
                <span className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[11px]">
                  Exact Composition & Ingredients
                </span>
                <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-mono text-[11px] break-words">
                  {selectedMed.composition || 'No additional composition details entered.'}
                </p>
              </div>

              {/* Instructions on Label */}
              {selectedMed.instructionsLabel && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[11px]">
                    Prescription Label Instructions
                  </span>
                  <p className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl text-teal-900 italic break-words">
                    "{selectedMed.instructionsLabel}"
                  </p>
                </div>
              )}

              {/* Timeline & Metadata Grid */}
              <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Start Date</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedMed.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">End Date</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedMed.endDate || 'Active (Ongoing)'}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Prescribing Clinician</span>
                  <span className="text-slate-800 font-medium">{selectedMed.prescribedBy || 'Self / Unspecified'}</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Dispensing Pharmacy</span>
                  <span className="text-slate-800 font-medium">{selectedMed.pharmacy || 'Unspecified'}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedMed.notes && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[11px]">
                    Caregiver & Clinical Notes
                  </span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 break-words">
                    {selectedMed.notes}
                  </p>
                </div>
              )}

              {/* Discontinue Action */}
              {selectedMed.status === 'active' && (
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-slate-500 text-[11px]">Stop taking this medication?</span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Discontinue ${selectedMed.medicationName} for ${patient.preferredName}? History will be preserved.`)) {
                        onStopMedication(selectedMed.id);
                        setSelectedMed(null);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition self-start sm:self-auto cursor-pointer"
                  >
                    Discontinue Medication
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  const target = selectedMed;
                  setSelectedMed(null);
                  setMedToDelete(target);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>

              <button
                onClick={() => setSelectedMed(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {medToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Medication Record?
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-900">{medToDelete.medicationName}</strong>
                {medToDelete.brandName ? ` (${medToDelete.brandName})` : ''} from {patient.preferredName}'s medication history?
              </p>
              <div className="mt-2.5 p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  This will permanently delete this medication's schedule, dosing logs, and package records from the vault.
                </span>
              </div>
            </div>

            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMedToDelete(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMedication(medToDelete.id);
                  setMedToDelete(null);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
