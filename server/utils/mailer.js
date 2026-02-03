import nodemailer from "nodemailer";

function createTransporter() {
  // const port = Number(process.env.EMAIL_PORT || 587);
  // const secure = String(process.env.EMAIL_SECURE || "true") === "true";

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}


export async function sendEmail({ to, subject, html }) {
  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html,
    });
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}