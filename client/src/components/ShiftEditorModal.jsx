import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import Modal from "./common/Modal";
import Dropdown from "./common/Dropdown";
import TextField from "./common/TextField";
import Button from "./common/Button";
import { Trash, Save, ArrowBigUp, CalendarDays } from "lucide-react";

export default function ShiftEditorModal({
  open,
  onClose,
  selectedRange,
  selectedRosterId,
  selectedTypeName,
  setSelectedTypeName,
  note,
  setNote,
  onSave,
  onDelete,
  onDeleteRange,
  types = [],
}) {
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const typeOptions = useMemo(
    () =>
      types.map((type) => ({
        value: type.name,
        label: type.name,
        color: type.bgcolor || type.color,
        textColor: type.textcolor || "#1E293B",
      })),
    [types]
  );

  const startDate = selectedRange?.startDate;
  const endDate = selectedRange?.endDate;
  const isRange = startDate && endDate && startDate !== endDate;
  const dateLabel = !startDate
    ? "-"
    : isRange
      ? `${dayjs(startDate).format("YYYY-MM-DD")} ~ ${dayjs(endDate).format("YYYY-MM-DD")}`
      : dayjs(startDate).format("YYYY-MM-DD");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isRange ? "Apply Shift Range" : `${selectedRosterId ? "Edit" : "Add"} Shift`}
      maxWidth="max-w-md"
    >
      <div className="mb-4 text-base font-medium text-slate-700 dark:text-gray-300">
        <div className="flex items-center gap-2 justify-center bg-blue-100 py-2 px-4 rounded-lg text-blue-600 dark:bg-gray-700 dark:text-gray-200">
          <CalendarDays size={20} className="text-blue-600 dark:text-gray-400" />
          {dateLabel}
        </div>
      </div>

      <div className="space-y-4">
        <Dropdown
          label="Shift Type"
          value={selectedTypeName}
          options={typeOptions}
          placeholder="Select a shift type"
          open={isTypeDropdownOpen}
          onOpenChange={setIsTypeDropdownOpen}
          onChange={setSelectedTypeName}
        />

        <TextField
          label="Note (Optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add any notes..."
          multiline
          rows={3}
        />

        <div className="flex justify-end gap-2 pt-2">
          {(selectedRosterId || isRange) && (
            <Button
              variant="danger"
              size="md"
              className="mr-auto"
              onClick={isRange ? onDeleteRange : onDelete}
            >
              <Trash size={20} />
              {isRange ? "Delete Range" : "Delete"}
            </Button>
          )}
          <Button variant="primary" size="md" onClick={onSave}>
            {selectedRosterId ? <ArrowBigUp size={20} /> : <Save size={20}/>}
            {selectedRosterId ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
