---
title: Playing Fasttracker 2 .XM files in Javascript
layout: post
hide: true
headhtml: |
  <script src="/code/jsxm/xm.js"></script>
  <script src="/code/jsxm/xmeffects.js"></script>
  <script src="http://a1k0n-pub.s3-website-us-west-1.amazonaws.com/xm/xmlist.js"></script>
  <style>

  .centered {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  #filelist a { color: #fff; }

  .playercontainer {
    background:#000; overflow: auto;
  }
  </style>
---
<div class="playercontainer">
  <div> <canvas class="centered" id="title" width="640" height="22"></canvas> </div>
  <div> <canvas class="centered" id="vu" width="224" height="64"></canvas> </div>
  <div> <canvas class="centered" id="gfxpattern" width="640" height="200"></canvas> </div>
  <div id="instruments"></div>
  <div>
    <p style="text-align: center">
      <button id="playpause" disabled="true" style="width: 100px">Play</button>
      <button id="loadbutton" style="width: 100px">Load</button>
    </p>
  </div>
  <div style="display: none" id='filelist'></div>
</div>

## What is this thing?

Hit the play button above and it will play music; specifically, music composed
with (or at least, compatible with) a program released in 1994 called
FastTracker 2; this is a Javascript homage I wrote in a fit of nostalgia.

FastTracker 2 looks like this:

<img src="/img/ft2.png">

I am using the original font to render a pastiche of the FT2 interface above.

## .XM files

The ubiquitous .MOD music file format originated on the Commodore Amiga in the
late 80s. It was more or less designed around the "Paula" chip inside the Amiga
which plays four 8-bit PCM channels simultaneously. It is fairly amazing what
artists are able to accomplish in just four voices; I've converted a few of
Lizardking's old four-channel .MODs to .XM format so they can be played in the
player above; try them out with the load button above.

FastTracker 2's .XM (eXtended Module) format was created as a multi-channel
extension to .MOD in the 90s; it was written by PC demo group
[Triton](http://www.pouet.net/groups.php?which=161). There were other
contemporaneous multi-channel MOD-type music trackers, like ScreamTracker 3's
.S3M and later Impulse Tracker's .IT. Nearly all PC demos and many games in the
90s and early 2000s played music in one of these formats.

Underneath the hood, it's several (14 in the case of the default song that
comes up here) *channels* independently playing *samples* at various
pitches and volume levels, controlled by the *pattern* which is what you
see scrolling above.

Patterns are a lot like assembly language for playing music, complete with a
slew of hexadecimal numbers and opaque syntax, except they are laid out like a
spreadsheet rather than a single column of instructions. Each cell contains an
instruction for playing or releasing a note with a certain instrument,
optionally modifying the volume, panning, or pitch with *effects*.

Every sound that is played is one of the *samples*, shown at the top of this
page as little waveforms and numbers in the table below the pattern. The idea
is that the musician would record an instrument, like a piano or a bass, at a
certain note, and then we play them back at higher or lower speeds to change
the pitch.

Theoretically each sample has a name like "piano" or "bass", but in practice,
musicians tended to erase those and write messages instead. Later trackers
would add a song message field to avoid abuse of the instrument list.

<img src="/img/ft2pattern.png">

In the above example, we are about to play an E note in octave 5 with
instrument number 2 on the first channel, and in the second channel we play the
same note an octave higher with the same instrument, except we also lower the
volume to 0x2C (maximum volume is 0x40, so this is between a half and 3/4ths
full volume). The second channel is also going to play with effect 0, which is
an arpeggio, switching between 0, 0x0c or 12, and 0 semitones higher -- meaning
it's going to rapidly play a sequence of E-6, E-7, E-6, and repeat.

XM *instruments* go beyond .MOD samples in that they include volume and panning
envelopes, and can have multiple different samples per instrument -- so you
could record various piano notes and use a recording closest to the note you're
playing rather than stretching a sample several octaves, which sounds bad. I
only render the first sample per instrument in the table above though.

In .MOD-derived formats, each row of pattern data is played at a certain rate
controlled by the *speed* and *BPM* which have a sort of tangential
relationship to the terms you may be familiar with. *speed* controls the row
speed in *ticks*, and *BPM* controls how long *ticks* are.  A *tick* is defined
as 2500/*BPM* milliseconds.

Typical values are *BPM*=125 and *speed*=6, corresponding to 2500/125 = 20ms
per tick, or 50 ticks/second; and 50/6 = 8.333 rows per second. If we assume
the downbeat happens every four rows then it works out to 125 beats per minute.
But if *speed* is 5 then it's 150 beats per minute, so we can't really take the
terms at face value.

Each *tick* we process *effects* -- modifications to the volume or pitch of a
note. Effects are represented by three hexadecimal digits: the effect type
(first digit) and parameter (second two digits). In XM the effect type goes
beyond the hex digits and goes all the way from 0-9 and A-Z.

Examples include arpeggio (switching between three notes really fast; effect
047 plays a major chord), portamento (sliding from one note to another, like a
trombone does; effect 1xx slides up 2xx down, and 3xx to a specific note),
vibrato (vibrating the pitch up and down; 4xx), or ramping the volume up or
down (Axy). If you watch closely while the song is playing you can try to work
it out.

I think this is what was most fun about playing .MODs and their ilk back in
days of yore -- you could actually *see* how a complex piece of music is put
together, and watch your computer perform it live. I wanted to recreate that
experience. There are other web-based .MOD players now, like
[mod.haxor.fi](http://mod.haxor.fi), but I wanted to write my own just for fun.

## Real-time Audio Synthesis in Javascript

The `webkitAudioContext` element was introduced to HTML a while back, and is
now available in the standard as `AudioContext`. The API is fairly flexible, and
one of the things you can do with it is get a Javascript callback which writes
samples more or less directly to the output device, just like we used to do
with DMA loop interrupts back in the day. It's called `createScriptProcessor`.

You can be up and running making all kinds of noise in a jiffy:
{% highlight js %}
function InitAudio() {
  // Create an AudioContext, falling back to 
  // webkitAudioContext (e.g., for Safari)
  var audioContext = window.AudioContext || window.webkitAudioContext;
  var audioctx = new audioContext();

  // Create a "gain node" which will just multiply everything input
  //  to it by some constant; this gives us a volume control.
  gainNode = audioctx.createGain();
  gainNode.gain.value = 0.1;  // master volume

  // Create a script processor node with 0 input channels,
  // 2 output channels, and a 4096-sample buffer size
  jsNode = audioctx.createScriptProcessor(4096, 0, 2);
  jsNode.onaudioprocess = function() {
    var buflen = e.outputBuffer.length;
    var dataL = e.outputBuffer.getChannelData(0);
    var dataR = e.outputBuffer.getChannelData(1);
    // dataL and dataR are Float32Arrays; fill them with
    // samples, and the framework will play them!
  };

  // Now, form a pipeline where our script feeds samples to the
  // gain node, and the gain node writes samples to the
  // "destination" which actually makes noise.
  jsNode.connect(gainNode);
  gainNode.connect(audioctx.destination);
}
{% endhighlight %}

Your `onaudioprocess` function will be called back whenever new samples are
needed to fill the output buffer. With a default samplerate of 44.1kHz, a
4096-sample buffer will expire, and thus your callback will be called, every
~92 milliseconds.

Our goal is to fill this buffer up with the sum of each channel's output
waveform. Each channel outputs a sample playing at a certain frequency and at a
certain volume.

*insert diagram of ticks/rows laid out in sample buffer*

But wait -- our output frequency is given (by
`audioctx.sampleRate` as it happens) and we need to play samples at different
frequencies for each note. How do we do that?

## Resampling

Playing a sample recorded at a different frequency from the output frequency is
a surprisingly nontrivial problem.

TODO:

 - frequency content, up to nyquist
 - aliasing phenomenon
 - FFT, brick-wall filter, sinc
 - amiga's approach, artists

It turns out that if we use advanced resampling techniques to eliminate
unwanted alias harmonics, many songs (especially "chiptunes" - songs with tiny
looping square wave or triangle wave samples, to emulate simple vintage sound
hardware chips) sound pretty bad. The original hardware and software that
played these either used "zero-order hold" -- just output the sample closest to
the interpolated time -- or "first-order hold" -- interpolate between the
surrounding samples.

I compromised with a very simple implementation that I think sounds pretty
good. I use a combination of zero-order hold and a per-channel two-pole
low-pass filter, which has very low implementation complexity.

### follow up in the next blog post
about digital filters and just say we made a IIR low pass filter, will explain
later



<!--
 - background
   - first thing i heard on a soundblaster, music you can see
   - chiptunes
   - amiga paula, .MOD format - assembly language for music
   - ProTracker, FastTracker 2, ScreamTracker 3 (S3M), Impulse Tracker,
     MilkyTracker, ...
   - kamel.xm ripped from ...? youtube link?

 - .XM format: multi-sample instruments, envelopes
   - great for chiptunes
   - XM documentation mostly wrong

 - basics: note, inst, vol, effect
   - "tempo" / "bpm" -> "row", "ticks"
   - effects, some on tick 0, some "between rows"

 - HTML5 AudioContext
   - ScriptNode callback
   - architecture: render a tick at a time, a channel at a time, a sample loop at a time
     - fast inner loop
   - time synchronization w/ audioContext.currentTime

 - resampling: playing 8363Hz sample at @44100Hz output
   - naive integer truncation (zero order hold)
   - linear
   - FFT resampling
   - brickwall; lanczos; etc; ... too much effort
   - cheap IIR LPF

-->
