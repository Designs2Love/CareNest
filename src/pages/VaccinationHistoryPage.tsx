import React, { useState } from 'react';
import {
  Syringe,
  Calendar,
  MapPin,
  AlertTriangle,
  Plus,
  ShieldCheck,
  User,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  PatientProfile,
  VaccinationRecord,
} from '../types';

interface VaccinationHistoryPageProps {
  patient: PatientProfile;
  vaccinations: VaccinationRecord[];
  onAddVaccination: (record: Omit<VaccinationRecord, 'id' | 'createdAt'>) => void;
}

export const VaccinationHistoryPage: React.FC<VaccinationHistoryPageProps> = ({
  patient,
  vaccinations,
  onAddVaccination,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [vaccineName, setVaccineName] = useState('');
  const [composition, setComposition] = useState('');
  const [dateAdministered, setDateAdministered] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [administeredAt, setAdministeredAt] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [routeAndSite, setRouteAndSite] = useState('Intramuscular, Left Deltoid');
  const [sideEffectsNotes, setSideEffectsNotes] = useState('');
  const [administeredBy, setAdministeredBy] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName.trim()) return;

    onAddVaccination({
      patientId: patient.id,
      vaccineName: vaccineName.trim(),
      composition: composition.trim() || 'Standard antigen formulation',
      dateAdministered,
      administeredAt: administeredAt.trim() || 'Unspecified Clinic / Pharmacy',
      lotNumber: lotNumber.trim() || undefined,
      routeAndSite: routeAndSite.trim() || undefined,
      sideEffectsNotes: sideEffectsNotes.trim() || 'No adverse side effects reported',
      administeredBy: administeredBy.trim() || undefined,
    });

    // Reset and close
    setVaccineName('');
    setComposition('');
    setAdministeredAt('');
    setLotNumber('');
    setSideEffectsNotes('');
    setAdministeredBy('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 font-mono">
              Immunization Record
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              {patient.preferredName}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            Vaccination & Immunization History
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete registry of vaccines received, active antigens, administration site, and recorded side effects.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Vaccination</span>
        </button>
      </div>

      {/* Vaccinations List */}
      {vaccinations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <Syringe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Vaccinations Logged</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No immunization records currently logged for {patient.preferredName}. Keep records up-to-date for school, travel, and clinical reviews.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            Log First Vaccine for {patient.preferredName}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {vaccinations.map((vac) => (
            <div
              key={vac.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              {/* Top Row: Vaccine Name & Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {vac.vaccineName}
                    </h3>
                    {vac.lotNumber && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Lot: {vac.lotNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/80">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Administered: <strong className="text-slate-900">{vac.dateAdministered}</strong></span>
                </div>
              </div>

              {/* Exact Composition & Formulation */}
              <div className="text-xs">
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] block mb-0.5">
                  Exact Vaccine Composition / Antigen
                </span>
                <p className="text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60 font-mono text-[11px] leading-relaxed">
                  {vac.composition}
                </p>
              </div>

              {/* Facility Location and Provider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Facility: <strong className="text-slate-800">{vac.administeredAt}</strong></span>
                </div>
                {vac.routeAndSite && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Site: <strong className="text-slate-800">{vac.routeAndSite}</strong></span>
                  </div>
                )}
              </div>

              {/* Potential Side Effects Experienced */}
              <div className="pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Side Effects / Reactions Experienced:</span>
                </div>
                <p
                  className={`p-2.5 rounded-lg text-xs ${
                    vac.sideEffectsNotes && !vac.sideEffectsNotes.toLowerCase().includes('no ')
                      ? 'bg-amber-50/70 border border-amber-200/80 text-amber-900'
                      : 'bg-slate-50 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  {vac.sideEffectsNotes || 'No adverse side effects recorded.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vaccination Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-teal-400 font-mono text-xs uppercase tracking-wider font-semibold">
                  New Record
                </span>
                <h3 className="text-base sm:text-lg font-bold mt-0.5">
                  Log Vaccination for {patient.preferredName}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Vaccine Name */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Vaccine Name *
                </label>
                <input
                  type="text"
                  required
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  placeholder="e.g. Spikevax Bivalent Booster, Fluad Quadrivalent, Tdap"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Exact Composition */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Exact Composition & Antigen
                </label>
                <textarea
                  rows={2}
                  value={composition}
                  onChange={(e) => setComposition(e.target.value)}
                  placeholder="e.g. Inactivated influenza antigens 60mcg HA per 0.5mL with MF59 adjuvant"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Date & Facility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Date Administered *
                  </label>
                  <input
                    type="date"
                    required
                    value={dateAdministered}
                    onChange={(e) => setDateAdministered(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Where Administered (Facility) *
                  </label>
                  <input
                    type="text"
                    required
                    value={administeredAt}
                    onChange={(e) => setAdministeredAt(e.target.value)}
                    placeholder="e.g. CVS Pharmacy #4128, Kaiser Clinic"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Lot Number & Injection Site */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Lot / Batch Number
                  </label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    placeholder="e.g. LOT-FLU-9921"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Route & Injection Site
                  </label>
                  <input
                    type="text"
                    value={routeAndSite}
                    onChange={(e) => setRouteAndSite(e.target.value)}
                    placeholder="e.g. Intramuscular, Left Deltoid"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Potential Side Effects */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Side Effects / Adverse Reactions Experienced
                </label>
                <textarea
                  rows={2}
                  value={sideEffectsNotes}
                  onChange={(e) => setSideEffectsNotes(e.target.value)}
                  placeholder="e.g. Mild tenderness at injection site for 24h, slight fatigue. Or 'No adverse effects'."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Clinician */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Administered By (Pharmacist / Nurse / Doctor)
                </label>
                <input
                  type="text"
                  value={administeredBy}
                  onChange={(e) => setAdministeredBy(e.target.value)}
                  placeholder="e.g. Dr. Reed, MD or P. Jenkins, PharmD"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-xs"
                >
                  Save Vaccination Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
