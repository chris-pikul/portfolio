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

[Chromaview](/projects/chromaview) started as an experiment in using web
technology (JavaScript) to deliver an augmented reality view of the world
through different color-blind modes.

This is a series intended to be a development breakdown of the process of
making Chromaview. In this part, I'll talk about scaffolding a new version of
the app from scratch, using a modern toolkit.

You can check out [part 1](./chromaview-breakdown-part-1) for a write-up on
the first version of this app. Additionally, [part 2](./chromaview-breakdown-part-2)
talks about scaffolding the new app with React and getting ready for the
processing.

## Starting The Processor

In the [previous](./chromaview-breakdown-part-2) article I mention a mysterious
class called `Processor` that is responsible for handling the actual work. React
hands it a reference to the `Canvas`, as well as some bindings for events such
as changing the mode, and notifying on resize events.

