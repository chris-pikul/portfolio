---
title: "Ruminations 2 - Resistive Degredation"
summary: "Systems feel like patchwork jobs most of the time, what if we just said no?"
timestamp: "2023-11-06T14:30:02+03:00"
heading: Ruminations 2
subheading: Resistive Degredation
tags:
  - Thoughts
  - Series
  - Frontend
---
# Ruminations 2 - Resistive Degredation

There exists a conceptual policy in web development of "Progressive Enhancement" which aims to say that the first delivered data of a webpage or application
should be the bare minimum to start consuming it, and to add enhancements ontop of that as network requests start returning. This is usually accomplished by
pushing most of the textual content and such first, and asynchronously loading the additional "enhancements" afterwards through JavaScript means. The goal is to
facilitate crawler robots, accessibility, and lower-end devices from having to wait and render all the dynamic content authors really want on their sites. This
"paradigm" reminded me of all the other systems that have some form of "backwards compatibility" as their primary development strategy. Microsoft is famous for
this, you can see it to this day in Windows with their compatibilty layers supporting software all the way back to Win3.1 and DOS. Granted, at this point that
support layer is "iffy" at best, but it's still a driving policy that all new versions of Windows should work with software from previous versions.

How do these two things relate? Progressive Enhancement and Backwards Compatibility? Not by much really. I suppose the association is the fact that older
technology and minimal delivery is the baseline, and all additional enhancements are patchwork add-ons on top of that system. Intentions are great, allow as
many devices as possible to consume your content by offering support for as many users as possible.

That is all well and good. But! For just a moment, may I suggest a thought experiment. What if we just... didn't? That is to say, what if we left the past in
the past and actually decided that backwards compatibility was _not_ going to be the baseline policy? Now sure, the immediate knee-jerk reaction may be to
scoff and say "what about the poor people?" (most likely in both meanings of belittling and economic status). I'm not saying we should make all software require
newest and greatest supercomputers. I'm saying maybe, just maybe, we shouldn't need to carry around protocols written over 50 years ago in the 1970's around
with us. Maybe this idea of "well the whole internet is used to this, so we shouldn't go against the grain" is really just slowing us down. Maybe it's time for
a fresh start now that we've had decades to progress on what technology actually needs to do for humanity.

## Causes of My Disappointment

Kernels are a big one. There's really only 2 base operating systems when you really reduce it down to it's fine essence. There's Windows, and there is Linux.
Naive will mention "MacOS", and elitists will supplement that with "actually MacOS is based on BSD which was a Unix flavour designed by..." and so on. But really
it's those two.

- Microsoft Windows is windows.
- Linux is linux, and there is a million+ linux distributions.
- MacOS is propriatary linux.
- Android is linux, with Java strapped ontop.
- iOS is just smaller MacOS, still propriatary linux.

And both of these kernels are duct-tape jobs over the decades. Everyone is so afraid to ditch the old for fear of loosing market share. "We can't get rid of
SCSI drivers!? What will those 3 people left in the world do without it!?". Maybe Apple is right in some regards, sometimes you just have to drag the market
with you into the future; kicking and screaming as they might, they'll thank us later.

I dispise email. The concept is great. The protocol is old and untrustworthy and a source of so much pain and money lost in the world. Any attempts to make it
secure for the common day usage is just "optional" enhancements. Most SMTP servers will still respond just fine to unsecure connections for the sake of Backwards
Compatibility. And so, the services and corporations decided they would all do their own patchwork jobs. SMTP, SMTPS, IMAP, IMAPS, POP3, etc. etc.

TCP get's the job done for communicating over networks reliably. It's a bit, verbose, isn't it? Can't we do better than this? Some already said yes with things
like the QWIK protocol (thanks Google) which rides ontop of UDP. But either way, that's all just riding on HTTP 1.0 protocol (from the late 80's).

Both Windows and Linux suffer from desktop environments built on top of UI protocols of the mid to early 90's. Very verbose and tricky to work with. Most have
to reach for one of the 3, or is it 4, Windows APIs to work on there. Linux got X, and then a million flavours ontop of that. This fustration is really what led
to things like Electron for bringing web development onto the desktop side. Otherwise you'd have to reach for Qt which is a bloated propriatery solution.

## What Do I Want?

I want to trim down kernels to the bare necessities to run on current generation hardware. That's where the title of this article comes in. "Resistive
Degregation". Let's ditch all the old protocols and support layers and stick with the newest and make the most of that. Anything deemed as backwards compatible
should be added on-top as an emulation layer, and most importantly that the kernel "resists" adding such degregations on purpose. It is not a kitchen sink kernel
that packages the ability to do everything, everywhere. It is purpose built for general user's needs targetting current and near future hardware. 64-bit registers,
no support for 32-bit. ARM might be necessary for mobile devices, but not interested in any other out-of-norm architectures. I want to get rid of all the antiquated
protocols that are probably un-neccessary. No SMTP support, no archaic driver and file-system support. Hell, I'll even get rid of the TTY if I can.

GUI is a big focus of mine these days. Frontend web is a disaster zone of competing standards and frameworks on frameworks. I know this, we all know this. But
at least HTML gave us the building blocks to build document based applications. I suggest an OS that prioritizes just that, applications designed with internet
usage in mind. That doesn't mean just packing chromium into a linux distro, I mean an actual application protocol that takes the best ideas from web and secures
them for desktop and tablet based usage. Applications could be accessed via web addresses instead of installers. User interface rendering would be vector based
compositing instead of pixel based. User authentication could come directly from OS access level. Let's go even more extreme and say you could access "your"
dekstop from any other connected device in the world. 

## Let's Do This

Ok. Let's do it. Maybe I'll make this my Mona Lisa. A magnum opus if you will. Start from the ground up, with the future in hand. I figure, first of all I'll
need a roadmap to figure out how to achieve this. Here's some rough ideas to start:

- New Kernel: One that is x64 and ARM64 compatible, taking advantage of SIMD, 64-bit registers, and all the fancy stuff processors give us now.
- Re-Invent Protocols: Elliptic cryptography at the start of all of them. Efficient transport protocols, binary versions of HTTP, messaging allowing for
distributed usage.
- Vector Rendering Engine: To power future-forward 2D rendering. Something like Google's Skia baked right in.
- Internet-Ready Applications: Instead of EXEs or DMGs having a web-inspired format instead. Take after WASM to deliver near native speeds. Provide more of the
desktop integrations expected like Electron does. Allow streaming of these applications and data.
- Expandable If Needed: Really need that CD-ROM driver? Fine, emulation layers are available but at a cost.

It's a hard, difficult, perilous journey. But it would be very rewarding.
