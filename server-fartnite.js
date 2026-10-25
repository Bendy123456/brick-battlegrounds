import http from 'node:http';
import {attachPartyServer} from './server-fartnite-party.js';
import {readFile,stat} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';

const PORT=Number(process.env.PORT)||3000;
const DIST=resolve('dist');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.ico':'image/x-icon','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.wasm':'application/wasm','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url||'/','http://localhost').pathname;
 if(pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({ok:true,game:'FartNite',mode:'solo-preview'}));return}
 const clean=decodeURIComponent(pathname);
 const target=resolve(DIST,'.'+(clean==='/'?'/index.html':clean));
 if(target!==DIST&&!target.startsWith(DIST+sep)){res.writeHead(403).end('Forbidden');return}
 try{
  if(!['GET','HEAD'].includes(req.method||'')){res.writeHead(405).end();return}
  const info=await stat(target);if(!info.isFile())throw Error('Not a file');
  const bytes=await readFile(target);
  res.writeHead(200,{'Content-Type':MIME[extname(target)]||'application/octet-stream','Content-Length':bytes.length,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(404).end('Not found')}
});
attachPartyServer(server);
server.listen(PORT,'0.0.0.0',()=>console.log('FartNite solo preview available on port '+PORT));
