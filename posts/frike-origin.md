---
title: Zwift started to bug me so I'm making my own
description: not advisable probably
date: 2026-04-11
tags:
  - cycling
  - hacking
  - oss
  - Zwift
  - gamedev
---

The last thing I needed was another project. I should be working on
[j17](https://www.j17.dev) right now but you know how that goes. I've been an on
and off Zwift user for going on ten years now and they've been frustrating me
(and many others for years). Reddit and the comments on ZwiftInsider and GPLama
videos etc, probably their own forums too, are perpetually full of complaints
about the UI for instance and changes have been extremely slow in coming.

I started looking into FTMS (the protocol that most of the trainers and smart
bikes use these days) a while ago and then stuck it on my mental backburner but
I was riding the other day and started thinking it was time.

## The long answer to why

**The pricing:** Zwift is expensive. There's no way around it. It's $20 USD per
month, you can cancel in the spring and pay again when the weather turns but any
even half-serious rider is in it for a few hundred dollars a year. There's a
trial mode but it's (I think) 25 km (\~18 miles) per month.

This made more sense when the target market had a $4000 carbon or titanium bike
frame and then a $1200 smart trainer to go with it but the economics have
changed (more on this later) and the pricing no longer makes sense for what I
bet is the majority of people who would be interested in this sort of thing.

Zwift also has no family plan and no pricing options other than monthly or
annually. No students, no seniors, no veterans, no anything as far as I know.

**The general closed-ness:** Zwift is not interested in being a platform for you
to build on; fair enough, up to them but it annoys me. They have a developer
program in theory, but they don't grant access to hobby developers. The only
partner with API access I could find mention of online is WTRL (the racing
league). You can email developers@Zwift.com to "register interest" but people on
the forums report getting nothing back. There have been forum threads requesting
a public API going back years with no movement.

There's some community attempts to reverse engineer the API or protocol and do
various things but that's always going to be fragile and difficult.

People like [DCRainmaker](https://www.dcrainmaker.com/) and
[GPLama](https://www.youtube.com/@gaborwhateverhislastnameis) have been making
versions of this observation for years — the walled garden is a choice, not a
technical constraint, and it limits what the ecosystem can become.

**The proprietary hardware:** This is the one that tipped me over the edge. Zwift
has an accessory ecosystem in a way. There's some 3rd party hardware (mostly
from Wahoo and TacX) and more recently 1st party hardware made or at least
branded and endorsed by Zwift (the Zwift bike and the Zwift hub). Here's the
thing. It's all proprietary. It speaks the same protocol as all the generic
stuff (GATT messages over BLE) but not only is it not documented, it's actively
encrypted!

So the obvious question then is "why?"

The fair read is that there isn't a SIG profile for what they wanted to do;
"cycling game controller with shifter, brake lever, steering, haptics, LEDS".
There is a mechanism for HID over GATT but that bonds at the OS level which is
awkward or impossible for mobile devices and just obviously the wrong solution
so they had to invent something. Fine, sure. You could argue that they're not
actively trying to screw the consumer but just protecting their product from
being cloned by low-cost manufacturers on aliexpress or tiktok or whatever and I
get that but... it rankles me nonetheless. They won't sell you the virtual
shifting for instance unless you have their bike, you can't just strap the play
controller to your cheap amazon bike. It's a bummer.

## A declaration of independence

I don't have venture capitalists breathing down my neck to get their \~700
MILLION dollars back (covid investment in at-home stuff was wild, look at
Peloton's stock chart some time if you want a laugh) so I can afford to just do
whatever I want.

Me to Claude:
> I'm going to build a hackable OSS friendly Zwift alternative for weirdos and
> hackers so I guess I'll end up reverse engineering their protocol more
> completely if I want to support their hardware or vice-versa

The name **Frike** came to me pretty quickly. Free bike, frick it.

Principles (draft one):

1. Standards-first: FTMS and predecessors are the primary surface.
2. Documentation and forkability: I'll probably sell something proprietary at
some point but you should have the latitude to go your own way and pay me
nothing.

## Architectural rabbitholes

See this is where a smart person would have said well that was a fun thought
experiment let's put it back on the backburner.

I started thinking about the world model instead. LLM assisted development seems
to have made my activation floor for this kind of thing much lower. More on that
later. The world isn't geometry in a unity scene (Zwift is unity btw) it's a
directed graph. Your position according to Frike is an offset along an edge
between two vertices. Your state is a bunch of things but the most important are
location and velocity. The physics "engine" is just your location, your power
output since the last tick, the slope, the rolling resistance, air resistance,
and a few other similar constants and variables in a function. The math is
trivial so we'll just do it on the server and let the client be IO and a
display. As far as I know Zwift does physics on the client which seems crazy to
me but must have made sense in 2014. I think they started out as a singleplayer
visualisation and added multiplayer universe as an afterthought.

> the "map" internally on the server would be a graph where the edges are a
> "base joule cost" not including momentum, air resistance, etc. and your
> position at any time is like a coordinate of position along an edge and a
> location in the graph

Here's something interesting you can do with that. The graph has no implied
geometry and no opinion about visuals. It's topology and physics. I considered
making even the distance and elevation abstract and just giving each edge an
energy cost and letting the client decide if that's long and flat or short and
steep or bad asphalt or magic goo or gravity tractor beams but eventually
decided on distance, elevation profile, road surface, and an arbitrary scalar.
Because it's open you can choose to multiply those out and redistribute the
difficulty however you want but I decided to give you a hint as to the "canon"
intent and you can ignore it at the cost of "realistic feel" if you want to. The
math is all available.

Anyway, the point is that this is a much more flexible and extensible
architecture. The same graph can be rendered as a wireframe in an 80s home micro
aesthetic, a Zwift-like cartoon world, a space opera, a medieval fantasy land,
or whatever you want. Someone could build a competing premium client with
completely different art and it would work against the same server with the same
physics and the same riders.

Worldbuilding, art, environmental storytelling; all up to you per client. This
is both an artistic and architectural choice and part of the eventual business
model.

## Dumb names

Everything in this project so far has a dumb name:

- **Cassowary** is an FTMS emulator. A fake trainer bike and other fake
peripherals bundled into an executable so I can develop on my desk and not in
the bike room. It's an emulator; an emu. An Emu. Cassowaries are a very
aggressive relative of the emu.

- **Edsel** is the first version of the server. The Ford Edsel (for those of you
in the back, too young, too international, or too cool to know) was a famously
bad car and a terrible commercial failure, which is a good reminder for my manic
ego but Ford Edsel Fong was also a legendarily rude and profane waiter in San
Francisco. Waiters are servers. I'd say "I'll stop", but I won't.

- **Braben** is the initial reference client, named after David Braben because I
decided early on that the version 0 client would be beeb wireframe style. The
next one will probably be flat-shaded more like the Archimedes port of Elite or
The Mighty 8th.

## Early progress

![Braben screenshot](/blog/frike-origin/braben.png)

This is from the first day of development. Stick man, bike, road surface, stats.

![Multiple riders](/blog/frike-origin/multiplayer.png)

Each rider here is a client process and an emulator process passing real packets
back and forth. The server is doing the physics and sending out updates to each
client. Multiplayer from literally day one.

## The part where I justify this as non-insane

Zwift has raised something like seven hundred million (thousand-thousand)
dollars of venture capital at a final valuation of presumably billions
(thousand-thousand-thousands). They have something like 350 employees down from
a peak of twice that and apparently about one million (thousand-thousand)
subscribers. I on the other hand have no employees, no subscribers, no revenue,
other projects I should be working on that also have no revenue, a Claude
subscription, and a lot of coffee.

> the thing is that Zwift's graphics are really not that impressive in the first
> place imo. I don't know where all that money is going. I mean sure it's a
> large landscape especially including the other "worlds" but all of watopia
> even doesn't seem like THAT difficult of a project really especially now given
> AI/llm assisted modeling tools

Their moat is obviously their user base and the network effect and not their
technology. The physics is well understood, the networking is pretty typical,
the graphics are nothing fancy.

### Economic shifts

Here's what I think though: Chinese smart trainers are now SUPER cheap. You can
get a bike (the whole indoor bike) with the bluetooth radio and everything ready
to go for like $250 on amazon shipped to your door (assuming you have prime).
When it was $2000 minimum to get into addressable market $15 a month ($20 now)
was pretty easy to swallow. When you pay for the whole bike every year of
subscription it feels much worse. It's a different product for a different
market. Hackers and weirdos, families, and really just anyone who finds a 3D
world with some persistence and a social aspect appealing and more motivating
than just riding with a movie on or a book to read. That's worth something but
it's not worth the best part of a dollar a day to most people, and COGS doesn't
justify charging that in 2026.

The exception, possibly (more on this later) is racing. Online racing in the app
I mean not just training for racing. Zwift has this sewn up and that's fine with
me. I don't want to do more than a very little bit of anti-cheat to be honest
and for that matter Zwift racing has never interested me. I think I have
literally never done it. I eventually will because I have to have all the
achievement badges (because I'm crazy) but... yeah.

Frike will be free to use and open source so you can just run it on your laptop,
a raspberry pi, a mini pc, whatever. Just you, you and as many friends as you
want, go for it. I will also offer a "canonical" world with a subscription but
I'm aiming for $2 a month (probably annual billing only because fixed Stripe
fees and all that). I'll probably offer family plans and other kinds of
discounts too. Maybe I'm missing something and costs are way higher and this is
impossible but uh... I don't think so.

## Anti-anti-cheat

Because we're not going to have any racing (the temptation to refer to any
hypothetical company/project as we is funny, it's just me really) except maybe
some kind of mario kart inherently unserious thing I'm going to make basically
no effort to prevent cheating. This sounds lazy but here's the thing: It's
actually probably hilariously easy to cheat on Zwift. They kind of imply that
they have some sophisticated anti-cheat system but it's fundamentally impossible
to prevent people from putting an ebike on a trainer, or man-in-the-middling
their own BLE connection, or just physically modifying their trainer for that
matter; and that doesn't even get into "weight doping" and the performance
advantage of having good cooling, never mind actual PEDs.

Removing anticheat as a design constraint is a major architectural simplifier.
It's load-bearing in a lot of the decisions. No need to validate that your power
numbers are "real." No need to police clients. No need for the adversarial
relationship between platform and user that makes Zwift's protocol proprietary
in the first place.

## AI development notes from the coalface

This whole project so far has been developed as a conversation with Claude. All
the exploratory apps are python (which anyone can basically write but which I've
never REALLY used). It's only taken a couple of days and it's kind of shocking
to me how much you can get done if you already really know what you're doing. No
comment on whether this will decimate the market for juniors and whether it's a
good way to work if you're not already a good programmer or a good way to learn.
That's above my paygrade.

Normally (outside of paid work of course) I would have written pretty few tests,
and almost no documentation. Currently there's over 100 tests and some pretty
good documentation, and I was able to hae research documents prepared for me on
each protocol, the state of all existing open source reverse engineering
projects, and so on.

## Philosophy of gear

This is the point where this blog post stops being in a sensible order and
starts being a collection of semi-related thoughts that I want to get down.

Zwift has a lot of brand deals and realworld bike frames and wheelsets and kits
and helmets and things like that, which is fun and fine. The frames and wheels
also have actual performance characteristics though, which, granted, gives more
life to the "droplet" economy but also introduces a whole FOMO inducing
meta-gaming loop where you have to read the wiki and reddit and GPLama blog and
god knows what else to not feel like you're leaving XP per hour on the table.
Maybe some people like it but it all seems like gear whore middle-aged dude
stuff to me. I have that mode in me don't get me wrong but... I dunno it just
doesn't seem fun to me so I'm not going to do it.

In Frike (the mainline version, you're free to fork) all equipment is going to
be cosmetic only. No CdA, weight, aero, or other differences. A new rider on day
one has the same equipment and stats as anyone else.

This will also make the physics model simpler.

## What's done, what's next

Three components now, all Python, all talking to each other:

- **Cassowary** (emulator): fake FTMS trainer over TCP. Steady state, ramp,
intervals, FIT file replay, and .zwo (Zwift workout format) playback. Simulates
heart rate too. Speaks real FTMS binary by default (same bytes a Wahoo Kickr
would send) with a JSON fallback for debugging.

- **Edsel** (server): server-authoritative physics at 4Hz. Graph world model
with piecewise-linear elevation profiles and terrain noise. Drafting with
diminishing returns for pelotons. Segment timing with leaderboards. ERG and SIM
mode. Economy (XP for distance, Spokes for effort). Chat with graph-distance
proximity filtering. Structured workout scheduling. Multi-connection model with
five roles (trainer, sensor, controller, actuator, viewer) so a companion app
and the main client can connect simultaneously for the same rider.

- **Braben** (reference client): Elite 1984 wireframe renderer. Perspective
projection, animated bikes with speed-dependent spoke blur, roadside scatter
seeded by edge ID, minimap, HUD, chat overlay. Synthesized sound (wind,
drivetrain, freehub buzz). Auto-records every ride to a FIT file you can upload
to Strava. BLE transport layer (written but untested on real hardware). Pairing
screen that auto-launches Edsel and Cassowary. World selection, accessories
pairing, workout selection with power profile graph.

Parsers for all four standard BLE fitness protocols: FTMS (trainers), CPS (power
meters), HRS (heart rate), CSCS (speed/cadence). Plus a transport layer I'm
calling GATT-over-TCP that multiplexes all of them over a single connection with
a 7-byte frame header. Same parser code handles both the TCP and BLE paths.
There's an argument that this should be a standalone open spec independent of
Frike; nobody seems to have standardised "just put GATT frames on TCP" and it
solves real problems (multi-client access, WiFi bridging, browser clients via
WebSocket) but I'll get to that eventually maybe.

**What's next:**

- The immediate thing is getting this running on actual BLE hardware — a real
trainer, a real HR strap. The code is written but untested (I haven't been home
much).
- Rewrite basically everything. Server in elixir, upgraded reference client in
zig probably. The emulator might survive for a while without a rewrite.
- I want to add an equivalent of the Zwift companion app soon too. Probably
before I rewrite everything else.
- Work on that Mario Kart-y mode maybe.
- Powerups for that and for casual riding for that matter.
- Some more architectural review and testing more esoteric features in the
original system to generate some insights before I do the next generation.


## Conclusions such as they are

I'm not going to compete with Zwift, they have the user base, VC millions, and
the competitive cycling and real "afficianado" market sewn up. I can build
something for the people they've been ignoring though, which might turn out to
be a bigger market in aggregate than you'd think. Tinkerers, cheapskates (all
love it's me too), kids and families; anyone who would rather pay $25 a year and
only vaguely knows a cannondale from a zipp.

I've got maybe 20 hours in the project so far. If it stops being fun I'll
probably stop working on it but I got pretty far in a couple of half days. Let
me know if you see this and want to alpha test some stuff for me.

If anything kills this it'll be that at the price I'm targeting there's no room
at all for marketing spend, so it's got to grow organically if at all... on the
other hand I'll probaby just keep building it even if I'm the only user.

## Look!

![Diverging roads](/blog/frike-origin/roads.png)
<video src="/blog/frike-origin/screencast.mp4" controls playsinline muted loop></video>
