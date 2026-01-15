import { app } from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT);

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🦊 Japanese Learning API                                    ║
║   Powered by Elysia.js + Bun                                  ║
║                                                               ║
║   Server running at: http://${app.server?.hostname}:${app.server?.port}                ║
║   API Documentation: http://${app.server?.hostname}:${app.server?.port}/docs           ║
║   Health Check:      http://${app.server?.hostname}:${app.server?.port}/health         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
