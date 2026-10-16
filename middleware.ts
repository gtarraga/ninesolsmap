import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/routing';
 
export default createMiddleware(routing);

// This matches all urls except api, _next, _vercel and the ones that contain a dot. 
// Unprefixed pages are internally rewritten to English without a browser redirect.
export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/([\\w-]+)?/users/(.+)'
  ]
};
