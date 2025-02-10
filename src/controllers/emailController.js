const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const User = require("../models/userModel");
const bcrypt = require('bcryptjs');
const axios = require('axios');

// Storage configuration remains the same
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and JSON files are allowed.'));
    }
  }
});

const generatePassword = (length = 12) => {
    const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercase = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "123456789";
    const symbols = "!@#$%^&*";
    
    const all = uppercase + lowercase + numbers + symbols;
    let password = "";
    
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for(let i = password.length; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

const sendEmail = async (toEmail, password) => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
    }

    const url = "https://api.resend.com/emails";
    const headers = {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
    };

    const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Welcome to FTC Arcade</h2>
        <p>Hello,</p>
        <p>Your account has been created successfully. Here are your login credentials:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${toEmail}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p style="color: #ff0000;">Important: Keep these credentials safe and do not share them with anyone.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply.</p>
    </div>
`;

    const data = {
        from: "FTC Arcade <arcade@ftc.viskkman.com>",
        to: [toEmail],
        subject: "Your FTC Arcade Account Credentials",
        html: htmlTemplate
    };

    try {
        const response = await axios.post(url, data, { headers });
        console.log(`Email sent successfully to ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`Email sending failed for ${toEmail}:`, 
            error.response ? error.response.data : error.message);
        throw new Error(`Failed to send email to ${toEmail}`);
    }
};

const processCsvFile = async (filePath) => {
    return new Promise((resolve, reject) => {
        const users = [];
        const errors = [];
        
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(row.email)) {
                    errors.push(`Invalid email format for: ${row.email}`);
                    return;
                }
                
                if (!row.email || !row.fullname || !row.regNo) {
                    errors.push(`Missing required fields for row: ${JSON.stringify(row)}`);
                    return;
                }
                
                users.push(row);
            })
            .on('end', () => {
                if (errors.length > 0) {
                    reject(new Error(`Validation errors: ${errors.join(', ')}`));
                } else {
                    resolve(users);
                }
            })
            .on('error', (error) => reject(error));
    });
};

exports.bulkSendEmailsWithFile = async (req, res) => {
    let filePath = null;
    try {
        if (!req.file) {
            return res.status(400).json({ 
                status: "fail", 
                message: "No file uploaded" 
            });
        }

        filePath = req.file.path;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        let users;

        try {
            if (fileExtension === '.json') {
                const fileData = fs.readFileSync(filePath, 'utf8');
                users = JSON.parse(fileData);
            } else if (fileExtension === '.csv') {
                users = await processCsvFile(filePath);
            } else {
                throw new Error('Unsupported file format');
            }
        } catch (parseError) {
            throw new Error(`File parsing error: ${parseError.message}`);
        }

        if (!users || users.length === 0) {
            throw new Error('No valid user data found in file');
        }

        const results = {
            successful: [],
            skipped: [],  // New array for tracking skipped users
            failed: []
        };

        // Process users
        for (const userData of users) {
            try {
                const { email, fullname, regNo } = userData;
                
                // Check if user already exists
                const existingUser = await User.findOne({ 
                    $or: [{ email }, { regNo }] 
                });

                if (existingUser) {
                    // Skip existing users and add to skipped list
                    results.skipped.push({
                        email,
                        reason: `User already exists with email ${email} or registration number ${regNo}`
                    });
                    continue;
                }

                // Only create new user and send email if user doesn't exist
                const plainPassword = generatePassword();
                const hashedPassword = await bcrypt.hash(plainPassword, 12);

                const newUser = new User({
                    email,
                    fullname,
                    regNo,
                    password: hashedPassword
                });

                await newUser.save();
                await sendEmail(email, plainPassword);
                
                results.successful.push(email);

            } catch (error) {
                results.failed.push({
                    email: userData.email,
                    reason: error.message
                });
            }
        }

        // Clean up uploaded file
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Send response with skipped users included
        res.status(200).json({
            status: "success",
            message: "User processing completed",
            data: {
                successful: results.successful,
                skipped: results.skipped,    // Include skipped users in response
                failed: results.failed,
                totalProcessed: users.length,
                successCount: results.successful.length,
                skippedCount: results.skipped.length,  // Add skipped count
                failureCount: results.failed.length
            }
        });

    } catch (error) {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        console.error('Bulk email processing error:', error);
        res.status(500).json({ 
            status: "error", 
            message: error.message 
        });
    }
};

exports.upload = upload;