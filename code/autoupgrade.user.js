// Kingdoms of Camelot auto-building user script
//
// version 0.4: now levies to raise gold every time happiness reaches 100%
// again (so every two hours or so).  this means the gold rate is
// 5*maxpopulation/hour, rather than using taxes which gives you
// 0.25*maxpop/hour.  20X more gold.  not too shabby.
// 
// ==UserScript==
// @name        KOC Auto-build v0.4.2
// @namespace   http://a1k0n.net/
// @description Auto-upgrades buildings in Kingdoms of Camelot
// @include     http://*.kingdomsofcamelot.com/*/main_src.php*
// ==/UserScript==

function possible_upgrades() {
  var seed = unsafeWindow.seed;
  var currentcityid = unsafeWindow.currentcityid;
  var bldgs = seed.buildings["city" + currentcityid];
  var builds = [];

  var barracks;

  for(var bid in bldgs) {
    var o = bldgs[bid];
    if(typeof(o) == "function") continue;
    var citpos = bid.substring(3);
    var bdgtype = o[0];
    var curlvl = parseInt(o[1]);
    if(curlvl == 9) continue;
    var nxtlvl = curlvl + 1;
    var desc = unsafeWindow.buildingcost["bdg" + bdgtype][0] + " lv " + nxtlvl;
    var e = Math.pow(2, curlvl);

    /*
    if(bdgtype == 13) {
      if(barracks) continue; // only upgrade the first barracks; additional ones aren't worth upgrading
      barracks = bid;
    }
    */

    // check requirements
    var n = true;
    var reqs = unsafeWindow.checkreq("bdg", bdgtype, nxtlvl);
    for (var q = 0; q < reqs[0].length; q++) {
      if (reqs[3][q] == 0) {
        n = false;
      }
    }
    if(!n) continue;

    // calculate build time
    var d = seed.knights["city" + currentcityid];
    var p = 0;
    if (d) {
      d = d["knt" + seed.leaders["city" + currentcityid].politicsKnightId];
      if (d) {
        p = parseInt(d.politics);
        if ((parseInt(d.politicsBoostExpireUnixtime) - unsafeWindow.unixtime()) > 0) {
          p = parseInt(p * 1.25)
        }
      }
    }
    var buildtime = unsafeWindow.buildingcost["bdg" + bdgtype][7] * e;
    if (parseInt(bdgtype) < 6 && parseInt(bdgtype) > 0 && e == 1) {
      buildtime = 15
    }
    buildtime = parseInt(buildtime / (1 + 0.005 * p + 0.1 * parseInt(seed.tech.tch16)));

    // prioritize based on build time for now, and give a bonus to resource builds
    var prio = buildtime;
    if (parseInt(bdgtype) < 6 && parseInt(bdgtype) > 0) {
      prio -= 900; // subtract for resource upgrades
      // we really need to do this better
    }
    builds.push([bdgtype, curlvl, citpos, buildtime, desc, prio]);
  }

  // sort by priority
  builds.sort(function(a,b) { return a[5] - b[5] });

  return builds;
}

function possible_research() {
  var seed = unsafeWindow.seed;
  var currentcityid = unsafeWindow.currentcityid;
  var rsc = [];

  var h = unsafeWindow.Object.keys(unsafeWindow.techcost);
  for (var q = 0; q < h.length; q++) {
    var o = unsafeWindow.techcost[h[q]];
    var techid = parseInt(h[q].split("tch")[1]);
    var curlvl = parseInt(seed.tech[h[q]]);
    var w = unsafeWindow.checkreq("tch", techid, curlvl+1);
    var desc = o[0] + " lvl " + (curlvl+1);
    if(curlvl == 9) continue;
    var n = true;
    for (var p = 0; p < w[0].length; p++) {
      if (w[3][p] == 0) n = false;
    }
    if(!n) continue;

    var r = 0;
    var d = seed.knights["city" + currentcityid];
    if (d) {
      d = d["knt" + seed.leaders["city" + currentcityid].intelligenceKnightId];
      if (d) {
        r = parseInt(d.intelligence);
        r = ((parseInt(d.intelligenceBoostExpireUnixtime) - unsafeWindow.unixtime()) > 0) ? (r * 1.25) : r
      }
    }
    var e = Math.pow(2, parseInt(seed.tech[h[q]]));
    var researchtime = parseInt(o[7] * e * (1 / (1 + 0.005 * r)));

    // just order these by research time for now; maybe we can prioritize later
    var prio = researchtime;
    if(techid == 13) {
      // always upgrade fletching until we can't anymore as it's vital to our
      // success
      prio = 0;
    }

    rsc.push([techid, curlvl+1, researchtime, desc, prio]);
  }

  rsc.sort(function(a,b) { return a[4] - b[4] });

  return rsc;
}

function levy_gold(cid) {
  var params = unsafeWindow.Object.clone(unsafeWindow.g_ajaxparams);
  params.cid = cid;
  new unsafeWindow.Ajax.Request(unsafeWindow.g_ajaxpath + "ajax/levyGold.php" + unsafeWindow.g_ajaxsuffix, {
    method: "post",
    parameters: params,
    onSuccess: function (transport) {
      unsafeWindow.setTimeout(unsafeWindow.update_seed_ajax, 1000);
      //var rslt = unsafeWindow.eval("(" + transport.responseText + ")");
      //if (rslt.ok) {
      //  if (rslt.updateSeed) {
      //    unsafeWindow.update_seed(rslt.updateSeed)
      //  }
      //}
    },
    onFailure: function () {}
  })
}

var run_timer;

function fill_queues() {
  var seed = unsafeWindow.seed;
  var currentcityid = unsafeWindow.currentcityid;
  var citystats = seed.citystats["city" + currentcityid];

  // can we build something?
  var q = seed.queue_con["city" + currentcityid];
  var next_event_time = 60; // poll every minute at a minimum
  if(q.length == 0) {
    var next_builds = possible_upgrades();
    if(next_builds.length > 0) {
      var b = next_builds[0]; // [bdgtype, curlvl, citpos, buildtime, desc, prio]
      unsafeWindow.buildaction(b[0], b[1], b[2], 0);

      var wait = b[3] + 3;  // wait three extra seconds
      next_event_time = Math.min(next_event_time, wait);
    }
  } else {
    var wait = q[0][4]+3 - unsafeWindow.unixtime();
    next_event_time = Math.min(next_event_time, wait);
  }
  
  q = seed.queue_tch["city" + currentcityid];
  if(q.length == 0) {
    var next_research = possible_research();
    if(next_research.length > 0) {
      var r = next_research[0]; //[techid, curlvl+1, researchtime, desc, prio];
      unsafeWindow.upg_tch(r[0], r[1], 0);

      var wait = r[2] + 3;
      next_event_time = Math.min(next_event_time, wait);
    }
  } else {
    var wait = q[0][3]+3 - unsafeWindow.unixtime();
    next_event_time = Math.min(next_event_time, wait);
  }

  // can we levy some gold?
  if(citystats.pop[2] == 100) {
    citystats.gold[0] += citystats.pop[0]*10;
    citystats.pop[2] -= 20;
    //levy_gold(currentcityid);
    unsafeWindow.modal_raise_gold();
  }

  run_timer = setTimeout(fill_queues, 1000*(next_event_time || 1));
}

function start() {
  if(run_timer == undefined)
    fill_queues();
}

function stop() {
  if(run_timer != undefined) {
    clearTimeout(run_timer);
    run_timer = undefined;
  }
}

GM_registerMenuCommand("Start auto-upgrading", start, "a", "shift alt", "s");
GM_registerMenuCommand("Stop auto-upgrading", stop, "b", "shift alt", "o");

unsafeWindow.autobuild_start = start;
unsafeWindow.autobuild_stop = stop;
unsafeWindow.autobuild_fill_queues = fill_queues;
unsafeWindow.possible_upgrades = possible_upgrades;
unsafeWindow.possible_research = possible_research;
unsafeWindow.levy_gold = levy_gold;

// send alerts to console instead of interrupting our operation
unsafeWindow.alert = console.warn;

