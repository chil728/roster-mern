import TypeModel from "../models/Type.js";
import UserModel from "../models/User.js";

const COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const MIN_NAME_LENGTH = 2;

function isOwner(userDoc, user) {
  const userId = typeof user === "string" ? user : user?._id;
  return userDoc.user.toString() === String(userId);
}

function normalizeColorValue(value, fallback) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return fallback;
  }

  return raw.toUpperCase();
}

function normalizeTypePayload(typeDoc) {
  const type = typeof typeDoc.toObject === "function" ? typeDoc.toObject() : typeDoc;

  const bgColor = normalizeColorValue(type.bgColor, "#3B82F6");
  const textColor = normalizeColorValue(type.textColor, "#FFFFFF");

  return {
    ...type,
    bgColor,
    textColor,
  };
}

function validate({ name, description, bgColor, textColor }) {
  if (typeof name !== "string" || name.trim().length < MIN_NAME_LENGTH) {
    return { valid: false, message: `Name must be at least ${MIN_NAME_LENGTH} characters long.` };
  }
  if (typeof description !== "string") {
    return { valid: false, message: "Description must be a string." };
  }
  if (typeof bgColor !== "string" || !COLOR_REGEX.test(bgColor.trim())) {
    return { valid: false, message: "Invalid background color format. Use hex code like #RRGGBB." };
  }
  if (typeof textColor !== "string" || !COLOR_REGEX.test(textColor.trim())) {
    return { valid: false, message: "Invalid text color format. Use hex code like #RRGGBB." };
  }
  return {
    valid: true,
    payload: {
      name: name.trim(),
      description: description.trim(),
      bgColor: bgColor.trim().toUpperCase(),
      textColor: textColor.trim().toUpperCase(),
    },
  };
}

export async function createType(req, res) {
  try {
    const userID = req.userID;
    if (!userID) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const { name, description, bgColor, textColor } = req.body;
    const result = validate({ name, description, bgColor, textColor });
    if (!result.valid)
      return res
        .status(400)
        .json({ success: false, message: result.message });

    if (
      await TypeModel.findOne({
        user: userID,
        name: result.payload.name,
      })
    ) {
      return res
        .status(400)
        .json({ success: false, message: "This type already exists" });
    }

    const newType = new TypeModel({
      user: userID,
      name: result.payload.name,
      description: result.payload.description,
      bgColor: result.payload.bgColor,
      textColor: result.payload.textColor,
    });
    const savedType = await newType.save();
    return res.status(201).json({ success: true, type: normalizeTypePayload(savedType) });

  } catch (error) {
    console.error("Error creating type:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
}

export async function getType(req, res) {
  try {
    const userID = req.userID;
    if (!userID) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const { id } = req.params;
    const type = await TypeModel.findById(id);
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: "Type not found" });
    if (!isOwner(type, userID)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    return res.json({ success: true, type: normalizeTypePayload(type) });
  } catch (error) {
    console.error("Error fetching type:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
}

export async function getTypes(req, res) {
  try {
    const userID = req.userID;

    const user = await UserModel.findById(userID);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });

    const types = await TypeModel.find({ user: userID }).lean();
    if (!types)
      return res
        .status(401)
        .json({ success: false, message: "No types found." });

    const normalizedTypes = types.map((type) => normalizeTypePayload(type));

    return res.json({
      success: true,
      types: normalizedTypes,
    });
  } catch (error) {
    console.error("Error fetching types:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
}

export async function updateType(req, res) {
  try {
    const userID = req.userID;

    const user = await UserModel.findById(userID);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });

    const { id } = req.params;
    const { name, description, bgColor, textColor } = req.body;
    const result = validate({ name, description, bgColor, textColor });
    if (!result.valid) {
      return res
        .status(400)
        .json({ success: false, message: result.message });
    }
    const type = await TypeModel.findById(id);
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: "Type not found" });
    if (!isOwner(type, user)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    type.name = result.payload.name;
    type.description = result.payload.description;
    type.bgColor = result.payload.bgColor;
    type.textColor = result.payload.textColor;
    const updatedType = await type.save();
    return res.json({ success: true, type: normalizeTypePayload(updatedType) });
  } catch (error) {
    console.error("Error updating type:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
}

export async function deleteType(req, res) {
  try {
    const userID = req.userID;
    const user = await UserModel.findById(userID);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });

    const { id } = req.params;
    const type = await TypeModel.findById(id);
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: "Type not found" });
    if (!isOwner(type, user)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    await TypeModel.findByIdAndDelete(id);
    return res.json({ success: true, message: "Type deleted successfully" });
  } catch (error) {
    console.error("Error deleting type:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
}
