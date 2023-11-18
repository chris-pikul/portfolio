---
title: "Web Font Optimization"
summary: "Web fonts are great, but a big step of optimizing them is usually missing. Here's how to get more out of them"
timestamp: 2023-11-18T22:09:05+03:00
heading: Web Font Optimization
subheading: Making the most of your web fonts
tags:
  - Frontend
  - Tutorial
---
# Web Font Optimization

Web fonts are great, but a big step of optimizing them is usually missing. Here's
how to get more out of them.

## Introduction

For those that don't know, web fonts are font files available for browsers that
enable you to customize the typography of your site. It's very common for developers
to just simply copy the link tags from [Google Fonts](https://fonts.google.com)
and call it enough. You can do more though to improve your optimization and allow
for more custom fonts not already available through those providers.

We are going to self-host our fonts, so we can precisely pick the fonts and formats
we end up using. I'll be focusing on variable width fonts as they are the newest
standard to help make your typography pop! Additionally, I'll focus on WOFF and
WOFF2 formats as they have enough support to make this easier. You could go
further though on your own if you need the other formats like OTF or TTF.

## Pre-Requisites

I'll be using the wonderful [FontTools](https://github.com/fonttools/fonttools)
Python package in order to perform some optimizations on the font files. Using
Pip you can install what you need as:

```bash
pip install fonttools brotli zopfli
```

For the example font, I downloaded the "font family" using Google Fonts. The
family I chose for this example is [Assistant](https://fonts.google.com/specimen/Assistant).
Once downloaded, you can extract the zip wherever you want. It will provide you
with the variable axis font file, and a folder of "static" fonts for the older
TTF format.

## Limiting The Weight Axis

Variable fonts generally contain information pertaining to the entire spectrum
of font weights, from 100 all the way to 800 and above. Typically, in my sites
I only ever use "regular" and "bold", but occasionally I might use "light". Here's
a table of common weights to help you choose what you need. Note that I am selecting
weights from this based on the ones I will use in the styles, so ensure you know
what you need here.

* 100 – Thin
* 200 – Extra Light (Ultra-Light)
* 300 – Light
* 400 – Normal/Regular
* 500 – Medium
* 600 – Semi Bold (Demi-Bold)
* 700 – Bold
* 800 – Extra Bold (Ultra-Bold)
* 900 – Black (Heavy)

For this example, I'll pick the normal through bold weights giving me the values
`400-700`. To do this, we will use the FontTools CLI to strip the extra weights
out. Here is the command to do so. Remember, we are using the variable weight
version of the fonts. This will not work on static weighted fonts.

```bash
fonttools varLib.instancer .\Assistant-VariableFont_wght.ttf wght=400:700 -o assistant-var.ttf
```

We need to use the special library "varLib.instancer" in order to manipulate the
variable axis fonts. In some cases, the font also contains a width specifier which
you can also limit to further compress the size. I chose to ignore that here.

This will strip out a few extra weights and shrink our font a bit. We will get a
TTF file output as "assistant-var.ttf" based on the argument we provided.

## Using Only The Characters We Need

The next step, which really puts the optimization in, is limiting the characters
present in the font to the ones we are actually going to use. Generally speaking
a lot of fonts include all the character ranges they can to serve as many languages
as possible. I write in English, so I really only need the Latin based characters.

We can again use FontTools to not only strip the other language characters out,
but to also put the compression on for us so we are web font ready. Using the
variable font we got from the previous step, we will output the same command twice.
Once for the WOFF font, and again for the WOFF2 compression. This will give us
3 total files we can use, but I'm only focusing on the WOFF/WOFF2 pair since that
covers 99% of modern browsers.

```bash
fonttools subset --unicodes="U+0020-007F,U+00A0-00FF" --flavor=woff --output-file="assistant-latin-var.woff" assistant-var.ttf

fonttools subset --unicodes="U+0020-007F,U+00A0-00FF" --flavor=woff2 --output-file="assistant-latin-var.woff2" assistant-var.ttf
```

Notice here the option for "unicodes" which provides the unicode character ranges
that we want to keep. These values correspond to the Basic Latin, and Latin-1
Supplement tables. To find more ranges in case you want to customize or break
up the tables further you can use [this handy resource here](https://jrgraphix.net/research/unicode_blocks.php)
and substitute the command as you wish.

Our final outputs are these three files:

- assistant-var.ttf
- assistant-latin-var.woff
- assistant-latin-var.woff2

I'm keeping the TTF with us _just in case_ something odd happens.

## Making The CSS Font-Face

Next we need to tell the browser how to use these. I'll upload the fonts to a
public directory so we can reference them later. Something like `/fonts` will
work.

Next we need to define the variable font face so CSS can interpret this as a
proper font. Use the following snippet to get yourself most of the way there and
just replace the paths with what you need.

```css
@font-face {
    font-family: 'Assistant';
    src: url('/fonts/assistant-latin-var.woff2') format('woff2'),
        url('/fonts/assistant-latin-var.woff') format('woff'),
        url('/fonts/assistant-var.ttf') format('truetype');
    font-weight: 400 700;
    unicode-range: U+0020-007F, U+00A0-00FF;
    font-display: swap;
}
```

Some people like to add a prefix of "VAR" or "VF" at the end of the font-family
name to help specify the difference when using static weight fonts. I don't think
this is necessary anymore since browser adoption is high enough now for variable
weight fonts.

## Additional Step Options

The above few steps is really pretty good to get started with importing optimized
fonts. There are a few more things you could do if you wanted, but I'm unsure
personally if the benefits are great enough to really bother.

### Preload The Font Files

You could tell the browser to pre-load the font files before you even use them.
It might help, but considering I basically use the same font for everything I
don't see much of the benefit. Technically speaking, this should speed stuff up
a bit considering the browser can start downloading immediately instead of waiting
for "proof" that the font was actually used in the page.

```html
<link rel=”preload” href=”/fonts/assistant-latin-var.woff2″ as=”font” type=”font/woff2″ crossorigin>
```

> Note: The `crossorigin` attribute here is only needed if the asset is on a 
> different server. I've only included it as a reminder it exists.

### The Ol' Base64 Trick

This is a conflicting one. Basically, you _could_ base-64 encode the whole font
file and inject it directly into the `@font-face` declaration instead of referencing
a different network resource.

Basically you would do something like this:

```css
@font-face {
    font-family: 'Assistant';
    src: url('data:font/woff2;charset=utf-8;base64,YOUR_BIG_BASE64_STRING') format('woff2');
    /* ... */
}
```

I don't prefer this because it means the CSS file for the font-face definition has
to carry around the entire weight of the font file with it. It saves 1 network
request in exchange for bloating the CSS file. Is it faster? Probably. Is it
worth it? I don't think so.

## Conclusion

That's basically it, optimized font files ready for self-hosting! Don't forget
to set reasonable fallback fonts when actually using it.

```css
html {
    font-family: 'Assistant', Arial, Helvetica, sans-serif;
}
```
