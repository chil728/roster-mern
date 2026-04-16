import React, { useContext, useState, useCallback, useRef } from "react";
import NavBar from "../components/NavBar.jsx";
import RosterCalendar from "../components/RosterCalendar.jsx";
import { AuthContext } from "../context/AuthContext";
import api from "../lib/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import ShiftEditorModal from "../components/ShiftEditorModal.jsx";

const CYCLE_ANCHOR_NUMBER = 381;
const CYCLE_ANCHOR_START = dayjs("2021-07-05").startOf("day");
const CYCLE_DAYS = 14;

function getCycleByDate(date) {
  const diffDays = dayjs(date).startOf("day").diff(CYCLE_ANCHOR_START, "day");
  return String(CYCLE_ANCHOR_NUMBER + Math.floor(diffDays / CYCLE_DAYS));
}

const Home = () => {
  const { isLoggedIn, types } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [visibleWindow, setVisibleWindow] = useState({ cycleStart: null, cycleEnd: null });
  const [rangeStartDate, setRangeStartDate] = useState(null);
  const [selectedRange, setSelectedRange] = useState({ startDate: null, endDate: null });
  const [selectedRosterId, setSelectedRosterId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTypeName, setSelectedTypeName] = useState("");
  const [note, setNote] = useState("");
  const lastWindowKeyRef = useRef("");

  const fetchRosters = useCallback(async (cycleStart, count = 2) => {
    try {
      const { data } = await api.get("/rosters/by-cycle", {
        params: { startCycle: cycleStart, count },
      });

      if (data.success) {
        // Transform backend rosters to calendar events
        const newEvents = (data.cycles || [])
          .flatMap((c) => c.rosters || [])
          .filter((r) => r !== null)
          .map((r) => {
            const backgroundColor = r.type?.bgcolor || r.type?.color || "#E0E7FF";
            const textColor = r.type?.textcolor || "#1E293B";

            return {
              id: r._id,
              date: dayjs(r.date).format("YYYY-MM-DD"),
              title: r.type?.name,
              typeName: r.type?.name,
              cycle: r.cycle,
              note: r.note,
              color: backgroundColor,
              backgroundColor,
              textColor,
            };
          });
        setEvents(newEvents);
      }
    } catch (error) {
      console.error("Failed to fetch rosters", error);
    }
  }, []);

  const handleWindowChange = useCallback(({ cycleStart, cycleEnd }) => {
    const windowKey = `${cycleStart}-${cycleEnd}`;
    if (lastWindowKeyRef.current === windowKey) {
      return;
    }

    lastWindowKeyRef.current = windowKey;
    setVisibleWindow({ cycleStart, cycleEnd });

    if (isLoggedIn) {
      fetchRosters(cycleStart, 2);
    }
  }, [isLoggedIn, fetchRosters]);

  const closeModal = () => {
    setIsModalOpen(false);
    setRangeStartDate(null);
    setSelectedRange({ startDate: null, endDate: null });
  };

  const handleDayPress = (date) => {
    // First click: choose range start
    if (!rangeStartDate) {
      setRangeStartDate(date);
      toast.info("Start date selected. Please click an end date.");
      return;
    }

    // Second click: choose range end and open modal
    const start = dayjs(rangeStartDate);
    const end = dayjs(date);
    const startDate = start.isBefore(end, "day") ? start.format("YYYY-MM-DD") : end.format("YYYY-MM-DD");
    const endDate = start.isBefore(end, "day") ? end.format("YYYY-MM-DD") : start.format("YYYY-MM-DD");

    setSelectedRange({ startDate, endDate });

    // Single-day selection keeps existing edit/delete flow
    if (startDate === endDate) {
      const existingEvent = events.find((e) => e.date === startDate);

      if (existingEvent) {
        setSelectedRosterId(existingEvent.id);
        setSelectedTypeName(existingEvent.title);
        setNote(existingEvent.note || "");
      } else {
        setSelectedRosterId(null);
        setSelectedTypeName("");
        setNote("");
      }
    } else {
      // Range selection uses bulk upsert; initialize empty form
      setSelectedRosterId(null);
      setSelectedTypeName("");
      setNote("");
    }

    setRangeStartDate(null);
    setIsModalOpen(true);
  };

  const handleSaveRoster = async () => {
    const { startDate, endDate } = selectedRange;

    if (!startDate || !endDate) {
      toast.error("Please select a date range first");
      return;
    }

    if (!selectedTypeName) {
      toast.error("Please select a shift type");
      return;
    }

    try {
      let response;
      if (startDate !== endDate) {
        response = await api.post("/rosters/bulk", {
          startDate,
          endDate,
          type: selectedTypeName,
          note,
        });
      } else if (selectedRosterId) {
        response = await api.put(`/rosters/${selectedRosterId}`, {
          date: startDate,
          cycle: getCycleByDate(startDate),
          type: selectedTypeName,
          note: note,
        });
      } else {
        response = await api.post("/rosters", {
          date: startDate,
          cycle: getCycleByDate(startDate),
          type: selectedTypeName,
          note: note,
        });
      }

      const { data } = response;

      if (data.success) {
        const isRangeSave = startDate !== endDate;
        toast.success(
          isRangeSave
            ? "Shifts saved for selected range"
            : selectedRosterId
              ? "Shift updated successfully"
              : "Shift added successfully"
        );
        closeModal();
        if (visibleWindow.cycleStart) {
          fetchRosters(visibleWindow.cycleStart, 2);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteRoster = async () => {
    if (!selectedRosterId) return;

    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        const { data } = await api.delete(`/rosters/${selectedRosterId}`);
        if (data.success) {
          toast.success("Shift deleted successfully");
          closeModal();
          if (visibleWindow.cycleStart) {
            fetchRosters(visibleWindow.cycleStart, 2);
          }
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  const handleBulkDeleteRoster = async () => {
    const { startDate, endDate } = selectedRange;

    if (!startDate || !endDate || startDate === endDate) return;

    if (window.confirm("Are you sure you want to delete all shifts in this selected range?")) {
      try {
        const { data } = await api.delete("/rosters/bulk", {
          data: { startDate, endDate },
        });

        if (data.success) {
          toast.success(`Deleted ${data.deletedCount || 0} shift(s) from selected range`);
          closeModal();
          if (visibleWindow.cycleStart) {
            fetchRosters(visibleWindow.cycleStart, 2);
          }
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  return (
    <>
      <NavBar />
      {isLoggedIn ? (
        <>
          <RosterCalendar
            initialDate={dayjs().format("YYYY-MM-DD")}
            events={events}
            onDayPress={handleDayPress}
            onWindowChange={handleWindowChange}
            rangeStartDate={rangeStartDate}
          />

          {isModalOpen && (
            <ShiftEditorModal
              open={isModalOpen}
              onClose={closeModal}
              selectedRange={selectedRange}
              selectedRosterId={selectedRosterId}
              selectedTypeName={selectedTypeName}
              setSelectedTypeName={setSelectedTypeName}
              note={note}
              setNote={setNote}
              onSave={handleSaveRoster}
              onDelete={handleDeleteRoster}
              onDeleteRange={handleBulkDeleteRoster}
              types={types || []}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100dvh-5rem)]">
          <h1 className="text-4xl font-bold mb-4 text-black dark:text-white">Welcome to Roster App</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Please login to have your own calendar.
          </p>
        </div>
      )}
    </>
  );
};

export default Home;
