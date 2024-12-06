import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import path from "path";
import { initDb } from '../db';

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.call(this, bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse?.error) {
        logLine += ` - Error: ${capturedJsonResponse.error}`;
      }
      log(logLine);
    }
  });

  next();
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    // Initialize database connection
    await initDb();
    log('Database connection established');

    // Register routes after DB is initialized
    registerRoutes(app);

    const port = process.env.PORT || 3000;
    const server = createServer(app);

    if (process.env.NODE_ENV === 'development') {
      const { setupVite } = await import('./vite');
      await setupVite(app, server);
    } else {
      // Serve static files in production
      app.use(express.static(path.join(process.cwd(), 'dist', 'public')));
      
      // Serve index.html for all non-API routes
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
          res.sendFile(path.join(process.cwd(), 'dist', 'public', 'index.html'));
        }
      });
    }

    server.listen(port, () => {
      log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      log('Shutting down server...');
      server.close(() => {
        log('Server stopped');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
