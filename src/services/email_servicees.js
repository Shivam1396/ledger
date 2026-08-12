const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    },

    debug: true,
    logger: true
});

transporter.verify((error, success) => {
    if (error) {
        console.log("Error connecting to email:", error);
    } else {
        console.log("Email server is ready to send messages");
    }
});

async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: `"backend_ledger" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });

        console.log("Message sent:", info.messageId);

        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

async function sendRegisterationEmail(userEmail, name) {
    const subject = "Welcome to backend_ledger!";

    const text = `Hello ${name},

Thank you for registering at backend_ledger.

We are excited to have you on board!

Best regards,
The backend_ledger Team`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to backend_ledger</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">

    <p>Hello ${name},</p>

    <p>
        Thank you for registering at
        <strong>backend_ledger</strong>.
    </p>

    <p>
        We are excited to have you on board!
    </p>

    <p>
        Best regards,<br>
        The backend_ledger Team
    </p>

</body>
</html>
`;

    return await sendEmail(
        userEmail,
        subject,
        text,
        html
    );
}

module.exports = {
    transporter,
    sendEmail,
    sendRegisterationEmail
};