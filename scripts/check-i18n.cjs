const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const esbuild = require('esbuild');
const root = path.join(__dirname, '..');
const dict = require('../src/i18n/zh-cn.json');
const uiDict = require('../src/i18n/ui-zh-cn.json');
let locale = 'zh-cn';
const compiled = esbuild.buildSync({ entryPoints:[path.join(root,'src/i18n/index.ts')],bundle:true,platform:'node',format:'cjs',external:['obsidian'],write:false }).outputFiles[0].text;
const moduleObj = {exports:{}};
vm.runInNewContext(compiled,{module:moduleObj,exports:moduleObj.exports,require(name){if(name==='obsidian')return{moment:{locale:()=>locale}};throw Error(name);}});
const {t,ui,initI18n,templateName,colorName} = moduleObj.exports;
// Eager initialization matters: command objects are constructed before Plugin.onload.
assert.equal(t('command.copy-link-to-selection','Copy link to selection or annotation'),'复制指向选择或注释的链接');
assert.equal(ui('Title & page'),'标题与页码');
assert.equal(ui('Page'),'页码');
assert.equal(ui('Text'),'文本');
assert.equal(ui('Emoji'),'表情符号');
assert.equal(ui('None'),'无');
assert.equal(ui('Copy link with format "{0}"',{0:'$&'}),'按“$&”格式复制链接');
assert.equal(t('menu.copy-link-to-page-number','Copy link to page {number}',{number:7}),'复制指向第 7 页的链接');
const defaults=[{name:'Title & page',template:'{{file.basename}}, p.{{pageLabel}}'}];
const saved={...defaults[0]};const before=JSON.stringify(saved);
assert.equal(templateName(saved,defaults),'标题与页码');
assert.equal(JSON.stringify(saved),before);
assert.equal(templateName({name:'Title & page',template:'MY CUSTOM TEMPLATE'},defaults),'Title & page');
assert.equal(templateName({name:'Personal format',template:'{{text}}'},defaults),'Personal format');
assert.equal(colorName('note',{note:'#086ddd'},{Note:'#086ddd'}),'笔记');
assert.equal(colorName('note',{note:'#123456'},{Note:'#086ddd'}),'note');
assert.equal(colorName('My color',{'My color':'#123456'},{Note:'#086ddd'}),'My color');
locale='en';initI18n();assert.equal(ui('Title & page'),'Title & page');
assert.equal(t('menu.copy-link-to-page-number','Copy link to page {number}',{number:7}),'Copy link to page 7');
locale='zh-cn';initI18n();

// Exercise the exact compatibility method from main.ts, not a reimplementation.
const main=ts.createSourceFile('main.ts',fs.readFileSync(path.join(root,'src/main.ts'),'utf8'),ts.ScriptTarget.Latest,true);
let hoverMethod;
function find(n){if(ts.isMethodDeclaration(n)&&n.name.getText(main)==='requireModKeyForLinkHover')hoverMethod=n.getText(main);ts.forEachChild(n,find);}find(main);
assert.ok(hoverMethod);
const probe=ts.transpileModule('class Probe {'+hoverMethod+'}; module.exports=Probe;',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const probeModule={exports:{}};vm.runInNewContext(probe,{module:probeModule});
const cases=[
 [{options:{'pdf-plus':false},overrides:{'pdf-plus':true}},true,false],
 [{options:{'pdf-plus':true}},false,true],
 [{overrides:{'pdf-plus':false}},true,false],
 [{overrides:{'pdf-plus':true}},false,true],
 [{options:{}},true,true],
 [undefined,true,true],
 [undefined,undefined,false]
];
for(const [instance,defaultMod,expected]of cases){const obj=new probeModule.exports();obj.app={internalPlugins:{plugins:{'page-preview':{instance}}},workspace:{hoverLinkSources:defaultMod===undefined?{}:{'pdf-plus':{defaultMod}}}};assert.equal(obj.requireModKeyForLinkHover(),expected);}

const missing=[],invalidParams=[];let calls=0;
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else if(item.name.endsWith('.ts')){const sf=ts.createSourceFile(p,fs.readFileSync(p,'utf8'),ts.ScriptTarget.Latest,true);function visit(n){if(ts.isCallExpression(n)&&ts.isIdentifier(n.expression)&&n.expression.text==='t'&&n.arguments[0]&&ts.isStringLiteralLike(n.arguments[0])){calls++;const key=n.arguments[0].text;if(!Object.hasOwn(dict,key))missing.push(key);const text=dict[key]??'';if(/(?<!\{)\{[A-Za-z_][\w]*\}(?!\})/.test(text)&&!n.arguments[2])invalidParams.push(key);}ts.forEachChild(n,visit);}visit(sf);}}}walk(path.join(root,'src'));
assert.deepEqual(missing,[],'Every referenced translation key must exist');
assert.deepEqual(invalidParams,[],'Do not render unresolved translation placeholders');
for(const [key,value]of Object.entries(uiDict)){assert.equal(typeof value,'string');const tokens=s=>[...new Set([...s.matchAll(/\{(\d+)\}/g)].map(x=>x[1]))].sort();assert.deepEqual(tokens(key),tokens(value),'UI interpolation tokens: '+key);}
console.log(JSON.stringify({passed:true,translationCalls:calls,translationKeys:Object.keys(dict).length,uiLabels:Object.keys(uiDict).length,hoverCompatibilityCases:cases.length,customTemplatesPreserved:true},null,2));
