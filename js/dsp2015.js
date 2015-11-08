window.onload = function() {
  var c1 = document.getElementById("c1");
  var ctx = c1.getContext('2d');
  ctx.strokeStyle = '#111';
  ctx.arc(150, 150, 120, 0, 2*Math.PI);
  ctx.moveTo(0, 150.5);
  ctx.lineTo(300, 150.5);
  ctx.moveTo(150.5, 0);
  ctx.lineTo(150.5, 300);
  ctx.stroke();
  console.log("fooey");
};
