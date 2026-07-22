import{J as C}from"./jszip.min-57Zn9Q9J.js";import{P as x,d as W,g as U,G as V}from"./PDFButton-CXmn4GFN.js";V.workerSrc=new URL("/assets/pdf.worker-CliDBb4N.mjs",import.meta.url).toString();function u(e,t,o){return Math.max(t,Math.min(o,e))}function P(e){const t=Number.parseInt(String(e).trim(),10);return Number.isFinite(t)?t:null}function F(e){return String(e).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g,"")}function p(e){return F(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Z(e){return F(e).replace(/\u00a0/g," ").replace(/\r\n?/g,`
`)}function G(e){const t=Z(e).trim();return t?t.split(/\n{2,}/).map(o=>o.replace(/[ \t]*\n[ \t]*/g," ").replace(/\s+/g," ").trim()).filter(Boolean):[]}function j(e){return F(e||"").replace(/^\uFEFF/,"").trim()}function J(e){const o=j(e).replace(/^D:/,"").match(/^(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?/);if(!o)return null;const[s,n="01",a="01",r="00",i="00",c="00"]=o.slice(1);return`${s}-${n}-${a}T${r}:${i}:${c}Z`}function Y({title:e,coverImageHref:t}){return`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="pt-BR" lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${p(e)}</title>
  <link rel="stylesheet" type="text/css" href="styles/style.css" />
</head>
<body>
  <section class="chapter chapter-cover chapter-cover-image">
    <img class="cover-image" src="${p(t)}" alt="${p(e)}" />
  </section>
</body>
</html>`}function A({title:e,pageTitle:t,paragraphs:o,imageHref:s}){const n=o.length?o.map(a=>`<p>${p(a)}</p>`).join(`
`):`<div class="page-image"><img src="${p(s)}" alt="${p(t)}" /></div>`;return`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="pt-BR" lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${p(t)}</title>
  <link rel="stylesheet" type="text/css" href="../styles/style.css" />
</head>
<body>
  <section class="chapter">
    <h1>${p(e)}</h1>
    <h2>${p(t)}</h2>
    ${n}
  </section>
</body>
</html>`}function K(e,t){const o=[...Array(t).keys()].map(s=>{const n=s+1;return`<li><a href="text/${`page-${String(n).padStart(3,"0")}.xhtml`}">Página ${n}</a></li>`}).join(`
`);return`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt-BR" lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${p(e)}</title>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>${p(e)}</h1>
    <ol>
      ${o}
    </ol>
  </nav>
</body>
</html>`}function Q(){return`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" />
  </rootfiles>
</container>`}function _(){return`body {
  font-family: serif;
  line-height: 1.5;
  margin: 0;
  padding: 1.25rem;
  color: #111827;
  background: #ffffff;
}

.chapter {
  max-width: 42rem;
  margin: 0 auto;
}

.chapter-cover {
  min-height: calc(100vh - 2.5rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chapter-cover-image {
  align-items: center;
}

.cover-image {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: contain;
  border-radius: 0.75rem;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.cover-label {
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.78rem;
  color: #0e7490;
}

.meta-line {
  margin: 0 0 0.5rem;
  color: #4b5563;
}

.chapter h1 {
  font-size: 1.6rem;
  margin: 0 0 0.5rem;
}

.chapter h2 {
  font-size: 1rem;
  margin: 0 0 1rem;
  color: #4b5563;
}

.chapter p {
  margin: 0 0 1rem;
  text-align: justify;
}

.page-image img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}
`}async function X(e,t={}){const o=e.getViewport({scale:1}),s=t.maxWidth||1600,n=typeof t.quality=="number"?t.quality:.88,a=Math.max(1,Math.min(2.5,s/o.width)),r=e.getViewport({scale:a}),i=document.createElement("canvas"),c=i.getContext("2d",{alpha:!1});if(!c)throw new Error("Nao foi possivel criar a imagem da pagina do PDF.");return i.width=Math.floor(r.width),i.height=Math.floor(r.height),await e.render({canvasContext:c,viewport:r}).promise,new Promise((l,m)=>{i.toBlob(d=>{d?l(d):m(new Error("Falha ao gerar a imagem da pagina do PDF."))},"image/jpeg",n)})}async function tt(e,t){const o=await e.arrayBuffer(),n=await U({data:o}).promise,{info:a={}}=await n.getMetadata().catch(()=>({info:{}})),r=j(a.Title),i=j(a.Author),c=j(a.Subject),l=J(a.CreationDate),m=j(a.Language)||"pt-BR",d=e.name.replace(/\.[^/.]+$/,"")||"Documento",h=r||d,D=i||"PDF XinoConvert",B=c||`Versão EPUB gerada a partir de ${d}`,E=n.numPages,b=[],g=[],v=[],S=[],k=await n.getPage(1),M=await(await X(k,{maxWidth:1800,quality:.9})).arrayBuffer();g.push({path:"OEBPS/images/cover.jpg",content:M});for(let f=1;f<=E;f+=1){const T=await n.getPage(f),q=await T.getTextContent();let O="";q.items.forEach($=>{$!=null&&$.str&&(O+=$.str),O+=$!=null&&$.hasEOL?`
`:" "});const I=G(O),y=`page-${String(f).padStart(3,"0")}`,z=`OEBPS/text/${y}.xhtml`,H=`OEBPS/images/${y}.jpg`;if(I.length)b.push({path:z,content:A({title:h,pageTitle:`Página ${f}`,paragraphs:I,imageHref:""})}),v.push(`<item id="${y}" href="text/${y}.xhtml" media-type="application/xhtml+xml" />`);else{const L=await(await X(T)).arrayBuffer();g.push({path:H,content:L}),b.push({path:z,content:A({title:h,pageTitle:`Página ${f}`,paragraphs:[],imageHref:`../images/${y}.jpg`})}),v.push(`<item id="${y}" href="text/${y}.xhtml" media-type="application/xhtml+xml" />`),v.push(`<item id="${y}-img" href="images/${y}.jpg" media-type="image/jpeg" />`)}S.push(`<itemref idref="${y}" />`),typeof t=="function"&&t(Math.round(f/E*100))}const w=new C;return w.file("mimetype","application/epub+zip",{compression:"STORE"}),w.file("META-INF/container.xml",Q()),w.file("OEBPS/content.opf",`<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" unique-identifier="bookid" xmlns="http://www.idpf.org/2007/opf" xml:lang="${p(m)}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:${crypto.randomUUID()}</dc:identifier>
    <dc:title>${p(h)}</dc:title>
    <dc:creator>${p(D)}</dc:creator>
    <dc:description>${p(B)}</dc:description>
    <dc:language>${p(m)}</dc:language>
    <meta property="language">${p(m)}</meta>
    <meta property="generator">PDF XinoConvert</meta>
    ${l?`<meta property="dcterms:created">${p(l)}</meta>`:""}
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/,"Z")}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
    <item id="css" href="styles/style.css" media-type="text/css" />
    <item id="cover" href="text/cover.xhtml" media-type="application/xhtml+xml" />
    <item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image" />
    ${v.join(`
    `)}
  </manifest>
  <spine>
    <itemref idref="cover" />
    ${S.join(`
    `)}
  </spine>
</package>`),w.file("OEBPS/text/cover.xhtml",Y({title:h,coverImageHref:"../images/cover.jpg"})),w.file("OEBPS/nav.xhtml",K(h,E)),w.file("OEBPS/styles/style.css",_()),b.forEach(f=>{w.file(f.path,f.content)}),g.forEach(f=>{w.file(f.path,f.content)}),w.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}})}function R(e,t){if(!e||!e.trim())return[...Array(t).keys()];const o=new Set,s=e.split(",").map(a=>a.trim()).filter(Boolean);for(const a of s)if(a.includes("-")){const[r,i]=a.split("-"),c=P(r),l=P(i);if(c===null||l===null)throw new Error(`Intervalo inválido: ${a}`);const m=u(Math.min(c,l),1,t),d=u(Math.max(c,l),1,t);for(let h=m;h<=d;h+=1)o.add(h-1)}else{const r=P(a);if(r===null)throw new Error(`Página inválida: ${a}`);if(r<1||r>t)throw new Error(`Página fora do intervalo permitido: ${r}`);o.add(r-1)}const n=[...o].sort((a,r)=>a-r);if(!n.length)throw new Error("Nenhuma página válida foi selecionada.");return n}function et(e,t){if(!e||!e.trim())return[...Array(t).keys()].map(n=>[n]);const o=[],s=e.split(",").map(n=>n.trim()).filter(Boolean);for(const n of s)if(n.includes("-")){const[a,r]=n.split("-"),i=P(a),c=P(r);if(i===null||c===null)throw new Error(`Intervalo inválido: ${n}`);const l=u(Math.min(i,c),1,t),m=u(Math.max(i,c),1,t);o.push([...Array(m-l+1).keys()].map(d=>l-1+d))}else{const a=P(n);if(a===null||a<1||a>t)throw new Error(`Página inválida: ${n}`);o.push([a-1])}if(!o.length)throw new Error("Nenhum grupo válido para divisão.");return o}async function ot(e,t){const o=await x.create();for(let n=0;n<e.length;n+=1){const a=await e[n].arrayBuffer(),r=await x.load(a,{ignoreEncryption:!0});(await o.copyPages(r,r.getPageIndices())).forEach(c=>o.addPage(c)),typeof t=="function"&&t(Math.round((n+1)/e.length*100))}const s=await o.save({useObjectStreams:!0});return new Blob([s],{type:"application/pdf"})}async function rt(e,t,o){const s=await e.arrayBuffer(),n=await x.load(s,{ignoreEncryption:!0}),a=et(t,n.getPageCount()),r=[];for(let i=0;i<a.length;i+=1){const c=await x.create();(await c.copyPages(n,a[i])).forEach(d=>c.addPage(d));const m=await c.save({useObjectStreams:!0});r.push({name:`${e.name.replace(/\.[^/.]+$/,"")}-parte-${String(i+1).padStart(2,"0")}.pdf`,blob:new Blob([m],{type:"application/pdf"})}),typeof o=="function"&&o(Math.round((i+1)/a.length*100))}return r}async function it(e,t,o,s){const n=await e.arrayBuffer(),a=await x.load(n,{ignoreEncryption:!0}),r=R(o,a.getPageCount()),i=new Set(r);a.getPages().forEach((l,m)=>{i.has(m)&&l.setRotation(W(t))}),typeof s=="function"&&s(100);const c=await a.save({useObjectStreams:!0});return new Blob([c],{type:"application/pdf"})}async function st(e,t,o){const s=await e.arrayBuffer(),n=await x.load(s,{ignoreEncryption:!0}),a=R(t,n.getPageCount()).sort((i,c)=>c-i);for(const i of a)n.removePage(i);if(n.getPageCount()===0)throw new Error("Não é possível remover todas as páginas do PDF.");typeof o=="function"&&o(100);const r=await n.save({useObjectStreams:!0});return new Blob([r],{type:"application/pdf"})}async function ct(e,t,o){const s=await e.arrayBuffer(),n=await x.load(s,{ignoreEncryption:!0}),a=R(t,n.getPageCount()),r=await x.create();(await r.copyPages(n,a)).forEach(l=>r.addPage(l)),typeof o=="function"&&o(100);const c=await r.save({useObjectStreams:!0});return new Blob([c],{type:"application/pdf"})}async function lt(e,t,o){const s=await e.arrayBuffer(),n=await x.load(s,{ignoreEncryption:!0}),a=n.getPageCount(),r=(t==null?void 0:t.area)||{x:0,y:0,width:1,height:1},i=(t==null?void 0:t.applyMode)==="current"?"current":"all",c=u(Number(t==null?void 0:t.currentPage)||1,1,a),l=u(Number(r.x)||0,0,.98),m=u(Number(r.y)||0,0,.98),d=u(Number(r.width)||1,.02,1-l),h=u(Number(r.height)||1,.02,1-m);n.getPages().forEach((B,E)=>{if(i==="current"&&E!==c-1)return;const b=B.getWidth(),g=B.getHeight(),v=u(b*l,0,Math.max(0,b-10)),S=u(b*d,10,b-v),k=u(g*h,10,g),N=u(g*m,0,Math.max(0,g-10)),M=u(g-N-k,0,Math.max(0,g-10));B.setCropBox(v,M,S,k),B.setMediaBox(v,M,S,k)}),typeof o=="function"&&o(100);const D=await n.save({useObjectStreams:!0});return new Blob([D],{type:"application/pdf"})}async function pt(e,t){return tt(e,t)}async function mt(e,t="downloads.zip",o){const s=new C;return e.forEach(a=>{s.file(a.name,a.blob||a.file)}),{zipBlob:await s.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}},a=>{typeof o=="function"&&o(Math.round(a.percent))}),zipName:t}}export{st as a,lt as b,pt as c,ct as e,ot as m,it as r,rt as s,mt as z};
