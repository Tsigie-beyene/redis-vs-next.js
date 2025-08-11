# 🔐 Redis Payment Gateway Demo

A comprehensive demonstration of secure payment processing using Redis caching, encrypted session management, and JWT token-based authentication. This demo showcases how to handle sensitive payment information securely without exposing data in browser console or URLs.

## 🎯 Demo Purpose

This application demonstrates:
- **Secure session management** with Redis
- **JWT token-based authentication** with Redis backing
- **Payment processing simulation** with realistic workflows
- **Sensitive data encryption** using AES-256
- **No local storage usage** for sensitive information
- **Server-side session handling** to prevent client-side exposure

## 🚀 Features

### Security Features
- ✅ **AES-256 Encryption** - All sensitive data encrypted before Redis storage
- ✅ **JWT Token Authentication** - Secure token-based authentication
- ✅ **No Local Storage** - Zero sensitive data stored in browser
- ✅ **Session Management** - Secure server-side session handling
- ✅ **Auto Expiry** - Automatic cleanup of expired sessions
- ✅ **Encrypted Caching** - Payment data cached securely in Redis

### Authentication Features
- 🔑 **JWT Token Authentication** - Secure token-based authentication only
- 🔄 **Token Refresh** - Automatic token renewal functionality
- 🛡️ **Token Validation** - Server-side token verification with Redis backing
- 📊 **Token Management** - Visual token inspection and management
- 🔐 **Redis-Backed Tokens** - Token sessions stored and validated in Redis

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
- **Authentication**: JWT (jsonwebtoken)
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

# JWT Secret Key (very long and secure)
JWT_SECRET=your-jwt-secret-key-very-long-and-secure!!
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

### 1. Authentication Flow
1. **Register** - Create a new account with encrypted storage
2. **Login** - Authenticate with JWT token generation
3. **Token Management** - View and manage your JWT tokens
4. **Dashboard** - Access the main application

### 2. Payment Processing
1. **Start Payment** - Click "Start New Payment"
2. **Enter Amount** - Specify payment amount and currency
3. **Card Details** - Enter card information (simulated)
4. **Processing** - Watch Redis caching in action
5. **Status Check** - View payment results from Redis

### 3. Token Management
- **Token Inspection** - View JWT header and payload
- **Token Refresh** - Renew expired tokens
- **Session Monitoring** - Track active sessions
- **Security Features** - Understand token security

## 🔒 Security Implementation

### Data Flow
1. **Client Input** → Form submission with sensitive data
2. **Server Processing** → Data encrypted using AES-256
3. **Redis Storage** → Encrypted data stored with TTL
4. **Session Management** → Secure session ID generation
5. **Token Generation** → JWT token creation and validation
6. **Data Retrieval** → Decryption on server-side only

### JWT Token Security
- **Algorithm**: HS256 (HMAC SHA-256)
- **Expiration**: 2 hours automatic expiry
- **Issuer/Audience**: Validated for security
- **Redis Backing**: Token sessions stored in Redis
- **HTTP-Only Cookies**: Secure token storage

### Encryption Details
- **Algorithm**: AES-256-CBC
- **Key Management**: Environment variable based
- **IV Generation**: Random IV for each encryption
- **Data Format**: IV:EncryptedData (hex encoded)

### Session Security
- **Session ID**: Cryptographically secure UUID
- **TTL**: 2 hours for auth sessions, 1 hour for payments
- **Access Control**: Server-side only access
- **Cleanup**: Automatic expiration and manual deletion

## 📊 Redis Data Structure

### User Storage
```
user:{username} = encrypted_user_data
```

### JWT Token Sessions
```
token:{sessionId} = encrypted_token_session_data (TTL: 7200s)
```

### Payment Sessions
```
session:{uuid} = encrypted_session_data (TTL: 3600s)
payment:{paymentId} = encrypted_payment_data (TTL: 1800s)
```

### Key Patterns
- `user:*` - Registered users
- `token:*` - JWT token sessions
- `session:*` - Active payment sessions
- `payment:*` - Cached payment data

## 🧪 Demo Scenarios

### Scenario 1: User Registration & JWT Authentication
1. Register new account with username/password
2. Login with credentials (JWT token generated)
3. View JWT token details and management
4. Refresh token functionality

### Scenario 2: Successful Payment
1. Enter payment amount (e.g., $99.99 USD)
2. Provide card details
3. Watch processing simulation
4. View successful result from Redis

### Scenario 3: Token Management
1. Access token management page
2. View JWT header and payload
3. Check token expiration times
4. Refresh token if needed

### Scenario 4: Session Management
1. Start multiple payments
2. Monitor Redis key growth
3. Clear sessions manually
4. Observe automatic cleanup

## 🔍 Monitoring and Debugging

### Redis CLI Commands
```bash
# Connect to Redis
redis-cli

# View all user keys
KEYS user:*

# View all token sessions
KEYS token:*

# View all payment keys
KEYS payment:*

# Check key TTL
TTL token:{sessionId}

# Monitor Redis operations
MONITOR
```

### Application Logs
- Redis connection status
- JWT token generation/validation
- Session creation/deletion
- Payment processing events
- Encryption/decryption errors

## 🚨 Security Best Practices Demonstrated

1. **Never store sensitive data in browser**
2. **Always encrypt data before storage**
3. **Use JWT tokens for authentication**
4. **Implement proper TTL for cached data**
5. **Server-side only data processing**
6. **Secure key management**
7. **Regular session cleanup**
8. **Token validation and refresh**

## 📈 Performance Benefits

- **Fast Data Access** - Redis in-memory caching
- **Reduced Database Load** - Session data in Redis
- **Scalable Architecture** - Horizontal scaling support
- **Real-time Processing** - Immediate data availability
- **Token Efficiency** - Stateless JWT with Redis backing

## 🤝 Contributing

This is a demo application for educational purposes. Feel free to:
- Experiment with different encryption methods
- Add more payment scenarios
- Implement additional security features
- Extend Redis functionality
- Enhance JWT token features

## 📄 License

This project is for educational and demonstration purposes.

---

**Note**: This is a demonstration application. For production use, implement additional security measures, proper error handling, and compliance with payment industry standards (PCI DSS).
