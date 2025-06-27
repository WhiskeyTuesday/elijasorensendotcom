---
title: open sim hardware (part one)
description: the last thing I need is another project but...
date: 2022-09-28
tags:
  - hardware
  - airplanes
  - flightsim
  - hacking
  - imaginary airplanes
layout: layouts/post.njk
---
The last thing I need is another project (I should be working on [my startup](http://www.getgather.app) right now for that matter, but I've been getting back into flightsim lately and I started looking into desktop simulator avionics. I was hoping that somebody, anybody, had come up with a good opensource platform. The state of the industry so to speak is still less than inspiring. I have some thoughts on what to do.

This post is going to be incredibly messy and basically a draft until I get a lot further in the process and come back to edit it (if I ever do). This first post will focus on desktop avionics, mostly radios and instruments. Following posts will go into primary flight controls and other peripherals like seat shakers and belt tensioners. Anyway:

### part one: an overview of the market as it stands
There are a lot of options to take into account at various price levels. The one that a random reader might be most familiar with is the product line that logitech now produces, formerly Saitek products. These include [radio panels](), an [autopilot panel](), [switches](), [pseudo garmin G3-ish instruments](), and a few others. They work well in FSX/ESP/P3D with proprietary drivers and can be made to work in XPlane and MSFS2020; I am not familiar with exactly how well. I don't know if they can be made to work in other simulators (DCS or IL-2 for example). I have a few of these panels but I have never gotten them set up in anything except FSX so far. There are some third-party software available that extend the capabilities of some of these products, particularly the G3X/G5 style instruments logitech calls FIPs or Flight Information Panels. Check out [FSX Times for instance](https://fsxtimes.wordpress.com/)

The rest of these companies are detailed in no particular order; if there are manufacturers out there worth mentioning that I have missed please drop me a line at hey@elijasorensen.com

FlightIllusion: This company seems to make the most expensive and highest quality GA panels that I can find. A full bendix-king style radio stack like you might find in a trainer 172 at your local airport costs about 3500 Euros. The panels seem to communicate with a single interface over RS232, which then relays to the host computer over USB. Also available from this company are many individual seemingly electro-mechanical needle gauges, over which I drool. They also make flight controls (which may be the topic of a future post). No GPS or PFD modules seem to be on offer. No G3X type instruments seem to be available.

RealSimGear: Mostly known for GPS modules (which I think I will deal with in a follow-up post) replicating the GNS430 and 530 and the GTN 650 and 750, the G500, G1000, G1500, as well as avidyne panels. They also make button boxes replicating controls found in Cirus aircraft and some other flight controls including a Cirrus style throttle quadrant.

Propwash Simulation: A smaller operation that seems like it's on the right track. Unfortunately their hardware is all closed source, which rubs me the wrong way though I certainly don't fault them for it. At their much more reasonable pricepoint it's reasonable to think that if the software were open source people would build their own hardware and take advantage of their work without paying anything for it. Their hardware is arduino based running on 16u4 chips. Each module is its own USB host. A GNS530 module is available but currently out of stock. No individual gauges (mechanical or G3X/G5 type) are avaliable.

Desktop Aviator: Putting aside the website which goes into the Space Jam 1995 hall of fame for outdated design, this company makes some well reviewed products. Mostly switch panels of various descriptions. They also make available USB interface boards for hobbiests to make their own custom hardware with. Each module seems to be its own USB host.

Virtual-Fly:

FSXDual: This is more of an honourable mention kind of thing as it's not really an avionic but it warrants a mention. These are USB audio cards with the correct impedence for real general aviation headsets and the ability to balance the simulator audio vs the headset audio. Two-headset dual versions and single-headset solo versions are available as well as units with helicopter plugs.

### part two: motivations and influences of mine; a plan, perhaps

### part three: a statement of vision, scoping

### part four: musings on technological choices
#### hardware (human interface)
#### hardware (technical)
#### firmware
#### software
