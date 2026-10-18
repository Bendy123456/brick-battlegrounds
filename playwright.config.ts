import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',testMatch:'**/*.pw.ts',
 timeout:95000,retries:0,workers:1,
 use:{baseURL:'http://127.0.0.1:3000',trace:'retain-on-failure',headless:true,
   launchOptions:{args:['--enable-webgl','--use-angle=swiftshader','--ignore-gpu-blocklist']}},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
 webServer:{command:'npm start',url:'http://127.0.0.1:3000/health',reuseExistingServer:!process.env.CI,timeout:45000}
});
