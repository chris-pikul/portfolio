---
title: Introducing Kismet
summary: A game that has been long on my mind, that I may actually build this time.
timestamp: 2024-02-16T21:39:22-08:00
tags:
    - Game
    - DevLog
    - RPG
    - Kismet
---
# Introducing Kismet

There is a game I've wanted to build for ages. With a decent name that I've already
chosen (because we know that's the most important part). I call it __Kismet__. Kismet
is defined in English as "destiny; fate". It originates as a Turkish word, which is
fitting since I moved to Turkey for some years after I decided on the name originally,
with no prior knowledge that it was the origin of the word. From there it goes back
to Arabic "qisma" meaning "portion" or "lot", but I digress...

Kismet is a 2D-top-down RPG with a rich persistent simulated world. Dwarf Fortress
was very inspirational in this regard. I would also say games like Elder Scrolls and
other classic Euro-centric fantasy RPGs played a part. Essentially, none of the other
titles reached that rich deepness that I was looking for. Something that felt unique
every playthrough, with rich simulated history, where actions mattered and shaped the
game world. Dwarf Fortress does this very _very_ well, but was lacking the single-player
adventure I was looking for (excusing Adventure Mode). I want to feel as if I am
the character, and that the world is my oyster that I can craft as I wish.

Why top-down 2D? Because I figured it would be easier. That's really it, and because I
can accomplish what I want it to do a bit quicker than having to deal with 3D assets.
I figure the less work I have to do on art assets and rendering pipeline the more
work I can put into the simulation and useful features. So what are those features?

## Planned Features

- Procedurally generated world unique in every way, on every play through.
    - Terrain generation
    - Climate simulation for biome selections
    - "Morality" climate dictating hot-spots for good and evil.
- Cultural generation and simulation. Making each culture within the world unique
and based on their individual historical events to shape them.
    - Languages specific to the cultures
    - Historical events shape and change behaviors
    - Expansion and contraction over time
    - Collapse and rise of new empires over time
    - Unique importance and priorities for each culture.
- Economic model that matters. Buying, selling, trading is affected and can effect
the rest of the world.
    - No more selling 1,000 daggers to a local merchant repeatedly.
    - Possibility for merchant playthrough that makes trading viable.
    - Markets are based on local, regional, empirical, and global factors.
- Homesteading and carving your own unique corner out of the world.
- Classic RPG quests
    - Unique procedural quest generation including primary "main" quests, and
    secondary, tertiary quests as well
    - Quests, and actions, affect the world around you and the response cultures
    have to your character.
- Experience and leveling are based on actual usage and can be diminished from disuse.
- Magic allowing for creation of new spells, and enchantments.
- Crafting because everyone (at least me) loves crafting.
- Survival aspects that don't detract, but enhance the experience.
    - Food and drink is important but only boosts other attributes.
    - Injuries can diminish abilities if not treated properly.

... and plenty more to come and go as development starts.

## The Plan

So that is a lot, and it reads as __a lot__ looking back at it. How do I plan on
doing this? Well first, I'm gonna make the job harder maybe before I make it easier.
I plan on doing this all in __C++__. Some may scoff, some may say "just use Unity".
I tried this before in Unity and didn't like it, also I just don't know modern Unity
well enough. I'm ok with C++. Also, C# in general is out because I don't want to
deal with Monogame and Unity like derivatives. C++ will give me more precise memory,
threading, and intrinsics such as SIMD to leverage for the heavy simulation work.

Rendering wise, I'll just use Vulcan raw. It's a tile-map at the end of the day, so
I should be ok with getting that up and working. I have no plans to port for OpenGL ES,
mobile, Apple via Metal, or Linux for that matter. Windows only for now. But I can
try to separate the rendering from the logic to make that possible in the future.

While developing, I'd like to write regular DevLogs to keep myself on track and to
share with the world the tricks and tips I find along the way.

I do plan on charging for all this work, but it'll be a cheaper one-time purchase
like the good old days. Additionally, I'd like to allow modding, but if it starts
bricking my productivity I may hold off on it. I'd like networking and multiplayer
but that's asking a bit much at this moment (although maybe... no! focus).

Anyways, thats the idea, that's what I'm doing on the side. Here's hoping...
