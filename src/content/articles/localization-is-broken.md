---
title: "Localization Is Broken"
summary: "One of the biggest pains of being a digital nomad is localization"
timestamp: 2023-11-10T7:00:00Z
heading: Localization Is Broken
tags:
  - Gripe
  - HTTP
  - Internet
---
# Localization Is Broken

I travel for work, a lot. I spend 90% of my time outside of the United States these past years. And one of my biggest gripes has been localization (l10n), or internationalization (i18n), on common
websites. How is this still a problem? Almost every major website I try to visit immediately redirects me to the regional flavour and language without my opinion. I understand content moderation
reasons going into it for companies like Netflix and the like which need to conform to licensing and laws. But for something as fundamental as _language_, why are these places "assuming" anything?

## Assuming Makes an Ass Out of You and Me

Amazon is the biggest offender here. Absolutely attrocious that one of the largest companies in the entire world cannot figure localization out. Going to the amazon website here in Turkey redirects
you to the local flavour which is written all in Turkish. Here's the rub, _there is no way to switch it to English_. Which is even more peculiar when it logs me in on my account automatically, in
which my settings specifically say "English" is the prefered language. My guess, is they are geo-positioning the IP address and attempting to figure out the localization from that pattern. This is
not only un-necessary, but is fundamentally wrong.

First is the culture aspect. By geo-localizing with IP you make the _assumption_ that most everyone reads the language you have decided. This is just factually untrue. Many, many countries have
multiple languages within their borders. Forget a moment the lonely tourist who needs to suffer this, when there are multiple languages spoken in a country companies are decided the major language
for their users. This is fundamentally terrible user experience for everyone involved. A travesty if I dare say.

## Why I Am Baffled

Some may say, "but Chris, localization is hard!". For content generators, copywriters, and the like; yes it is very hard to ensure text formatting fits with all the given languages. But as far as
_choosing_ which localization to present, the option is quite literally already solved for you a long time ago.

[HTTP 1.0 Protocol, §D.2.4](https://www.w3.org/Protocols/HTTP/1.0/draft-ietf-http-spec.html#Additional-Headers) first drafted in February 1996 and the basis of the entire internet from that day onward
gave us a lovely little request header called `Accept-Language`. Every client in the world sends this, and it is pre-filled with not only their prefered language, but other languages they will accept
as well. So... what's the excuse? It is simply right there, told to every server by every user.

## Possible Reason Why

Ok, so hopefully we all agree that this whole mess is stupid and the solution is available to us right there in the headers. So why is this still a problem?

My best guess is that these companies have giant content delivery networks (CDNs) that are not sharding all the languages in all places. Instead of incurring latency and inter-network bandwidth for
them to properly serve the requests on language, they decided to ship the localized versions to regional data centers and just "geo fence" the requests. I would personally prefer to incur the
latency and wait a bit longer on my requests, than not be able to read them at all. Maybe that's just me.

Even if the product lists, recommendation feeds, articles, etc. would be different for each region, that's where string internationalization comes in. Sure it's a bit more work, but instead of alienating
customers maybe just serve the strings from different servers based on `Accept-Language` and keep the content choices geo-fenced.

## In Closing

My suggestion to any new developers or anyone planning on building an international service. Don't do what these guys are doing. Use the `Accept-Language` header, serve content based on that. Don't
get fancy with weird geo-fencing to try and "best guess" it. It's better to plan under the guise that all your guesses will be wrong.

