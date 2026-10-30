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

    const shutdown = async (signal: string) => {
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
