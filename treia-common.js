/* Treia beta — shared helpers used by every page */
var TREIA = (function(){

  // Google Apps Script web-app URL (same deployment as before; update the version, keep the URL)
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuEzdMxLZZ5pER_Owl2FRmsn7SlJniU0Wd3ft_vCsxXIHd6BhBLEZSI_6_4Z5xccosjw/exec';

  var RINGS = [
    {key:'health',   name:'Health',    def:'Physical, mental, and emotional well-being.', ex:'Think energy, sleep, movement, stress, and caring for yourself.', color:'#6E8B6B', bg:'var(--health-bg)'},
    {key:'joy',      name:'Joy',       def:'Fulfillment, inspiration, and activities that energize you.', ex:'Think fun, rest, creativity, and the things you look forward to.', color:'#C2973B', bg:'var(--joy-bg)'},
    {key:'love',     name:'Love',      def:'Relationships with a spouse or partner, family, friends, and community.', ex:'Think connection, support, belonging, and kindness, including toward yourself.', color:'#B5654A', bg:'var(--love-bg)'},
    {key:'wealth',   name:'Wealth',    def:'Financial security, priorities, and long-term planning.', ex:'This is about how you feel about money and your plans, not how much you have.', color:'#557A95', bg:'var(--wealth-bg)'},
    {key:'curiosity',name:'Curiosity', def:'Learning, exploration, and new possibilities.', ex:'Think ideas, new experiences, questions, and growth.', color:'#7E6A8A', bg:'var(--curiosity-bg)'}
  ];

  // Simple line icons, after the brand moodboard iconography
  var ICONS = {
    joy:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    love:'<circle cx="12" cy="8" r="2.6"/><circle cx="5.8" cy="10" r="2"/><circle cx="18.2" cy="10" r="2"/><path d="M7.3 19a4.7 4.7 0 0 1 9.4 0"/><path d="M2.3 18.5a3.6 3.6 0 0 1 5-3.1"/><path d="M21.7 18.5a3.6 3.6 0 0 0-5-3.1"/>',
    health:'<path d="M5 19C5 11 11 6 19 5c0 8-5 14-14 14z"/><path d="M5 19l8-8"/>',
    wealth:'<ellipse cx="12" cy="6" rx="6" ry="2.5"/><path d="M6 6v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V6"/><path d="M6 10v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4"/><path d="M6 14v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4"/>',
    curiosity:'<path d="M9.5 18h5"/><path d="M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.1V16h5v-.1c0-.8.4-1.5 1.1-2.1A6 6 0 0 0 12 3z"/>'
  };
  function ring(key){ for(var i=0;i<RINGS.length;i++){ if(RINGS[i].key===key) return RINGS[i]; } return null; }
  function icon(key,size){
    var r=ring(key), sz=size||44, i=Math.round(sz*0.52);
    return '<span class="ring-badge" style="width:'+sz+'px;height:'+sz+'px;border-color:'+r.color+'"><svg viewBox="0 0 24 24" width="'+i+'" height="'+i+'" fill="none" stroke="'+r.color+'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONS[key]+'</svg></span>';
  }
  function lc(t){ return t.charAt(0).toLowerCase()+t.slice(1).replace(/\.$/,''); }

  // The Five Rings figure: loosely overlapping rings forming one balanced circle, after the brand symbol
  function ringsFigure(){
    // [dx, dy, rx, ry, rotation] for Health, Joy, Love, Wealth, Curiosity
    var shape=[[-11,-6,72,68,-18],[10,-9,69,73,24],[12,8,71,67,62],[-8,11,68,72,-50],[2,2,75,71,8]];
    var cx=120,cy=100,g='';
    RINGS.forEach(function(rg,i){
      var p=shape[i];
      g+='<ellipse cx="'+(cx+p[0])+'" cy="'+(cy+p[1])+'" rx="'+p[2]+'" ry="'+p[3]+'" transform="rotate('+p[4]+' '+(cx+p[0])+' '+(cy+p[1])+')" fill="none" stroke="'+rg.color+'" stroke-width="4" stroke-linecap="round" opacity=".9"/>';
    });
    var legend='<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px 16px;margin-top:14px;">'+RINGS.map(function(rg){return '<span style="display:inline-flex;align-items:center;gap:6px;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:15px;color:'+rg.color+'"><span style="width:10px;height:10px;border-radius:50%;background:'+rg.color+'"></span>'+rg.name+'</span>';}).join('')+'</div>';
    return '<svg viewBox="0 0 240 200" width="100%" style="max-width:220px;display:block;margin:6px auto 0;" role="img" aria-label="The Five Rings: Health, Joy, Love, Wealth and Curiosity, forming one balanced circle">'+g+'</svg>'+legend;
  }


  var SCALES = {
    A:['Strongly disagree','Disagree','Neutral','Agree','Strongly agree'],
    F:['Never','Rarely','Sometimes','Often','Almost always'],
    C:['None','1','2–3','4–5','6 or more']
  };

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
  function lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }
  // Jump to the top of the new screen. Runs again after the screen is drawn, because phones
// (especially iPhones) otherwise keep the old scroll position and land at the bottom.
  function scrollTop(){
    function up(){ window.scrollTo(0,0); document.documentElement.scrollTop=0; document.body.scrollTop=0; }
    up(); if(window.requestAnimationFrame) requestAnimationFrame(up); setTimeout(up,60); setTimeout(up,250);
  }

  function tid(){
    var t = ls('treia-tid');
    if(!t){ t='T'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase(); ls('treia-tid',t); }
    return t;
  }

  // Send one row to a named tab. The Apps Script creates the tab and any new columns automatically.
  function post(sheet,row){
    if(!SCRIPT_URL) return Promise.resolve();
    var payload = {sheet:sheet,row:row};
    return fetch(SCRIPT_URL,{method:'POST',body:JSON.stringify(payload)}).catch(function(){});
  }

  // 5-point labelled pills
  function pills(name,val,scale,color){
    var labels = SCALES[scale]||scale;
    return '<div class="pills" role="radiogroup">'+labels.map(function(l,i){
      var v=i+1, on=val===v;
      return '<button type="button" class="pill'+(on?' on':'')+'" role="radio" aria-checked="'+on+'" data-set="'+name+'" data-val="'+v+'" data-color="'+color+'"'+(on?' style="background:'+color+'"':'')+'>'+esc(l)+'</button>';
    }).join('')+'</div>';
  }

  // 0-10 scale
  function ten(name,val,color,lo,hi){
    var h='<div class="ten" role="radiogroup">';
    for(var v=0;v<=10;v++){
      var on=val===v;
      h+='<button type="button" class="pill'+(on?' on':'')+'" role="radio" aria-checked="'+on+'" data-set="'+name+'" data-val="'+v+'" data-color="'+color+'"'+(on?' style="background:'+color+'"':'')+'>'+v+'</button>';
    }
    return h+'</div><div class="ten-labels"><span>'+esc(lo)+'</span><span>'+esc(hi)+'</span></div>';
  }

  // single / multi choice list. multi values stored as arrays
  function choices(name,val,options,multi,twoCol){
    return '<div class="choices'+(twoCol?' two':'')+'">'+options.map(function(o){
      var on = multi ? (val||[]).indexOf(o)>-1 : val===o;
      return '<button type="button" class="choice'+(multi?' multi':'')+(on?' on':'')+'" data-'+(multi?'multi':'pick')+'="'+name+'" data-val="'+esc(o)+'"><span class="box"></span>'+esc(o)+'</button>';
    }).join('')+'</div>';
  }

  // Wire up clicks on pills / choices. stateRef is an object or a function returning the object to write into.
  function bind(stateRef,onChange){
    document.addEventListener('click',function(e){
      var b=e.target.closest('[data-set],[data-pick],[data-multi]');
      if(!b) return;
      var state=typeof stateRef==='function'?stateRef():stateRef;
      if(b.hasAttribute('data-set')){
        var n=b.getAttribute('data-set'), v=parseInt(b.getAttribute('data-val'),10), c=b.getAttribute('data-color');
        state[n]=v;
        b.parentNode.querySelectorAll('.pill').forEach(function(p){ p.classList.remove('on'); p.style.background=''; p.setAttribute('aria-checked','false'); });
        b.classList.add('on'); b.style.background=c; b.setAttribute('aria-checked','true');
      } else if(b.hasAttribute('data-pick')){
        var n2=b.getAttribute('data-pick'); state[n2]=b.getAttribute('data-val');
        b.parentNode.querySelectorAll('.choice').forEach(function(p){p.classList.remove('on');});
        b.classList.add('on');
      } else {
        var n3=b.getAttribute('data-multi'), v3=b.getAttribute('data-val'), arr=(state[n3]||[]).slice(), i=arr.indexOf(v3);
        if(i>-1) arr.splice(i,1); else arr.push(v3);
        state[n3]=arr; b.classList.toggle('on');
      }
      if(onChange) onChange();
    });
    document.addEventListener('input',function(e){
      var n=e.target.getAttribute && e.target.getAttribute('data-text');
      var state=typeof stateRef==='function'?stateRef():stateRef;
      if(n){ state[n]=e.target.value; if(onChange) onChange(); }
    });
  }

  // Radar chart on a 0-10 scale. overlay (optional) drawn dashed, e.g. importance.
  function radar(scores,overlay){
    var cx=160,cy=160,maxR=108,n=RINGS.length,step=2*Math.PI/n;
    function pt(i,v){var a=i*step-Math.PI/2,r=(v/10)*maxR;return[cx+r*Math.cos(a),cy+r*Math.sin(a)];}
    function path(vals){return vals.map(function(v,i){var p=pt(i,v);return(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1);}).join(' ')+'Z';}
    var g='';
    [2,4,6,8,10].forEach(function(l){ g+='<path d="'+path(RINGS.map(function(){return l;}))+'" fill="none" stroke="#E4DACA" stroke-width="1"/>'; });
    RINGS.forEach(function(r,i){
      var e=pt(i,10); g+='<line x1="'+cx+'" y1="'+cy+'" x2="'+e[0].toFixed(1)+'" y2="'+e[1].toFixed(1)+'" stroke="#E4DACA"/>';
      var lp=pt(i,12.2), anchor=lp[0]<cx-5?'end':lp[0]>cx+5?'start':'middle';
      g+='<text x="'+lp[0].toFixed(1)+'" y="'+(lp[1]+4).toFixed(1)+'" font-size="12" font-weight="700" fill="'+r.color+'" font-family="Fraunces,Georgia,serif" text-anchor="'+anchor+'">'+r.name+'</text>';
    });
    if(overlay){ g+='<path d="'+path(RINGS.map(function(r){return overlay[r.key];}))+'" fill="none" stroke="#2E2A24" stroke-width="1.5" stroke-dasharray="4 4" opacity=".55"/>'; }
    g+='<path d="'+path(RINGS.map(function(r){return scores[r.key];}))+'" fill="rgba(110,139,107,.14)" stroke="#2E2A24" stroke-width="2.2"/>';
    RINGS.forEach(function(r,i){var p=pt(i,scores[r.key]);g+='<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="5" fill="'+r.color+'"/>';});
    return '<svg viewBox="-45 0 410 320" width="100%" style="max-width:380px;display:block;margin:0 auto;" role="img" aria-label="Five Rings chart">'+g+'</svg>';
  }

  function wordmark(){ return '<div class="wordmark">treia<span>.</span></div>'; }

  return {ring:ring,icon:icon,lc:lc,ringsFigure:ringsFigure,RINGS:RINGS,SCALES:SCALES,esc:esc,ls:ls,lsDel:lsDel,scrollTop:scrollTop,tid:tid,post:post,pills:pills,ten:ten,choices:choices,bind:bind,radar:radar,wordmark:wordmark};
})();
