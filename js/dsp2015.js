// makeshift complex exponential
function cexp(x) {
  var r = Math.exp(x[0]);
  var s = Math.cos(x[1]);
  var c = Math.sin(x[1]);
  return [r*c, r*s];
}

var poles = [
  [-0.707, 0.707],
];

poles[0] = cexp(poles[0]);

var zcircle_x = 160;
var zcircle_y = 150;
var zcircle_radius = 120;

function RedrawZ(elem) {
  var ctx = elem.getContext('2d');
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
    var y = zcircle_radius * poles[i][1] + zcircle_y;
    ctx.moveTo(x - 3, y - 3);
    ctx.lineTo(x + 3, y + 3);
    ctx.moveTo(x + 3, y - 3);
    ctx.lineTo(x - 3, y + 3);
    // draw complex conjugate also
    var y = -zcircle_radius * poles[i][1] + zcircle_y;
    ctx.moveTo(x - 3, y - 3);
    ctx.lineTo(x + 3, y + 3);
    ctx.moveTo(x + 3, y - 3);
    ctx.lineTo(x - 3, y + 3);
  }
  ctx.stroke();
}

var dragging_pole = undefined;
window.onload = function() {
  var c1 = document.getElementById("c1");
  c1.onmousedown = function(e) {
    e = e || window.event;

    var target = e.target || e.srcElement,
          rect = target.getBoundingClientRect(),
       offsetX = e.clientX - rect.left,
       offsetY = e.clientY - rect.top;

    dragging_pole = undefined;
    for (var i = 0; i < poles.length; i++) {
      var x = zcircle_radius * poles[i][0] + zcircle_x;
      var y = zcircle_radius * poles[i][1] + zcircle_y;
      var d2 = (x - offsetX)*(x - offsetX) + (y - offsetY)*(y - offsetY);
      if (d2 <= 16) {
        dragging_pole = i;
      }
    }
  }
  c1.onmouseup = function(e) {
    dragging_pole = undefined;
  }

  c1.onmousemove = function(e) {
    if (dragging_pole) {
      e = e || window.event;

      var target = e.target || e.srcElement,
      rect = target.getBoundingClientRect(),
      offsetX = e.clientX - rect.left,
      offsetY = e.clientY - rect.top;
      var x = (offsetX - zcircle_x) / zcircle_radius;
      var y = (offsetY - zcircle_y) / zcircle_radius;
      // poles[dragging_pole]
    }
  }
  RedrawZ(c1);
};
