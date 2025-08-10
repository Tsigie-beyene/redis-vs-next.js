import { createClient } from 'redis';

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

export { client }
