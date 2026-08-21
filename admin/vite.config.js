import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import login from "../api/login.mjs";
import logout from "../api/logout.mjs";
import posts from "../api/posts.mjs";
import preview from "../api/preview.mjs";
import session from "../api/session.mjs";
import settings from "../api/settings.mjs";

function localApi() {
  return {
    name: "local-admin-api",
    configureServer(server) {
      process.env.ADMIN_PASSWORD ||= "local-paideia";
      process.env.SESSION_SECRET ||= "local-development-secret-32-characters";
      server.middlewares.use("/api", async (req, res, next) => {
        const route = req.url?.split("?")[0];
        if (!["/login", "/logout", "/posts", "/preview", "/session", "/settings"].includes(route)) return next();
        let raw = "";
        for await (const chunk of req) raw += chunk;
        req.body = raw ? JSON.parse(raw) : {};
        const response = {
          setHeader: (name, value) => res.setHeader(name, value),
          status(code) { res.statusCode = code; return response; },
          json(value) { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(value)); return response; },
          send(value) { res.end(value); return response; },
        };
        const handler = { "/login": login, "/logout": logout, "/posts": posts, "/preview": preview, "/session": session, "/settings": settings }[route];
        await handler(req, response);
      });
    },
  };
}

export default defineConfig({
  root: "admin",
  base: "/admin/",
  plugins: [react(), localApi()],
  build: {
    outDir: "../dist/admin",
    emptyOutDir: false,
  },
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:3000" },
  },
});
