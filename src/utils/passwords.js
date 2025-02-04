require('dotenv').config();
const fs = require('fs');
const bcrypt = require('bcrypt');
const axios = require('axios');
const csv = require('csv-parser');
const { parse } = require('json2csv');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CSV_FILE = "C:/Users/tapar/Desktop/ftcUsers.csv";
const UPDATED_CSV_FILE = "C:/Users/tapar/Desktop/updated_ftcUsers.csv";  // 

const generatePassword = (length = 10) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
};

const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const sendEmail = async (toEmail, password) => {
    const url = "https://api.resend.com/emails";
    const headers = {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
    };
    const data = {
        from: "onboarding@resend.dev",
        to: [toEmail],
        subject: "Your Event Password",
        html: `<p>Hello,</p>
               <p>Your login credentials for the event:</p>
               <p><strong>Email:</strong> ${toEmail}</p>
               <p><strong>Password:</strong> ${password}</p>
               <p>Please keep this information safe.</p>`
    };

    try {
        await axios.post(url, data, { headers });
        console.log(`Email sent to ${toEmail}`);
    } catch (error) {
        console.error(`Failed to send email to ${toEmail}:`, error.response?.data || error.message);
    }
};

const processCSV = async () => {
    const results = [];
    fs.createReadStream(CSV_FILE)
        .on('error', (err) => {
            console.error(`Error reading file: ${err.message}`);
            process.exit(1);
        })
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            if (!results[0]?.email) {
                console.error("The CSV file must have an 'email' column!");
                return;
            }

            await Promise.all(results.map(async (row) => {
                const plainPassword = generatePassword();
                const encryptedPassword = await encryptPassword(plainPassword);
                row.password = encryptedPassword;
                await sendEmail(row.email, plainPassword);
            }));

            const updatedCSV = parse(results, { fields: Object.keys(results[0]) });
            fs.writeFileSync(UPDATED_CSV_FILE, updatedCSV);  
            console.log("Passwords generated, encrypted, and emailed successfully!");
        });
};

processCSV();
