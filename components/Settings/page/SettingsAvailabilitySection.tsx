import { FiCalendar, FiClock, FiCoffee } from "react-icons/fi";
import Loader from "@/components/UI/Loader";
import Input from "@/components/UI/Input";
import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";
import { SectionShell, SettingRow, Toggle } from "@/components/Settings/page/SettingsPageShared";

function useSettingsAvailabilitySectionData() {
  const {
    actions,
    availabilitySettings,
    dirty,
    savingBySection,
    setAvailabilitySettings,
  } = useSettingsPageContext();

  const toggleDay = (day: string) => {
    setAvailabilitySettings((current) => ({
      ...current,
      workingDays: current.workingDays.includes(day)
        ? current.workingDays.filter((d) => d !== day)
        : [...current.workingDays, day],
    }));
  };

  return {
    actions,
    availabilitySettings,
    dirty,
    savingBySection,
    setAvailabilitySettings,
    toggleDay,
  };
}

export function SettingsAvailabilitySection() {
  const {
    actions,
    availabilitySettings,
    dirty,
    savingBySection,
    setAvailabilitySettings,
    toggleDay,
  } = useSettingsAvailabilitySectionData();

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <SectionShell
      title="Availability Settings"
      subtitle="Manage your working hours and vacation status to control client expectations."
    >
      <div className="space-y-6">
        {/* Working Days */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
            <FiCalendar className="size-3.5" />
            Working Days
          </div>
          <div className="flex flex-wrap gap-2">
            {days.map((day) => {
              const active = availabilitySettings.workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-all ${
                    active
                      ? "border-(--btn-bg-primary) bg-(--btn-bg-primary) text-(--btn-text-primary)"
                      : "border-(--border-color) bg-(--bg-secondary)/55 text-(--text-secondary) hover:bg-(--bg-secondary)"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Working Hours */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              <FiClock className="size-3.5" />
              Start Time
            </div>
            <Input
              type="time"
              value={availabilitySettings.startTime}
              onChange={(e) =>
                setAvailabilitySettings((c) => ({ ...c, startTime: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              <FiClock className="size-3.5" />
              End Time
            </div>
            <Input
              type="time"
              value={availabilitySettings.endTime}
              onChange={(e) =>
                setAvailabilitySettings((c) => ({ ...c, endTime: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Vacation Mode */}
        <div className="space-y-4 rounded-3xl border border-amber-100 bg-amber-50/50 p-5 dark:border-amber-900/30 dark:bg-amber-900/10">
          <SettingRow
            title="Vacation Mode"
            description="Temporarily pause new orders and set an out-of-office message."
            control={
              <Toggle
                checked={availabilitySettings.vacationMode}
                onChange={(next) =>
                  setAvailabilitySettings((c) => ({ ...c, vacationMode: next }))
                }
              />
            }
          />

          {availabilitySettings.vacationMode && (
            <div className="profile-fade-in grid gap-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-(--text-muted)">
                    Vacation Start
                  </label>
                  <Input
                    type="date"
                    value={availabilitySettings.vacationStart}
                    onChange={(e) =>
                      setAvailabilitySettings((c) => ({
                        ...c,
                        vacationStart: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-(--text-muted)">
                    Vacation End
                  </label>
                  <Input
                    type="date"
                    value={availabilitySettings.vacationEnd}
                    onChange={(e) =>
                      setAvailabilitySettings((c) => ({
                        ...c,
                        vacationEnd: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-(--text-muted)">
                  Auto-reply Message
                </label>
                <textarea
                  rows={3}
                  value={availabilitySettings.autoReply}
                  placeholder="I'm currently away. I'll get back to you as soon as I return!"
                  onChange={(e) =>
                    setAvailabilitySettings((c) => ({
                      ...c,
                      autoReply: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-(--input-border) bg-(--bg-card) px-3 py-2 text-sm text-(--input-text)"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={!dirty.availability || savingBySection.availability}
        onClick={() => void actions.saveAvailability()}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) disabled:cursor-not-allowed disabled:opacity-70"
      >
        {savingBySection.availability ? (
          <>
            <Loader className="border-white/40 border-t-white" /> Saving
          </>
        ) : (
          "Save availability"
        )}
      </button>
    </SectionShell>
  );
}
