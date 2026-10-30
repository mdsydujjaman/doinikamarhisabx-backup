import 'dotenv/config';
import http from 'node:http';
import { URL } from 'node:url';
import {
  connectDatabase,
  closeDatabase,
  getDatabaseStatus
} from './database.js';

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 3001);
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const server = http.createServer((req, res) => {
  const requestId = crypto.randomUUID();

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Request-ID', requestId);

  let pathname;

  try {
    pathname = new URL(
      req.url || '/',
      `http://${req.headers.host || 'localhost'}`
    ).pathname;
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      ok: false,
      error: {
        code: 'INVALID_URL',
        message: 'অনুরোধের ঠিকানা সঠিক নয়।'
      },
      requestId
    }));
  }

  if (req.method === 'GET' && pathname === '/api/v1/health/live') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      ok: true,
      service: 'দৈনিক আমার হিসাবX API',
      status: 'alive',
      environment: NODE_ENV,
      requestId
    }));
  }

  if (req.method === 'GET' && pathname === '/api/v1/health/ready') {
    const db = getDatabaseStatus();
    const statusCode = db.ready ? 200 : 503;

    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8'
    });

    return res.end(JSON.stringify({
      ok: db.ready,
      status: db.state,
      message: db.ready
        ? 'ডেটাবেজ সংযোগ যাচাই সফল হয়েছে।'
        : 'ডেটাবেজ সংযোগ এখনো প্রস্তুত নয়।',
      requestId
    }));
  }

  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({
    ok: false,
    error: {
      code: 'NOT_FOUND',
      message: 'এই API ঠিকানাটি এখনো তৈরি হয়নি।'
    },
    requestId
  }));
});

server.listen(PORT, HOST, () => {
  console.log(`HisabX API listening at http://${HOST}:${PORT}`);
  console.log(`Live check: http://${HOST}:${PORT}/api/v1/health/live`);
  void connectDatabase();
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal}: shutting down API server...`);

  server.close(async (error) => {
    try {
      await closeDatabase();
    } catch (dbError) {
      console.error('Database shutdown error:', dbError.message);
    }

    if (error) {
      console.error('Server shutdown error:', error.message);
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
