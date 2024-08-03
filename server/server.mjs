import { WebSocketServer, WebSocket } from 'ws';
import pgk from 'pg';
const { Client } = pgk;

const wss = new WebSocketServer({ port: 8080 });

const client = new Client({
    connectionString: 'postgres://postgres:Bsgp2GlHLvfj3W%5FKHORRk2d0sl8boFB1LjISJrkHOL8@localhost:5432/zforders'
});

client.connect();

client.query('LISTEN table_update');

client.on('notification', async (_msg) => {
    try {
        // Fetch the open orders
        const res = await client.query('SELECT * FROM get_open_orders()');

        console.log('Open orders:', res.rows); // Log only the rows for clarity
        
        // Send the open orders to all clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    event: 'open_orders',
                    data: res.rows,
                }));
            }
        });
    } catch (err) {
        console.error('Error fetching open orders:', err);
    }
});

wss.on('connection', (_ws) => {
    console.log('Client connected');
});

console.log('Server started on port 8080');