import RosterModel from "../models/Roster.js";
import TypeModel from "../models/Type.js";
import mongoose from "mongoose";

const CYCLE_ANCHOR_NUMBER = 381;
const CYCLE_ANCHOR_START = new Date("2021-07-05T00:00:00.000Z");
const CYCLE_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function resolveTypeForUser(userID, typeInput) {
  if (!typeInput) return null;

  const raw =
    typeof typeInput === "object"
      ? typeInput?._id || typeInput?.id || typeInput?.name || typeInput?.value
      : typeInput;

  if (!raw) return null;

  const value = String(raw).trim();
  if (!value) return null;

  if (mongoose.Types.ObjectId.isValid(value)) {
    const byId = await TypeModel.findOne({ _id: value, user: userID }, "_id");
    if (byId) return byId;
  }

  return TypeModel.findOne(
    {
      user: userID,
      name: { $regex: `^${escapeRegExp(value)}$`, $options: "i" },
    },
    "_id"
  );
}

function parseDateParts(dateInput) {
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const validated = new Date(Date.UTC(year, month - 1, day));

      if (
        validated.getUTCFullYear() !== year ||
        validated.getUTCMonth() + 1 !== month ||
        validated.getUTCDate() !== day
      ) {
        return null;
      }

      return { year, month, day };
    }
  }

  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return {
    year: parsed.getUTCFullYear(),
    month: parsed.getUTCMonth() + 1,
    day: parsed.getUTCDate(),
  };
}

// Persist date-only roster data at UTC midnight of that same calendar date.
function normalizeToUTC8StartOfDay(dateInput) {
  const parts = parseDateParts(dateInput);
  if (!parts) {
    return null;
  }

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function addDays(baseDate, days) {
  return new Date(baseDate.getTime() + days * MS_PER_DAY);
}

function formatUTC8DateKey(dateInput) {
  const normalized = normalizeToUTC8StartOfDay(dateInput);
  if (!normalized) {
    return null;
  }

  const year = normalized.getUTCFullYear();
  const month = String(normalized.getUTCMonth() + 1).padStart(2, "0");
  const day = String(normalized.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getUTC8DayOfMonth(dateInput) {
  const normalized = normalizeToUTC8StartOfDay(dateInput);
  if (!normalized) {
    return null;
  }

  return normalized.getUTCDate();
}

function getUTC8DateRange(startInput, endInput) {
  const start = normalizeToUTC8StartOfDay(startInput);
  const endStart = normalizeToUTC8StartOfDay(endInput);

  if (!start || !endStart) {
    return null;
  }

  if (start.getTime() > endStart.getTime()) {
    return null;
  }

  return {
    start,
    endExclusive: addDays(endStart, 1),
  };
}

function getCycleByDate(dateInput) {
  const date = normalizeToUTC8StartOfDay(dateInput);
  const anchor = normalizeToUTC8StartOfDay(CYCLE_ANCHOR_START);

  if (!date || !anchor) {
    return null;
  }

  const diffDays = Math.floor((date.getTime() - anchor.getTime()) / MS_PER_DAY);
  const cycleOffset = Math.floor(diffDays / CYCLE_DAYS);
  return String(CYCLE_ANCHOR_NUMBER + cycleOffset);
}

function getCycleRange(cycleNumber) {
  const cycle = Number(cycleNumber);
  const anchor = normalizeToUTC8StartOfDay(CYCLE_ANCHOR_START);
  const offsetDays = (cycle - CYCLE_ANCHOR_NUMBER) * CYCLE_DAYS;
  const start = addDays(anchor, offsetDays);
  const endExclusive = addDays(start, CYCLE_DAYS);
  const end = new Date(endExclusive.getTime() - 1);
  return { start, end, endExclusive };
}

// Query rosters by cycle number
export const getRostersByCycle = async (req, res) => {
  try {
    const userID = req.userID;
    const { cycle, startCycle, count } = req.query;

    const baseCycleRaw = startCycle ?? cycle;
    const baseCycle = Number(baseCycleRaw);
    const cyclesCount = Number(count ?? 1);

    if (!Number.isFinite(baseCycle)) {
      return res.status(400).json({ success: false, message: "Cycle is required" });
    }

    if (!Number.isFinite(cyclesCount) || cyclesCount < 1 || cyclesCount > 12) {
      return res.status(400).json({ success: false, message: "Count must be between 1 and 12" });
    }

    const firstRange = getCycleRange(baseCycle);
    const lastRange = getCycleRange(baseCycle + cyclesCount - 1);

    const rosters = await RosterModel.find({
      user: userID,
      date: { $gte: firstRange.start, $lt: lastRange.endExclusive },
    }).populate("type");

    const cycleBuckets = Array.from({ length: cyclesCount }, (_, index) => {
      const cycleNumber = baseCycle + index;
      const range = getCycleRange(cycleNumber);
      return {
        cycle: String(cycleNumber),
        startDate: range.start,
        endDate: range.end,
        rosters: [],
      };
    });

    rosters.forEach((roster) => {
      const cycleNumber = Number(getCycleByDate(roster.date));
      const bucketIndex = cycleNumber - baseCycle;
      if (bucketIndex >= 0 && bucketIndex < cycleBuckets.length) {
        cycleBuckets[bucketIndex].rosters.push(roster);
      }
    });

    return res.status(200).json({
      success: true,
      cycleStart: String(baseCycle),
      cycleEnd: String(baseCycle + cyclesCount - 1),
      cycles: cycleBuckets,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get rosters by month or range
export const getRostersByMonth = async (req, res) => {
  try {
    const { year, month, startDate: qStartDate, endDate: qEndDate } = req.query;
    const userID = req.userID;

    let query = { user: userID };
    let isRangeQuery = false;
    let daysInMonth = null;

    if (qStartDate && qEndDate) {
      const range = getUTC8DateRange(qStartDate, qEndDate);
      if (!range) {
        return res.status(400).json({ success: false, message: "Invalid date range" });
      }

      query.date = {
        $gte: range.start,
        $lt: range.endExclusive,
      };
      isRangeQuery = true;
    } else if (year && month) {
      const yearNum = Number(year);
      const monthNum = Number(month);
      if (!Number.isFinite(yearNum) || !Number.isFinite(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ success: false, message: "Invalid month query" });
      }

      const monthStart = normalizeToUTC8StartOfDay(`${yearNum}-${String(monthNum).padStart(2, "0")}-01`);
      daysInMonth = new Date(Date.UTC(yearNum, monthNum, 0)).getUTCDate();
      const monthEnd = normalizeToUTC8StartOfDay(
        `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`
      );

      if (!monthStart || !monthEnd) {
        return res.status(400).json({ success: false, message: "Invalid month query" });
      }

      query.date = { $gte: monthStart, $lt: addDays(monthEnd, 1) };
    } else {
       return res.status(400).json({ success: false, message: "Missing query parameters" });
    }

    const rosters = await RosterModel.find(query).populate("type");

    if (isRangeQuery) {
      // Return raw list for range query
      return res.status(200).json({
        success: true,
        rosters: rosters,
      });
    }

    // Legacy: If the day has no roster entry, the default value will be null
    const rosterMap = {};
    rosters.forEach((roster) => {
      const dayOfMonth = getUTC8DayOfMonth(roster.date);
      if (dayOfMonth !== null) {
        rosterMap[dayOfMonth] = roster;
      }
    });
    const result = [];
    for (let day = 1; day <= daysInMonth; day++) {
      result.push(rosterMap[day] || null);
    }

    res.status(200).json({
      success: true,
      rosters: result,
      days: result.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Create a new roster entry
export const createRoster = async (req, res) => {
  try {
    const { cycle, date, type, note } = req.body;
    const userID = req.userID;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    }

    const typeDoc = await resolveTypeForUser(userID, type);

    if (!typeDoc) {
      return res.status(404).json({ success: false, message: "Type not found" });
    }

    const normalizedDate = normalizeToUTC8StartOfDay(date);
    if (!normalizedDate) {
      return res.status(400).json({ success: false, message: "Invalid date" });
    }

    const nextDay = addDays(normalizedDate, 1);
    const existingRoster = await RosterModel.findOne({
      user: userID,
      date: { $gte: normalizedDate, $lt: nextDay },
    });

    if (existingRoster) {
      return res.status(409).json({
        success: false,
        message: "Roster already exists",
      });
    }

    const newRoster = new RosterModel({
      user: userID,
      cycle: cycle || getCycleByDate(normalizedDate),
      date: normalizedDate,
      type: typeDoc._id,
      note,
    });
    await newRoster.save();
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Modify an existing roster entry
export const updateRoster = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, type, note, cycle } = req.body;
    const userId = req.userID;
    const roster = await RosterModel.findById(id);

    if (!roster) {
      return res.status(404).json({ success: false, message: "Roster entry not found" });
    }

    if (roster.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (type) {
      const typeID = await resolveTypeForUser(userId, type);
      if (!typeID) {
        return res.status(404).json({ success: false, message: "Type not found" });
      }
      roster.type = typeID._id;
    }
    let normalizedDateForUpdate = null;
    if (date) {
      normalizedDateForUpdate = normalizeToUTC8StartOfDay(date);
      if (!normalizedDateForUpdate) {
        return res.status(400).json({ success: false, message: "Invalid date" });
      }

      const nextDay = addDays(normalizedDateForUpdate, 1);
      const duplicateRoster = await RosterModel.findOne({
        user: userId,
        _id: { $ne: id },
        date: { $gte: normalizedDateForUpdate, $lt: nextDay },
      });

      if (duplicateRoster) {
        return res.status(409).json({ success: false, message: "Roster already exists" });
      }

      roster.date = normalizedDateForUpdate;
    }
    if (cycle !== undefined) {
      roster.cycle = cycle;
    } else if (normalizedDateForUpdate) {
      roster.cycle = getCycleByDate(normalizedDateForUpdate);
    }
    if (note !== undefined) {
      roster.note = note;
    }
    const updatedRoster = await roster.save();
    res.status(200).json({ success: true, roster: updatedRoster });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Delete a roster entry
export const deleteRoster = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userID;
    const roster = await RosterModel.findById(id);

    if (!roster) {
      return res.status(404).json({ success: false, message: "Roster entry not found" });
    }

    if (roster.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await RosterModel.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Roster entry deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Bulk delete roster entries by date range
export const bulkDeleteRoster = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const userID = req.userID;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Start date and end date are required" });
    }

    const range = getUTC8DateRange(startDate, endDate);
    if (!range) {
      return res.status(400).json({ success: false, message: "Invalid date range" });
    }

    const result = await RosterModel.deleteMany({
      user: userID,
      date: { $gte: range.start, $lt: range.endExclusive },
    });

    res.status(200).json({
      success: true,
      message: "Rosters deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Bulk create roster entries
export const bulkCreateRoster = async (req, res) => {
  try {
    const { startDate, endDate, typeName, type, cycle, note } = req.body;
    const userID = req.userID;
    const typeInput = typeName ?? type;

    if (!startDate || !endDate || !typeInput) {
      return res.status(400).json({ success: false, message: "Start date, end date, and type are required" });
    }

    const typeDoc = await resolveTypeForUser(userID, typeInput);
    if (!typeDoc) {
      return res.status(404).json({ success: false, message: "Type not found" });
    }

    const start = normalizeToUTC8StartOfDay(startDate);
    const end = normalizeToUTC8StartOfDay(endDate);
    if (!start || !end || start.getTime() > end.getTime()) {
      return res.status(400).json({ success: false, message: "Invalid date range" });
    }

    const rangeEndExclusive = addDays(end, 1);
    const existingRosters = await RosterModel.find(
      {
        user: userID,
        date: { $gte: start, $lt: rangeEndExclusive },
      },
      "_id date"
    );
    const existingRosterIdByDate = new Map();
    existingRosters.forEach((roster) => {
      const dayKey = formatUTC8DateKey(roster.date);
      if (dayKey) {
        existingRosterIdByDate.set(dayKey, roster._id);
      }
    });

    const operations = [];

    // Loop from start to end date with UTC+8 day boundaries
    for (let current = new Date(start); current.getTime() <= end.getTime(); current = addDays(current, 1)) {
      const dayStart = new Date(current);
      const dayKey = formatUTC8DateKey(dayStart);
      const existingId = existingRosterIdByDate.get(dayKey);
      const cycleValue = cycle !== undefined ? cycle : getCycleByDate(dayStart);

      if (existingId) {
        operations.push({
          updateOne: {
            filter: { _id: existingId, user: userID },
            update: {
              $set: {
                date: dayStart,
                type: typeDoc._id,
                note: note || "",
                cycle: cycleValue,
              },
            },
          },
        });
      } else {
        operations.push({
          insertOne: {
            document: {
              user: userID,
              date: dayStart,
              type: typeDoc._id,
              note: note || "",
              cycle: cycleValue,
            },
          },
        });
      }
    }

    if (operations.length > 0) {
      await RosterModel.bulkWrite(operations);
    }

    res.status(201).json({ success: true, message: "Rosters created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
