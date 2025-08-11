'use server'

import { 
    createSession, 
    getSession, 
    updateSession, 
    deleteSession,
    cachePaymentData,
    getCachedPayment 
} from "@/lib/db"

// Simulate payment processing
const simulatePaymentProcessing = async (paymentData) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate payment success/failure
    const isSuccess = Math.random() > 0.1; // 90% success rate
    
    return {
        success: isSuccess,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: isSuccess ? 'completed' : 'failed',
        message: isSuccess ? 'Payment processed successfully' : 'Payment processing failed'
    };
};

// Initialize payment session
export async function initializePayment(formData) {
    const { amount, currency, description } = Object.fromEntries(formData);
    
    if (!amount || !currency) {
        return { error: 'Amount and currency are required' };
    }

    try {
        // Create payment session with sensitive data
        const paymentData = {
            amount: parseFloat(amount),
            currency: currency.toUpperCase(),
            description: description || 'Payment',
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        // Store in Redis with encryption
        const sessionId = await createSession(paymentData);
        
        return { 
            success: true, 
            sessionId,
            message: 'Payment session initialized'
        };
    } catch (error) {
        console.error('Error initializing payment:', error);
        return { error: 'Failed to initialize payment session' };
    }
}

// Process payment with card details
export async function processPayment(formData) {
    const { sessionId, cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = Object.fromEntries(formData);
    
    if (!sessionId || !cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
        return { error: 'All payment details are required' };
    }

    try {
        // Retrieve session data
        const sessionData = await getSession(sessionId);
        if (!sessionData) {
            return { error: 'Invalid or expired session' };
        }

        // Create payment object with sensitive data
        const paymentData = {
            ...sessionData,
            cardDetails: {
                last4: cardNumber.slice(-4),
                expiryMonth,
                expiryYear,
                cardholderName
            },
            status: 'processing'
        };

        // Cache payment data in Redis (encrypted)
        const paymentId = `PAY_${Date.now()}`;
        await cachePaymentData(paymentId, paymentData);

        // Process payment (simulated)
        const result = await simulatePaymentProcessing(paymentData);
        
        // Update session with result
        const updatedSessionData = {
            ...sessionData,
            paymentId,
            result,
            status: result.success ? 'completed' : 'failed'
        };
        
        await updateSession(sessionId, updatedSessionData);

        return {
            success: true,
            paymentId,
            result,
            sessionId
        };
    } catch (error) {
        console.error('Error processing payment:', error);
        return { error: 'Payment processing failed' };
    }
}

// Get payment status
export async function getPaymentStatus(sessionId) {
    try {
        const sessionData = await getSession(sessionId);
        if (!sessionData) {
            return { error: 'Invalid or expired session' };
        }

        // Return only safe data (no sensitive information)
        return {
            success: true,
            amount: sessionData.amount,
            currency: sessionData.currency,
            description: sessionData.description,
            status: sessionData.status,
            timestamp: sessionData.timestamp,
            result: sessionData.result || null
        };
    } catch (error) {
        console.error('Error getting payment status:', error);
        return { error: 'Failed to retrieve payment status' };
    }
}

// Clear session
export async function clearSession(sessionId) {
    try {
        await deleteSession(sessionId);
        return { success: true, message: 'Session cleared' };
    } catch (error) {
        console.error('Error clearing session:', error);
        return { error: 'Failed to clear session' };
    }
}
