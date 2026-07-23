---
title: I am become gamedev, renderer of worlds; or how I learned to stop worrying and love shaders and stuff
description: speculative fiction from a possible future
date: 2026-04-13
tags:
  - cycling
  - hacking
  - gamedev
  - zig
  - frike
---

*Disclaimer: this is a piece of speculative fiction written today (April 2026)
from the perspective of my future self looking back on the next few weeks. None
of this has happened yet. I'm publishing it now as a kind of dare to myself. If
it turns out to be completely wrong that'll be funny too.*

---

So I shipped the Python prototype. Five worlds, real BLE hardware, the whole
deal. Wireframe graphics like it's 1984 and I'm David Braben. It worked. People
could ride. The physics were correct. The protocol was sound. The FIT files
uploaded to Strava. I declared victory on "g0" and then stared at the ceiling
for a while.

The next step was obvious and terrifying: I had to become a game developer.

## The part where I panic about shaders

I have never written a shader. I want to be clear about this. I have written
operating systems curriculum, I have written event sourcing infrastructure, I
have written BLE protocol parsers. I have not written a shader. The word
"fragment" in a programming context makes me think of memory allocation, not
light.

Here is the thing though. My flat-shaded low-poly aesthetic — the one I chose
for artistic reasons and because I thought it would be easier — turns out to
require approximately the simplest possible shader. I'll reproduce it here in
its entirety:

```glsl
flat in vec3 fragNormal;
uniform vec3 lightDir;
uniform vec4 colDiffuse;

void main() {
    float NdotL = max(dot(fragNormal, lightDir), 0.0);
    float light = 0.3 + 0.7 * NdotL;
    finalColor = vec4(colDiffuse.rgb * light, colDiffuse.a);
}
```

That's it. That's the entire lighting model. Dot product of the face normal
with the sun direction, mix it with some ambient, multiply by the color. One
color per face. No textures. No PBR. No normal maps. No shadow maps. The `flat`
keyword tells the GPU "don't interpolate anything across this triangle, I meant
what I said."

I spent three days being afraid of something that turned out to be six lines of
high school trigonometry in a slightly funny syntax.

## Raylib and the art of not using an engine

I had a whole crisis about whether to use Godot. It has an animation editor! A
scene tree! Blend spaces! The vibes are good! The community is nice!

Then I remembered that my world model is a directed graph computed from server
data and Godot wants you to arrange things in a scene tree in an editor and I
realized I would spend more time fighting Godot's assumptions about how games
work than I would spend just... drawing triangles.

Raylib is a C library. It gives you a window. It gives you `BeginMode3D()` and
`EndMode3D()`. It loads glTF models. It plays sounds. It does not have opinions
about your architecture. This turns out to be exactly what I wanted.

The entire rendering loop is: open a 3D context, draw some models, close it,
draw some 2D text on top. I already wrote this in Python with pygame. The Zig
port is the same code with better types and no garbage collector.

## The animation revelation

I was terrified of skeletal animation. Bones? Quaternion slerp? Inverse
kinematics? These are words that game developers say to each other to establish
dominance.

Then I looked at what I actually need to animate. A cyclist on a bike. The
cyclist:
- pedals (legs go in circles, cadence-dependent)
- coasts (legs stop, sits upright)
- stands (out of saddle climbing)
- waves (emote, upper body only)
- tucks (aero position at speed)

Here is the animation state machine:

```
const pose = switch (state) {
    .pedaling => blend(pedal_low, pedal_high, cadence / 120),
    .coasting => coast,
    .standing => stand,
    .emote => emote_poses[id],
};
const final = blend(previous_pose, pose, transition_timer);
```

It's a switch statement and a lerp. The prototype already does this — the
Python `make_rider_animated` function picks joint positions based on pedal phase
and body sway. I just didn't realize I was writing an animation state machine
because it didn't have any of the scary words in it.

Blending between two bone poses is: for each bone, interpolate the position
(lerp) and the rotation (slerp). Quaternion slerp sounds intimidating until you
look at the formula and realize it's four multiplies and an acos. Thirty lines
of Zig.

## The Blender chapter

I don't know Blender either. I have opened Blender twice before; once in 2019
to look at it and once in 2022 to look at it again.

But the modeling requirements for flat-shaded low-poly are... modest. A bike is
some cylinders and rectangles. A tree is a cone on top of a box. A rider is a
bunch of boxes with joints. There's no texturing, no UV unwrapping, no material
graph nonsense. You make shapes. You assign them colors. You export to glTF.

I made my first bike in about an hour. It looked like a bike drawn by someone
who had seen a bike described to them over the phone. But it had the right
number of wheels and it loaded into Raylib and I could make it spin and I felt
like a god.

## The performance epiphany

The Python prototype runs at 30-60fps doing wireframe rendering of maybe 5000
line segments. I did back-of-envelope math on what the Zig client would need to
do. My conclusion was that the rendering would use approximately 1% of the
frame budget.

Let me say that again. The entire geometry pipeline — road generation,
scatter placement, model transforms, perspective projection, every triangle on
screen — takes about 100-200 microseconds at native speed. At 60fps I have
16,000 microseconds per frame. The rendering is a rounding error.

This means I can draw everything. No aggressive culling. No LOD tricks (though
I added them anyway because they were easy). No worrying about draw call
budgets. The flat-shaded aesthetic that I chose for vibes turns out to also be
approximately the cheapest possible thing to render. No texture sampling. No
shadow passes. No post-processing. Just: for each triangle, dot product, multiply,
done.

I should have been a game developer this whole time. It's all the fun parts of
systems programming with pretty pictures at the end.

## Discoveries

**Clay is great.** It's a C layout library that computes rectangles. You tell
it what you want (row of buttons, scrollable list, centered panel) and it tells
you where to put them. Then you draw them however you want. It has no opinions
about what your UI looks like. For menu screens in a game this is perfect — I
want the layout math, I don't want a widget toolkit's idea of what a button
should look like.

**The sound engine ported in an afternoon.** Three synthesized audio layers
(wind, drivetrain, freehub) in Python, three synthesized audio layers in Zig.
Raylib gives you an AudioStream, you fill a buffer with PCM samples, it plays
them. Same API shape as pygame's mixer. I added tire-on-surface sounds (the
rumble changes with road type) and it took maybe an hour. Synthesis is
underrated — zero audio assets, infinite variation, tiny binary.

**The road is the easy part.** I was worried about generating road mesh from the
graph world model. It's the same algorithm as the Python prototype: walk the
edge, sample positions, compute perpendiculars, emit a triangle strip. In Zig
this generates a full world's worth of road geometry in single-digit
milliseconds and then it's cached forever because the terrain is static.

**The BLE situation is annoying but solved.** SimpleBLE is a C library that
abstracts BLE across Linux, macOS, and Windows. I `@cImport` it from Zig and
all the FTMS protocol code ports almost line-for-line from the Python original.
The hardest part remains the platform-specific bonding quirks, and those are the
same regardless of language.

## The graph-to-world pipeline

This is the part I'm most proud of, because it's the part that feels genuinely
novel.

The server sends you a graph: nodes with positions, edges with elevation
profiles. Your client turns this into a world. The same data that the Python
wireframe client interpreted as green lines on a black background, the Zig
client interprets as flat-shaded polygon roads with scattered props and animated
riders.

The server doesn't know or care. It's still doing the same F=ma it's always
done. The world is topology and physics. The beauty is someone else's problem.

There's something very satisfying about watching the same ride that used to look
like an Acorn Electron demo now look like a Virtua Racing cabinet. Same server.
Same protocol. Same edges and nodes. Same physics tick. Just a different set of
triangles.

## Things I was wrong about

- I thought I'd need to understand "real" 3D math. I already understood it.
  `friketech0.py` — the hand-rolled matrix library from the prototype — ports
  to Zig unchanged. Vec3, Mat4, perspective projection, camera transforms. I
  wrote all of this in Python without realizing it was "gamedev."

- I thought shaders would be a rabbit hole. The flat-shaded shader is six
  lines. I've spent more time on the sound engine.

- I thought I'd miss an engine's tooling. I don't. Raylib's API is cleaner than
  any engine's, because it does less.

- I thought animation would be the hard part. The protocol is the hard part.
  BLE is the hard part. Getting BlueZ to not throw "Unlikely Error" is the
  hard part. Making a polygon man pedal a polygon bike is the easy part.

## What's actually hard

The game server. Not the physics — that's trivial. The persistence. The economy.
The social layer. The event system. The companion app. The authentication. The
billing (even at $0, you still need accounts and infrastructure). All the stuff
that isn't rendering and isn't physics and isn't glamorous and doesn't produce
pretty screenshots for blog posts.

That's what the next few months are about, if I'm honest. But this week was
about becoming a game developer, and I'm still riding that high, and the
screenshots are going to be SO good.

## Conclusions such as they are (part two)

Indoor cycling software reads a 16-bit integer from a Bluetooth sensor four
times a second and does F=ma. The rendering is a flat-shaded fragment shader
that's six lines long. The animation system is a switch statement and a lerp.
The sound engine is three sine waves and some noise. The road is a triangle
strip extruded along a graph edge.

None of this is hard. It was never hard. The hard part was believing it wasn't
hard.

If you've been wanting to build something graphical and you're scared of
shaders: they're just math with a slightly funny syntax. If you've been wanting
to build a game and you think you need an engine: maybe you don't. If you've
been telling yourself you're "not a game developer": you might already be one.
You just haven't drawn the triangles yet.

I'm going to go ride my polygon bike through my polygon world now. It looks
like Virtua Racing and it feels like freedom.
