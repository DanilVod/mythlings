import { protectedProcedure, publicProcedure, router } from '../index';
import { todoRouter } from './todo';
import { gameRouter } from './game';

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return 'OK';
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: 'This is private',
      user: ctx.session.user,
    };
  }),
  userEmail: protectedProcedure.query(({ ctx }) => {
    return {
      message: 'This is private',
      email: ctx.session.user.email,
    };
  }),
  todo: todoRouter,
  game: gameRouter,
});
export type AppRouter = typeof appRouter;
