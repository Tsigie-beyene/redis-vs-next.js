import { createClient } from 'redis';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Singleton pattern for Redis client
let client = null;

const getRedisClient = () => {
    if (!client) {
        client = createClient({
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
        client.on('end', () => console.log('Redis Client Disconnected'));
        if (!client.isOpen) { client.connect().catch(err => { console.error('Failed to connect to Redis:', err); }); }
    }
    return client;
};

// Encryption utilities for sensitive data
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-32-chars-long!!';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-very-long-and-secure!!';
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

// JWT Token utilities
export const generateToken = (payload, expiresIn = '2h') => {
    return jwt.sign(payload, JWT_SECRET, { 
        expiresIn,
        issuer: 'redis-payment-gateway',
        audience: 'payment-users'
    });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET, {
            issuer: 'redis-payment-gateway',
            audience: 'payment-users'
        });
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
};

export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('Token decode failed:', error.message);
        return null;
    }
};

// Password hashing utilities
export const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password + ENCRYPTION_KEY).digest('hex');
};

export const verifyPassword = (password, hashedPassword) => {
    return hashPassword(password) === hashedPassword;
};

// User management utilities
export const createUser = async (username, password, email = '') => {
    try {
        const redisClient = getRedisClient();
        
        // Check if user already exists
        const existingUser = await redisClient.get(`user:${username}`);
        if (existingUser) {
            return { error: 'Username already exists' };
        }

        const hashedPassword = hashPassword(password);
        const userData = {
            username,
            email,
            hashedPassword,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        const encryptedUserData = encryptData(JSON.stringify(userData));
        await redisClient.set(`user:${username}`, encryptedUserData);
        
        return { success: true, message: 'User created successfully' };
    } catch (error) {
        console.error('Error creating user:', error);
        return { error: 'Failed to create user' };
    }
};

export const authenticateUser = async (username, password) => {
    try {
        const redisClient = getRedisClient();
        const encryptedUserData = await redisClient.get(`user:${username}`);
        if (!encryptedUserData) {
            return { error: 'Invalid username or password' };
        }

        const userData = JSON.parse(decryptData(encryptedUserData));
        
        if (!verifyPassword(password, userData.hashedPassword)) {
            return { error: 'Invalid username or password' };
        }

        // Update last login
        userData.lastLogin = new Date().toISOString();
        const updatedEncryptedData = encryptData(JSON.stringify(userData));
        await redisClient.set(`user:${username}`, updatedEncryptedData);

        return { 
            success: true, 
            user: {
                username: userData.username,
                email: userData.email,
                createdAt: userData.createdAt,
                lastLogin: userData.lastLogin
            }
        };
    } catch (error) {
        console.error('Error authenticating user:', error);
        return { error: 'Authentication failed' };
    }
};

export const getUser = async (username) => {
    try {
        const redisClient = getRedisClient();
        const encryptedUserData = await redisClient.get(`user:${username}`);
        if (!encryptedUserData) {
            return null;
        }

        const userData = JSON.parse(decryptData(encryptedUserData));
        return {
            username: userData.username,
            email: userData.email,
            createdAt: userData.createdAt,
            lastLogin: userData.lastLogin
        };
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

// JWT Token-based authentication utilities
export const createTokenSession = async (userData) => {
    const sessionId = crypto.randomUUID();
    const token = generateToken({
        userId: userData.username,
        sessionId: sessionId,
        role: 'user'
    });

    const sessionData = {
        userId: userData.username,
        userData: userData,
        token: token,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
    };

    const redisClient = getRedisClient();
    const encryptedSessionData = encryptData(JSON.stringify(sessionData));
    await redisClient.setEx(`token:${sessionId}`, 7200, encryptedSessionData); // 2 hours expiry
    
    return { sessionId, token };
};

export const getTokenSession = async (sessionId) => {
    try {
        const redisClient = getRedisClient();
        const encryptedSessionData = await redisClient.get(`token:${sessionId}`);
        if (!encryptedSessionData) return null;

        const sessionData = JSON.parse(decryptData(encryptedSessionData));
        
        // Verify token is still valid
        const tokenPayload = verifyToken(sessionData.token);
        if (!tokenPayload) {
            // Token expired, remove session
            await redisClient.del(`token:${sessionId}`);
            return null;
        }
        
        // Update last activity
        sessionData.lastActivity = new Date().toISOString();
        const updatedEncryptedData = encryptData(JSON.stringify(sessionData));
        await redisClient.setEx(`token:${sessionId}`, 7200, updatedEncryptedData);

        return sessionData;
    } catch (error) {
        console.error('Error getting token session:', error);
        return null;
    }
};

export const deleteTokenSession = async (sessionId) => {
    const redisClient = getRedisClient();
    await redisClient.del(`token:${sessionId}`);
};

export const validateToken = async (token) => {
    try {
        const payload = verifyToken(token);
        if (!payload) return null;

        const sessionData = await getTokenSession(payload.sessionId);
        if (!sessionData) return null;

        return sessionData.userData;
    } catch (error) {
        console.error('Error validating token:', error);
        return null;
    }
};

// Session management utilities (for payment sessions only)
export const createSession = async (sessionData) => {
    const sessionId = crypto.randomUUID();
    const encryptedData = encryptData(JSON.stringify(sessionData));
    const redisClient = getRedisClient();
    await redisClient.setEx(`session:${sessionId}`, 3600, encryptedData); // 1 hour expiry
    return sessionId;
};

export const getSession = async (sessionId) => {
    const redisClient = getRedisClient();
    const encryptedData = await redisClient.get(`session:${sessionId}`);
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
    const redisClient = getRedisClient();
    await redisClient.setEx(`session:${sessionId}`, 3600, encryptedData);
};

export const deleteSession = async (sessionId) => {
    const redisClient = getRedisClient();
    await redisClient.del(`session:${sessionId}`);
};

// Payment cache utilities
export const cachePaymentData = async (paymentId, paymentData) => {
    const encryptedData = encryptData(JSON.stringify(paymentData));
    const redisClient = getRedisClient();
    await redisClient.setEx(`payment:${paymentId}`, 1800, encryptedData); // 30 minutes expiry
};

export const getCachedPayment = async (paymentId) => {
    const redisClient = getRedisClient();
    const encryptedData = await redisClient.get(`payment:${paymentId}`);
    if (!encryptedData) return null;
    try {
        const decryptedData = decryptData(encryptedData);
        return JSON.parse(decryptedData);
    } catch (error) {
        console.error('Payment data decryption failed:', error);
        return null;
    }
};

// Export the client getter for backward compatibility
export const redisClient = getRedisClient();
