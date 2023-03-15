---
title: "Chromaview - Development Breakdown - Part 3"
summary: "Heavy-lifting with the media processor to perform our magic"
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
# Chromaview - Development Breakdown - Part 3

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

## Introduction

This is a series intended to be a development breakdown of the process of
making Chromaview. In this part, I'll talk about the very first version which
was a working prototype, and some lessons learned about it. In future articles,
I'll discuss the new version and the improvements I've made.
