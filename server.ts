import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { gateway } from './src/backend/gateway';
import { registry } from './src/backend/registry';
import { conversationManager } from './src/backend/conversation';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parsing
app.use(express.json({ limit: '10mb' }));

// -------------------------------------------------------------
// AI Provider Gateway Routes (FIRST)
// -------------------------------------------------------------

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
  });
});

/**
 * Get all registered providers and their current statuses
 */
app.get('/api/providers', async (req, res) => {
  try {
    const list = await registry.list();
    res.json({ success: true, providers: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Toggle provider status (enable/disable)
 */
app.post('/api/providers/toggle', (req, res) => {
  const { id, enabled } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Provider "id" is required.' });
  }

  let success = false;
  if (enabled) {
    success = registry.enable(id);
  } else {
    success = registry.disable(id);
  }

  res.json({ success, id, enabled });
});

/**
 * Validate configuration state of Gemini
 */
app.get('/api/config/verify', (req, res) => {
  const isKeyPresent = !!process.env.GEMINI_API_KEY;
  res.json({
    hasKey: isKeyPresent,
    env: process.env.NODE_ENV || 'development',
    variables: {
      GEMINI_API_KEY: isKeyPresent ? 'CONFIGURED_SECURE' : 'MISSING',
    }
  });
});

/**
 * Telemetry request logs
 */
app.get('/api/gateway/logs', (req, res) => {
  res.json({ success: true, logs: gateway.getLogs() });
});

/**
 * Clear telemetry request logs
 */
app.post('/api/gateway/logs/clear', (req, res) => {
  gateway.clearLogs();
  res.json({ success: true });
});

/**
 * Non-streaming AI execution route
 */
app.post('/api/ai/chat', async (req, res) => {
  const { providerId, messages, temperature, maxTokens, safetyLevel, systemInstruction, timeout, retryCount } = req.body;

  try {
    // Validate that we have some messages
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'The "messages" field is required and must be an array.' });
    }

    const response = await gateway.generate(providerId || 'gemini', {
      messages,
      temperature: temperature !== undefined ? Number(temperature) : 0.7,
      maxTokens: maxTokens ? Number(maxTokens) : 2048,
      safetyLevel: safetyLevel || 'block_medium_above',
      streaming: false,
      systemInstruction,
      timeout: timeout ? Number(timeout) : 30000,
    });

    res.json({ success: true, response });
  } catch (err: any) {
    console.error('Non-streaming generation error:', err);
    res.status(500).json({ success: false, error: err.message || 'AI request execution failed.' });
  }
});

/**
 * Server-Sent Events (SSE) Streaming Route
 */
app.post('/api/ai/chat/stream', async (req, res) => {
  const { providerId, messages, temperature, maxTokens, safetyLevel, systemInstruction, timeout, retryCount } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ success: false, error: 'The "messages" field is required and must be an array.' });
    return;
  }

  // Configure Server-Sent Events headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Turn off buffering on nginx/proxies
  res.flushHeaders();

  let activeStream = true;

  // Listen for client aborts
  req.on('close', () => {
    activeStream = false;
  });

  try {
    const stream = await gateway.generateStream(providerId || 'gemini', {
      messages,
      temperature: temperature !== undefined ? Number(temperature) : 0.7,
      maxTokens: maxTokens ? Number(maxTokens) : 2048,
      safetyLevel: safetyLevel || 'block_medium_above',
      streaming: true,
      systemInstruction,
      timeout: timeout ? Number(timeout) : 30000,
    });

    for await (const chunk of stream) {
      if (!activeStream) break;
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    if (activeStream) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    }
    res.end();
  } catch (err: any) {
    console.error('SSE streaming error:', err);
    if (activeStream) {
      res.write(`data: ${JSON.stringify({ error: err.message || 'Stream processing failure' })}\n\n`);
    }
    res.end();
  }
});

/**
 * Conversation Archive Export
 */
app.post('/api/conversations/export', (req, res) => {
  const { conversations } = req.body;
  if (!conversations || !Array.isArray(conversations)) {
    return res.status(400).json({ success: false, error: 'Expected conversations array.' });
  }
  try {
    const archive = conversationManager.exportArchive(conversations);
    res.setHeader('Content-Disposition', 'attachment; filename="jnas-archive.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(archive);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Conversation Archive Import validation
 */
app.post('/api/conversations/import', (req, res) => {
  const { archive } = req.body;
  if (!archive) {
    return res.status(400).json({ success: false, error: 'Expected archive payload.' });
  }
  try {
    const parsed = conversationManager.importArchive(typeof archive === 'string' ? archive : JSON.stringify(archive));
    res.json({ success: true, threads: parsed });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Production Static Bundles (SECOND)
// -------------------------------------------------------------

async function initializeVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

// Start booting up
initializeVite().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully operational in ${process.env.NODE_ENV || 'development'} mode.`);
    console.log(`Ingress connected to: http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize Vite assets:', err);
});
