---
title: On segmentation of English words
layout: post
---
<script src="/js/wordseg.js">
</script>

I discovered a neat little algorithm recently, and I wanted to share it.

Say you're given a chunk of lowercase text with no spaces or punctuation in it.
Say you want to write a program to find what actual words are in it, at least
to some good approximation.  This problem is a little contrived in English but
it's definitely not contrived for many languages which don't have spaces
between words, e.g. Chinese or Japanese or (especially hard to parse) Thai.

For example,
"thisisabunchoftextwithnospacesorpunctuationandiwanttoknowwhatwordsareinit"
should become "this is a bunch of text with no spaces or punctuation and i want
to know what words are in it".

Try typing words into the box here without spaces (or paste the above example
in, if you want).  This requires a Canvas-enabled browser (Firefox, Safari,
Chrome, Opera, IE 9?) to work.  A little bit of Javascript code will strip out
all the spaces and non-alphabetical characters, down-case everything, and then
attempt to put spaces in where they belong, provided the input is in English.
(It's not making requests to my server; your browser is doing the work)

<textarea type="text" cols="50" rows="5" id="i" onkeyup="kp();" disabled="true">(loading...)</textarea>
<pre style="border: solid 1px" id="o">
</pre>

With a little bit of experimentation you'll see that it works pretty well, but
not perfectly by any means.  This is mostly because of a design tradeoff I made
&mdash; for my demo your browser is loading a <a
href="/img/langmodel.png">60-kilobyte PNG</a> which encodes a
lossily-compressed English language model, and you can get better performance
with a larger model, but there's no reason to download a huge amount of data
for a simple demonstration of the idea here.

But it's also because there isn't necessary a unique solution to the
problem, so the question becomes: What is the *most likely* solution, and
what does our program need to know about English to know whether one decoding
is more likely than another?

Breaking it down further: for each letter in our input string, is it more
likely that a space comes after it or not?  Obviously, making a choice in one
part of the string can affect the rest of the string: If we see "orient", the
most likely parsing depends on whether the following string is "al" (as in
"oriental") or "er" (as in "or i enter").

To get this done requires solving two major subproblems: the engineering
problem of representing the likelihood of a letter in a phrase, and the
algorithmic problem of finding the global maximum.

### Representing letter likelihoods

In many machine learning problems, once you get through the math and start an
implementation, it often comes down to nothing more than churning through lots
of data and counting stuff.

### Finding the global maximum

For now, let's take it as read that we know the approximate probability of
seeing a letter in a context (e.g. the preceeding letters of the word).  For
example, if we have seen "`the`" in a randomly chosen section of English
text, it is very likely that this is the end of the word, but it is also pretty
likely that the next letter is "`r`".

Note that a greedy approach won't work: if we just run through the sentence one
letter at a time and pick "space" or "no space" based on which is more likely,
we won't be able to resolve the above "`germ(an| and)`" example
correctly.

We have to go through the sentence and try it both ways -- is the entire
sentence more likely if we put a space here, or not?  We could try all
2<sup>N</sup> combinations through a backtracking search and keep only the
maximum.  That would get the right answer, but very, very slowly.

This is equivalent to asking whether the probability of the sentence prior to
this letter, times the probability of this letter, times the probability of the
rest of the sentence is greater than the same probability if we put a space
in here.

\[
  L_i = P(ctx_i) * \max( P(wordending_i) * P(L_{i+1} | wordending_i), P(L_{i+1} | not wordending_i) )
\]


