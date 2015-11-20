---
title: Simple Digital Filters
layout: post
hide: true
headhtml: |
  <script src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
  <script src="/js/dsp2015.js"></script>
---
Digital signal processing makes use of some surprisingly neat mathematics which
seems incredibly strange at first.

In the following notation, capital letters ($$X$$) are streams of samples and lowercase
letters with subscripts ($$x_k$$) are individual samples.

It starts with the operator $$z$$, which when multiplied by a stream of
samples, advances in time by one sample. If we have a stream of samples $$X$$,
then if $$Y = X z$$, $$y_k = x_{k+1}$$. This of course works the other way
around which is more useful in practice: $$z^{-1}$$ delays by one sample.

The $$z$$ domain is, like the Fourier or Laplace domains, an integral
transform. A single point in $$z$$ corresponds to a periodic signal in time. It
is very closely related to the Laplace domain in fact: $$z = e^{s T}$$ where T
is the sampling period of your signal.

What this means is that assigning $$z$$ to a point in the complex plane lets us
analyze the behavior of an equation operating on discrete signals, such as
audio samples.

Here's a simple example based on an idea you've probably seen before. Say we
have a simple moving-average filter, where we take 1% of our input sample and
add it to 99% of our current value. In this case,

$$
y_n = \alpha x_n + (1 - \alpha) y_{n-1}
$$

Transforming to the $$z$$ domain is straightforward when we have a recurrence
relation like this:

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

<canvas width="600" height="300" id="c1"></canvas>

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


