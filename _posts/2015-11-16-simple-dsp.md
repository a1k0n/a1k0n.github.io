---
title: Simple Digital Filters
layout: post
hide: true
headhtml: |
  <script src="/js/dsp2015.js"></script>
  <script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
---
In my last post, I mentioned I used a two-pole low pass filter for playing
samples in XM files back at different speeds. I wanted to give a bit of
background and explain how that works.

Digital signal processing makes use of some surprisingly neat mathematics which
seems incredibly strange at first.

In the following notation, capital letters ($$X$$) are streams of samples and
lowercase letters with subscripts ($$x_k$$) are individual samples. It's also
important to understand Euler's formula, namely $$e^{j x} = \cos x + j \sin
x$$. (As an engineer, I am using $$j$$ as the imaginary unit rather than $$i$$
-- Python also uses `j`.) As $$x$$ goes from 0 to 2&pi;, $$e^{j x}$$ goes all
the way around the unit circle in the complex plane, starting at 1, circling up
to $$j$$, over to -1, to $$-j$$, and back to 1.

It starts with the operator $$z$$, which when multiplied by a stream of
samples, advances time by one sample. If we have a stream of samples $$X$$,
then if $$Y = X z$$, $$y_k = x_{k+1}$$. This of course works the other way
around which is more useful in practice: $$z^{-1}$$ delays by one sample. If
you've ever opened a DSP textbook, you may have seen a diagram with little
blocks containing $$z^{-1}$$ which mean "delay the input by one sample".

If you've heard of the Laplace domain or Laplace transform before, the $$z$$
domain is very closely related to the Laplace domain: $$z = e^{s T}$$
where $$T$$ is the sampling period of your signal. What this means is that
existing analog design techniques which use the Laplace transform (AKA the
$$s$$ plane) can be transformed into the digital processing domain by making
use of this relationship (or approximations thereof).

If we assign a point in the complex plane to $$z$$, we can analyze the behavior
of an equation operating on discrete signals, such as audio samples. For
example, if we have a *filter*, which takes some stream of samples $$X$$ as
input, performs some operation, and produces a stream of samples $$Y$$ as
output, we can find an equation for the filter in terms of $$z$$, solve for the
ratio of output to input $$\frac{Y}{X}$$, and then plug in different values of
$$z$$. By comparing the magnitude and phase of the complex number that comes
out, we can see what the filter does to each frequency.

Here's a simple example based on an idea you've probably seen before. Say we
have a simple moving-average filter, where we take 1% of our input sample and
add it to 99% of our current value. In this case,

$$
y_n = \alpha x_n + (1 - \alpha) y_{n-1}
$$

With $$\alpha = 0.01$$. Transforming to the $$z$$ domain is straightforward
when we have a recurrence relation like this:

$$
Y(z) = \alpha X(z) + (1 - \alpha) Y(z) z^{-1}
$$

The ratio of the output to the input is called the *transfer function* usually
denoted as $$H(z)$$:

$$
(1 - (1 - \alpha)z^{-1}) Y(z) = \alpha X(z)
$$

$$
H(z) = \frac{Y(z)}{X(z)} = \frac{\alpha}{1 - (1 - \alpha) z^{-1}}
$$



<div>
z
<canvas width="300" height="300" id="zdomain"></canvas>
s
<canvas width="300" height="300" id="sdomain"></canvas>
</div>
<div>
f
<canvas width="200" height="100" id="fresponse"></canvas>
l
<canvas width="200" height="100" id="logresponse"></canvas>
i
<canvas width="200" height="100" id="impulse"></canvas>
</div>

<pre id="f1"></pre>
<canvas width="600" height="200" id="piano"></canvas>

 - real (as in not complex) filters for audio processing
 - polynomials, $$H(z) = \frac{Y(z)}{X(z)} = \frac{(z - a)(z -
   a^*)}{(z - p)(z - p^*)}$$
 - butterworth
 - laplace domain -> z domain mapping, $$z = e^{s T}$$
 - audio gadget, generate noise or buzz w/ keyboard notes
 - complex filters for SDR
 - quadrature, I/Q signal
 - no such thing as a low-pass filter complex domain
 - fm demodulation animation?


