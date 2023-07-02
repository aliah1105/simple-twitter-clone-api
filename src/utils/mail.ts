import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "aliahadi.f1105@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

const send_mail = async (mailDetails: any, callback: (info:any) => any) => {
  try {
    const info = await transporter.sendMail(mailDetails);
    callback(info);
  } catch (e: any) {
    console.error(e);
  }
};

export default send_mail;
