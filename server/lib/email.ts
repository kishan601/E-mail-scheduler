import nodemailer from "nodemailer";

// Create a transporter that will be reused
let transporter: nodemailer.Transporter | null = null;

export async function getTransporter() {
  if (transporter) return transporter;

  // Check for environment variables first
  if (process.env.ETHEREAL_EMAIL && process.env.ETHEREAL_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_EMAIL,
        pass: process.env.ETHEREAL_PASSWORD
      }
    });
    return transporter;
  }

  // Fallback to creating a new test account
  console.log("Creating new Ethereal Email test account...");
  const testAccount = await nodemailer.createTestAccount();
  
  console.log("Ethereal Email credentials created:");
  console.log("User:", testAccount.user);
  console.log("Pass:", testAccount.pass);
  console.log("Preview URL: https://ethereal.email/messages");

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string) {
  const transport = await getTransporter();
  const info = await transport.sendMail({
    from: '"ReachInbox Scheduler" <scheduler@reachinbox.demo>',
    to,
    subject,
    html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  
  return info;
}
