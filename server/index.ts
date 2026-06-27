import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './socketHandlers.js';
import { publicSummaries } from './roomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });

app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'Cờ Tướng Việt - Trí Tuệ Việt' }));
app.get('/api/rooms', (_req, res) => res.json(publicSummaries()));

const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));

registerSocketHandlers(io);
const port = Number(process.env.PORT || 3000);
server.listen(port, () => console.log(`Xiangqi server listening on ${port}`));
