function verifyEmailTemplate({ name, verifyUrl }) {
  return `
    <div style="font-family: Arial, sans-serif; line-height:1.4">
      <h2>Verify your email</h2>
      <p>Hi ${name || "there"},</p>
      <p>Thanks for creating an account. Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}" target="_blank">Verify Email</a></p>
      <p>This link will expire soon. If you didn’t create this account, you can ignore this email.</p>
    </div>
  `;
}

function resetPasswordTemplate({ name, resetUrl }) {
  return `
    <div style="font-family: Arial, sans-serif; line-height:1.4">
      <h2>Reset your password</h2>
      <p>Hi ${name || "there"},</p>
      <p>We received a request to reset your password. Click below to reset it:</p>
      <p><a href="${resetUrl}" target="_blank">Reset Password</a></p>
      <p>If you didn’t request this, ignore this email.</p>
    </div>
  `;
}

module.exports = { verifyEmailTemplate, resetPasswordTemplate };
