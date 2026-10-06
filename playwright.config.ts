import { defineConfig } from '@playwright/test';

/** Deterministic production-browser checks against a local anonymous data service. */
export default defineConfig({
  testDir:'./tests',fullyParallel:false,workers:1,reporter:'list',
  use:{baseURL:'http://localhost:3100',viewport:{width:390,height:844},isMobile:true,
    hasTouch:true,headless:true,trace:'retain-on-failure'},
  webServer:{command:'node scripts/test-server.mjs',url:'http://localhost:3100/en',reuseExistingServer:false,timeout:30000},
});
