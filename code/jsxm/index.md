---
layout: page
title: Javascript XM Player
headhtml: |
  <title>js xm</title>
  <script src="xmeffects.js"></script>
  <script src="xm.js"></script>
  <script src="trackview.js"></script>
  <script src="shell.js"></script>
  <script src="http://a1k0n-pub.s3-website-us-west-1.amazonaws.com/xm/xmlist.js"></script>
  <style>
    .centered {
      display: block;
      margin-left: auto;
      margin-right: auto;
    }

    #filelist a { color: #fff; }

    .playercontainer {
      background:#000;
    }

    .draghover {
      background:#000;
      opacity: 0.5;
    }

    .hscroll {
      overflow: auto;
      margin-bottom: 14px;
    }

    .hscroll::-webkit-scrollbar {
        -webkit-appearance: none;
    }

    .hscroll::-webkit-scrollbar:horizontal {
        height: 11px;
    }

    .hscroll::-webkit-scrollbar-thumb {
        border-radius: 2px;
        border: 1px solid #93C3E9; /* should match background, can't be transparent */
        background-color: #A0D4FD;
    }

    .hscroll::-webkit-scrollbar-track { 
        background-color: #333; 
        border-radius: 8px; 
    } 

  </style>
---
  <div id="playercontainer" class="playercontainer" ondrop="XMPlayer.handleDrop(event)" ondragover="XMPlayer.allowDrop(event)" ondragleave="XMPlayer.allowDrop(event)">
    <div><canvas class="centered" id='title' width="640" height="22"></canvas></div>
    <div class="hscroll">
      <div><canvas class="centered" id='vu' width="224" height="64"></canvas></div>
      <div><canvas class="centered" id='gfxpattern' width="640" height="200"></canvas></div>
    </div>
    <div id='instruments'></div>
    <div>
      <p style="text-align: center">
        <button id="playpause" disabled="true" style="width: 100px; background: #ccc;">Play</button>
        <button id="loadbutton" style="width: 100px; background: #ccc">Load</button>
      </p>
    </div>
    <div style="display: none" id='filelist'></div>
  </div>

Drag .xm files onto the window above to load them, or use the load button to
load a small selection of .xms. A longer explanation is on [my
blog](/2015/11/09/javascript-ft2-player.html).

code: <a href="http://github.com/a1k0n/jsxm/">github.com/a1k0n/jsxm</a>

todo:

 - missing XM effects:
   - E3x, E4x, E5x, E6x, E7x, E9x, EDx, EEx
   - 7xy - tremolo
   - Gxx, Hxy, Kxx, Lxx, Pxy, Txy
 - render pattern with the wider fonts for fewer channels

