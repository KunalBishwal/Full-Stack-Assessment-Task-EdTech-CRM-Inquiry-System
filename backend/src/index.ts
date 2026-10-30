import { createApp } from './app';
import { verifyDatabaseConnection, pool } from './config/database';
import { env } from './config/env';

async function bootstrap() {
  try {
    await verifyDatabaseConnection();
    console.log('✅ Connected to Supabase PostgreSQL database');

    const app = createApp();
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 K12 Hunar Backend listening on port ${env.PORT} (${env.NODE_ENV})`);
    });

    // Keep-alive interval: pings database and external URL every 10 minutes
    const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || process.env.KEEP_ALIVE_URL;
    const keepAliveInterval = setInterval(async () => {
      try {
        await pool.query('SELECT 1');
        if (keepAliveUrl) {
          const target = `${keepAliveUrl.replace(/\/+$/, '')}/api/health`;
          await fetch(target).catch(() => {});
        }
      } catch {
        // Silently ignore ping errors
      }
    }, 10 * 60 * 1000);
    keepAliveInterval.unref();

    const shutdown = async (signal: string) => {
      clearInterval(keepAliveInterval);
      console.log(`\nReceived ${signal}. Closing HTTP server and PostgreSQL pool...`);
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Failed to start K12 Hunar Backend:', error);
    process.exit(1);
  }
}

void bootstrap();
