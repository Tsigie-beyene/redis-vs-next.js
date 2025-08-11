import { createClient } from 'redis';
import crypto from 'crypto';

const client = createClient({
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PW,
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    }
});

client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));
client.on('ready', () => console.log('Redis Client Ready'));

// Connect to Redis if not already connected
if (!client.isOpen) {
    client.connect().catch(err => {
        console.error('Failed to connect to Redis:', err);
    });
}

// Encryption utilities for sensitive data
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-32-chars-long!!';
const ALGORITHM = 'aes-256-cbc';

export const encryptData = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

export const decryptData = (text) => {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Session management utilities
export const createSession = async (sessionData) => {
    const sessionId = crypto.randomUUID();
    const encryptedData = encryptData(JSON.stringify(sessionData));
    await client.setEx(`session:${sessionId}`, 3600, encryptedData); // 1 hour expiry
    return sessionId;
};

export const getSession = async (sessionId) => {
    const encryptedData = await client.get(`session:${sessionId}`);
    if (!encryptedData) return null;
    try {
        const decryptedData = decryptData(encryptedData);
        return JSON.parse(decryptedData);
    } catch (error) {
        console.error('Session decryption failed:', error);
        return null;
    }
};

export const updateSession = async (sessionId, sessionData) => {
    const encryptedData = encryptData(JSON.stringify(sessionData));
    await client.setEx(`session:${sessionId}`, 3600, encryptedData);
};

export const deleteSession = async (sessionId) => {
    await client.del(`session:${sessionId}`);
};

// Payment cache utilities
export const cachePaymentData = async (paymentId, paymentData) => {
    const encryptedData = encryptData(JSON.stringify(paymentData));
    await client.setEx(`payment:${paymentId}`, 1800, encryptedData); // 30 minutes expiry
};

export const getCachedPayment = async (paymentId) => {
    const encryptedData = await client.get(`payment:${paymentId}`);
    if (!encryptedData) return null;
    try {
        const decryptedData = decryptData(encryptedData);
        return JSON.parse(decryptedData);
    } catch (error) {
        console.error('Payment data decryption failed:', error);
        return null;
    }
};

export { client }
