---
layout: page
title: LM318-based video amplifier
---
I made this video amplifier while attempting to add RCA [audio/video jacks to a
ColecoVision](index.html), and while not really knowing what I was doing. This
is mostly here for posterity.

<img src="video_sch.png">

C2 is a power supply bypass capacitor.  It may not be necessary, and then
again it may make a world of difference if you have a snowy output.  Use
something like 1&micro;F or higher.

The LM318 is set up as a voltage follower as recommended by its datasheet.
It feeds into C3, which removes the DC component of the video signal, and 
R3/R4 provide a 75&Omega; impedance match.

I tried some single-transistor emitter follower designs, but the impedance
is too high; it drags down the RF circuit's weak signal.  The LM318's 
relatively high input impedance seems to work out rather well.

Also, the 150&Omega; resistors in parallel can just be one 75&Omega;
resistor... I just didn't have any extra 75&Omega;s in my resistor drawer.

[Circuit layout](pcb.html)
