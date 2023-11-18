---
title: "Ruminations 1 - Back to the Future"
summary: "History seems to repeat itself, even in development. Are we coming full circle in terms of frontend development? I think, probably!"
timestamp: 2023-11-01T22:34:02+03:00
heading: Ruminations 1
subheading: Back to the Future
tags:
  - Thoughts
  - Series
  - Frontend
---
# Ruminations 1 - Back to the Future

> The Ruminations series is an on-going topic of rantings and ravings. There may
> or may not be useful information here.

Development these days, at least in the frontend web world is always changing
quicker than most people can keep track of. For those of us that do this type of
work day-in day-out (such as myself) it becomes a daily chore to read up on all
the new technology that either changed, or was invented, within the short time
span of yesterday. As of today, November the first, 2023; the hot newest talking
point is the release of React server side components and embedding backend in
the frontend (again). The "RSC" idea is not necessarily a new one, but it is
new for the JS world. Next.JS has been beating this drum for a while now, and it
seems with Vercel scooping up most of the React foundational team their agenda
has now been pushed beyond the borders of their own product. RSC basically makes
it so you can write backend processes in your frontend processes, or at least
something like that. Sure, on the shallow end it's about server side rendering
and differentiating between server delivered components and those that exist on
the client side. But as they eluded with a deceptively simple example featuring
SQL query directly in a "server component", this will open up a whole new chapter
for React based frameworks and how we build applications. Is this good? Maybe.

## Trip to the Past

Some may remember the days of ASP the lovely forgotten realm of Microsoft's first
foray into making life difficult for developers before the advent of C# and .NET.
The savvy historians may remember that PHP was released a year before ASP so an
argument could be made for who did what first and popularized it. Either way,
they both had this magical mission to allow for dynamically served pages. It
breathed life into the Web where before it was stale and motionless. And thus,
the differences between server and client where cemented into the job descriptions
of web developers everywhere.

The idea, was roughly the same (kind of?). Users asked for a webpage and some
magic scripts on the server decided on the spot what to deliver them. They
generally considered things like state (don't tell REST people) and request
headers to make up their minds. I don't honestly see that much of a difference
between those days and this new RSC mechanism. Granted, with PHP you had to write
PHP, and then HTML, and CSS, and JS, and whatever else. Whereas now you have to
write TypeScript/JavaScript, React JSX, possibly CSS, and whatever framework
dependent APIs come with them. Tit-for-tat they seem about the same amount of
work honestly.

## So What Happened?

Now that we know today, and yester-year, what happened in-between? At some point
the SPA (single page application) craze hit the internet. Some say React did it,
others say jQuery and AJAX was pushing us there anyways. I suppose the idea was
that hosting servers was expensive still, so if the developer could offload as
much of that work as possible to the client they could avoid massive data centers.
It also offered a way to provide nice transitions and some-what-bandwidth-saving
caching features.

Here's my problem with SPA's. They got crazy. Too big; offloaded too much. I've
seen backend engineers just shoveling as many tasks and business logic implementations
as they possibly can onto the frontend departments issue tracking. And once people
started embedding massive amounts of dependencies, and Lottie animations, and
icons, and fonts; it's gotten to be too much. JavaScript and NodeJS for no small
part gave the entire world's developers foot-guns free of charge. Business and
project managers rejoiced in the idea of stuffing as many open-source dependencies
into their projects as they could possibly get away with not paying for. They
scoffed at made up terms like "tech debt" with impunity. The concept of scaffolding
a start-up with React used to be plausible, but now any quick-start guide that's
less than 10 pages (printed in 12px Times New Roman) is just straight up lying
and glossing over huge swaths of considerations to be made. Anyways, I digress
to much on dependency hell...

At some point, new generation developers came up with a brilliant idea: what if
we made the server generate some of the frontend for clients so it's faster? 
Brilliant I say. Never heard of it before I swear (see the chapter above).

## Back To The Future

It seems, quite frankly, that we are going back to the future. We are attempting
again to write all the different technologies in one place and doing the backend
with the frontend. PHP is still kicking, so if this React rollercoaster is making
you dizzy you can jump on board that train instead. What is NextJS but a JS based
Laravel? Apparently they have lambos over there in PHP world so maybe it's worth
it.

I for one love TypeScript and JavaScript. Node is not my favorite thing and I am
awaiting Bun becoming more stable. But these over-the-top meta framework such-and-suchs
need to stop. Try as you might, JavaScript is still a slow language and moving it
to the server was a bad idea probably.

## Alternative To The Tea-Cup Ride

What good would this article be if I did not at least offer some sort of idea to
avoid all the anguish above?

How about doing things the simple old-school way of servers and clients. Servers
do server stuff, and clients do client stuff. Dynamic serving is still nice and
we can do that, just bring in less stuff to do it. I for one am looking at the
[HTMX](https://htmx.org/) project with some hope, I just haven't found a use for
it yet. [Astro](https://astro.build) is used for this site and it abstracts
everything away in a refreshing way that leaves you feeling pleased with your
productivity. For server work, I find nothing better than [Go](https://go.dev/)
for building fast moving backends.

A recent project of mine actually found me using Go for all of it. Just Go
delivering dynamic web pages via it's built-in templating functionality. And do
you know what? It's damn fast and easy enough to use. Sub-second delivery times
with Lighthouse scores probably higher than 100. I can translate the whole damn
thing and ship the version that works best for you in the same time frame as
well. And all my API functionality is already there! No need to get some giant
JavaScript framework involved to tell me how things should be done this week
before they change their minds next week.

Now, how about directly embedding HTMX as a Go package to make this whole thing
even faster and with better developer experience? Well that's a project for
another day.

## In Closing

We are going back to the beginning and that's ok. Because sometimes you got to
drive on the sidewalk to remember where the road is. In closing I'll leave you
with one extra thing to make sure you are dizzy from all this "best practices"
three-card-monte trucks.

The creators of popular CSS-in-JS libraries who swore it was the best way have
changed their minds and realized it's actually probably the worst. So get ready
for all those library dependencies like Emotion to grind to a halt and leave you
with massive amounts of tech-debt.
