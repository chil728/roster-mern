import mongoose from "mongoose";

const RosterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cycle: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: mongoose.Schema.Types.ObjectId, ref: "Type", required: true },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("rosters", RosterSchema);
