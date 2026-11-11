import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  Archive,
  RotateCcw,
  Edit2,
  Calendar,
  Heart,
  Shield,
  Clock,
} from 'lucide-react';
import {
  PatientProfile,
  Gender,
} from '../types';

interface PatientProfilesPageProps {
  patients: PatientProfile[];
  allPatients: PatientProfile[]; // includes archived
  activePatientId: string;
  onSelectPatient: (patientId: string) => void;
  onAddPatient: (profile: Omit<PatientProfile, 'id' | 'createdAt' | 'isArchived'>) => void;
  onUpdatePatient: (profile: PatientProfile) => void;
  onArchivePatient: (patientId: string) => void;
  onRestorePatient: (patientId: string) => void;
  activeMedicationCounts: Record<string, number>;
}

const AVATAR_COLORS = [
  'bg-teal-600',
  'bg-indigo-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-sky-600',
  'bg-purple-600',
];

export const PatientProfilesPage: React.FC<PatientProfilesPageProps> = ({
  patients,
  allPatients,
  activePatientId,
  onSelectPatient,
  onAddPatient,
  onUpdatePatient,
  onArchivePatient,
  onRestorePatient,
  activeMedicationCounts,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientProfile | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [birthDate, setBirthDate] = useState('1985-06-15');
  const [gender, setGender] = useState<Gender>('Female');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [careNotes, setCareNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);

  const resetForm = () => {
    setName('');
    setPreferredName('');
    setBirthDate('1985-06-15');
    setGender('Female');
    setAllergiesInput('');
    setCareNotes('');
    setAvatarColor(AVATAR_COLORS[0]);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (patient: PatientProfile) => {
    setEditingPatient(patient);
    setName(patient.name);
    setPreferredName(patient.preferredName);
    setBirthDate(patient.birthDate || '');
    setGender(patient.gender);
    setAllergiesInput(patient.allergies.join(', '));
    setCareNotes(patient.careNotes || '');
    setAvatarColor(patient.avatarColor || AVATAR_COLORS[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedAllergies = allergiesInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    if (editingPatient) {
      onUpdatePatient({
        ...editingPatient,
        name: name.trim(),
        preferredName: preferredName.trim() || name.trim().split(' ')[0],
        birthDate: birthDate || undefined,
        gender,
        allergies: parsedAllergies.length > 0 ? parsedAllergies : ['No Known Drug Allergies (NKDA)'],
        careNotes: careNotes.trim() || undefined,
        avatarColor,
      });
      setEditingPatient(null);
    } else {
      onAddPatient({
        name: name.trim(),
        preferredName: preferredName.trim() || name.trim().split(' ')[0],
        birthDate: birthDate || undefined,
        gender,
        allergies: parsedAllergies.length > 0 ? parsedAllergies : ['No Known Drug Allergies (NKDA)'],
        careNotes: careNotes.trim() || undefined,
        avatarColor,
      });
      setShowAddModal(false);
    }

    resetForm();
  };

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

  const archivedPatients = allPatients.filter((p) => p.isArchived);

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 font-mono">
              Caregiver Household Vault
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              {patients.length} / 6 Active Profiles
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            Patient Profiles & Access
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain isolated medication records for family members or clients on this device.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {archivedPatients.length > 0 && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
            >
              {showArchived ? 'Hide Archived' : `Archived (${archivedPatients.length})`}
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            disabled={patients.length >= 6}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition ${
              patients.length >= 6
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Patient Profile</span>
          </button>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {patients.map((patient) => {
          const isActive = patient.id === activePatientId;
          const medCount = activeMedicationCounts[patient.id] || 0;

          return (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer relative flex flex-col justify-between ${
                isActive
                  ? 'bg-teal-50/30 border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                  : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Top Banner */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-xs ${
                        patient.avatarColor || 'bg-teal-600'
                      }`}
                    >
                      {patient.preferredName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 leading-tight">
                          {patient.name}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                        {calculateAge(patient.birthDate)} · {patient.gender}
                      </span>
                    </div>
                  </div>

                  {/* Edit icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(patient);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    title="Edit Patient Profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Allergies list */}
                <div className="mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                    Drug Allergies
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((allergy, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 border border-rose-200 text-rose-800"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {patient.careNotes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                    {patient.careNotes}
                  </p>
                )}
              </div>

              {/* Bottom stats and action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-600">
                  <strong className="text-slate-900 font-bold">{medCount}</strong> active meds
                </span>

                <div className="flex items-center gap-2">
                  {!isActive ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatient(patient.id);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition"
                    >
                      Select
                    </button>
                  ) : (
                    <span className="text-teal-700 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Viewing Now
                    </span>
                  )}

                  {patients.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Archive profile for ${patient.name}? Records will remain safe and can be restored at any time.`
                          )
                        ) {
                          onArchivePatient(patient.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Archive profile"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Archived Profiles Section */}
      {showArchived && archivedPatients.length > 0 && (
        <div className="bg-slate-100 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Archived Profiles ({archivedPatients.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {archivedPatients.map((p) => (
              <div
                key={p.id}
                className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {p.gender} · {calculateAge(p.birthDate)}
                  </span>
                </div>
                <button
                  onClick={() => onRestorePatient(p.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-semibold hover:bg-teal-100 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Patient Modal */}
      {(showAddModal || editingPatient) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-teal-400 font-mono text-xs uppercase tracking-wider font-semibold">
                  {editingPatient ? 'Update Profile' : 'New Patient Profile'}
                </span>
                <h3 className="text-base sm:text-lg font-bold mt-0.5">
                  {editingPatient ? editingPatient.name : 'Create Household Profile'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPatient(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Legal or Family Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Preferred / Display Name
                </label>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  placeholder="e.g. Eleanor, Mom, Sophie"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Drug Allergies */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Current Drug Allergies (comma separated)
                </label>
                <input
                  type="text"
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  placeholder="e.g. Penicillin (Hives), Sulfa (Rash)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Prominently shown in header and medication reviews to prevent accidental administration.
                </span>
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Avatar Color
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatarColor(color)}
                      className={`w-7 h-7 rounded-full ${color} transition-transform ${
                        avatarColor === color ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Care Notes */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Caregiver Notes / Primary Clinician
                </label>
                <textarea
                  rows={2}
                  value={careNotes}
                  onChange={(e) => setCareNotes(e.target.value)}
                  placeholder="e.g. Primary Doctor: Dr. Reed. Takes morning meds with breakfast."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPatient(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-xs"
                >
                  {editingPatient ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
