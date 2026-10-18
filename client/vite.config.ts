import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({root:resolve(process.cwd(),'client'),publicDir:false,resolve:{alias:[{find:'/vendor/three.module.js',replacement:'three'}]},build:{outDir:resolve(process.cwd(),'dist'),emptyOutDir:true,chunkSizeWarningLimit:2900},server:{proxy:{'/ws':{target:'http://localhost:3000',ws:true}}}});
