import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'zh-TW', 'zh-CN'],
  defaultLocale: 'en'
});

// This matches all urls except api, _next, _vercel and the ones that contain a dot. 
// It will redirect all the others to the default locale
export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/([\\w-]+)?/users/(.+)'
  ]
};