# 🔐 Redis Payment Gateway Demo

A comprehensive demonstration of secure payment processing using Redis caching and encrypted session management. This demo showcases how to handle sensitive payment information securely without exposing data in browser console or URLs.

## 🎯 Demo Purpose

This application demonstrates:
- **Secure session management** with Redis
- **Payment processing simulation** with realistic workflows
- **Sensitive data encryption** using AES-256
- **No local storage usage** for sensitive information
- **Server-side session handling** to prevent client-side exposure

## 🚀 Features

### Security Features
- ✅ **AES-256 Encryption** - All sensitive data encrypted before Redis storage
- ✅ **No Local Storage** - Zero sensitive data stored in browser
- ✅ **Session Management** - Secure server-side session handling
- ✅ **Auto Expiry** - Automatic cleanup of expired sessions
- ✅ **Encrypted Caching** - Payment data cached securely in Redis

### Payment Processing
- 💳 **Two-step payment flow** - Amount entry → Card details
- 🔄 **Session persistence** - Payment state maintained across steps
- 📊 **Real-time status** - Payment status retrieval from Redis
- 🎲 **Simulated processing** - Realistic payment success/failure simulation

### Redis Integration
- 🔐 **Encrypted storage** - All data encrypted before Redis storage
- ⏰ **TTL management** - Automatic expiration for sessions and payments
- 📈 **Real-time stats** - Live Redis key monitoring
- 🗑️ **Session cleanup** - Manual and automatic session deletion

## 🛠️ Technology Stack

- **Frontend**: Next.js 13 with App Router, React 18
- **Styling**: Tailwind CSS
- **Database**: Redis v4.7.1
- **Encryption**: Node.js crypto module (AES-256-CBC)
- **Server Actions**: Next.js server actions for secure form handling

## 📋 Prerequisites

- Node.js 18+ 
- Redis server running locally or remotely
- npm or yarn package manager

## ⚙️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USER=your_redis_username
REDIS_PW=your_redis_password

# Encryption Key (32 characters recommended)
ENCRYPTION_KEY=your-secret-key-32-chars-long!!
```

### 3. Start Redis Server
Make sure Redis is running on your system:

```bash
# Local Redis
redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:latest
```

### 4. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the demo.

## 🎮 How to Use the Demo

### 1. Dashboard Overview
- View Redis statistics and active sessions
- See security features and caching information
- Monitor real-time payment sessions

### 2. Payment Processing
1. **Start Payment** - Click "Start New Payment"
2. **Enter Amount** - Specify payment amount and currency
3. **Card Details** - Enter card information (simulated)
4. **Processing** - Watch Redis caching in action
5. **Status Check** - View payment results from Redis

### 3. Session Management
- **Session Creation** - Automatic on payment initiation
- **Data Encryption** - All sensitive data encrypted
- **Status Retrieval** - Secure session data access
- **Session Cleanup** - Manual or automatic expiration

## 🔒 Security Implementation

### Data Flow
1. **Client Input** → Form submission with sensitive data
2. **Server Processing** → Data encrypted using AES-256
3. **Redis Storage** → Encrypted data stored with TTL
4. **Session Management** → Secure session ID generation
5. **Data Retrieval** → Decryption on server-side only

### Encryption Details
- **Algorithm**: AES-256-CBC
- **Key Management**: Environment variable based
- **IV Generation**: Random IV for each encryption
- **Data Format**: IV:EncryptedData (hex encoded)

### Session Security
- **Session ID**: Cryptographically secure UUID
- **TTL**: 1 hour for sessions, 30 minutes for payments
- **Access Control**: Server-side only access
- **Cleanup**: Automatic expiration and manual deletion

## 📊 Redis Data Structure

### Session Storage
```
session:{uuid} = encrypted_session_data (TTL: 3600s)
```

### Payment Cache
```
payment:{paymentId} = encrypted_payment_data (TTL: 1800s)
```

### Key Patterns
- `session:*` - Active payment sessions
- `payment:*` - Cached payment data

## 🧪 Demo Scenarios

### Scenario 1: Successful Payment
1. Enter payment amount (e.g., $99.99 USD)
2. Provide card details
3. Watch processing simulation
4. View successful result from Redis

### Scenario 2: Failed Payment
1. Follow same process
2. Experience 10% failure rate simulation
3. View failure handling and error display

### Scenario 3: Session Management
1. Start multiple payments
2. Monitor Redis key growth
3. Clear sessions manually
4. Observe automatic cleanup

## 🔍 Monitoring and Debugging

### Redis CLI Commands
```bash
# Connect to Redis
redis-cli

# View all session keys
KEYS session:*

# View all payment keys
KEYS payment:*

# Check key TTL
TTL session:{sessionId}

# Monitor Redis operations
MONITOR
```

### Application Logs
- Redis connection status
- Session creation/deletion
- Payment processing events
- Encryption/decryption errors

## 🚨 Security Best Practices Demonstrated

1. **Never store sensitive data in browser**
2. **Always encrypt data before storage**
3. **Use secure session management**
4. **Implement proper TTL for cached data**
5. **Server-side only data processing**
6. **Secure key management**
7. **Regular session cleanup**

## 📈 Performance Benefits

- **Fast Data Access** - Redis in-memory caching
- **Reduced Database Load** - Session data in Redis
- **Scalable Architecture** - Horizontal scaling support
- **Real-time Processing** - Immediate data availability

## 🤝 Contributing

This is a demo application for educational purposes. Feel free to:
- Experiment with different encryption methods
- Add more payment scenarios
- Implement additional security features
- Extend Redis functionality

## 📄 License

This project is for educational and demonstration purposes.

---

**Note**: This is a demonstration application. For production use, implement additional security measures, proper error handling, and compliance with payment industry standards (PCI DSS).
