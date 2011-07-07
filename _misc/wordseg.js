var NGRAM=5;
var ctxLL;
var outtag;
var intag;
var tmr;

(function(){
  var img = new Image();
  img.onload = function() {
    var s = "", 
        c = document.createElement("canvas"),
        t = c.getContext("2d"),
        w = img.width,
        h = img.height;
    c.width  = c.style.width  = w;
    c.height = c.style.height = h; 
    t.drawImage(img, 0, 0);
    ctxLL = t.getImageData( 0, 0, w, h ).data;

    outtag = document.getElementById('o');
    intag = document.getElementById('i');
    intag.disabled = false;
    intag.value = "";
    intag.focus();
    // var o=[];
    // for(var i=0;i<16;i++) o.push(ctxLL[i*4]);
    // out.innerHTML = "loaded; initial data: " + o.join(" ");
    
  };
  img.src = 'langmodel.png';
})();

window['kp']=function() {
  if(tmr) clearTimeout(tmr);
  tmr=setTimeout(function(){
      tmr=0;
      var str = ((intag.value).toLowerCase()).replace(/[^a-z]/g, "");
      outtag.innerHTML = segment(str);
    }, 50);
}

function get_ctx_hash(str, begin, len)
{
  var h=0;
  for(var i=0;i<len;i++) {
    h=((h+str.charCodeAt(begin+i)-96)*27)&0xffff;
  }
  return h;
}

function segment(str)
{
  var len = str.length;
  if(!len) return "";
  var split=[], LL=[0,0,0,0,0], LL_=[];
  for(var i=len-1;i>=0;i--) {
    for(var k=0;k<Math.min(i+1,NGRAM);k++) {
      var kp1 = Math.min(NGRAM-1, k+1);
      var LLc = ctxLL[4*((get_ctx_hash(str, i-k, k)+str.charCodeAt(i)-96)&0xffff)];
      var LLw = ctxLL[4*get_ctx_hash(str, i+1-kp1, kp1)];
      var LL1 = LLc + LLw + LL[0];
      var LL2 = LLc + LL[kp1];
      LL_[k] = Math.min(LL1,LL2);
      split[i*NGRAM+k] = LL1 < LL2;
    }
    for(k=0;k<NGRAM;k++) LL[k]=LL_[k];
  }
  var result = [Math.floor(LL[0]/len)];
  var linelen=0;
  for(i=0;i<len;) {
    var wordlen=0, k=0;
    while((i+wordlen) < len) {
      wordlen++;
      if(split[(i+wordlen-1)*NGRAM+k])
        break;
      k = Math.min(NGRAM-1, k+1);
    }
    if(linelen+wordlen > 80) { result.push("\n  "); linelen=0; }
    result.push(str.substring(i, i+wordlen));
    i += wordlen;
    linelen += wordlen;
  }
  return result.join(" ");
}
