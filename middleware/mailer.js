const nodemailer = require("nodemailer");

// Create a transporter object using Gmail's SMTP service
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAILER_SENDER_EMAIL, // Replace with your Gmail address
    pass: process.env.NODE_MAILER_SENDER_EMAIL_PASSWORD, // Replace with your Gmail password or app-specific password
  },
});

// Email options
// const mailOptions = {
//   from: "your-email@gmail.com", // Sender's email address
//   to: "recipient-email@example.com", // Recipient's email address
//   subject: "Test Email", // Subject of the email
//   text: "This is a test email sent from Node.js using Nodemailer!", // Email body
// };

// // Send the email
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.log("Error:", error);
//   } else {
//     console.log("Email sent:", info.response);
//   }
// });

module.exports = { transporter };
