---
title: Two weeks, one prototype, five worlds, and a dead business model
description: frike g0 postmortem
date: 2026-04-22
tags:
  - cycling
  - hacking
  - oss
  - frike
  - gamedev
---

The prototype is done. Not "done" done, but done in the sense that I've
learned everything I set out to learn and further investment in Python
wireframe rendering is probably largely pointless.

## BLE works (but it's weird)

The first big milestone was getting real hardware talking. I have an MRK S09
trainer (a $300ish Chinese smart bike, FTMS over BLE) and a Coospo HW706 heart
rate strap. I have another bike in a storage unit somewhere and a couple of
older wheel-on trainers in the garage, so maybe I'll make sure those work too
eventually.

The trainer requires *bonding* which I guess is different from pairing? I still
haven't properly learned how BLE works or read the spec. It's [amazing how far
you can get these days](/blog/slopportunity-knocks) by vibecoding alone. Anyway if you
just connect and subscribe to notifications, you get data for about 1.5 seconds
and then it kicks you off. You have to call `pair()` to establish a bonded
relationship.

The HR strap, on the other hand, *must not* be bonded. If you call `pair()` on
it you get an "Unlikely Error" (GATT Protocol Error 0x0E), which is not super
helpful and subscription fails. So the trainer needs bonding and the HR strap
actively rejects bonding, I guess. Cool cool cool.

Multi-device BLE on Linux (BlueZ) is also touchy. You need a 2-5 second cooldown
between connections or you get "InProgress" errors (at least on my laptop). The
initial connect has a retry loop with exponential backoff. It works but it's
kind of ugly.

All that said, I got the thing running with real hardware and took Cassowary
out of the loop and everything more or less worked.

## The 3D pipeline

The original renderer was pure 2D projection hacks. I'd compute a screen
position from world coordinates with a manual perspective divide and draw lines.
It worked but it was fundamentally limited. Rotating the view was more hacks on
top of hacks, etc.

So I had Claude write friketech-0: Vec3, Mat4, Camera, Pipeline. Column-major
matrices, perspective projection, look_at, chase cam with exponential smoothing,
and a bunch of other standard 3D math stuff that I've vaguely heard of over
years of watching Carmack talks or random tutorial contents. It's about 330
lines of Python hand-rolled matrix math that's... correctly incorrect at least.
I think I got handedness wrong?

The coordinate system saga deserves its own post. I went back and forth between
left-handed and right-handed about four times. The cross product sign for
computing "right from heading" flipped repeatedly. At one point the map was
correct but the camera was inverted. I eventually settled on left-handed
(X=east, Y=up, Z=north) which I think is "wrong" in a textbook sense but it
works and I'll use someone else's real math library in gen-1 (someone who knows
what they're doing).

The chase camera is a simple exponential smoothing of the rider's position
and heading and it's frankly a little abrupt but it gives you the idea. I think
in the next generation I'll add a little bit of "look ahead" so it anticipates
turns and also give the camera some minimal physics so it sort of trails the
rider instead of being locked to them, like during speed changes or turning. I
dunno. I never intended to be a game dev or get into graphics so I've not
thought particularly deeply about this stuff before.

## Five worlds

During development I had the bot spit out five different worlds for testing
various features:

- **JouleTopia:** Non-infringing coastal flats, rolling hills, a big climb spur
  (250m), and a totally original radio tower climb. About 20km loop.
- **Figure Eight:** two triangles sharing a junction node. Small, good for
  testing degree-4 intersections. I think this was the original map.
- **Gridtown:** a 3x3 grid of nodes, for testing intersection rendering
- **Crit Circuit:** 1.2km flat rectangle the bot made that I never asked for
- **Mountain Stage:** 25km with two categorized climbs (Cat 3, Cat 1) going up
  to 980m.

Then once the renderer was working I had it stitch the maps together into a
single connected graph. I think some of the scaling is pretty off since the
coordinates were all hand-rolled independently but it validates the world format
and the rendering pipeline more than individual test maps did and unlike Zwift
I'm not planning at this point on having multiple disconnected worlds in the
release version. More on that later probably.

## The junction problem

This is the part that taught me the most I think. For most of the prototype the
renderer had a special-case for junctions. When you got within 120m of a node,
it would render "fork strips", separate road geometry starting 8m past the
junction in different colors to show the route (green for the planned turn, dim
for alternatives, yellow if you've manually selected one). This changed a bit
along the way but largely like that. The fork strips overlapped with the main
road near the junction point but there was visual jitter from, I assume, float
precision. There was a gap but only sometimes and roads that weren't immediately
adjacent to your current edge were invisible so the world basically felt like a
long hallway.

The solution was to stop trying to be clever and just render everything nearby.
Nearby is a slightly strained concept because the world is a graph, but it was
good enough for now to define it as within two hops on the graph. In the final
version there will be a hybrid graph/spatial approach that also considers
physical distance but the song of the day is 'good enough'.

So I just render all of them as full road strips at decreasing brightness. No
special fork code, no gap, no overlap. Scatter objects (trees, poles, buildings)
render on nearby edges too, so the world feels populated in all directions.

This tanked the framerate initially (Python doing per-point matrix math for
every edge), but caching the static geometry and adding distance culling brought
it back. The adaptive system expands the cull radius when fps is high and
shrinks it when fps drops. Currently it settles around 800-1200m draw distance
at 45-55fps on my laptop, which is pretty playable.

![2km draw distance, road curving into the
hills](/blog/frike-g0-complete/distance.png)

## Performance archaeology

Then I threw the bot back at its own code with slightly different instructions.
The intentionally naive renderer was death by Vec3 allocation. Creating two to
five thousand Vec3 objects per frame, each one a Python object with `__init__`,
attribute access through `__slots__`, is apparently not the move. It's stunning
how fast modern computers are, you can do basically the worst thing and it just
kind of works.

- Cache static edge geometry, it never changes so regenerating it 60 times a
second is dumb.
- Cache the BFS neighbor set, the graph doesn't change either and you're not
  switching edges very often, so recomputing it every frame is also dumb.
- Add `project_xyz(x, y, z)` that takes raw floats instead of allocating a Vec3
  just to immediately unpack it. I have no idea if this is actually a good idea
  and didn't profile it individually but it sounds like it makes sense.
  Allocation bad generally.
- Distance-cull scatter objects more aggressively behind the camera than in
  front since you're not looking behind you very much.

## Climb interface

I added climb sub-segments to the Mountain Stage and JouleTopia worlds and
built a climb UI overlay as a vertical strip on the right side of the screen
that shows your progress through a multi-section climb, like Zwift's Alpe du
Zwift/Climb Portal display. Numbered segments, color-coded (dim for upcoming,
bright for current, green for completed), with a little arrow showing your
position.

I added different surface types to the radio tower climb (tarmac at the base,
rough in the middle, cobblestone near the top). It's six segments across 3 graph
edges I think.

## Road surfaces

Speaking of surfaces: the road now visually communicates its rolling resistance
in three tiers of crosshatch. There would be more in the final version.

- **Smooth tarmac**: sparse perpendicular crosshatch lines, clean bright green
- **Rough**: denser perpendicular + diagonal X pattern, slightly dimmer
- **Cobble/gravel**: dense crosshatch + diagonal X on every row, noticeably
different texture

## The business model dies and is reborn

It was about this point that I did a little more research into something called
MyWhoosh which I came across when I did the initial research into whether there
were Zwift alternatives I'd like better or anything open source etc.

When I wrote the first post I'd dismissed them as a prestige e-sports platform
but it turns out they're a full Zwift clone and by some measures bigger than
Zwift. 14 worlds, 90 routes, it's Unreal Engine 5 (Zwift being unity I think).
It's also free, backed by the UAE's sovereign wealth fund, which controls about
$26 billion in assets as, one assumes, an attempt at so called sports-washing.

You can't out-free free so the "cheaper Zwift" positioning is dead.

Frike was never really about the subscription revenue. It was about building
something I wanted to exist and proving that it was possible, as well as
dogfooding [my database product](https://www.j17.dev).

So Frike is back to being free. No subscription, no tiers, no gates. If
people want to support it there'll be a cosmetic shop and some kind of patronage
subscription, but you never have to pay anything. The value proposition is "no
weird government/political angle, open source, community-owned, can be
self-hosted."

## What the prototype proved

- Server-authoritative physics at 4Hz is fine. The client interpolates for
  smooth 60fps.
- The graph world model works; topology and physics on the server, visuals on
  the client.
- BLE pairing works mostly like I imagined, and isn't rock science.
- The protocol is workable. I have a json version and a binary version currently
- The nearby-edge BFS rendering approach is mostly correct and solves junctions,
  scatter, and world visibility in one system.

## More later

This post is already a little out of date at the time of publication, I've
started experimenting with gen1, started plugging raylib (with zig bindings)
into some other tools, made a little playground area to test approaches to
lighting and modeling, and generated some concept art for reference. I've been
working on other stuff lately anyway so I should be able to get out another
post before I make a lot more actual progress. Frike website coming soon too.
Anyway, onward.

## Demo video

<iframe width="560" height="315" src="https://www.youtube.com/embed/hxxnnKRNUs0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
