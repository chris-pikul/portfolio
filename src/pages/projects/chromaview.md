---
title: "Chromaview - In browser vision AR"
summary: "An experiment in using web technology to deliver an augmented reality view of the world through different color-blind modes."
timestamp: "2023-01-25T12:00:00-08:00"
tags:
  - Web
  - JavaScript
  - AR
  - Media
---
# Chromaview

## Introduction

Chromaview started as an experiment in using web technology (JavaScript) to
deliver an augmented reality view of the world through different color-blind
modes.

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

## Initial Attempt

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

### From Camera, to Canvas

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

### Applying the Filter, Via Math

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

### Apply the Filter, Via LUT

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

## A New Start

Github's dependabot and security warnings are great. But they have constantly
been giving me messages about vulnerabilities in my chromaview repository since
probably shortly after I initially made the repo. The resoning was sound, I hade
a `package.json` file using an old version of `webpack` to help with bundling
this up into a final upload and something in one of those dependencies was
flagged as no good.

Either way, I started thinking about the old project some more and thought
maybe it could use a refresh. So I started the task of making some new dev
branches, archiving the old master branch, and starting fresh with a clean repo.
I'd learned a lot in the previous attempt and in general over the years, as well
as it being a fairly decent portfolio project to show off some chops, I'd tasked
to remake it.

So as anyone does these days in 2022 in the Web/JS ecosystem I'd bring a ton of
un-necessary-probably frameworks and dependencies to get to work. Granted the
first methodology worked just fine with a HTML and a JS file and call it a day;
but these days it feels like if you don't have a public project with at least
TypeScript on it, let alone React, are you really a web developer? Also, I
wanted an introduction/launch page of sorts so React would help with this while
keeping it a SPA. And I do love types.

### Scaffolding the New Version

Some dependencies and setup was needed this time since I was going a bit over-
the-top on purpose. First, I planned on doing a monorepo in case I wanted to
try some other variations and internal libs, so just made a folder for the app
and started with `pnpm init` (I like PNPM right now, but Yarn is nice too). From
there I figured I'd use [Vite](https://vitejs.dev) for this since it would
scaffold up the project for me and the bundling is much quicker than the old
Webpack way. I also figured I'd try this new [SWC](https://swc.rs) bundler that
Vite says it's compatible with. All in all, the Vite template I used was the
`react-ts-swc` which they don't directly mention but you can find it in their
repository as a listed option. This gave me SWC, TypeScript, React, and Sass as
a starting point. From which I immediately deleted the starting code and assets
like the Vite logo and all. Starting fresh!

I like Sass, I feel almost naked without it, so a quick setup for Sass using the
SCSS syntax to get my `index.scss` file ready with my favorite CSS reset the
[Eric Meyer's Reset](http://meyerweb.com/eric/tools/css/reset/) was needed. I
added "Montserrat" font from Google to freshen up the typography as well. To
finish the styling setup I jotted some colors down to use as a palette.

For the React side, I just created a main `<App />` functional component using
TypeScript that maintained two state objects for `showIntro` and `transition`.
The first is most important as it set's whether the intro splash page is shown,
or is the camera view shown. The second `transition` one is to track whether the
animation to fade-out the splash and fade-in the camera was working. If your
curious, doing the transition looked like this:

```javascript
// Maintain the state on if we are transitioning
const [ inTransition, setTransition ] = useState(false);

// This is used by the button component as it's click handler, it's passed
// down through prop drilling
const startTransition = () => setTransition(true);

// Watch the transition state for changes and then timeout for the fade duration
useEffect(() => {
  if(inTransition) {
    const handle = setTimeout(() => {
      // Hide the intro by changing the state that switches the components.
      hideIntro();
    }, 1000);

    return () => clearTimeout(handle);
  }
}, [ inTransition ]);
```

The transition only needs to go one way. This isn't technically the greatest
decision for UX reasons, but it would work for how small this app is.

#### Relationship Between React, and Not-React

Here's the real trick with this whole React idea. I want React to handle the UI
work and DOM, but I don't want React to handle the actual processing and
workload of the camera filtering. So I need a component in React that displays
the canvas, as well as the controls, but passes processing off to a more
JS-native method that doesn't rely on React (in the event I change frameworks).

The UI/DOM part is easy enough. It's a functional component with the `<canvas>`
element in it, as well as the control overlay. I need access to the `<canvas>`
element so I used a hook for `useRef` that's bound using `<canvas ref={canvasRef}>`.

For the processing part, I wanted it standalone so created a folder holding a
default exported class called `Processor` that would maintain everything needed
for doing the filtering. I like ES6 classes and think it's a shame that React
dropped them for the most part.

To connect this class which I only want one instance of, and the React UI, I
again turned to `useRef`. The instantiation of the ref is null at first but using
`useEffect` with an array containing the `canvasRef` as it's dependency we can
basically watch for when the canas gets mounted and react (ha) to that as needed.
From there I check that the canvas reference is valid and that I don't have the
processor setup yet, and then perform the construction and setup needed. This
part of the process looks like this:

```tsx
const canvasRef = useRef<HTMLCanvasElement|null>(null);
const processorRef = useRef<Processor|null>(null);

// Watch for the component to mount
useEffect(() => {
  // If we have a canvas element
  if(canvasRef.current) {
    // But we don't have a processor object
    if(!processRef.current)
      processorRef.current = new Processor();

    // Either on mount, or re-mount, tell processor about the new/updated
    // canvas element
    processorRef.current.setCanvas(canvasRef.current);
  }
}, [ canvasRef ]);

// The rest of the return is removed, but this is the idea
return <canvas ref={canvasRef} />
```

From here, we can use the `processorRef.current` reference to access the class
or object for communication between. This is paramount for duing the DOM events
in the UI controls.

#### Handling Resize

One of the functions I needed to watch for was resize events. Since the
`<canvas>` element displaying this will take the full size of the document or
screen I need to be aware of it's size, as well as when that size changes.

To do this, I looked for the classic resize event on the window object. This
could have been done inside the `Processor` class, but I decided to keep this
decoupled and have React handle this since it's in charge of the UI. To bind to
a window event we need to do a couple things.

First, we need to bind to the event, and preferably only once. Given I already
have the `useEffect` hook for detecting the canvas change, I decided to double
up and strap this into there. This is done using the `window.addEventListener`
method binding to `resize` event. To ensure this only binds once and when the
DOM changes to unbind old listeners to prevent dead referances I employed the
return callback in `useEffect` to do the cleanup. With the event bound, I just
pass the callback into our `Processor` reference I set up earlier. This whole
part can be summed up in this snippet:

```typescript
const wrapperRef = useRef<HTMLDivElement|null>(null);

const handleResize = () => {
  if(wrapperRef.current && processorRef.current) {
    const bounds = wrapperRef.current.getBoundingClientRect();

    // Pass the event onto the Processor object
    processorRef.current.handleResize(bounds);
  }
};

useEffect(() => {
  // Bind the event here
  window.addEventListener('resize', handleResize);

  // ... code from earlier about Processor setup

  // Cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}), [ canvasRef ];

return <div ref={wrapperRef}>
  <canvas ref={canvasRef} />
</div>
```

You'll notice I use another reference to map to the parent wrapper `<div>` that
holds everything. This is because the size of the canvas is more or less directly
specified, and I found having a wrapper just worked better. Especially for the
control UI and placing it correctly with CSS.

The actual size is passed to the `Processor` from the function
`getBoundingClientRect` which returns a `DOMRect` object describing at least the
width and height of the specified element, which in this case is the wrapper.

#### Going Fullscreen

Because React is handling the UI and DOM events, it's also the place I chose to
handle the fullscreen switch functionality. This way, the fullscreen button can
map directly to the handler. It requires two parts though. The first is to
actually bind to the fullscreen button to start the transition.

The second, is to listen for fullscreen change event on the window so we know
when the user exited fullscreen and act accordingly. Together with the first
part we can maintain a state variable to know whether we are, or are not, in
fullscreen to adjust the UI buttons as needed.

My research shows that performing the request to go fullscreen is pretty well
standardized and accepted across vendors. Detecting if the document is in
fullscreen-mode on the other hand, is not.

To go fullscreen, the button handler first needs to detect if we already are in
fullscreen so we can toggle the effect. I chose to detect the state
programmaticaly instead of use my state variable here in case something gets
out of sync. Anyways, here's the functionality to do this:

```typescript
const toggleFullscreen = (evt?:Event) => {
  // I needed to block clickthrough of the button for some reason
  if(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  // If we already are in fullscreen, then exit. Otherwise ENGAGE!
  if(
    ('fullscreenElement' in document && document['fullscreenElement'] !== null) || 
    ('mozFullScreenElement' in document && document['mozFullScreenElement'] !== null) ||
    ('webkitFullscreenElement' in document && document['webkitFullscreenElement'] !== null)
  )
    document.exitFullscreen();
  else
    document.documentElement.requestFullscreen();
};
```

To watch for the fullscreen change, I hooked into the existing `useEffect` I'd
been using for setup and to bind the resize event and just added this into it.
It saves the current fullscreen mode to a state variable so I can change UI
icons later. Pretty cut and dry here:

```typescript
const detectIfFullscreen = ():boolean => (
  ('fullscreenElement' in document && document['fullscreenElement'] !== null) || 
  ('mozFullScreenElement' in document && document['mozFullScreenElement'] !== null) ||
  ('webkitFullscreenElement' in document && document['webkitFullscreenElement'] !== null)
);

const [ isFullscreen, setFullscreen ] = useState(detectIfFullscreen);

handleFullscreenChange = () => setFullscreen(detectIfFullscreen());

useEffect(() => {
  // ... the resize handler is here
  window.addEventListener('fullscreenchange', handleFullscreenChange);

  // ... processor setup is here

  return () => {
    // ... resize handler cleanup is here
    window.removeEventListener('fullscreenchange', handleFullscreenChange);
  }
}, [ canvasRef ]);
```

Note, that the convienience function `detectIfFullscreen` can be used above in
the `toggleFullscreen` function as well. I'm just making stuff easier here in
this article.

### Camera Filters, Again


