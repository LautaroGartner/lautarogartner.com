import fs from 'node:fs';
import path from 'node:path';
const dist=path.join(process.cwd(),'dist');
fs.cpSync(path.join(process.cwd(),'public'),dist,{recursive:true});
function htmlFiles(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?htmlFiles(p):e.name.endsWith('.html')?[p]:[];});}
let count=0;
for(const file of htmlFiles(dist)){if(file.includes(`${path.sep}admin${path.sep}`))continue;const html=fs.readFileSync(file,'utf8');const clean=html.replace(/<script[^>]*src=["']\/admin-edit\.js["'][^>]*><\/script>\s*/g,'');if(clean!==html){fs.writeFileSync(file,clean);count++;}}
console.log(`[admin] copied assets; removed contextual admin bootstrap from ${count} public pages`);
