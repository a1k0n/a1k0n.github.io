var NGRAM=5; // context size in the model (constant)
var ctxLL;   // context log-likelihood data (aka language model)
var tmr;     // output refresh timer
var outtag, intag; // our input and output html tags

// Load up our language model image data
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
  };
  img.src = 'langmodel.png';
})();

// On keypress, set a 50ms timer to refresh our word segmentation output
window['kp']=function() {
  // if we don't have our context likelihood data, give up
  if(ctxLL === undefined)
    return;

  if(tmr) clearTimeout(tmr);
  tmr=setTimeout(function(){
      tmr=0;
      var str = ((intag.value).toLowerCase()).replace(/[^a-z]/g, "");
      outtag.innerHTML = segment(str);
    }, 50);
}

// This extremely bad hash function happens to work better than a bunch of
// other things I tried, probably because 27 is both prime and the number of
// unique symbols we are encoding so it doesn't collide very much.  Still,
// you'd expect a mixing step at the end to be necessary before the final mod
// 2^16 but it actually makes things (very slightly) worse.
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

  // trivial segmentation is trivial
  if(!len) return "";

  // split is the NGRAM x len array of bools: whether or not to split in a given context
  // LL is the log-likelihoods of the previous letter at all context sizes
  var split=[], LL=[0,0,0,0,0], LL_=[];
  // Work from the end of the string back towards the beginning
  for(var i=len-1;i>=0;i--) {
    // Try all possible prefix lengths from 0 to NGRAM
    for(var k=0;k<Math.min(i+1,NGRAM);k++) {
      var kp1 = Math.min(NGRAM-1, k+1);

      // LLc = -log likelihood of current character in current context
      var LLc = ctxLL[4*((get_ctx_hash(str, i-k, k)+str.charCodeAt(i)-96)&0xffff)];
      // LLw = -log likelihood of ending a word after this letter
      var LLw = ctxLL[4*get_ctx_hash(str, i+1-kp1, kp1)];
      var LL1 = LLc + LLw + LL[0]; // choice #1: we extend the word by one letter end it there, and start a new word with 0 preceeding characters
      var LL2 = LLc + LL[kp1];     // choice #2: we extend the word by one letter
      LL_[k] = Math.min(LL1,LL2);  // Result for this context is the better of the two
      split[i*NGRAM+k] = LL1 < LL2; // and we split here if choice #1 was better
    }
    for(k=0;k<NGRAM;k++) LL[k]=LL_[k];
  }

  // The first result is the average per-character confusion (confusion =
  // negative log-likelihood), which gives us a rough guess as to whether or
  // not we are doing anything useful here (a high value means the input
  // probably isn't English by our definition)
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
