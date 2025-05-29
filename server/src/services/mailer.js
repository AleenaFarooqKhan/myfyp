import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "aleenafarooq457@gmail.com",
    pass: "clsm iumw vkts kzpm", // Consider using environment variables for security
  },
});

export const registrationEmail = async (to, username) => {
  const mailOptions = {
    from: '"aleena farooq" <aleenafarooq457@gmail.com>',
    to,
    subject: "Registration email",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2c3e50;">Hey ${username},</h2>
        <p style="font-size: 16px; color: #34495e;">
          Thanks for creating an account at <strong>Roam Together</strong>.
        </p>
        <p style="font-size: 16px; color: #34495e;">
          Your account is currently under review. You can log in after it has been approved.
        </p>
        <br/>
        <p style="font-size: 14px; color: #7f8c8d;">– Roam Together Team</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export const approvalEmail = async (to, username) => {
  const mailOptions = {
    from: '"aleena farooq" <aleenafarooq457@gmail.com>',
    to,
    subject: "Approval email",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2c3e50;">Hey ${username},</h2>
        <p style="font-size: 16px; color: #34495e;">
          Great news! Your account has been <strong>approved</strong>.
        </p>
        <p style="font-size: 16px; color: #34495e;">
          You can now log in and start exploring.
        </p>
        <br/>
        <p style="font-size: 14px; color: #7f8c8d;">– Roam Together Team</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export const rejectionEmail = async (to, username) => {
  const mailOptions = {
    from: '"aleena farooq" <aleenafarooq457@gmail.com>',
    to,
    subject: "Rejection email",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2c3e50;">Hey ${username},</h2>
        <p style="font-size: 16px; color: #e74c3c;">
          We're sorry to inform you that your registration request has been <strong>rejected</strong>.
        </p>
        <p style="font-size: 16px; color: #34495e;">
          If you believe this was a mistake, feel free to contact us.
        </p>
        <br/>
        <p style="font-size: 14px; color: #7f8c8d;">– Roam Together Team</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};
export const otpEmail = async (to, username, otp) => {
  const mailOptions = {
    from: '"Aleena Farooq" <aleenafarooq457@gmail.com>',
    to,
    subject: "Verify your account with OTP",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 500px; margin: auto; background-color: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50;">Welcome, ${username} 👋</h2>
          <p style="font-size: 16px; color: #34495e;">
            Thank you for signing up for <strong>Roam Together</strong>.
          </p>
          <p style="font-size: 16px; color: #34495e;">
            Please use the following One-Time Password (OTP) to verify your account:
          </p>
          <div style="font-size: 24px; font-weight: bold; color: #3498db; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #7f8c8d;">
            This OTP is valid for 10 minutes. Do not share it with anyone.
          </p>
          <br/>
          <p style="font-size: 14px; color: #7f8c8d;">– Roam Together Team</p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};