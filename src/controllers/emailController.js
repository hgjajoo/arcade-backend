// src/controllers/emailController.js
const User = require("../models/userModel");
const bcrypt = require('bcryptjs');
const axios = require('axios');

// Helper function to generate random password
const generatePassword = (length = 10) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Helper function to send email
const sendEmail = async (toEmail, password) => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY not configured');
    }

    const url = "https://api.resend.com/emails";
    const headers = {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
    };

    const data = {
        from: "FTC Arcade <arcade@ftc.viskkman.com>",
        to: [toEmail],
        subject: "Your FTC Arcade Login Credentials",
        html: `<p>Hello,</p>
               <p>Your login credentials for FTC Arcade:</p>
               <p><strong>Email:</strong> ${toEmail}</p>
               <p><strong>Password:</strong> ${password}</p>
               <p>Please keep this information safe.</p>`
    };

    try {
        await axios.post(url, data, { headers });
        return true;
    } catch (error) {
        console.error(`Failed to send email to ${toEmail}:`, error.response?.data || error.message);
        return false;
    }
};

// Controller function to manually trigger bulk email sending
exports.bulkSendEmails = async (req, res) => {
    try {
        const users = await User.find();
        const errors = [];

        for (const user of users) {
            try {
                const plainPassword = generatePassword();
                const hashedPassword = await bcrypt.hash(plainPassword, 12);
                user.password = hashedPassword;
                await user.save();
                const emailSent = await sendEmail(user.email, plainPassword);

                if (!emailSent) {
                    errors.push(`Failed to send email to ${user.email}`);
                }
            } catch (error) {
                errors.push(`Error processing ${user.email}: ${error.message}`);
            }
        }

        res.status(200).json({
            status: "success",
            message: "Bulk email sending completed",
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Bulk email sending error:', error);
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};
