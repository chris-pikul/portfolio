---
title: "Chromaview - Development Breakdown - Part 2"
summary: "Scaffolding and building a new app, with React as the focus for UI"
timestamp: "2023-03-08T00:50:24Z"
tags:
  - Breakdown
  - Web
  - JavaScript
  - AR
  - Media
  - Series
  - Chromaview
---
# Chromaview - Development Breakdown - Part 2

[Chromaview](/projects/chromaview) started as an experiment in using web
technology (JavaScript) to deliver an augmented reality view of the world
through different color-blind modes.

This is a series intended to be a development breakdown of the process of
making Chromaview. In this part, I'll talk about scaffolding a new version of
the app from scratch, using a modern toolkit.

You can check out [part 1](./chromaview-breakdown-part-1.md) for a write-up on
the first version of this app.

## Why a New Version?

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

## Scaffolding the New Version

Some dependencies and setup was needed this time since I was going a bit over-
the-top on purpose. First, I planned on doing a monorepo in case I wanted to
try some other variations and internal libs, so I just made a folder for the app
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

## Relationship Between React, and Not-React

Here's the real trick with this whole React idea. I want React to handle the UI
work and DOM, but I don't want React to handle the actual processing and
workload of the camera filtering. So I need a component in React that displays
the canvas, as well as the controls, but passes processing off to a more
JS-native method that doesn't rely on React (in the event I change frameworks).

The UI/DOM part is easy enough. It's a functional component with the `<canvas>`
element in it, as well as the control overlay. I need access to the `<canvas>`
element so I used a hook for `useRef` that's bound using `<canvas ref={canvasRef}>`.

### Preparing For a Processor

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

## Handling Resize

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

```tsx
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

## Going Fullscreen

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

