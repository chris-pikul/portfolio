---
title: "Chromaview - Development Breakdown - Part 1"
summary: "The initial attempt at developing Chromaview, and lessons learned"
timestamp: 2023-03-08T00:50:24Z
tags:
  - Breakdown
  - Web
  - JavaScript
  - AR
  - Media
  - Series
  - Chromaview
heading: Chromaview
subheading: Development Breakdown
part: 1
---
# Chromaview - Development Breakdown - Part 1

[Chromaview](/projects/chromaview) started as an experiment in using web
technology (JavaScript) to deliver an augmented reality view of the world
through different color-blind modes.

I originally became interested in this in late 2018 after learning one of my
best friends was color-blind, and wondering what the world might look like to
them. I was also using this as an excuse to play with new Web Standards and
Rust/WASM.

The idea was simple, use the device's camera (preferable environment facing
on mobile) to get a view of the world. Then apply a color filter to change the
visible spectrum to color-blindness. Of course, there are many different modes
of color-blindness, so some ability to switch the filter was needed. So a basic
UI to change the mode. Either way, present the results as a full-document or
full-screen canvas to have the most immersion as possible.

## Introduction

This is a series intended to be a development breakdown of the process of
making Chromaview. In this part, I'll talk about the very first version which
was a working prototype, and some lessons learned about it. In future articles,
I'll discuss the new version and the improvements I've made.

The first attempt was as raw to the ways of web tech as I could get. A single
HTML file and a hand-written (no processors) JavaScript file to handle the
UI building and workload. Effectively the site was just a single canvas and
some classic HTML tags for the mode selector and fullscreen button. CSS would
then just maximize these elements and place them accordingly for a full-screen
(or document) canvas with the UI controls overlaid. Then the JS would come in,
bind the events, get the media stream, and start working.

It's been a few years since then so memory is a bit foggy. But I do remember
finding mathmatical formulas on converting incoming RGB data into a color-blind
version. So this was my first attempt at filtering the incoming video.

## From Camera, to Canvas

Interestingly, in all their grand wisdom, there is no straight forward way to
just get a frame from a video stream after you've aquired it with
`getUserMedia`. No, in fact you have to create a dummy `<video>` element and
set it's `src` to the video track you received from `getUserMedia` (given
the user OK'd it in the first place).

Now that there's a video element receiving the camera's stream you can then just
access that element and get the frame... right? Nope, of course not.

Instead you need to use a canvas rendering context, and call `drawImage` to just
draw the video element to your canvas. From there, you ask the canvas context
for it's frame data via `getImageData` to get a `ImageData` object containing
the cached frame data. Inside that, luckily, is a `data` property represented as
a `Uint8ClampedArray` of the red, green, blue, and alpha channels. With this
frame data, we can start to perform the transformations needed.

When all filtering and transformations are done to the frame data, we can
present it to the user by again using the canvas context's `putImageData` method
to apply the frame back to the canvas with it's new data.

Wrap all this into a `requestAnimationFrame` loop, and, "bob's your uncle" as
they say. Now, it is important to note some possibly not obvious optimizations
and considerations you should make during this process. Ones that I did not make
in the first attempt, but I leave that for later in this article as it's part of
my rewrite.

## Applying the Filter, Via Math

So, how do I apply the color changes needed now that I have a byte buffer of the
camera data? Using some formulas found online (sorry, to long ago, don't have
source links). I tried the math approach in JS. Essentially taking the RGB
channels, apply some math, and return new RGB channels using a pure function was
the plan.

In JavaScript this turned out very poorly. The performance was abismal,
achieving framerates of sub-tens. There was no way this was gonna work. So I
reached for the newest hottest technology I could find. Web Assembly. Touted as
being "near-native" execution and having zero use outside of heavy calculations
this seemed like a good choice. I additionally was curious on this new fangled
Rust language that was starting to get traction, and it offered memory-safe
speed and WASM targeting so I took a crash course on their site and installed
the necessary tools like Cargo and all.

The newest plan as of now. Was to get JS to setup a data buffer via a shared
`Uint8ClampedArray` much like the one I got during the whole camera-to-canvas
debackle. I would pass this to WASM after it was loaded and ready and ask it to
do the math. When it was done, given that it was "shared memory" I'd just apply
the data buffer back to the canvas and be done with it.

This whole thing improved things to some end. Framerates did increase, but only
to the tune of maybe 20-30 frames per second. If WASM at the time had the SIMD
instructions they say they have now, I might of been able to vectorize the whole
operation and squeeze a 3x improvement (just guessing here), but alas it did
not. A new methodology was needed.

If curious, here is the permalink to the original rust code I wrote to handle
all this on [GitHub](https://github.com/chris-pikul/chromaview/blob/87a7d7a436acf41c871110a2ac582ed2953c8674/legacy/rust/src/lib.rs)

## Apply the Filter, Via LUT

Remembering my hobbyist game development, I looked to an old tech method but a
good one. 3D look up tables. They're effectively small images containing a
mapping of the RGB color spectrum on them, that you can use to calculate an input
coordinate using your "source RGB" color to get a pixel that represents your new
"destination RGB" color. They are lightweight enough since they are mostly just
512x512 PNG images (careful here, JPG is lossy).

So the new plan is to make a series of LUT images that have the color-blind
filters applied to them. This way, it's baked into the image data and I can
really just generate new ones for whatever purposes I want. I imagine this is
how a lot of social media photo filters work at their most basic (think
Instagram filters). Anyways, using the image data from these LUTs I would then
calculate the pixel coordinate needed using the incoming camera data RGB. With
the pixel aquired, just output that color to the destination canvas and I'd be
done. Just a one-to-one mapping really.

First some math was need to get the coordinate on the LUT using an incoming RGB
truple. This was actually a bit tricky to figure out on my own (ugh, math is not
my strongest) but luckily this is a fairly bog-standard algorithm and plenty of
examples exist that just need to be tailored to my needs. Here's the one I found
and used:

```javascript
function toLUTCoord(r, g, b) {
    r = Math.floor(r / 4);
    g = Math.floor(g / 4);
    b = Math.floor(b / 4);

    let x = (b % 8) * 64 + r;
    let y = Math.floor(b / 8) * 64 + g;

    return (y * 512 + x)*4;
}
```

I've grown as a coder and would change some things in that original function
just for my own sanity, but I'll leave it for posterity.

Now as we've experienced before with the whole video stream to canvas thing in
order to get the image data, this would need to be done again for the LUT images
because of course we do. So again: a dummy `<canvas>`, followed by a canvas 
context, followed by `drawImage`, followed by `getImageData` and we now have the
pixel information from the LUT image we loaded.

From here we just need to iterate over the entire camera source buffer we have,
convert the source RGB to LUT coordinate using the `toLUTCoord` function above,
then access the LUT image data buffer using it as an index, and pull out the new
destination RGB, and finally override the buffers data with the destination RGB
and stick it back in the display canvas. Whew. Done.

Framerates improved dramatically with this attempt. Desktop was achieving about
50-60 frames per second. My low quality mobile device I use for app testing
liked this better, but it was still stuttering at about 25-45 frames a second
with some hichups in between. It wasn't perfect. But it worked.

## Conclusion

For an early prototype, it felt good and worked well enough. Performance was
spotty, and UI quality left a lot to be desired. But it did what I intended it
to do. Additionally, getting to play with WASM in a "real world"-ish situation
was a great learning experience.

A glaring mistake I didn't notice until the rewrite, was that I was applying the
filter to the document sized canvas instead of the input "signal". This meant my
algorithm had to iterate all the fullscreen pixels instead of the probably more
limited input pixels from the camera. Additionally, I never specified the wanted
camera size well so browsers may provide the smallest resolution they have. This
lead to a potential for a lot of upscaling of the image reducing the quality of
the image.

### Next Installment

In the [next article, part 2](./chromaview-breakdown-part-2.md) I'll start
rewriting the whole app from scratch using modern toolkits to provide a better
quality experience, albeit at a "bundle size" cost.
