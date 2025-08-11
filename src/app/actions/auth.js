'use server'

import { 
    createUser, 
    authenticateUser, 
    createTokenSession,
    getTokenSession,
    deleteTokenSession,
    validateToken,
    getUser 
} from "@/lib/db"
import { cookies } from 'next/headers'

const TOKEN_COOKIE_NAME = 'auth_token'

// Register new user
export async function registerUser(formData) {
    const { username, password, email } = Object.fromEntries(formData);
    
    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters long' };
    }

    try {
        const result = await createUser(username, password, email);
        return result;
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Registration failed. Please try again.' };
    }
}

// Login user with JWT token
export async function loginUser(formData) {
    const { username, password } = Object.fromEntries(formData);
    
    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    try {
        const authResult = await authenticateUser(username, password);
        
        if (authResult?.error) {
            return authResult;
        }

        if (authResult?.success) {
            // Create token-based session
            const { sessionId, token } = await createTokenSession(authResult.user);
            
            // Set secure cookie
            const cookieStore = cookies();
            cookieStore.set(TOKEN_COOKIE_NAME, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7200 // 2 hours
            });

            return { 
                success: true, 
                user: authResult.user,
                token: token,
                message: 'Login successful'
            };
        }

        return { error: 'Login failed' };
    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Login failed. Please try again.' };
    }
}

// Logout user
export async function logoutUser() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
        
        if (token) {
            // Decode token to get session ID
            const { decodeToken } = await import('@/lib/db');
            const payload = decodeToken(token);
            if (payload?.sessionId) {
                await deleteTokenSession(payload.sessionId);
            }
        }
        
        // Clear cookie
        cookieStore.delete(TOKEN_COOKIE_NAME);
        
        return { success: true, message: 'Logged out successfully' };
    } catch (error) {
        console.error('Logout error:', error);
        return { error: 'Logout failed' };
    }
}

// Get current user from token
export async function getCurrentUser() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
        
        if (!token) {
            return null;
        }

        const userData = await validateToken(token);
        return userData;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Validate JWT token
export async function validateUserToken(token) {
    try {
        const userData = await validateToken(token);
        return userData;
    } catch (error) {
        console.error('Error validating token:', error);
        return null;
    }
}

// Get current user by token (alias for getCurrentUser)
export async function getCurrentUserByToken() {
    return await getCurrentUser();
}

// Check if user is authenticated
export async function isAuthenticated() {
    const user = await getCurrentUser();
    return user !== null;
}

// Get user profile
export async function getUserProfile(username) {
    try {
        const user = await getUser(username);
        return user;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

// Refresh token
export async function refreshToken() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
        
        if (!token) {
            return { error: 'No active token' };
        }

        // Decode token to get session ID
        const { decodeToken } = await import('@/lib/db');
        const payload = decodeToken(token);
        if (!payload?.sessionId) {
            return { error: 'Invalid token' };
        }

        const tokenSessionData = await getTokenSession(payload.sessionId);
        if (!tokenSessionData) {
            return { error: 'Invalid session' };
        }

        // Generate new token
        const { generateToken } = await import('@/lib/db');
        const newToken = generateToken({
            userId: tokenSessionData.userData.username,
            sessionId: payload.sessionId,
            role: 'user'
        });

        // Update session with new token
        tokenSessionData.token = newToken;
        const { encryptData } = await import('@/lib/db');
        const encryptedSessionData = encryptData(JSON.stringify(tokenSessionData));
        const { redisClient } = await import('@/lib/db');
        await redisClient.setEx(`token:${payload.sessionId}`, 7200, encryptedSessionData);

        // Update cookie
        cookieStore.set(TOKEN_COOKIE_NAME, newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7200 // 2 hours
        });

        return { 
            success: true, 
            token: newToken,
            message: 'Token refreshed successfully'
        };
    } catch (error) {
        console.error('Error refreshing token:', error);
        return { error: 'Failed to refresh token' };
    }
}
