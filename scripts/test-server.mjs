import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const markers = JSON.parse(await readFile(new URL('../tests/fixtures/markers.json',import.meta.url),'utf8'));
let mode = 'ok';
const upstream = http.createServer((req,res)=>{
  if (req.url?.startsWith('/control/')) { mode = req.url.slice('/control/'.length);res.end('ok');return; }
  if (!req.url?.startsWith('/rest/v1/markers_chinese') || req.headers.cookie ||
    req.headers.apikey !== 'test-anonymous-key' || req.headers.authorization !== 'Bearer test-anonymous-key') {
    res.writeHead(403);res.end('Unexpected credentials or path');return;
  }
  res.writeHead(mode === 'error' ? 500 : 200,{'Content-Type':'application/json'});
  res.end(JSON.stringify(mode === 'invalid' ? [{id:'invalid',x:'bad'}] : mode === 'error' ? {error:'test failure'} : markers));
});
upstream.listen(3101,'127.0.0.1');
const child = spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3100'],{
  stdio:'inherit',env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:3101',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:'test-anonymous-key',NEXT_PUBLIC_POSTHOG_KEY:'',NEXT_PUBLIC_ADSENSE_PUBLISHER_ID:''},
});
function stop() { child.kill('SIGTERM');upstream.close(); }
process.on('SIGTERM',stop);process.on('SIGINT',stop);
child.on('exit',code=>{upstream.close();process.exitCode=code ?? 0;});
