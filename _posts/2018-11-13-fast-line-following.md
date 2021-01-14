---
title: Fast line-following robots
layout: post
headhtml: |
  <script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
  <script type="text/javascript" src="/js/steering.js"></script>
---
Since February 2016, I have been participating in
[DIYRobocars](https://diyrobocars.com/) meetups here in the SF Bay Area,
wherein a bunch of amateur roboticists compete in autonomous time trials with
RC cars.  I had been doing very well in the competition with essentially just a
glorified line-following robot, but have lately upgraded to a full SLAM-like
approach with a planned trajectory.

In this series of posts I will try to brain-dump everything I've learned in the
last two years, and explain how my car works.

Here's a race between my car and
[@otaviogood](https://twitter.com/otaviogood/)'s
[Carputer](https://github.com/otaviogood/carputer), which uses an end-to-end
behavioral cloning neural network to drive. It had to dodge a lot of other
cars in training that day, which we think is why it sort of chokes when my car
cuts it off. My car is completely oblivious to other cars; the wheel-to-wheel
race here was just for fun.

<iframe width="560" height="315" src="https://www.youtube.com/embed/yT4iM6wx5DY" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

In the video above you can see everything the car can see/sense: a birds-eye
view of the ground, gyroscope, accelerometer, and wheel velocity measurements.

Here's a more recent video showing the current state of the same car, using a
slightly different but still fundamentally line-following strategy (instead of
following the line on the ground, it's following a pre-optimized racing line):

<iframe width="560" height="315" src="https://www.youtube.com/embed/4Tsqox6Ziec" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Line-following theory

Imagine you are a line following robot. Your mission is to move forward and
keep the line in the middle of your sensors (maybe they're IR sensors looking
at the ground, maybe it's a camera). The line can go straight or it can turn,
and so can you. As far as you're concerned, the world consists of only you and
the line, so we need to think about your position in space relative to the
line.

### Curvilinear coordinates

A line-following robot lives in a *curvilinear* coordinate system: all
measurements of position are relative to a line which has some (probably
varying) curvature. Therefore instead of saying the robot has an *x*, *y*
position and maybe an angle *&theta;*, I try to follow the notation I've seen
in the robotics / automotive control literature.

<img src="/img/curvilinear1.svg" />

We assume that the car is traveling along a circle with curvature *&kappa;*,
which is equivalent to 1/radius *r*, except it can be either positive or
negative -- in the convention I'm using, if it's positive, the circle curves to
the left and negative curvature goes right (if this seems backwards, think
about how angles conventionally run counterclockwise on the plane, as in (*x*, *y*)
= (cos *&theta;*, sin *&theta;*)). 0 curvature of course means a perfectly straight
line.

At the point on the track centerline closest to the car's position, the forward
direction is called *x* and the direction toward the left is *y*.  (Again if
*y* seems backwards, it's because of the right-hand rule given that *x* goes
forwards.  Why is *x* forwards? Not really sure, that's just how they tend to
do it.)

The distance from the car to the nearest point on the center line is called
*y<sub>e</sub>*, which is positive if the car is on the left side of the
center, negative on the right. The heading angle of the car with respect to the
centerline is denoted *&Psi;<sub>e</sub>*, which increases as the car turns
counterclockwise with respect to the centerline.

### Control strategies

The most obvious thing to do is to ignore everything but *y<sub>e</sub>* -- if
the line is on the left, then turn left, and if it's on the right, turn right.
That'll get you started, but it will wander back and forth and won't work at
all when you crank up the speed. Here's a little simulation:

#### Pure Proportional Control
<div class="container-fluid">
<canvas class="linefollower control-p" width="400" height="200"></canvas>
</div>
<fieldset>
<div>
  <label for="Kp">Kp</label><input type="range" name="Kp" min="0.1" max="3" value="1" step="0.1" class="control-p" style="width: 90%; float: right; margin: auto;">
</div>
<div>
  <label for="v">v</label><input type="range" name="v" min="0.1" max="3" value="1" step="0.1" class="control-p" style="width: 90%; float: right; margin: auto;">
</div>
</fieldset>
control: $$ \kappa' = -K_p y_e $$

This is the <a href="https://twitter.com/a1k0n/status/845839637205594114">first
thing I tried</a>, and is about as far as many people get when making
line-following robots. But there's a simple tweak that makes it work much
better, if you can determine not just the distance to the centerline but also
the relative angle of the line *&Psi;<sub>e</sub>*.

#### Pure Proportional-Differential Control

We need a way to damp out those oscillations, and the classical way to do that
is to add a derivative feedback term. We could either numerically differentiate
our *y<sub>e</sub>* error from the last frame, or we could use the sine of the
angle between our heading and our centerline, which is pretty much equivalent
(except it doesn't depend on velocity).

<div class="container-fluid">
<canvas class="linefollower control-pd" width="400" height="200"></canvas>
</div>
<fieldset>
<div>
  <label for="Kp">Kp</label><input type="range" name="Kp" min="0.1" max="3" value="1" step="0.1" class="control-pd" style="width: 90%; float: right; margin: auto;">
</div>
<div>
  <label for="Kd">Kd</label><input type="range" name="Kd" min="0.1" max="10" value="1" step="0.1" class="control-pd" style="width: 90%; float: right; margin: auto;">
</div>
<div>
  <label for="v">v</label><input type="range" name="v" min="0.1" max="10" value="1" step="0.1" class="control-pd" style="width: 90%; float: right; margin: auto;">
</div>
</fieldset>
control: $$ \kappa' = -K_p (y_e + K_d \sin \psi_e) $$

That's a lot better, isn't it? Only it tends to get "surprised" when there's a
turn, and it will always overshoot. If we know the curvature of the path we're
following, we can just add that in to our control signal.

#### Curvature-aware Proportional-Differential Control

<div class="container-fluid">
<canvas class="linefollower control-pdk" width="400" height="200"></canvas>
</div>
<fieldset>
<div>
  <label for="Kp">Kp</label><input type="range" name="Kp" min="0.1" max="3" value="1" step="0.1" class="control-pdk" style="width: 90%; float: right; margin: auto;">
</div>
<div>
  <label for="Kd">Kd</label><input type="range" name="Kd" min="0.1" max="10" value="1" step="0.1" class="control-pdk" style="width: 90%; float: right; margin: auto;">
</div>
<div>
  <label for="v">v</label><input type="range" name="v" min="0.1" max="10" value="1" step="0.1" class="control-pdk" style="width: 90%; float: right; margin: auto;">
</div>
</fieldset>
control: $$ \kappa' = -K_p (y_e + K_d \sin \psi_e) + \kappa $$

Even better. It still overshoots a bit, but it can be made to track very
accurately. The only real issue with this is the curvature of the track
actually depends on the car's *y* position; the inside of a turn has a higher
curvature than the outside.

There's a paper from 1993 that studies this problem in depth that I've found
very helpful: <a href="https://hal.inria.fr/inria-00074575/en/">Trajectory
tracking for unicycle-type and two-steering-wheels mobile robots</a>.[^1] The
authors derive a nice closed-form PD control law (a bit hairier than the above,
but not hard to compute) adjusted for curvy target trajectories.

<div class="container-fluid">
<canvas class="linefollower control-rr2097" width="400" height="200"></canvas>
</div>
<fieldset>
<div>
  <label for="Kp">Kp</label><input type="range" name="Kp" min="0.1" max="3" value="1" step="0.1" class="control-rr2097" style="width: 90%; float: right; margin: auto;">
</div>
<div>
  <label for="Kd">Kd</label><input type="range" name="Kd" min="0.1" max="10" value="1" step="0.1" class="control-rr2097" style="width: 90%; float: right; margin: auto;">
</div>
<div>
  <label for="v">v</label><input type="range" name="v" min="0.1" max="10" value="1" step="0.1" class="control-rr2097" style="width: 90%; float: right; margin: auto;">
</div>
</fieldset>
control: $$ \kappa' = \frac{\cos \psi_e}{1 - \kappa y_e}\left[ -K_p \frac{y_e \cos^2 \psi_e}{1 - \kappa y_e} + \sin \psi_e \left(\kappa \sin \psi_e - K_d \cos \psi_e \right) \right] $$

If you play around with the constants, you'll see this one gets around the
track faster than any of the others above.

#### Target velocity in a curve

The above give us control targets for curvature, but don't say anything about
exactly how fast we should be driving in a turn.  In fact the above simulations
are just driving the motor at a constant speed, and the simulator understeers
in turns (in other words, the front wheels skid, it doesn't actually turn as
far as it wants to, and it slows the car down).

Ideally we'd brake for the turns and not understeer in them. But how fast
should we go?

This can be very complicated due to tire dynamics and weight transfer, but the
simplest thing that works is to shoot for a given lateral acceleration -- the
tires will be able to exert a certain amount of *g* force sideways, and you can
measure this by driving the car around in circles and seeing what the
accelerometer (or the product of the forward velocity and gyro yaw rate) says.

There's a simple formula for lateral acceleration, and we can solve it for
velocity given a maximum lateral acceleration.

$$ a_L = \frac{v^2}{r} = v^2 \kappa $$

$$ v_{Max} = \sqrt{\left|\frac{a_{LMax}}{\kappa}\right|} $$

There are some minor practicalities to consider here ($$ \kappa $$ can be near
zero) -- I compute $$ \kappa_{min} = a_{Lmax} / v_{max}^2 $$ and set $$ v = v_{max}
$$ if $$ \left|\kappa\right| < \kappa_{min} $$.

<div class="container-fluid">
<canvas class="linefollower control-rr2097" width="400" height="200"></canvas>
</div>
<fieldset>
<div>
  <label for="Kp">Kp</label><input type="range" name="Kp" min="0.1" max="3" value="1" step="0.1" class="control-rr2097v" style="width: 90%; float: right; margin: auto;">
</div>
<div>
  <label for="Kd">Kd</label><input type="range" name="Kd" min="0.1" max="10" value="1" step="0.1" class="control-rr2097v" style="width: 90%; float: right; margin: auto;">
</div>
<div>
  <label for="aL">a<sub>L</sub></label><input type="range" name="aL" min="0.1" max="20" value="6" step="0.5" class="control-rr2097v" style="width: 90%; float: right; margin: auto;">
</div>
<div>
  <label for="vmax">v<sub>max</sub></label><input type="range" name="vmax" min="0.1" max="20" value="10" step="0.5" class="control-rr2097v" style="width: 90%; float: right; margin: auto;">
</div>
<div>
  <label for="lookahead">lookahead</label><input type="range" name="lookahead" min="0" max="20" value="10" step="1" class="control-rr2097v" style="width: 90%; float: right; margin: auto;">
</div>
</fieldset>

$$ \kappa' = \frac{\cos \psi_e}{1 - \kappa y_e}\left[ -K_p \frac{y_e \cos^2 \psi_e}{1 - \kappa y_e} + \sin \psi_e \left(\kappa \sin \psi_e - K_d \cos \psi_e \right) \right] $$

$$ v = \min\left(\sqrt{\left|\frac{a_L}{\kappa'}\right|}, v_{max}\right) $$

Now it speeds up for straights and slows down for turns. The only problem is it
doesn't have instantly-acting brakes, so it's still surprised by turns; I've
added one more parameter which is how far it looks ahead before determining the
$$ \kappa $$ to use to compute its velocity -- it will look ahead on the track
and take the maximum of its control curvature and the curvature on the track
coming ahead to determine its speed limit.

#### Future work

At this point we're reaching the limits of what we can do with simple PD-type
control, and to get really great tracking we need to start doing finite-horizon
planning, but that's out of the scope of what I want to cover here. <a
href="https://studywolf.wordpress.com/2016/02/03/the-iterative-linear-quadratic-regulator-method/">Iterated
Linear Quadratic Regulators / Differential Dynamic Programming</a> are what I
would use next, but we haven't talked about even making the simple algorithms
practical yet!

## Finding *y*, *&Psi;*, *&kappa;*, and all that

In a real robot, we need to use our sensors to make measurements of the line
with respect to our own position / orientation. This can be as simple as some
phototransistors pointing at the ground, or a front-facing (preferably
wide-angle) camera.

Either way, we can at least indirectly measure these parameters. To track them
over time and refine our estimates requires a Kalman filter.

For now, this is a very brief overview of how it was done in the first video above:

 - Calibrate the camera with OpenCV
 - Generate a look-up table mapping pixels in our front-facing camera to a
   virtual birds-eye view
 - Set the camera to take video in YUV color space (most cameras can do this
   natively) -- YUV is a perceptual color space, and makes it really easy to
   find colors like yellow and orange
 - Remap each image and use a convolutional filter on the virtual birdseye view
   to find the lane lines (note: not a convolutional neural network or anything
   like that, just a hand-designed function which "activates" on lane lines and is
   relatively immune to lighting changes)
 - Use linear regression to fit a parabola to the lines
 - Compute *y<sub>e</sub>*, *&Psi;<sub>e</sub>*, *&kappa;* from the equation of
   the parabola at the point where the fit was best.

<iframe width="560" height="315" src="https://www.youtube.com/embed/esMiT7phZUM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Of course, the measurement isn't perfect and if you completely leave the track
or even just turn too far to one side, it provides no information on your
rapidly increasing *y<sub>e</sub>*. This is why I added a Kalman filter to
track the line's position relative to the car, and wheel encoders, brushless
motor sensor feedback, and/or MEMS gyroscopes can help tremendously with this
approach.

[^1]: Alain Micaelli, Claude Samson. Trajectory tracking for unicycle-type and two-steering-wheels mobile robots. [Research Report] RR-2097, INRIA. 1993.
