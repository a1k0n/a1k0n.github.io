// Kingdoms of Camelot auto-farming user script
//
//         0.2.4: farm with all knights, not just one of them.  assumes you have enough troops.
//         0.2.3: bugfixes
//         0.2.2: oops!  don't attack players@!  also, fix bug unit counting bug
//         0.2.1: level 5 only now
// version 0.2.0: fetch map tiles to find nearest barbarians rather than using bookmarks
// version 0.1.3: initial auto-farmer thing; barbarian level 4 only
// 
// ==UserScript==
// @name        KOC Auto-farm v0.2.4
// @namespace   http://a1k0n.net/
// @description Auto-attacks barbarians in your bookmarked locations once an hour
// @include     http://*.kingdomsofcamelot.com/*/main_src.php*
// ==/UserScript==

// this isn't already a javascript primitive?
function encode_form(t) {
  var poop = [];
  for(var k in t) {
    poop.push(encodeURIComponent(k) + '=' + encodeURIComponent(t[k]));
  }
  return poop.join('&');
}

function farming_knight(currentcityid, min_lvl) {
  var seed = unsafeWindow.seed;
  var knights = seed.knights["city" + currentcityid];
  var knt, kntid;
  var e = unsafeWindow.Object.keys(knights);
  for (var j = 0; j < e.length; j++) {
    var f = parseInt(e[j].split("knt")[1]);
    // this terrible code stolen from the KoC source
    if (f != parseInt(seed.leaders["city" + currentcityid].resourcefulnessKnightId) && f != parseInt(seed.leaders["city" + currentcityid].intelligenceKnightId) && f != parseInt(seed.leaders["city" + currentcityid].combatKnightId) && f != parseInt(seed.leaders["city" + currentcityid].politicsKnightId)) {

      if(knights[e[j]].combat <= min_lvl)
        continue;
      if(knights[e[j]].knightStatus != 1)
        continue;

      if(!knt || knt.combat > knights[e[j]].combat) {
        knt = knights[e[j]];
        kntid = f;
      }
    }
  }
  return kntid;
}

/* deprecated for now
function is_busy(currentcityid, kntid) {
  var seed = unsafeWindow.seed;
  var knights = seed.knights["city" + currentcityid];
  return (0|knights["knt" + kntid].knightStatus != 1);
}
*/

// this is GM_xmlhttpRequest, except it works.
function xhr(d) {
  var x = new XMLHttpRequest();
  x.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) { d.onload(this); }
    else if(this.readyState == 4) { d.onerror(this); }
  };
  x.open(d.method, d.url);
  for(h in d.headers) { x.setRequestHeader(h, d.headers[h]); }
  return x.send(d.data);
}

var _farm_busy = false;
function farm(cityid,kid,x,y) {
  // find lowest-level combat knight, designate as farming knight
  // if there is current troop activity with our designated farming knight, set
  // timer until it is expected to complete
  //
  // find whichever ones haven't been farmed recently
  // if all have been farmed recently, set a timer for one hour past the least-recently-farmed
  //
  // issue march order with 16000 archers, 20 supply wagons; set timer a few seconds in the future
  if(_farm_busy) return false;
  var seed = unsafeWindow.seed;
  var params = unsafeWindow.Object.clone(unsafeWindow.g_ajaxparams);
  params.cid = cityid;
  params.type = 4;
  params.kid = kid;
  params.xcoord = x;
  params.ycoord = y;
  var unitsarr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var resources = [0,0,0,0,0];
  unitsarr[6] = 16000; // 16000 archers
  unitsarr[9] = 20;    // 20 supply wagons
  for(var i=1;i<5;i++) { params["r"+i] = 0; }
  for(var i=0;i<unitsarr.length;i++) { if(unitsarr[i]>0) params["u"+i] = unitsarr[i]; }
  params.gold = 0;
  console.info("attacking " + x + "," + y + " from city " + cityid + " with knight " + kid);
  _farm_busy = true;
  xhr({
      url: unsafeWindow.g_ajaxpath + "ajax/march.php" + unsafeWindow.g_ajaxsuffix,
      method: "POST",
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: encode_form(params),
      onload: function (transport) {
        _farm_busy = false;
        var rslt = eval("(" + transport.responseText + ")");
        if (rslt.ok) {
          for (var i=0; i<unitsarr.length; i++) {
            if(unitsarr[i] > 0)
              seed.units["city" + cityid]["unt"+i] -= unitsarr[i];
          }
          seed.knights["city" + cityid]["knt" + kid].knightStatus = 10
          var timediff = parseInt(rslt.eta) - parseInt(rslt.initTS);
          var ut = unsafeWindow.unixtime();
          console.info("eta: " + unsafeWindow.timestr(timediff) + " initTS " + rslt.initTS + " now " + ut);
          unsafeWindow.attack_addqueue(rslt.marchId, ut, ut + timediff, params.xcoord, params.ycoord, 
            unitsarr, params.type, params.kid, resources, rslt.tileId, rslt.tileType, rslt.tileLevel);
        } else {
          console.warn(rslt.msg);
        }
        unsafeWindow.setTimeout(unsafeWindow.update_seed_ajax, 1000);
      },
      onerror: function (e) {
        _farm_busy = false;
        console.warn("ajax/march.php onFailure?!" + e.statusText);
      }
    });
  return true;
}

var barbs = [];
function get_bookmarks(cb) {
  var params = unsafeWindow.Object.clone(unsafeWindow.g_ajaxparams);
  params.requestType = "GET_BOOKMARK_INFO";
  var data = encode_form(params);
  xhr({
      url: unsafeWindow.g_ajaxpath + "ajax/tileBookmark.php" + unsafeWindow.g_ajaxsuffix,
      method: "POST",
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Accept': 'text/javascript',
      },
      data: data,
      onload: function (message) {
        var result = eval("(" + message.responseText + ")");
        if (result.ok) {
          var bookmarkInfo = result.bookmarkInfo;
          for (id in bookmarkInfo) {
            if( bookmarkInfo[id].name == "Barbarian Camp" ) {
              var x = bookmarkInfo[id].xCoord, y = bookmarkInfo[id].yCoord;
              console.info("bookmark " + id + ": " + bookmarkInfo[id].name + "@ " + x + "," + y);
              barbs.push([x+","+y, x,y]);
            }
          }
          return cb();
        }
      },
      onerror: function (resp) { console.warn(resp.statusText); }
    });
}

var last_farmed = {};

function get_available_barb(t) {
  for(var i=0;i<barbs.length;i++) {
    var b = barbs[i];
    if(!last_farmed[b[0]] || (t - last_farmed[b[0]]) > 3600) {
      return b;
    }
  }
}

var run_timer;
function farm_all() {
  run_timer = setTimeout(farm_all, 1000*10);

  var seed = unsafeWindow.seed;
  var cid = unsafeWindow.currentcityid;
  var knt = farming_knight(cid, 61);
  if(!knt)
    return;

  var t = unsafeWindow.unixtime();
  var b = get_available_barb(t);
  if(!b)
    return;
  last_farmed[b[0]] = t;
  farm(cid,knt, b[1], b[2]);
}

function fetch_tiles(x,y,radius,type,level,cb) {
  var blocks = [];
  var found = [];
  x = (x-x%5);
  y = (y-y%5);
  function b(x,y) { blocks.push("bl_"+x+"_bt_"+y); }
  for(var i=-radius*5;i<=radius*5;i+=5) {
    b(x+i,y-radius*5);
    if(radius>0)
      b(x+i,y+radius*5);
  }
  for(var i=-radius*5+5;i<=radius*5-5;i+=5) {
    b(x-radius*5,y+i);
    b(x+radius*5,y+i);
  }
  console.info("fetching "+radius+"-tile radius around "+x+","+y);
  var params = unsafeWindow.Object.clone(unsafeWindow.g_ajaxparams);
  params.blocks = blocks.join(',');
  xhr({
      url: unsafeWindow.g_ajaxpath + "ajax/fetchMapTiles.php" + unsafeWindow.g_ajaxsuffix,
      method: "POST",
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Accept': 'text/javascript',
      },
      data: encode_form(params),
      onload: function (message) {
        var result = eval("(" + message.responseText + ")");
        if (result.ok) {
          var n = 0;
          for(var i in result.data) {
            var t = result.data[i];
            n++;
            if(t.tileType == type && t.tileLevel == level && !t.tileCityId) {
              found.push(t);
              console.info("found lvl "+level+" type "+type+ " @ " + t.xCoord + "," + t.yCoord);
            }
          }
          console.info(n+" locations scanned");
          cb(found);
        }
      },
      onerror: function (resp) { console.warn(resp.statusText); }
    });
}

function scan_barbs(level, num, cont) {
  var radius = 0;
  var barbs = [];
  var city = unsafeWindow.seed.cities[0];
  var x = city[2], y = city[3];
  function dist(t) {
    return (t.xCoord - x)*(t.xCoord - x) + (t.yCoord - y)*(t.yCoord - y);
  }
  function cb(t) {
    for(var i=0;i<t.length;i++) barbs.push(t[i]);
    if(barbs.length >= num) {
      barbs.sort(function(a,b) { return dist(a) - dist(b); });
      console.info("Found " + barbs.length + " closest barbarians:");
      for(i=0;i<barbs.length;i++) console.info(barbs[i].xCoord + "," + barbs[i].yCoord + " dist " + Math.sqrt(dist(barbs[i])));
      return cont(barbs);
    }
    radius++;
    fetch_tiles(x,y,radius,51,level, cb);
  };
  fetch_tiles(x,y,radius,51,level, cb);
}

function start() {
  //get_bookmarks(function() { if(run_timer == undefined) run_timer = setTimeout(farm_all, 10); });
  scan_barbs(5, 25, function(b) {
      barbs = [];
      for(var i=0;i<b.length;i++) {
        var x=b[i].xCoord, y=b[i].yCoord;
        barbs.push([x+","+y, x,y]);
      }
      if(run_timer == undefined)
        run_timer = setTimeout(farm_all, 10);
    });
}

function stop() {
  if(run_timer != undefined) {
    clearTimeout(run_timer);
    run_timer = undefined;
  }
}

GM_registerMenuCommand("Start auto-farming", start);
GM_registerMenuCommand("Stop auto-farming", stop);

unsafeWindow.farm = farm;
unsafeWindow.farming_knight = farming_knight;
unsafeWindow.farm_all = farm_all;
unsafeWindow.get_bookmarks = get_bookmarks;
unsafeWindow.barbs = barbs;
unsafeWindow.get_available_barb = get_available_barb;
unsafeWindow.last_farmed = last_farmed;
unsafeWindow.farm_start = start;
unsafeWindow.farm_stop = stop;

// send alerts to console instead of interrupting our operation
unsafeWindow.alert = console.warn;

