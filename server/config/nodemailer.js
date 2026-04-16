import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_GMAIL,
    pass: process.env.APP_PASS,
  }
});

export default transporter;