// vim:ft=javascript:

var avatars = [
  // desc       col row sex
  ['Warrior'   , 6],
  ['Berserk'   , 1],
  ['Healer'    , 8],
  ['Magician'  , 7],
  ['Ranger'    ,10],
  ['Monk'      , 0],
  ['Samurai'   ,13],
  ['Ninja'     , 9],
  ['Soldier'   , 3],
  ['D.Knight'  , 2],
  ['Child'     ,12],
  ['Priest'    ,14, 0, 0],
  ['Nun'       ,14, 1, 1],
  ['King'      ,15, 0, 0],
  ['Queen'     ,15, 1, 1],
  ['Townfolk1' , 4],
  ['Townfolk2' , 5],
  ['Townfolk3' ,11],
  ['Townfolk4' ,16],
  ['Vampire'   , 0, 2,-1],
  ['Bard'      , 1, 2,-1],
  ['Paladin'   , 2, 2,-1],
  ['Merchant'  , 3, 2, 0],
  ['Cultist'   , 4, 2,-1],
  ['Pirate'    , 5, 2, 0],
  ['Captain'   , 6, 2, 0],
  ['Fire Elemental' ,  7, 2,-1],
  ['Water Elemental',  8, 2,-1],
  ['Wind Elemental' ,  9, 2,-1],
  ['Earth Elemental', 10, 2,-1],
  ['Light Elemental', 11, 2,-1],
  ['Dark Elemental' , 12, 2,-1]
];

// vim:ft=javascript:




function rot(x,n) { return (x<<n) | (x>>(32-n)) & 0xffffffff; }
function hash(a,b)
{
  var c=0x032f24c2;
  a += 0xb2ae9013;
  b += 0x2cd8e04a;
  c ^= b; c -= rot(b,14);
  a ^= c; a -= rot(c,11);
  b ^= a; b -= rot(a,25);
  c ^= b; c -= rot(b,16);
  a ^= c; a -= rot(c,4);
  b ^= a; b -= rot(a,14);
  c ^= b; c -= rot(b,24);

  return c&65535;
}

function mapinterp(map, x,y, u,s,x0,y0)
{
  map[x+y*33] = u+(0|(s*(hash(x+x0,y+y0)-32768)/25600));
}

function clamp(chunk,x,y)
{
  chunk[x+y*33] = Math.max(0,7*Math.min(65535,chunk[x+y*33])/65536);
}

function gen_subdivide(chunk,x0,y0,scale,x,y)
{
  if(scale <= 1) { return; }
  var hscale = scale>>1;

  // generate five points
  // a 1 b
  // 3 5 4
  // c 2 d
  var a = chunk[x0+y0*33];
  var b = chunk[(x0+scale)+y0*33];
  var c = chunk[x0+(y0+scale)*33];
  var d = chunk[(x0+scale)+(y0+scale)*33];
  mapinterp(chunk, x0+hscale,y0, (a+b)>>1,scale<<8, x,y);
  mapinterp(chunk, x0+hscale,y0+scale, (c+d)>>1,scale<<8, x,y);
  mapinterp(chunk, x0,y0+hscale, (a+c)>>1,scale<<8, x,y);
  mapinterp(chunk, x0+scale,y0+hscale, (b+d)>>1,scale<<8, x,y);
  mapinterp(chunk, x0+hscale,y0+hscale, (a+b+c+d)>>2,362*scale, x,y);
  gen_subdivide(chunk, x0,y0,hscale, x,y);
  gen_subdivide(chunk, x0+hscale,y0,hscale, x,y);
  gen_subdivide(chunk, x0,y0+hscale,hscale, x,y);
  gen_subdivide(chunk, x0+hscale,y0+hscale,hscale, x,y);
  // normalize and clamp
  clamp(chunk, x0+hscale,y0);
  clamp(chunk, x0+hscale,y0+scale);
  clamp(chunk, x0,y0+hscale);
  clamp(chunk, x0+scale,y0+hscale);
  clamp(chunk, x0+hscale,y0+hscale);
}

function gen_chunk(x,y)
{
  var chunk = [];
  chunk[0] = hash(x,y);
  chunk[32] = hash(x+32,y);
  chunk[32*33] = hash(x,32+y);
  chunk[32*33+32] = hash(x+32,y+32);
  gen_subdivide(chunk,0,0,32,x,y);
  clamp(chunk, 0,0);
  clamp(chunk, 0,32);
  clamp(chunk, 32,0);
  clamp(chunk, 32,32);
  return chunk;
}

// FIXME: evict old stuff with LRU, tunable between client and server (or maybe just weak refs?)
var world = {};
function get_chunk(x,y)
{
  if(!world[y]) { world[y] = {}; }
  if(world[y][x]) { return world[y][x]; }
  world[y][x] = gen_chunk(x<<5, y<<5);
  return world[y][x];
}







// vim:ft=javascript:

// for objects, x,y are integer world-space coordinates.  there are 16x16
// pixels per tile, and 32x32 tiles per chunk.  map chunks are 512x512.
// a double-precision float has a 52-bit mantissa, and our map is 2^32 square,
// so we have plenty of precision.

// actions: 8 1 2
//          7 0 3
//          6 5 4
var action_dx = [0, 0, 1, 1, 1, 0,-1,-1,-1],
    action_dy = [0,-1,-1, 0, 1, 1, 1, 0,-1];

var action_face = [0, 0,0,1,2,2,2,3,0];


// collision radius: sum of impassible feature radius + sprite collision radius

// 16 possibilities for collisions:
var coll_lut = [
  [],            // 0: empty tile: 0x+0y > -1
  [ 1, 1,12],    // 1: UL corner: x+y > 12
  [-1, 1,12-16], // 2: UR corner: -x+y > 12-16
  [ 0, 1,12],    // 3: UL,UR edge: y > 12
  [ 1,-1,12-16], // 4: LL corner: x-y > 12-16
  [ 1, 0,12],    // 5: UL,LL edge: x > 12
  [-1, 1,12-16, 1,-1,12-16], // 6: UR,LL diagonal
  [ 1, 1,12+16], // 7: UL,UR,LL inner corner: x+y > 12+16
  [-1,-1,12-32], // 8: LR corner: -x-y > 12-32
  [ 1, 1,12,   -1,-1,12-32], // 9: UL,LR diagonal
  [-1, 0,12-16], // 10: UR,LR edge: -x > 12-16
  [-1, 1,12],    // 11: UL,UR,LR inner corner: -x+y>12
  [ 0,-1,12-16], // 12: LL,LR edge: y > 12-16
  [ 1,-1,12],    // 13: UL,LL,LR inner corner: x-y > 12
  [-1,-1,12-16], // 14: UR,LL,LR inner corner: -x-y > 12-16
  []             // 15: impassible
];


var _ts_offset = 0; // correction between server and client ts, if necessary
function cur_ts() {
  // timestamp with game-tick resolution
  // game tick is 32ms, 31.25fps
  return ((new Date()).getTime()>>5) + _ts_offset;
}

/** @constructor */
function PlayerObject(oid,ts,x,y,pclass,sex,a) {
  this.otype = 0;
  this.oid = oid;
  this.ts = ts; // relative timestamp
  this.x = x;
  this.y = y;
  this.a = a; // current action
  this.pclass = pclass;
  this.sex = sex;
  this.chunk = get_chunk(x>>9, y>>9);
  this.min_height = 2;
  this.max_height = 5;

  this.basex = 3*16*pclass;
  this.basey = 4*18*sex;
  // facing convention in sprites: 0:up 1:right 2:down 3:left
  this.facing = 2; // face towards screen
  this.anim_frame = 0;

}




PlayerObject.prototype.updateSprite = function(s,screens) {
  // 0,1,2,3
  // 1,2,1,0
  var anim = [1,2,1,0];
  var frame = anim[(this.anim_frame/6)|0]*16;
  update_sprite_img(s, this.basex+frame, this.basey+this.facing*18);
  var X=this.x>>9, Y=this.y>>9, tx=this.x&511, ty=this.y&511;
  var screenidx = (X&1)+(Y&1)*2;
  s.style.left = (tx-8)+"px";
  s.style.top = (ty-12)+"px";
  s.style.zIndex=10+ty;
  if(this.screenidx != screenidx) {
    if(this.screenidx) {
      screens[this.screenidx].removeChild(s);
    }
    screens[screenidx].appendChild(s);
    this.screenidx = screenidx;
  }
}


function chk_height(h0,h1,h,v) {
  return (h < h0 || h > h1) ? v : 0;
}

// time at which we will cross into the next tile starting at px,py moving dx,dy
function crossing_time(px,py,dx,dy,hmax) {
  var hx=hmax,hy=hmax;
  if(dx>0) hx=(16-px)/dx;
  if(dx<0) hx=(-1-px)/dx;
  if(dy>0) hy=(16-py)/dy;
  if(dy<0) hy=(-1-py)/dy;
  return Math.min(hx,hy,hmax);
}

// we'll need to calculate speed from class/stats at some point i guess

PlayerObject.prototype.update = function(ts) {
  if(this.a == 0) {this.ts = ts; return;}

  var pspeed = 3; // three pixels per game tick -> 93.75 pixels/sec
  var dx = action_dx[this.a]*pspeed, dy = action_dy[this.a]*pspeed;
  var h = ts - this.ts; // timestep


  this.anim_frame += h;
  this.anim_frame %= 4*6;


  var h0 = this.min_height, h1 = this.max_height;
  var chunk = this.chunk;
  var x = this.x, y = this.y;
  var X = x>>9, Y = y>>9;

  while(h > 0) {
    var tx = (x>>4)&31, ty = (y>>4)&31;
    var mask = (chk_height(h0,h1,chunk[tx+ty*33],1) |
      chk_height(h0,h1,chunk[tx+ty*33+1],2) |
      chk_height(h0,h1,chunk[tx+ty*33+33],4) |
      chk_height(h0,h1,chunk[tx+ty*33+34],8));
    //console.log("h="+h+"(x,y)=("+x+","+y+") dx "+dx+" dy "+dy+" mask="+mask);

    var dt = h;
    // project a ray from x,y along dx,dy
    // intersect with the world on the tile at x,y
    var coll = coll_lut[mask];
    var moved = 0;
    var px = x&15, py = y&15;
    // check all collision edges
    for(var ci=0;ci<coll.length;ci+=3) {
      var a = coll[ci], b = coll[ci+1], c = coll[ci+2];
      var dp = dx*a + dy*b; // dot product of movement vector with surface normal
      if(dp < 0) { // are we moving towards the surface?
        // time when we'll hit the tile edge
        var t = (c - a*px-b*py)/dp;
        if(t > h) t = h;
        // move along dx,dy for 0..t
        x  += (dx*t)|0; y  += (dy*t)|0;
        px += (dx*t)|0; py += (dy*t)|0;
        h -= t;
        moved = 1;
        // then move along projection onto (-b,a) for t..dt so we slide along walls
        // if you're hitting a wall edge-on this projection will be zero
        var pdp = -b*dx + a*dy;
        dt = crossing_time(px,py,-b*pdp,a*pdp,h);
        x += (-b*pdp*dt)|0; y += (a*pdp*dt)|0;
        h -= dt;
        if(t < 0) {
          // we just kicked ourselves out of an intersection, so we are done moving
          h=0;
          moved=1;
          break;
        }

        // the nice thing about this is if you're inside a wall, t will be
        // negative so we will kick you out of the wall behind where you're
        // trying to go, and then shove you along the wall.  if you get placed
        // inside an object, this can go very badly.
        //
        // also, if you happen to already be on an impassible wall, you'll be
        // able to walk on it freely until you reach the edge at which point you
        // might get kicked out with some effort
      }
    }
    if(!moved) {
      // no collision, no problem
      dt = crossing_time(px,py,dx,dy,h);
      //console.log("no collision: h="+h+" dt="+dt);
      x += (dx*dt)|0; y += (dy*dt)|0;
      h -= dt;
    }
    // update chunk if necessary
    var XX = x>>9, YY = y>>9;
    if(XX != X || YY != Y) {
      //console.log("switching chunk from ("+X+","+Y+") to ("+XX+","+YY+")");
      chunk = this.chunk = get_chunk(XX,YY);
      X = XX; Y = YY;
    }
  }

  this.x = x;
  this.y = y;
  this.ts = ts;
}

PlayerObject.prototype.setAction = function(ts, a) {
  //console.log("setAction("+ts+","+a+")");
  this.update(ts);
  this.a = a;

  if(a == 0) this.anim_frame = 0;
  else this.facing = action_face[a];

}

// encoding is done relative to a base:
// base[0] = max_ts (encode as t' = max_ts-ts; ts = max_ts-t')
// base[1] = max_oid (encode as e = max_oid-oid; oid = max_oid-e)
// base[2] = x_rel
// base[3] = y_rel
PlayerObject.prototype.encodeState = function(base,buf) {
  buf.push(this.otype);
  buf.push(base[1] - this.oid);
  buf.push(base[0] - this.ts);
  buf.push(this.x - base[2]);
  buf.push(this.y - base[3]);
  buf.push(this.pclass);
  buf.push(this.sex);
  buf.push(this.a);
}

var obj_constructors = [
  function(base,buf,ptr) { // object type 0: players
    // buf: oid, ts, x, y, pclass, sex, action
    return new PlayerObject(
      base[1] - buf[ptr], // oid
      base[0] - buf[ptr+1],  // ts
      buf[ptr+2]-base[2], buf[ptr+3]-base[3], // x,y
      buf[ptr+4], buf[ptr+5], buf[ptr+6]); // pclass,sex,a
  }
];

function decodeObject(base,buf,ptr) {
  var t = buf[ptr];
  if(obj_constructors[t]) {
    return obj_constructors[t](base,buf,ptr+1);
  }
}


function $(x){return document.getElementById(x);}

function cmd_input() {
}

function cmd_input_onfocus() {
}

var sprites = {};

function update_sprite_img(div,u,v) {
  div.style.backgroundPosition = (-u)+"px "+(-v)+"px";
}

function make_sprite(img,w,h) {
  var div = document.createElement('div');
  div.style.position = "absolute";
  div.style.background = 'url("'+img+'") 0 0 no-repeat';
  div.style.width=w+"px";
  div.style.height=h+"px";
  return div;
}

var scr = [[],[],[],[]];
var sx = [], sy = [];
var screens = [];
// x,y is the location of the center pixel
// maintains a 2x2 array of 32x32-tile (512x512 pixels) map chunks, rotating
// them out as the screen scrolls. any given chunk will always use the same
// element of the 2x2 array:
// 010101010101
// 232323232323
// 010101010101
// 232323232323
// this way we do the minimum amount of redrawing chunks.
function _move_screen(x,y) {
  // scr[0]: even,even
  // scr[1]:  odd,even
  // scr[2]: even, odd
  // scr[3]:  odd, odd
  var tx = (x-256)>>9,  ty = (y-256)>>9;
  var ox = (x-256)&511, oy = (y-256)&511;
  for(var j=0;j<2;j++) {
    for(var i=0;i<2;i++) {
      var T = ((tx+i)&1)|(((ty+j)&1)<<1);
      //console.log("i="+i+" j="+j+" T="+T+" ox="+ox+" oy="+oy);
      if(sx[T] != tx+i || sy[T] != ty+j) {
        //console.log("rendering "+(tx+i)+","+(ty+j)+" to T"+T);
        update_screen_chunk(scr[T],tx+i,ty+j);
        sx[T] = tx+i;
        sy[T] = ty+j;
      }
      screens[T].style['left'] = (-ox+512*i) + "px";
      screens[T].style['top']  = (-oy+512*j) + "px";
    }
  }
}

// onload
window['a'] = function() {
  var t=0;
  var maptable = $('map');
  build_tile_lut();

  for(var i=0;i<4;i++) {
    screens[i] = gen_screen_chunk(scr[i]);
    maptable.appendChild(screens[i]);
  }
  var initx,inity;
  var cap=0;
  var key_tmr;

  var p = new PlayerObject(1,cur_ts(),256,256, 1,0, 0);
  var s1 = make_sprite("chars.png",16,18);
  p.updateSprite(s1,screens);
  var keys_down = [];

  var keycode_mapping = {
    37: 'L', // left
    38: 'U', // up
    39: 'R', // right
    40: 'D', // down
    87: 'U', // w
    65: 'L', // a
    83: 'D', // s
    68: 'R'  // d
  };

  var screenx=p.x+8,screeny=p.y+12;
  _move_screen(screenx,screeny);
  var sdx=0,sdy=0;

  setInterval(function() {
      var ts = cur_ts();
      p.update(ts);
      p.updateSprite(s1,screens);
      var stx = p.x+action_dx[p.a]*128+8, sty = p.y+action_dy[p.a]*128+12;
      var P = 1/32, D = -7/16;
      var ox = P*(stx-screenx) + D*sdx;
      var oy = P*(sty-screeny) + D*sdy;
      sdx += ox; sdy += oy;
      screenx = screenx + sdx; screeny = screeny + sdy;
      _move_screen(screenx, screeny);

      $('status').innerHTML = '('+p.x+","+p.y+')';
    }, 32);

  var arrow_update = function() {
    var t = cur_ts();
    if(keys_down['U']) {
      if(keys_down['L']) {
        p.setAction(t, 8); //up-left
      } else if(keys_down['R']) {
        p.setAction(t, 2); // up-right
      } else {
        p.setAction(t, 1); // up
      }
    } else if(keys_down['D']) {
      if(keys_down['L']) {
        p.setAction(t, 6); // down-left
      } else if(keys_down['R']) {
        p.setAction(t, 4); // down-right
      } else {
        p.setAction(t, 5); // down
      }
    } else if(keys_down['L']) {
      p.setAction(t, 7);
    } else if(keys_down['R']) {
      p.setAction(t, 3);
    } else {
      p.setAction(t, 0);
    }
  }

  window.onkeydown = function(e) {
    if(e.keyCode) {
      if(keycode_mapping[e.keyCode]) {
        keys_down[keycode_mapping[e.keyCode]] = 1;
        arrow_update();
      }
    }
  }
  window.onkeyup = function(e) {
    if(e.keyCode) {
      if(keycode_mapping[e.keyCode]) {
        keys_down[keycode_mapping[e.keyCode]] = 0;
        arrow_update();
      }
    }
  }
/*
  maptable.onmousedown = function(e) { cap=1; initx=e.clientX; inity=e.clientY; }
  maptable.onmouseup = function(e) { cap=0; }
  maptable.onmousemove = function(e) {
    if(cap) {
      var dx = e.clientX-initx, dy=e.clientY-inity;
      screenx-=dx; screeny-=dy;
      _move_screen(screenx, screeny);
      initx+=dx; inity+=dy;
    }
  }

      */

  /*
  setInterval(function() {
      if(pause){ return; }
      t++;
      var x = Math.cos(t/53)*600+320;
      var y = Math.sin(t/47)*600+320;
      _move_screen(x,y);
    }, 40);
  */

  /*
  var idiv = $('inputdiv');
  var inputline = document.createElement('input');
  inputline.style.width = "100%";
  inputline.onchange = cmd_input;
  inputline.onfocus = cmd_input_onfocus;
  idiv.appendChild(inputline);
  */

}

// onunload
window['b'] = function() {
}

window['t'] = function() {
  var a = $('about');
  if(a.style.visibility == 'hidden')
    a.style.visibility = 'visible';
  else a.style.visibility = 'hidden';
}

var DUP_TILES=4;

var tile_lut = [];

function build_tile_lut()
{
  var i;
  for(i=0;i<27;i++) {
    var c0=0;
    var c1=i%3 - 1;
    var c2=((i/3)|0)%3 - 1;
    var c3=((i/9)|0) - 1;
    var off = 0;
    if(c1 == -1 || c2 == -1 || c3 == -1) {
      off = -15;
      c0=1;
      c1++; c2++; c3++;
    }
    tile_lut[i] = DUP_TILES*(off+c0+c1*2+c2*4+c3*8);
  } 
}

var tile_img = document.createElement('img');
tile_img['src'] = "t.gif";

function gen_screen_chunk(scr)
{
  var canvas = document.createElement('canvas');
  canvas.width  = 512;
  canvas.height = 512;
  scr[0] = canvas.getContext('2d');
  var div = document.createElement('div');
  div.appendChild(canvas);
  div.style.width  = '512px';
  div.style.height = '512px';
  div.style.position = 'absolute';
  return div;
}

function update_screen_chunk(scr,X,Y)
{
  var chunk = get_chunk(X, Y);
  var chunkidx,idx,x,y;
  X <<= 5; Y <<= 5;

  for(var y=0,idx=0;y<32;y++) {
    for(var x=0,chunkidx=y*33;x<32;x++,chunkidx++) {
      var ul = chunk[chunkidx]|0;
      var ur = chunk[chunkidx+1]|0;
      var dl = chunk[chunkidx+33]|0;
      var dr = chunk[chunkidx+34]|0;

      var t = (ur-ul+1)+(dl-ul+1)*3+(dr-ul+1)*9;
      var charidx = ul*15*DUP_TILES + tile_lut[t] + (hash(X+x,Y+y)&(DUP_TILES-1));
      //console.log("ul "+ul+" ur "+ur+" dl "+dl+" dr "+dr+" t "+t+" lut "+tile_lut[t]+" charidx "+charidx);

      scr[0].drawImage(tile_img, 16*(charidx&15),16*(charidx>>4), 16,16, x*16,y*16, 16,16);
    }
  }
}

