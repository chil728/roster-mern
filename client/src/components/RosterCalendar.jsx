import React, { useMemo, useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getLunar } from "chinese-lunar-calendar";

const CYCLE_ANCHOR_NUMBER = 381;
const CYCLE_ANCHOR_START = dayjs("2021-07-05").startOf("day");
const CYCLE_DAYS = 14;
const WINDOW_CYCLES = 2;
const WINDOW_DAYS = CYCLE_DAYS * WINDOW_CYCLES;
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCycleNumber(date) {
  const diffDays = dayjs(date).startOf("day").diff(CYCLE_ANCHOR_START, "day");
  return CYCLE_ANCHOR_NUMBER + Math.floor(diffDays / CYCLE_DAYS);
}

function getCycleStart(cycleNumber) {
  return CYCLE_ANCHOR_START.add(
    (cycleNumber - CYCLE_ANCHOR_NUMBER) * CYCLE_DAYS,
    "day",
  );
}

function hasShiftNote(note) {
  if (typeof note === "string") {
    return note.trim().length > 0;
  }
  return Boolean(note);
}

export default function CalendarWidget({
  initialDate,
  events = [],
  onDayPress,
  onWindowChange,
  rangeStartDate,
}) {
  const today = dayjs().format("YYYY-MM-DD");
  const [currentDate, setCurrentDate] = useState(initialDate || today);

  const currentCycle = useMemo(
    () => getCycleNumber(currentDate),
    [currentDate],
  );
  const windowStart = useMemo(
    () => getCycleStart(currentCycle),
    [currentCycle],
  );
  const windowEnd = useMemo(
    () => windowStart.add(WINDOW_DAYS - 1, "day"),
    [windowStart],
  );

  const title = useMemo(
    () => `Cycle ${currentCycle} - ${currentCycle + 1}`,
    [currentCycle],
  );
  const subtitle = useMemo(
    () =>
      `${windowStart.format("YYYY-MM-DD")} ~ ${windowEnd.format("YYYY-MM-DD")}`,
    [windowStart, windowEnd],
  );

  const handlePrevWindow = useCallback(() => {
    const newDate = windowStart
      .subtract(WINDOW_DAYS, "day")
      .format("YYYY-MM-DD");
    setCurrentDate(newDate);
  }, [windowStart]);

  const handleNextWindow = useCallback(() => {
    const newDate = windowStart.add(WINDOW_DAYS, "day").format("YYYY-MM-DD");
    setCurrentDate(newDate);
  }, [windowStart]);

  const handleToday = useCallback(() => {
    setCurrentDate(today);
  }, [today]);

  useEffect(() => {
    if (onWindowChange) {
      onWindowChange({
        cycleStart: currentCycle,
        cycleEnd: currentCycle + 1,
        startDate: windowStart.format("YYYY-MM-DD"),
        endDate: windowEnd.format("YYYY-MM-DD"),
      });
    }
  }, [currentCycle, windowStart, windowEnd, onWindowChange]);

  // Group events by date
  const eventMap = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  const cycleSections = useMemo(
    () =>
      Array.from({ length: WINDOW_CYCLES }, (_, index) => {
        const cycleNumber = currentCycle + index;
        const start = getCycleStart(cycleNumber);
        const end = start.add(CYCLE_DAYS - 1, "day");
        const days = Array.from({ length: CYCLE_DAYS }, (_, dayIndex) =>
          start.add(dayIndex, "day"),
        );
        return { cycleNumber, start, end, days };
      }),
    [currentCycle],
  );

  const handleDayClick = (day) => {
    if (onDayPress) {
      onDayPress(day.format("YYYY-MM-DD"));
    }
  };

  // Render a single day cell
  const renderDay = (day) => {
    const dateString = day.format("YYYY-MM-DD");
    const dayEvents = eventMap[dateString] || [];
    const isToday = dateString === today;
    const isRangeStart = rangeStartDate && dateString === rangeStartDate;
    const monthLabel = day.format("MMMM");

    // Lunar Date Calculation
    const lunar = getLunar(day.year(), day.month() + 1, day.date());
    const dayName = lunar.dateStr.slice(-2);
    const monthName = lunar.dateStr.slice(0, -2);
    const lunarText = lunar.lunarDate === 1 ? monthName : dayName;

    return (
      <div
        key={dateString}
        onClick={() => handleDayClick(day)}
        className={`
          min-h-[80px] border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors
          ${isRangeStart ? "ring-2 ring-indigo-500" : ""}
          hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer
        `}
      >
        <div className="w-full inline-flex bg-slate-100 px-1.5 py-[1px] text-[10px] items-center justify-center font-semibold tracking-wide text-slate-600  dark:bg-gray-700 k:text-gray-300">
          {monthLabel}
        </div>
        <div className="mb-1 flex justify-between items-start">
          <span
            className={`text-[10px] md:text-xs ml-1 ${isToday ? "text-blue-600 dark:text-blue-400 font-medium" : "text-slate-500 dark:text-gray-300"}`}
          >
            {lunarText}
          </span>
          <span
            className={`
              flex h-6 w-6 items-center justify-center ml-auto rounded-full text-sm md:text-base font-bold
              ${isToday ? "bg-blue-600 text-white" : "text-slate-900 dark:text-gray-200"}
            `}
          >
            {day.date()}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {dayEvents.slice(0, 3).map((ev) => {
            const chipBackgroundColor = ev.backgroundColor || ev.color || "#E0E7FF";
            const chipTextColor = ev.textColor;

            return (
              <div
                key={ev.id}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs md:text-sm font-semibold"
                style={{
                  backgroundColor: chipBackgroundColor,
                  color: chipTextColor,
                }}
                title={ev.title}
              >
                {hasShiftNote(ev.note) && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                )}
                <span className="truncate" style={{ color: chipTextColor }}>{ev.title}</span>
              </div>
            );
          })}
          {dayEvents.length > 3 && (
            <span className="text-[10px] md:text-xs text-slate-500 dark:text-gray-400 pl-1">
              +{dayEvents.length - 3} more
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex max-w-screen-lg mx-auto mt-8 flex-col gap-1 p-2 rounded-xl transition-colors duration-300">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 pt-4">
        <button
          onClick={handlePrevWindow}
          className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors"
          aria-label="Previous Cycles"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
          <button
            onClick={handleToday}
            className="px-4 py-1.5 rounded-full bg-indigo-500 text-white text-sm md:text-base font-bold hover:bg-indigo-600 transition-colors"
          >
            Today
          </button>
        </div>

        <button
          onClick={handleNextWindow}
          className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors"
          aria-label="Next Cycles"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 rounded-lg overflow-hidden">
        {WEEK_DAYS.map((day) => (
          <div
            key={`week-header-${day}`}
            className="py-2 text-center text-sm md:text-base font-semibold text-slate-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {cycleSections.map((section) => (
        <div
          key={section.cycleNumber}
          className="rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
        >
          <div className="px-4 py-2 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900">
            <h3 className="text-sm md:text-base font-bold text-slate-700 dark:text-gray-200">
              Cycle {section.cycleNumber}
            </h3>
          </div>

          <div className="grid grid-cols-7">{section.days.map(renderDay)}</div>
        </div>
      ))}
    </div>
  );
}
