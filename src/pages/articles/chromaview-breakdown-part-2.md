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

## Changing The Vision Mode

In the main `Camera` component, the one we've been writing so far, I added the
new state variables and a callback function for changing the Vision Mode. In
addition, I wanted the functionality to just "tap" the screen to cycle to the
next mode. To prepare for this, we add some state and callback functions to
handle this.

```tsx
// What is the current Vision Mode being used?
const [ currentVisionMode, setCurrentVisionMode ] = useState<VisionMode|null>(null);

// When called, will cycle the mode to the next available one, wrapping around
const cycleVisionMode = () => {
  const availKeys = Object.keys(VisionModes);
  const curInd = availKeys.findIndex(key => VisionModes[key].name === currentVisionMode?.name);

  const nextInd = (curInd + 1) % availKeys.length;

  setCurrentVisionMode(VisionModes[availKeys[nextInd]]);
};

// Used by the toolbar to select from a drop-down menu
const handleSelectMode = (mode:VisionMode) => setCurrentVisionMode(mode);

// Watch when vision mode changes
useEffect(() => {
  if(processorRef.current) 
    processorRef.current.changeLUT(currentVisionMode?.url);
}, [ currentVisionMode ]);
```

To break down what's happening, first I should mention, I keep all the Vision
Modes in their own "manifest" as a constant object. This manifest is just an object
containing unique keys, and a desription of the vision mode with the properties
needed to operate them. One of them looks like this:

```typescript
export type VisionMode = {
  id: string;
  name: string;
  classification: string;
  url: string;
  acuityDegrade?: number;
  summary: string;
  rates: [number, number];
  animal?: boolean;
};

export const VisionModes:Record<string, VisionMode> = {
  achromatomaly: {
    id: 'achromatomaly',
    name: 'Achromatomaly',
    classification: 'Monochromatic',
    summary: 'Weak to all colors',
    url: './LUTs/achromatomaly.lut.png',
    rates: [ 0, 0 ],
  },
};
```

The "state" we are maintaining holds the object record of our assigned Vision
Mode. When we want to change it, we just assign a new record and notify the
`Processor` of the change.

The `cycleVisionMode` function takes all the keys of the available modes and
finds the index of the current one. It then increments it while wrapping around
for array index bounds, then grabs the key at that index and assigns the record
belonging to it.

`handleSelectMode` just passes the wanted record directly in to the state.

The magic I suppose, is in the `useEffect` block that watches for changes to the
`currentVisionMode` state, and then notifies the `Processor` to change the
current LUT. From there, the `Processor` should handle the rest.

These functions are passed through to the "Toolbar" components, as well as
bound to the click event on the "overlay" component holding all the additional
UI controls.

### A Selector to Select

In order to display during usage what the current Vision Mode is, as well as
allow the user to select one, I created a custom `Selector` component which
mimics in very simple ways a `<select />` element.

I'm honestly not going to go into much detail about this because it's just
generic React usage for the most part. I will say, that I had trouble with all
of the click events propogating through objects on the UI portion. Leading to
the parent objects receiving them. The parent object for these UI elements is
actually a wrapper div that when clicked cycles the vision mode. This lead to a
bug where tapping the selector (or any button for that matter), would cause the
Vision Mode to cycle.

To correct this, I had to modify all the click events I used and add a helper
function to stop the event propogation.

```typescript
const noClickThrough = (evt?:MouseEvent) => {
  // Prevent click-through
  if(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }
};

// Elsewhere in components...
const handleClick = (evt?:MouseEvent) => {
    noClickThrough(evt);

    // Perform our actual action...
};
```

When the current vision mode bar is clicked, it opens a menu showing all the
options. For this, it's essentially a dialog list of buttons that have some
typography to describe what they are. When selected it uses the
`handleSelectMode` callback that was passed to it from above to tell the main
display component to switch the Vision Modes.

## Responding to LUT Loading

When I talk about the `Processor`, you'll be informed that when a Vision Mode
is chosen, it's LUT file (a PNG image of the output color mapping) will be
loaded asynchronously. Because it's async, I'll need to notify the user of the
changes in state during this process. Basically the events of `Loading`,
`Success`, and `Error`. This way, the short (hopefully) pause during loading
doesn't make the user feel as if it's broken. Additionally, if something goes
wrong like internet outage then the user can be notifies of such.

To do this, I created a new component called `LUTState` that is passed the
`Processor` reference we currently have.

This component holds 2 state variables for `isLoading` and `hasFailed` so we can
cover the 3 states we need. I suppose it could just be one enumerated field but
this seemed to be the easier method at the time.

I leverage a `useEffect` again here, to watch the processor reference and bind
to the `Processor` callback hooks. Essentially the `Processor` class will have
some properties that are used as callbacks for when the LUT state changes and
assigning them a function allows React to know when something has happened.

```typescript
useEffect(() => {
    // Bind the callbacks
    if(processorRef.current) {
      processorRef.current.onLUTLoading = handleLoading;
      processorRef.current.onLUTFailed = handleFailed;
      processorRef.current.onLUTSuccess = handleSuccess;
    }

    // Cleanup so we don't have stale component state in the processor
    return () => {
      if(processorRef.current) {
        processorRef.current.onLUTLoading = noOp;
        processorRef.current.onLUTFailed = noOp;
        processorRef.current.onLUTSuccess = noOp;
      }
    };
  }, [ processorRef.current ]);
```

Pretty cut and dry here. The `noOp` is just a dumb arrow function that I've used
for no-operation. Some claim to use `Function.prototype` instead but I've heard
of potential performance issues with that so better to be save and do:

```typescript
const noOp = () => {};
```

Not so hard. Anyways, then depending on the state the app will show a spinner
for loading, or a message dialog for errors that basically just says to reload
the app.

## Conclusion

There are some extra details I'm sure a missed or glossed over, but for that you
can read the code itself on the [GitHub repository](https://github.com/chris-pikul/chromaview).

At this point, outside the `Processor` itself, the React side should be operating
correctly and we are ready to actually implement the functionality. To find out
how that's done, there's [part 3](./chromaview-breakdown-part-3) to read.
