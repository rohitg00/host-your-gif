import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";

export async function setupVite(app: Express, server: Server) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const { createServer: createViteServer } = await import('vite');
  const viteConfig = await import('../vite.config');

  const vite = await createViteServer({
    ...viteConfig.default,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith('/api')) {
      next();
      return;
    }

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );
      let template = fs.readFileSync(clientTemplate, "utf-8");
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      if (e instanceof Error) {
        vite.ssrFixStacktrace(e);
      }
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const publicDir = path.resolve(__dirname, '..', 'dist', 'public');
  app.use(express.static(publicDir));

  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}
