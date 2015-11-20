// makeshift complex exponential
function cexp(x) {
  var r = Math.exp(x[0]);
  var c = Math.cos(x[1]);
  var s = Math.sin(x[1]);
  return [r*c, r*s];
}

var poles = [
  [-0.707, 0.707],
  [-0.707, -0.707],
];

poles[0] = cexp(poles[0]);
poles[1] = cexp(poles[1]);

var zcircle_x = 160;
var zcircle_y = 150;
var zcircle_radius = 120;

// magnitude of transfer function at z
function transferMag(z) {
  var h = 1.0;
  for (var i = 0; i < poles.length; i++) {
    var dr = z[0] - poles[i][0],
      di = z[1] - poles[i][1];
    h /= dr*dr + di*di;
  }
  return Math.sqrt(h);
}

function redrawZ(elem) {
  var ctx = elem.getContext('2d');
  ctx.clearRect(0, 0, elem.width, elem.height);
  ctx.strokeStyle = '#111';
  ctx.beginPath();
  ctx.arc(zcircle_x, zcircle_y, zcircle_radius, 0, 2*Math.PI);

  // draw x axis
  ctx.moveTo(0, 0.5 + zcircle_y);
  ctx.lineTo(300, 0.5 + zcircle_y);

  // y axis
  ctx.moveTo(0.5 + zcircle_x, 0);
  ctx.lineTo(0.5 + zcircle_x, 300);
  for (var i = 0; i < poles.length; i++) {
    var x = zcircle_radius * poles[i][0] + zcircle_x;
    var y = -zcircle_radius * poles[i][1] + zcircle_y;
    ctx.moveTo(x - 3, y - 3);
    ctx.lineTo(x + 3, y + 3);
    ctx.moveTo(x + 3, y - 3);
    ctx.lineTo(x - 3, y + 3);
  }
  ctx.stroke();

  // now draw frequency response
  var gain = 1.0/transferMag([1.0, 0]);
  ctx.moveTo(350, 100);
  ctx.lineTo(550, 100);

  ctx.moveTo(350, 150);
  ctx.lineTo(550, 150);

  ctx.moveTo(350, 200);
  ctx.lineTo(550, 200);

  ctx.moveTo(350, 100);
  // linear plot
  for (i = 0; i <= 200; i++) {
    var z = cexp([0, Math.PI * i / 200.0]);
    var g = gain * transferMag(z);
    ctx.lineTo(350 + i, 200 - 100*g);
  }
  /*
  // bode plot
  // freq from "10Hz" to "22kHz", assuming 44kHz sampling rate
  var f0 = 10.0 / 44100.0;
  var l0 = Math.log(f0);
  var l1 = Math.log(0.5);
  for (i = 0; i <= 200; i++) {
    var f = Math.exp(i * (l1 - l0) / 200.0 + l0);
    var z = cexp([0, Math.PI * 2 * f]);
    var y = 10*Math.log10(gain * transferMag(z));
    ctx.lineTo(350 + i, 100 - 2*y);
  }
  */

  // impulse response
  ctx.moveTo(350, 250);
  var y1 = 0, y2 = 0;
  // assume two conjugate poles for now
  // h(z) = y(z)/x(z) = 1/[(z-p)(z-p*)]
  // = 1/(1 - 2Re[p]z^-1 + pp* z^-2)
  // y(z) = x(z) + y(z)[2Re[p]z^-1 - pp* z^-2]
  var x = gain;
  var a = 2*poles[0][0];
  var b = poles[0][0]*poles[0][0] + poles[0][1]*poles[0][1];
  for (i = 0; i <= 100; i++) {
    var z = cexp([0, Math.PI * i / 200.0]);
    var g = gain * transferMag(z);
    var y = x + a*y1 - b*y2;
    ctx.lineTo(350 + 2*i, 250 - 50*y);
    x = 0;
    y2 = y1;
    y1 = y;
  }

  ctx.stroke();
}

function findPole(offsetX, offsetY) {
  for (var i = 0; i < poles.length; i++) {
    var x = zcircle_radius * poles[i][0] + zcircle_x;
    var y = -zcircle_radius * poles[i][1] + zcircle_y;
    var d2 = (x - offsetX)*(x - offsetX) + (y - offsetY)*(y - offsetY);
    if (d2 <= 16) {
      console.log("found pole", i, "@", offsetX, offsetY, "/", x, y);
      return i;
    }
  }
  console.log("no pole @", offsetX, offsetY);
}

var dragging_pole, drag_x0, drag_y0;
window.onload = function() {
  var c1 = document.getElementById("c1");
  c1.onmousedown = function(e) {
    e = e || window.event;

    var target = e.target || e.srcElement,
          rect = target.getBoundingClientRect(),
       offsetX = e.clientX - rect.left,
       offsetY = e.clientY - rect.top;

    dragging_pole = findPole(offsetX, offsetY);
    if (dragging_pole !== undefined) {
      e.preventDefault();
      drag_x0 = offsetX;
      drag_y0 = offsetY;
    }
  };
  c1.onmouseup = function(e) {
    dragging_pole = undefined;
  };

  c1.onmousemove = function(e) {
    if (dragging_pole !== undefined) {
      e = e || window.event;

      var target = e.target || e.srcElement,
            rect = target.getBoundingClientRect(),
         offsetX = e.clientX - rect.left,
         offsetY = e.clientY - rect.top;
      var dx = offsetX - drag_x0;
      var dy = offsetY - drag_y0;
      var p = poles[dragging_pole];
      p[0] += dx / zcircle_radius;
      p[1] -= dy / zcircle_radius;
      // auto-update the complex conjugate
      var pstar = poles[dragging_pole ^ 1];
      pstar[0] = p[0];
      pstar[1] = -p[1];
      drag_x0 = offsetX;
      drag_y0 = offsetY;
      redrawZ(c1);
    }
  };
  redrawZ(c1);
};
