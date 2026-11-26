const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const site = process.env.MYBOX_SITE_SOURCE || path.resolve(__dirname,"../../../site/firmware-download");
const model = require(path.join(site,"catalog-model.js"));
const ctx = { AbortSignal }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(site,"live-catalog.js"),"utf8")+"\nthis.subject=liveCatalog;",ctx);
const live = ctx.subject;
const r = (major,rev,channel="dev",board="mini-v2-vib") => ({firmware:"inav",version:major===9?"9.1.0":"10.0.0",
  revision:rev,channel,board,tag:major+"-"+rev+"-"+channel});
const catalog={releases:[r(10,18),r(9,16),r(9,15,"dev"),r(9,15,"stable")]};
assert.equal(model.selectionFromUrl("?firmware=inav").channel,"stable");
assert.equal(model.selectionFromUrl("?firmware=inav").line,"9");
assert.equal(model.selectionFromUrl("?firmware=inav&line=10").channel,"dev");
const nine={firmware:"inav",board:"mini-v2-vib",line:"9",channel:"all",version:"latest"};
assert.deepEqual(model.candidates(catalog,nine).map(r=>r.revision),[16,15,15]);
assert.equal(model.candidates(catalog,{...nine,line:"10",channel:"stable"}).length,0);
assert.equal(model.candidates(catalog,{...nine,channel:"stable"})[0].revision,15);
assert.equal(model.capabilities(r(9,16)).can,false);
assert.equal(model.capabilities(r(10,18)).can,true);
assert.equal(model.capabilities(r(10,18)).imuReserve,true);
assert.equal(model.capabilities(r(10,18,"dev","mini-v2")).imuReserve,false);
assert.equal(model.capabilities(r(9,9)).dshot,false);
assert.equal(model.capabilities(r(9,14)).escTelemetry,true);
const selection={...nine,version:"myboxh743-mini-v2-vib-9.1.0-r16-dev"};
assert.equal(model.selectionFromUrl("?"+model.urlParams(selection)).version,selection.version);
assert.equal(model.selectionFromUrl("?firmware=inav&version=myboxh743-mini-10.0.0-r17-dev").line,"10");
assert.equal(model.selectionFromUrl("?firmware=inav&board=pro").board,"mini-v2");
function raw(rev=18){
  const tag="myboxh743-mini-v2-vib-10.0.0-r"+rev+"-dev";
  return {tag_name:tag,html_url:"https://github.com/example/repo/releases/tag/"+tag,assets:[
    "inav_10.0.0_MYBOXH743MINIV2VIB_BENCH.hex","manifest.json","SHA256SUMS.txt"
  ].map(name=>({name,browser_download_url:"https://example.com/"+name}))};
}
(async()=>{
  const old=live.normalize(raw(17),"inav");
  const current=live.normalize(raw(),"inav");
  assert.equal(live.normalize({...raw(),draft:true},"inav"),null);
  assert.equal(live.normalize({...raw(),assets:[]},"inav"),null);
  const partial=await live.refresh({releases:[old]},async url=>{
    if(url.includes("MYBOXES_Ardupilot"))throw Error("offline");
    return {ok:true,json:async()=>[raw()]};
  });
  assert.equal(partial.releases.length,1);
  assert.equal(partial.releases[0].tag,current.tag); // withdrawn releases do not linger
  assert.deepEqual(Array.from(partial.live_refresh.failed),["ardupilot"]);
  assert.equal(await live.refresh({releases:[old]},async()=>{throw Error("offline");}),null);
  let pages=0;
  const paged=await live.refresh({releases:[]},async url=>{
    if(url.includes("MYBOXES_Ardupilot"))return {ok:true,json:async()=>[]};
    pages++;
    return {ok:true,json:async()=>url.endsWith("page=1")?Array.from({length:100},(_,i)=>raw(i+1)):[raw(101)]};
  });
  assert.equal(pages,2);assert.equal(paged.releases.length,101);
  console.log("Frontend selection, compatibility, permanent links, pagination and offline fallback: passed");
})().catch(e=>{console.error(e);process.exitCode=1;});
