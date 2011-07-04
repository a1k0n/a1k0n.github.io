// this gets closure-compiled into index.html

var d,i,oi,_,o,tmr,hpos,hend,hh,kpos;
var oneiter = function() {
  for(var k=0;"##K#8(38D-##C]L5870.X7\\M_b;90\\MC-M/NZGB6Q,I0VGB6a0FbN<VG.6Q\\bNb7^@`X=N@`XQaOVX:^]NX=:Z8PY]B`:>PNY8^$#SM):XA".charCodeAt(_/6)-35>>_++%6&1;k++){}o+=" _/\\\n,`)('<-"[k];  while((0|(_/6)) != hh) {    hpos=hend;    for(var c;(c=oi.charCodeAt(hpos))==34;hpos+=3){}    hend=hpos+1;    if(c == 92) hend++;
    if(c == 38) hend+=3;
    hh++;
  }
  if(_>=641) {
    clearInterval(tmr);
    i.innerHTML = oi;
  } else {
    var kk = kpos+k, ke=1;
    if(k==3)ke++; if(k>3)kk++;
    if(k==4)ke++; if(k>4)kk++;
    if(k==10)ke+=3; if(k>10)kk+=3;
    var q = oi.substring(0,hpos) + '<span style="background:#0ee">' + oi.substring(hpos,hend) + '</span>' + oi.substring(hend,kk) +
      '<span style="background:#ee0">' + oi.substring(kk,kk+ke) + '</span>' + oi.substring(kk+ke);
    i.innerHTML = q;
  }
  d.innerHTML=o+'<span style="background:#000">&nbsp;</span>';
};

window.signature = function(){
  d=document.getElementById('o');
  if(!i) { i=document.getElementById('i'); oi=i.innerHTML; }
  _=0;o="";hpos=oi.indexOf("(k=0;")+6,hend=hpos+1,hh=0;
  kpos=oi.indexOf("(k[\"")+4;
  if(tmr===undefined)tmr=setInterval(oneiter,50);
}

