require('dotenv').config();
const fs = require('fs');
const bcrypt = require('bcrypt');
const axios = require('axios');
const csv = require('csv-parser');
const { parse } = require('json2csv');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CSV_FILE = "C:/Users/tapar/Desktop/ftcUsers.csv";
const UPDATED_CSV_FILE = "C:/Users/tapar/Desktop/updated_ftcUsers.csv";

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+$/;
    return emailRegex.test(email) || /.+ <[^\s@]+@[^\s@]+>/.test(email);
};

// Generate random password
const generatePassword = (length = 10) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
};

// Encrypt password before storing
const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Send email
const sendEmail = async (toEmail, password) => {
    if (!isValidEmail(toEmail)) {
        console.error(`Invalid email format: ${toEmail}`);
        return;
    }

    const url = "https://api.resend.com/emails";
    const headers = {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
    };

    const data = {
        from: "FTC Arcade <arcade@ftc.viskkman.com>",
        to: [toEmail],
        subject: "Your Event Password",
        html: `<p>Hello,</p>
               <p>Your login credentials for the event:</p>
               <p><strong>Email:</strong> ${toEmail}</p>
               <p><strong>Password:</strong> ${password}</p>
               <p>Please keep this information safe.</p>`
    };

    try {
        console.log(`Attempting to send email to: ${toEmail}`);
        await axios.post(url, data, { headers });
        console.log(`Email sent to ${toEmail}`);
    } catch (error) {
        console.error(`Failed to send email to ${toEmail}:`, error.response?.data || error.message);
    }
};

// Process CSV file and send emails in batches
const processCSV = async () => {
    const results = [];
    fs.createReadStream(CSV_FILE)
        .on('error', (err) => {
            console.error(`Error reading file: ${err.message}`);
            process.exit(1);
        })
        .pipe(csv())
        .on('data', (data) => {
            if (data.email && data.email.trim() !== "") { // Ignore empty rows
                results.push(data);
            }
        })
        .on('end', async () => {
            if (results.length === 0) {
                console.error("The CSV file must contain at least one valid email!");
                return;
            }

            const batchSize = 2; // Resend API allows 2 requests per second
            for (let i = 0; i < results.length; i += batchSize) {
                const batch = results.slice(i, i + batchSize);

                // Process batch in parallel
                await Promise.all(batch.map(async (row) => {
                    const plainPassword = generatePassword();
                    const encryptedPassword = await encryptPassword(plainPassword);
                    row.password = encryptedPassword;
                    return sendEmail(row.email, plainPassword);
                }));

                // Wait 1 second before the next batch to avoid rate limit
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Save updated CSV with passwords
            const updatedCSV = parse(results, { fields: Object.keys(results[0]) });
            fs.writeFileSync(UPDATED_CSV_FILE, updatedCSV);
            console.log("Passwords generated, encrypted, and emailed successfully!");
        });
};

// Start processing the CSV
// processCSV();


