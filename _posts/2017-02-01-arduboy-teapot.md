---
title: 3D Rendering on an Arduboy
layout: post
headhtml: |
  <script type="text/javascript"
      src="//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
  </script>
---
The [Arduboy](http://arduboy.com/) is a cute little credit-card sized
Arduino-compatible with a 128x64 black and white OLED screen. It has 32kb of
flash for program memory and 2560 bytes of RAM.

(N.B.: this is "reblogged" from [my post on
community.arduboy.com](http://community.arduboy.com/t/solid-3d-graphics-rendering/2753))

Over the Christmas break I put together a little demo which renders the Utah
teapot (240 faces) at >30fps on the Arduboy, with 4x4 ordered dithering.

<iframe width="640" height="360" src="https://www.youtube.com/embed/QGIxj1Yy6Vk" frameborder="0" allowfullscreen></iframe>

Source code is available [on Github](https://github.com/a1k0n/arduboy3d) as usual.

I started off just rendering an octahedron, as it was simple and the faces were
triangles instead of squares (usually I'd use a cube...). I got it working
while on the train home and posted a quick video tweet:

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Playing with an <a href="https://twitter.com/hashtag/arduboy?src=hash">#arduboy</a> on the train home, got subpixel dithered triangle renderer working <a href="https://t.co/n5oYztuSHI">pic.twitter.com/n5oYztuSHI</a></p>&mdash; Andy Sloane (@a1k0n) <a href="https://twitter.com/a1k0n/status/811755919449067520">December 22, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

And then I extended it to an icosahedron (in spaaaaace!)...
<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="en" dir="ltr"><a href="https://twitter.com/a1k0n">@a1k0n</a> now with more polygons, PWM dithered pixels, and fixed point math (no floats) <a href="https://t.co/F1P00NeDiH">pic.twitter.com/F1P00NeDiH</a></p>&mdash; Andy Sloane (@a1k0n) <a href="https://twitter.com/a1k0n/status/813530205947969536">December 26, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

...but then Kevin Bates, the Arduboy creator, pushed me to do more.

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="en" dir="ltr"><a href="https://twitter.com/a1k0n">@a1k0n</a> I downloaded this and it looks even better in person. What are the odds for a teapot? 😊</p>&mdash; Kevin Bates (@bateskecom) <a href="https://twitter.com/bateskecom/status/811903526854983680">December 22, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

That required doing a ton of optimization work, but I'm happy I persevered. In
the course of this project, I ended up creating a bespoke statistical profiler
which runs in a timer ISR and inspects the call stack, buffers it, and sends it
over the USB serial port. I'll get to that later.

Here's how it works.

## Polygon rendering
The arduboy screen is a 1024 byte array where each byte corresponds to eight
vertically arranged pixels; you can think of it as 8 horizontal "banks" of 8
pixels tall, 128 pixels wide. Here are the addresses and masks of the pixels on
the left side of the first two "banks":

![](/img/arduboy-pixelgrid.png)

To make it fast, the triangle filler works in vertical stripes (instead of the
more typical horizontal ones), and the inner loop can plot up to eight pixels
at once just by writing a byte to memory and then moving down to the next
"bank". It's no extra work to plot a dithered pattern; you just write a
different byte value for each horizontal column (0x55, 0xaa, etc for a
checkerboard).

![](/img/arduboy-trifill.gif)<br>
*slow motion triangle fill, one frame per byte written*

Another important property to making this look good is that all screen
coordinates are computed with sub-pixel accuracy (it's 4 extra subpixel bits,
so the real 128x64 screen becomes a virtual 2048x1024 one). The reason for this
is that when plotting lines or triangles, the interior pixels covered by the
triangle can change even if the vertices of the triangle map to the same
pixels. So slow rotations make subtle changes to the shape of the outline and
it really improves the overall aesthetic, which is super important at low
resolutions.

![](/img/arduboy-subpixel.gif)<br>
*left: subpixel accurate rendering; right: vertices clamped to integer coordinates*

Compromising on rendering accuracy would speed things up a bit, but I'm
unwilling to do that and I found better ways to optimize, though ultimately I
did compromise precision in 3D coordinates.

## Ordered dithering
I use the same 4x4 matrix as what's on the [wikipedia
page](https://en.wikipedia.org/wiki/Ordered_dithering), but converted into a
17-level lookup table (from pure black to 15 in-between levels to pure white).
A [few lines of
numpy](https://github.com/a1k0n/arduboy3d/blob/master/dither.py) generate this.

![](/img/arduboy-dither.gif)

## 3D math
The teapot has 137 vertices and 240 faces. Naïvely doing the rotation,
projection and backface sorting on a microcontroller stretches the frame
budget, even without rendering polygons.

The original octahedron used the AVR float library for all computations, and
that ran pretty fast, but then I got a bit more ambitious and had to switch to
fixed point math in order to render a teapot. I first did this in a
straightforward way, using a lot of 32-bit integer multiplications instead of
float multiplications.

However the profiler showed me I was basically spending all my time in the
32-bit multiply and divide routines.

The AVR has a variety of 2-cycle 8x8 -> 16 multiply instructions, and this
makes extensive use of that. It does not have any efficient way to perform
division, though, so I had to replace all division with either subtract loops
(the triangle filler does this) or fake it (the perspective projection is a
linear Taylor expansion of $$ \frac{k1}{z + k2} $$).

The first step in rendering (DrawObject if you're looking at the code) is to
create a rotation matrix; this is done with a 10-bit precision sine lookup
table (another neat trick I discovered: 1024 * (sin(x) - x) is < 256
everywhere, so a 10-bit precise sine LUT fits in 8 bits just by adding x back
on), and some 32 bit math to construct a rotation matrix once up front, and
then that matrix is quantized down to 8 bits.

The object models are also quantized down to 8 bit coordinates with a little
[python script](https://github.com/a1k0n/arduboy3d/blob/master/convertobj.py)
which takes an .obj format, rescales the model and quantizes to 8 bits, fuses
merged vertices, and also rescales / quantizes face normal vectors.  Then the
rotation is a 3x3 8-bit matrix multiplied with an 8-bit 3-vector; the AVR has a
special instruction (fmuls) which will do a 1.7 signed fixed point
multiplication which is exactly what I needed, and is available in avr-gcc as
`__builtin_avr_fmuls()`.

Then the vertices are projected with the Taylor expansion trick:
 $$ \frac{2^{20} x}{2^{10} - z} $$ is approximated as $$ x \cdot (2^{10} + z) $$ and
it's good enough for a 128x64 screen...

I still need to do 32-bit multiplications to check the face winding order
(faces that have clockwise vertices are facing away from the camera, so are not
rendered), since the vertices are 16-bits in precision: both because the
subpixel screen grid is 2048x1024 but also because some vertices might be
off-screen, and we still want to correctly clip the triangles if they are.

## Face sorting
The teapot is not a convex object; if you render it without allowing for this,
the knob at the top, the handle, or the spout will show through the object like
a ghost, unless you either z-buffer (HA! too slow, not enough memory anyway) or
draw the faces back-to-front.

I actually implemented a heap sort to do this, which worked perfectly on my
computer but would crash on the AVR. Turns out, I'm completely out of memory.
Between the frame buffer (1024 bytes), projected vertices (137\*2\*2 = 548
bytes), stack and other globals, I definitely don't have another 377 bytes left
(137 z coordinates, 240 face orders) to dynamically sort.

Instead, I pre-sort the faces, as I'm not hurting for flash space. The model
comes with the faces "baked in" sorted by +x, and also has auxiliary face
orders sorted by y and z. At runtime, I figure out which axis is most facing
toward (or away from) the camera, choose the face order from the lookup table
(reversed if necessary), and render in that order. It's close enough.

## Profiling on Arduboy
I was surprised to find there's no real decent arduino profiler option.

I ended up hacking together something ugly; I have to manually count the number
of 'push' instructions in the generated assembly to figure out where the return
address on the stack is to get it to work, but once it is working it sends a
stream of sampled addresses over the USB port. It also walks the stack a bit
and probes the flash for anything that points to a CALL instruction; so that
if, for instance, the avr-gcc multiply routine is interrupted, it can find the
function which called it and attribute the sample to that function as well.

There is an auxiliary python scripts which collect the data from USB and save
the histogram out, and another one to annotate the disassembly with the
histogram.

It's not great, but it's really really useful.

## Future work
The Arduboy is a really constrained platform -- 128x64 black and white
graphics, only 2560 bytes of RAM, no dedicated graphics hardware -- which is
somewhat mitigated, compared to true retro platforms, by having a 16MHz CPU.
Just because of the resolution I don't think we'll see much 3D on it, but it
was fun to get it to work anyway.
