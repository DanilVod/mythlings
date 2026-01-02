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
    origin: (origin) =>
      origin ? (origin === env.CORS_ORIGIN ? origin : null) : '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
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
