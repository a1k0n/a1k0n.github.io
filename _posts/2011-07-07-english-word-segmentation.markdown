---
title: On segmentation of English words
layout: post

# not ready for public distribution yet
hide: true
---
<script src="/js/wordseg.js">
</script>

*Oops, sorry, this post isn't ready yet.  It accidentally showed up in the atom feed.*

I discovered a neat little algorithm recently, and I wanted to share it.

Say you're given a chunk of lowercase text with no spaces or punctuation in it.
You want to write a program to find what actual words are in it, at least to
some good approximation.  This problem is a little contrived in English but
it's definitely not contrived for many languages which don't have spaces
between words, e.g. Chinese or Japanese or (especially hard to parse) Thai.

For example, the input
"thisisabunchoftextwithnospacesorpunctuationandiwanttoknowwhatwordsareinit"
should produce the output "this is a bunch of text with no spaces or
punctuation and i want to know what words are in it".

Try typing words into the box here without spaces (or paste the above example
in, if you want).  Because of some hackery which I will explain later, this
requires a Canvas-enabled browser &mdash; Firefox, Safari, Chrome, Opera, and
maybe IE 9 &mdash; to work.  A little bit of Javascript code will strip out all
the spaces and non-alphabetical characters, down-case everything, and then
attempt to put spaces in where they belong, provided the input is in English.
(It's not making requests to my server; your browser is doing the work)

<textarea type="text" cols="50" rows="5" id="i" onkeyup="kp();" disabled="true">(loading...)</textarea>
<pre style="border: solid 1px" id="o">
</pre>

With a little bit of experimentation you'll see that it works pretty well, but
not perfectly by any means.  This is mostly because of a design tradeoff I made
&mdash; for my demo your browser is loading a <a
href="/img/langmodel.png">60-kilobyte PNG</a> which encodes a
lossily-compressed English language model (the language model is lossy, not the
image compression), and you can get better performance with a larger model, but
there's no reason to download a huge amount of data for a simple demonstration
of the idea here.

But it's also because there isn't necessary a unique solution to the
problem, so the question becomes: What is the *most likely* solution, and
what does our program need to know about English to know whether one decoding
is more likely than another?

For each letter in our input string, is it more likely that a space comes after
it or not?  Making a choice in one part of the string can affect the rest of
the string: If we see "segmenta", the most likely parsing depends on whether
the following string is "tion" (as in "segmentation") or "coin" (as in "segment
a coin").

To get this done requires solving two major subproblems: the algorithmic
problem of finding the global maximum, and the engineering problem of
representing the likelihood of a letter in a phrase.

### Finding the global maximum

For now, let's take it as read that we know the approximate probability of
seeing a letter or a space after some number of preceeding letters.  For
example, if we have seen "`the`" in a randomly chosen section of English text,
it is very likely that this is the end of the word, but it is also pretty
likely that the next letter is "`r`".

Note that a greedy approach won't work: if we just run through the sentence one
letter at a time and choose whether or not a space appears after the letter
based on which is more likely, we won't be able to resolve the above "segmenta..."
vs. "segment a..." example correctly.

We have to go through the sentence and try it both ways -- is the entire
sentence more likely if we put a space here, or not?  We could try all
2<sup>N</sup> combinations through a backtracking search and keep only the
maximum.  That would get the right answer, but very, very slowly.

We can do better.  To see how, let's formalize the problem mathematically.  A
"phrase" is a particular output of the algorithm with spaces between some of
the input characters &mdash; a set of words separated by spaces.  The
probability of a phrase is the product of the probability of each word in it,
and the probability of a word is the product of the probability of each letter
given the previous letters, and the probability of ending the word on the last
letter.

For instance, the word "the" is the probability of seeing a word start with
"t", times the probability of "h" following "t", times the probability of "e"
following "th", times the probability of the word ending after "the".  I hope
it's clear that by this definition, the phrase "t he words" is less probable
than "the words", because "t" is a relatively unlikely word (not because it
starts with "t", but because there is nothing but "t" before the word ending)
and because "he" occurs less frequently than "the".

{% comment %}
So we can formulate it this way, with the *i*th word in a phrase being $w_i$ ,
the *j*th letter in word *i* being $l_{i,j}$, and $P(e | \{l_0..l_n\})$ being
the probability of seeing a word ending after letters 0 through *n*:

\[
P(phrase) = \prod_{i=0}^{N} P(w_i)
\]

\[
P(w_i) = P(e | \{l_{i,0} .. l_{i,j}) \cdot \prod_{j=0}^{M} P(l_{i,j} | \{l_{i,0} .. l_{i,j-1}\})
\]

But this is sort of begging the question since we need to know the assignment
of letters into words to compute it.  Instead, we should formulate the problem
in terms of input letter positions.
{% endcomment %}

When we look at the probability of a particular parsing of a phase, we need to
specify the probability of a letter *given a context*, where the context is 0
or more preceeding letters in the word.  This could be implemented through a
dictionary search in a <a href="http://en.wikipedia.org/wiki/Trie">trie</a>, or
through an *n*-gram language model where we only look at up to *n* letters at a
time.  For a 5-gram letter model, we'd only look at the "anism" at the end of
"antidisestablishmentari<u>anism</u>" in order to determine the likelihood of
the final "m" in the word.

With a fully-specified dictionary, our algorithm stops working when we see a
word we don't recognize but which might be valid.  With an *n*-gram model, we
can at least make a pretty good guess in any context.  Not only that: If we
choose the *n*-gram model, we get a very simple polynomial time algorithm
(technically a linear time algorithm since *n* is fixed), and it's this
algorithm I want to write about.

\[
  P_{i,j} = P(word_{i,j}) \cdot \max\left( P(wordending_{i,j}) \cdot P(L_{i+1} | wordending_i), P(L_{i+1} | not wordending_i) \right)
\]

However, I'm having great difficulty coming up with a good prose explanation of
how we can do this in sub-exponential time.  The basic answer is that the
problem decomposes right-to-left, and so we can wave the magic wand of dynamic
programming.  So in the style of the <a
href="http://blog.ezyang.com/2010/11/dp-zoo-tour/">DP Zoo Tour</a>, here is an
interactive diagram of how the dynamic programming algorithm works &mdash; as
Edward Z. Yang points out in the previous link, it might as well be called a
*table-filling algorithm*.  (Like the demo above, this also uses canvas tags in
Javascript)

<table id="dpdiag" cellspacing="0" cellpadding="1" border="1">
</table>

### Representing probabilities

As a quick aside, let me point out that etc etc take the log

### Representing letter likelihoods

The easiest way to find out how likely a letter is after a particular context
is to run over a large amount of English words, count the number of times each
context occurs, tally up each letter following each context, and make a big
lookup table you can query.  If a word began with "th" 1000 times and then "e"
followed afterward 800 times, then the probability estimate of "e" given "th"
is 800/1000 = 0.8.

