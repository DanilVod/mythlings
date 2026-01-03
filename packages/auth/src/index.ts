import { expo } from '@better-auth/expo';
import { db } from '@mythlings/db';
import * as schema from '@mythlings/db/schema/auth';
import { env } from '@mythlings/env/server';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',

    schema: schema,
  }),
  trustedOrigins: [
    env.CORS_ORIGIN,
    'http://localhost:3002',
    'http://127.0.0.1:3002',
    'mybettertapp://',
    'exp://',
  ],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [expo()],
});
