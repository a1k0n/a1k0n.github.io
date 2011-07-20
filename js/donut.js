document.getElementsByTagName('body')[0].onload = function() {
  var tag = document.getElementById('d');
  var tmr;
  var A=1, B=1;
  var oneframe=function() {
    var b=[];
    var z=[];
    A += 0.01;
    B += 0.03;
    var cA=Math.cos(A), sA=Math.sin(A),
        cB=Math.cos(B), sB=Math.sin(B);
    for(var k=0;k<1760;k++) {
      b[k]=k%80 == 79 ? "\n" : " ";
      z[k]=0;
    }
    for(var j=0;j<6.28;j+=0.07) { // j <=> theta
      var ct=Math.cos(j),st=Math.sin(j);
      for(i=0;i<6.28;i+=0.02) {   // i <=> phi
        var sp=Math.sin(i),cp=Math.cos(i), h=ct+2, D=1/(sp*h*sA+st*cA+5), t=sp*h*cA-st*sA;

        var x=0|(40+30*D*(cp*h*cB-t*sB)),
            y=0|(12+15*D*(cp*h*sB+t*cB)),
            o=x+80*y,
            N=0|(8*((st*sA-sp*ct*cA)*cB-sp*ct*sA-st*cA-cp*ct*sB));
        if(y<22 && y>0 && x>0 && x<79 && D>z[o])
        {
          z[o]=D;
          b[o]=".,-~:;=!*#$@"[N>0?N:0];
        }
      }
    }
    tag.innerHTML = b.join("");
    A+=0.04;
    B+=0.02;
  }
  window.anim = function() {
    if(tmr === undefined) {
      tmr = setInterval(oneframe, 50);
    } else {
      clearInterval(tmr);
      tmr = undefined;
    }
  }
  oneframe();
}

