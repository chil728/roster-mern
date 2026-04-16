import mongoose from "mongoose";

const TypeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, unique: true },
    description: { type: String },
    bg_color: { type: String, required: true },
    text_color: { type: String, required: true },
  },
  { timestamps: true }
);

const TypeModel = mongoose.model("Type", TypeSchema);

export default TypeModel;
