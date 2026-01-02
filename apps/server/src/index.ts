import { trpcServer } from '@hono/trpc-server';
import { createContext } from '@mythlings/api/context';
import { appRouter } from '@mythlings/api/routers/index';
import { auth } from '@mythlings/auth';
import { env } from '@mythlings/env/server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use(logger());
app.use(
  '/*',
  cors({
    origin: (origin) => {
      if (!origin) return '*';

      if (origin === env.CORS_ORIGIN) return origin;

      // Allow native app schemes
      const allowedOrigins = [
        env.CORS_ORIGIN,
        'mybettertapp://',
        'exp://',
        'http://localhost:*',
        'http://127.0.0.1:*',
        'http://192.168.0.110:*',
      ];

      // Check if origin matches any allowed pattern
      if (
        allowedOrigins.some((allowed) => {
          if (allowed.includes('*')) {
            const regex = new RegExp(allowed.replace('*', '.*'));
            return regex.test(origin);
          }
          return origin === allowed;
        })
      ) {
        return origin;
      }

      return null;
    },
    allowMethods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    credentials: true,
    maxAge: 86400,
  }),
);

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

app.get('/', (c) => {
  return c.text('OK');
});

export default app;
