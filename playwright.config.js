import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const browserPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
export default defineConfig({
 testDir:'./tests', testMatch:'**/*.spec.js', fullyParallel:true,
 use:{baseURL:'http://127.0.0.1:5173',launchOptions:{executablePath:browserPath,args:['--no-sandbox']}},
 projects:[{name:'mobile',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}},{name:'desktop',use:{viewport:{width:1440,height:1000}}}],
 webServer:{command:'npm run dev -- --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI},
});
