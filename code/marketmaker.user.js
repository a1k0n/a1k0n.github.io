// Kingdoms of Camelot market maker
//
// ==UserScript==
// @name        KOC Market Maker v0.1
// @namespace   http://a1k0n.net/
// @description Market maker for Kingdoms of Camelot
// @include     http://*.kingdomsofcamelot.com/*/main_src.php*
// ==/UserScript==


// so we need functions to place buy orders and sell orders and functions
// as well as ways to download the current market orders (including our
// own)

// we want to estimate the time before someone else takes our trade if the
// sell price is too high then it'll take forever for someone to buy it if
// the sell price is too low then it'll be bought very quickly

// we want to maximize our wealth, while keeping a certain inventory (if we
// have Y units and we want to hold X, we are either long Y-X or short X-Y
// units.  however, we can't really count on raising/lowering prices to
// maintain our inventory, as the market participants aren't very informed
// about the prices.

// the bid/ask spread existing in the market is how we make money.  if the
// bid/ask spread is too wide, we will get no takers.  if it's too narrow,
// we get no profit.  we maintain the spread in order to keep the order
// flow under control because we have a 30m wait to buy stuff.  There is
// also a 0.5% overhead on each transaction so we want to minimize their
// number.

// each market participant has a certain underlying income, and certain
// assumptions can be made about the ratio of resource/gold income; very
// roughly speaking, the resources are produced at a rate about 5-20x
// faster than their gold production.  however, gold isn't really demanded
// while certain resources are demanded a lot; wood and ore are demanded to
// build armies, wood and stone to build buildings, and food to maintain
// armies.

// therefore, market price fluctuations result mainly from global demand
// for whatever the high level players are building, and their prices
// without any particular demand should be at around 0.1 - 0.2 per unit.
// in the current game they tend to go for more like 1 - 2 per unit, but
// bid/ask spreads are gigantic and each market tends to have either only
// sell or buy orders.  that's where this script comes in.

// the signals we have are:
//  - a new order
//  - a reduction in volume of an existing order
//  - removal of an order

// so each time we observe a change in the market, output a transaction
// tuple: (price, volume, original order was bid/ask, time on market)

// let's start with the simplest thing that could possibly work, though:
// grab the market, observe bid/ask spread, assume true price is somewhere
// in there but with a prior surrounding, like, 0.75 or something, and then
// issue bid/ask orders below and above.
//
// if someone buys a lot, then we need to replenish our supplies; we either
// jack up our ask price as we reach our resource minimum or don't make any
// more sell orders
//
// if someone buys a partial lot, then ??? (i guess we wait; i don't think
// we can cancel, can we?)

// so the bid-ask spread needs to cover the cost of the transactions
// assuming they're both taken, plus some pure profit per transaction which
// is enough to cover taking us out of circulation for 30 minutes

function poop() {
}

unsafeWindow.poop = poop;
