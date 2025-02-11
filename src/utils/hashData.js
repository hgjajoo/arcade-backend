const bcrypt = require("bcrypt");

exports.hashData = async (data, saltRounds = 12) => {
    try { 
        const hashedData = await bcrypt.hash(data, saltRounds);
        return hashedData;
    } catch (error) {
        console.error("Error in hashData:", error.message);
        throw new Error(`Hashing failed: ${error.message}`);
    }
};

exports.verifyHashedData = async (unhashed, hashed) => {
    try {
        const match = await bcrypt.compare(unhashed, hashed);
        return match;
    } catch (error) {
        console.error("Error in verifyHashedData:", error.message);
        throw new Error(`Verification failed: ${error.message}`);
    }
};