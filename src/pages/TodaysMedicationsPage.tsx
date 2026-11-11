import React from 'react';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Pill,
  AlertCircle,
  Calendar,
  PlusCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PatientProfile,
  MedicationDefinition,
  Regimen,
  DoseLog,
  ScheduleEntry,
} from '../types';

interface TodaysMedicationsPageProps {
  patient: PatientProfile;
  medications: MedicationDefinition[];
  regimens: Regimen[];
  doseLogs: DoseLog[];
  onMarkTaken: (medicationId: string, scheduleTime: string, quantity?: string) => void;
  onUndoDose: (medicationId: string, scheduleTime: string) => void;
  onNavigateAddMed: () => void;
}

interface DoseRowItem {
  medication: MedicationDefinition;
  regimen: Regimen;
  scheduleEntry: ScheduleEntry;
  doseLog?: DoseLog;
  isTaken: boolean;
  takenAt?: string;
}

export const TodaysMedicationsPage: React.FC<TodaysMedicationsPageProps> = ({
  patient,
  medications,
  regimens,
  doseLogs,
  onMarkTaken,
  onUndoDose,
  onNavigateAddMed,
}) => {
  const activeMeds = medications.filter((m) => m.status === 'active');
  const activeMedMap = new Map(activeMeds.map((m) => [m.id, m]));

  // Build scheduled dose items for today
  const scheduledItems: DoseRowItem[] = [];
  const prnMeds: MedicationDefinition[] = [];

  for (const reg of regimens) {
    const med = activeMedMap.get(reg.medicationId);
    if (!med) continue;

    if (reg.frequencyType === 'prn') {
      prnMeds.push(med);
      continue;
    }

    for (const entry of reg.scheduleEntries) {
      const log = doseLogs.find(
        (l) => l.medicationId === med.id && l.scheduleTime === entry.localTime
      );
      scheduledItems.push({
        medication: med,
        regimen: reg,
        scheduleEntry: entry,
        doseLog: log,
        isTaken: log?.status === 'taken',
        takenAt: log?.takenAt,
      });
    }
  }

  // Sort chronologically by schedule time (08:00, 13:00, 20:00)
  scheduledItems.sort((a, b) =>
    a.scheduleEntry.localTime.localeCompare(b.scheduleEntry.localTime)
  );

  const totalScheduled = scheduledItems.length;
  const takenCount = scheduledItems.filter((item) => item.isTaken).length;
  const percentComplete =
    totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 0;

  const handleTakeWithConfetti = (
    medicationId: string,
    scheduleTime: string,
    quantity?: string
  ) => {
    onMarkTaken(medicationId, scheduleTime, quantity);
    // If this completes all today's doses, trigger a celebratory confetti burst
    if (takenCount + 1 >= totalScheduled && totalScheduled > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#0d9488', '#14b8a6', '#059669', '#3b82f6'],
        });
      } catch {
        // Fallback gracefully
      }
    }
  };

  const formatTimeDisplay = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatTakenTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* 5. Daily Adherence Progress Summary Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 font-mono">
                Daily Adherence
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">
                {todayDateFormatted}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Today's Schedule for {patient.preferredName}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {takenCount}
                <span className="text-slate-400 font-normal text-base"> / {totalScheduled}</span>
              </span>
              <span className="text-xs text-slate-500 block">Doses Taken</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center font-mono font-bold text-teal-700 text-sm">
              {percentComplete}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        {percentComplete === 100 && totalScheduled > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All scheduled doses for today are completed! Great job maintaining adherence.</span>
          </div>
        )}
      </div>

      {/* Doses List Container (Sleek Compact View) */}
      {scheduledItems.length === 0 && prnMeds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Active Regimens</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {patient.preferredName} currently has no active scheduled medications recorded in the vault.
          </p>
          <button
            onClick={onNavigateAddMed}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add Medication for {patient.preferredName}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Scheduled Doses ({scheduledItems.length})
            </h3>
            <span className="text-[11px] text-slate-400">Tap Mark Taken when administered</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {scheduledItems.map((item, index) => {
              const { medication, scheduleEntry, isTaken, takenAt } = item;
              return (
                <div
                  key={`${medication.id}-${scheduleEntry.localTime}-${index}`}
                  className={`rounded-xl border transition-all p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isTaken
                      ? 'bg-emerald-50/40 border-emerald-200/80'
                      : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  {/* Left: Time and Med Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Time Badge */}
                    <div
                      className={`w-16 sm:w-20 py-1 px-1.5 rounded-lg text-center shrink-0 border ${
                        isTaken
                          ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                          : 'bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="block text-xs sm:text-sm font-bold font-mono tabular-nums leading-none">
                        {formatTimeDisplay(scheduleEntry.localTime)}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block mt-0.5">
                        {scheduleEntry.label || 'Scheduled'}
                      </span>
                    </div>

                    {/* Medication & Composition Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                          {medication.brandName ? (
                            <>
                              <span>{medication.brandName}</span>
                              <span className="text-xs font-medium text-slate-500 ml-1.5">
                                ({medication.medicationName})
                              </span>
                            </>
                          ) : (
                            medication.medicationName
                          )}
                        </h4>
                        
                        {/* Dose Quantity Badge */}
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200/60 shrink-0">
                          {scheduleEntry.doseQuantity} {scheduleEntry.doseUnit}
                        </span>
                      </div>

                      {/* 1. Exact Composition Display Underneath */}
                      {medication.composition && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 sm:line-clamp-2">
                          <span className="font-semibold text-slate-600">Composition: </span>
                          {medication.composition}
                        </p>
                      )}

                      {/* Instructions / Reason */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                        {medication.reasonForUse && (
                          <span>For: {medication.reasonForUse}</span>
                        )}
                        {medication.instructionsLabel && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-500 italic">
                              "{medication.instructionsLabel}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Indicator and Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    {/* Visual Status Indicator: Taken vs Pending */}
                    {isTaken ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Taken</span>
                          {takenAt && (
                            <span className="font-mono text-[10px] text-emerald-700">
                              @{formatTakenTime(takenAt)}
                            </span>
                          )}
                        </div>

                        {/* 4. Undo Button for correcting accidental clicks */}
                        <button
                          onClick={() =>
                            onUndoDose(medication.id, scheduleEntry.localTime)
                          }
                          aria-label={`Undo taken status for ${medication.medicationName}`}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium transition active:scale-95 shadow-2xs"
                          title="Undo dose if marked by accident"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-500" />
                          <span>Undo</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-1 text-amber-700 text-xs font-medium bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending</span>
                        </div>

                        {/* Mark Dose as Taken Button */}
                        <button
                          onClick={() =>
                            handleTakeWithConfetti(
                              medication.id,
                              scheduleEntry.localTime,
                              scheduleEntry.doseQuantity
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-xs active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Taken</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRN / As Needed Medications Section */}
      {prnMeds.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                PRN / As-Needed Medications ({prnMeds.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Administer only as required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {prnMeds.map((med) => (
              <div
                key={med.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {med.brandName ? `${med.brandName} (${med.medicationName})` : med.medicationName}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {med.composition}
                  </p>
                  <div className="mt-1.5 text-slate-600">
                    <span className="font-medium">Instructions: </span>
                    {med.instructionsLabel || 'Take as instructed by clinician'}
                  </div>
                  {med.reasonForUse && (
                    <span className="inline-block mt-1 text-[10px] text-indigo-700 font-medium">
                      Indication: {med.reasonForUse}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    const nowTime = new Date().toTimeString().slice(0, 5);
                    onMarkTaken(med.id, nowTime, '1');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shrink-0 transition"
                >
                  Log PRN
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
