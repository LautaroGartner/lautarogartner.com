from pathlib import Path
import json, os, subprocess, sys, re
root=Path.cwd()
s=(root/'site/.preview-render.mjs').read_text()
s=s.replace('readFileSync(path.join(PACKAGE_ROOT, "package.json"), "utf8")',json.dumps((root/'vendor/paideia-framework/package.json').read_text()))
for expression,file in [('fs2.readFileSync(new URL("../content/portfolio/copy.json", import.meta.url), "utf8")','content/portfolio/copy.json'),('fs2.readFileSync(new URL("./motion.css", import.meta.url), "utf8")','site/motion.css'),('fs.readFileSync(new URL("../public/route-boot.js", import.meta.url), "utf8")','public/route-boot.js'),('fs3.readFileSync("content/site.json")','content/site.json')]:
 s=s.replace(expression,json.dumps((root/file).read_text()))
s=re.sub(r'(?:fs\d*)\.readFileSync\(new URL\("([^"]+)", import\.meta\.url\), "utf8"\)',lambda match:json.dumps((root/'site'/match[1]).resolve().read_text()),s)
start=s.index('var read = (dir) =>');end=s.index('\nvar site =',start)
inputs={d:[json.loads(p.read_text()) for p in (root/d).glob('*.json')] for d in ['content/posts','content/pages']}
s=s[:start]+'var read = dir => ('+json.dumps(inputs)+')[dir];'+s[end:]
start=s.index('var write = (file, value) =>');end=s.index('\nvar read =',start)
s=s[:start]+'var outputs = {}; var write = (file,value) => outputs[file] = value;'+s[end:]
for file in ['portfolio.js','motion-shell.js','route-boot.js']:s=s.replace('fs3.readFileSync("public/'+file+'")',json.dumps((root/'public'/file).read_text()))
s=s[:s.index('console.log(`Refreshed')]+'process.stdout.write(JSON.stringify(outputs));\n'
script=Path('/tmp/portfolio-current-render-input.mjs');script.write_text(s)
result=subprocess.run(['node',str(script)],capture_output=True,text=True,check=True)
items=json.loads(result.stdout)
version=sys.argv[1] if len(sys.argv)>1 else 'ready-r2'
release=root/('preview-releases/'+version);release.mkdir(parents=True,exist_ok=True)
previous=(root/'.preview-current').resolve()
# Share immutable non-generated files, with individual work image links rather than case-directory links.
for directory,subdirectories,files in os.walk(previous,followlinks=True):
 for name in files:
  source=Path(directory)/name;relative=source.relative_to(previous)
  if str(relative) in items:continue
  destination=release/relative;destination.parent.mkdir(parents=True,exist_ok=True)
  if not destination.exists():destination.symlink_to(source)
for file,value in items.items():
 if file.endswith('.html'):value=value.replace('src="/portfolio.js"','src="/portfolio.js?v='+version+'"').replace('src="/motion-shell.js"','src="/motion-shell.js?v='+version+'"')
 destination=release/file;destination.parent.mkdir(parents=True,exist_ok=True);destination.write_text(value)
next_link=root/'.preview-next'
if next_link.is_symlink():next_link.unlink()
next_link.symlink_to(release.relative_to(root));os.replace(next_link,root/'.preview-current')
print(json.dumps({'release':str(release),'generated':len(items)}))
