---
title: "RESTful API Design"
summary: "A simple guide for designing RESTful API endpoint paths."
timestamp: 2023-11-10T16:30:02+03:00
heading: RESTful API Design
subheading: Preparing predictable URL paths for your API
tags:
  - Guide
  - Web
  - Backend
---
# RESTful API Design

Designing APIs for applications to consume is the backbone of the internet for probably 90% of it. Sure it's a made up number, but it feels right considering you see them everywhere. Not all APIs are
public, so please don't confuse this with building public APIs or "SDKs" like other services do. Whether it's public, or internal, a good API design using RESTful principals will ensure predictable and
understandable outcomes when using it. If followed properly, developers consuming your API will feel confident knowing how to infer API usage just off the pattern.

> Some complain that REST is a whole paradigm and complicated set of "rules", and that in reality most services are just CRUD based operations and not fulfilling the REST mandates completely to be able
> to call themselves "RESTful". I'm just going to ignore that argument for this entire guide. If it bothers you, consider I wrote "REST-ish" instead.

## Introduction

The internet was built on English, that may be an issue for some, but it's the way of the world (at least the internet) for our purposes. I mention this, because RESTful patterns are built ontop of
English grammar, much like the original HTTP protocol is. To that end, a working knowledge of English grammar will be useful here. To help, here's some copy-paste definitions for you:

- **Noun** a word (other than a pronoun) used to identify any of a class of people, places, or things (common noun), or to name a particular one of these (proper noun).
- **Verb** a word used to describe an action, state, or occurrence, and forming the main part of the predicate of a sentence, such as hear, become, happen.
- **Adjective** a word naming an attribute of a noun, such as sweet, red, or technical.
- **Adverb** a word or phrase that modifies or qualifies an adjective, verb, or other adverb or a word group, expressing a relation of place, time, circumstance, manner, cause, degree, etc. (e.g., gently, quite, then, there ).
- **Singular** (of a word or form) denoting or referring to just one person or thing.
- **Plural** (of a word or form) denoting more than one, or (in languages with dual number) more than two.

### Refresher on HTTP URLs

We use these grammar rules to help form patterns of expected URLs that form our API. This guide will focus primarily on path design as the bulk of documentation can be infered from these. When I say URLs I
should clarify I suppose. I mean the path that's typed into the address bar of your browser, or more likely the path of the HTTP request you are making to consume it. As we should all know, URLs are
formatted in such way:

```
<PROTOCOL>://<HOST>[:PORT]/<PATH SEGMENTS...>[?[KEY=VALUE&]...][#FRAGMENT]
https://subdomain.example.com/some/path
https://example.com/some/path?query=value
https://example.com/some/path?query=value&extra=data
https://example.com/some/path#fragment-name
```

For our purposes we can ignore everything before the path segments, since that has to do with your hosting and network infrastructure mostly. The three important parts are the "path segments", and the "query
parameters". The "fragment" portion can also be ignored since that's mostly antiquated and used by browsers for in-document linking. In this guide I will shorten the whole URL to just the path segments and
beyond for brevity. It's useful to know that most consumers can use this too in case you need to swap out hosts. For instance, instead of `https://subdomain.example.com/some/path`, I will simply use
`/some/path` since the host is irregardless to the point.

### Building Relationships

The point of URLs is that the path segments denote a hierarchial relationship when read from left-to-right. Meaning that a segment to the right of another is considered a child, or belonging to the
resource type on the left. You should never ever do it the other way around; although I would actually be kind of impressed if you managed to design a graph that worked that way (not for good reasons).

```
/parent/child/sub-child
/groups/users/avatars
```

This makes predicting the paths easier. Reading the second example I can immediately infer that it's requesting the avatars, of users, of groups.

> This example is over-simplified and of course there would be identifiers in the paths

## Defining casing and composure

I'd first like to start by defining some global rules you should follow about casing and composing phrases when building URL paths. These should be followed for any and all "things" you have to give names
to.

1) All lower-case characters. Do not provide a path such as `/Some/Example` instead it should be `/some/example`.
2) Use hyphens instead of underscores in places spaces would naturally occurre. Do not do `/great_articles` instead use `/great-articles`.
3) Do not start any path with numbers or not easily identifiable constants. This one is a bit complicated to explain, but essentially we will need to provide resource identifiers at some point, so do not
   confuse the paths by using other numerical constants as path segments. `/articles/314/421341` is almost impossible to infer what it means, and based on RESTful rules it will be guessed wrong.

In addition to casing it should also be mentioned that path segments should not be phrases, and absolutely do not include verbs in them. Do not use `/get-articles` as a URL.

## Grammar

Each path segment portion should be in reference to a singular type of object, using a _noun_. Whether it returns multiple of those, or single items determines whether the noun is plural or singular.
Rembembering that path segments should not be phrases themselves we can imagine that the whole path resembles a phrase when put together. For this, constant path segments (the parts that do not change
based on an identifier of some sort) should be nouns only.

Bad examples:
```
/fancy/articles
/get/shopable/fresh
```

Better examples:
```
/articles?fancy=1
/shop/items?fresh=1
```

> These are just example suggestions, and the queries will be explained in a bit, but essentially each portion of the path (between the slashes) should be a noun.

### Plural vs. Singular

There are some arguments about this part. Some say that it should only be singular, others that they should only be plural. If I remember correctly the original RESTful principles said singular and
relied on trailing slashes to denote plural. This is bad advice these days since too many web servers trim trailing slashes automatically and require specific configuration to keep them in place, better
to assume they will be removed. Because of this, my simple rule of thumb on plural versus singular is whether it returns/modifies a single item, or multiple. This makes the decision more readable to me.

The path `/department/123/users` to me reads as a department, with ID 123, fetching a list of users. I expect this to return multiple user objects. Conversely, `/settings/security` to me reads as some
object of "security" type that belongs to "settings". I expect this former example to return a singular object, since it is phrased this way.

### Verbs Declaring Intention

Thanks to HTTP we already have _verb_ methods at our disposal to categorize what the intended action is on the resources. We should all know the basic 4, but there are more than that. It's fairly safe
to ignore the others for the purposes of API design as they are mostly utility types. We can define these methods further than the HTTP specifications do for our purposes by introducing some verb rules
to live by.

- `GET` retrieves an object or objects from the path. It accepts no request body (although it technically can).
- `POST` creates new object, or objects of the type denoted by the path segment. It must accept a body declaring the content of the resource.
- `PUT` updates an existing object, or objects of the type denoted by the path segment. It must accept a body declaring what the content should look like.
- `DELETE` removes existing object, or objects of the type denoted by the path segment. It should be used sparingly and only on paths that clearly identify the expected removals.

The `DELETE` verb is the most precious. It should be handled sparingly and with as much caution as you can throw at it. Making content and data should be easy for a service, but removing it should be
limited. Make sure whenever using `DELETE` the path specifies **exactly** what will happen so there are no suprises.

You do not have to implement each verb for each path. It's recommended to do so if you can, but in practice it is sometimes necessary to avoid doing so. By recommended, I mean strongly recommended.
These verbs make up the bulk of your operations in defining "CRUD" services (Create, Retrieve, Update, Delete), and generally make up all the actions needed by an API.

Adhering to our rules above, the verb takes care of... well, the verbage of the phrase. Because of this, there is no need to include that in your path names. Avoid paths like `/articles/create` or
`/articles/update/1234`. Both of these are already taken care of by the verbage. Therefore these bad examples can be made good with:

```
GET /articles
POST /article
PUT /article/1234
```

From top to bottom, it becomes:
1) Get articles, plural so more than one
2) Create an article, singular because the path name is as well
3) Update an article, by it's given ID.

## Resource Identifiers

There are plenty of cases where you need to specify which object in particular you are looking for or referencing. For this, we can use _path variables_ in our URLs. Path variables are essentially
placeholders that take dynamic input within the path. The primary use case is for identifiers, but technically you can use them for any dynamic content although it is not recommended. In back-end
world we usually deal with databases which compose their identifiers in either serial numerical form, or something more complicated such as UUID/GUIDs. You could instead use textual identifiers which
is common place in article and blogging situations (such as this site). Either way, the form of the identifier (ID) matters less, it's where you put it that matters.

Identifiers should always come as their own segment directly after the resource they are pointing towards. If we remember the relationships part, being to the right of something means "belonging to".

```
/article/123456
/group/e6489278-033b-464f-bbc1-b28664cee85d/users
```

Both of these examples show that the identifier is directly next to the resource they identify. It's also noted that you can continue the path segments, but in this fashion the following segments now
belong to that specific user. Taking the second example to mean: users that belong to the group with this ID.

If you are going to craft your own special format of IDs (which I have done before), ensure they are easily encodable in URL path segments. Stick to alpha-numeric latin characters to make things easier.
Something like hexidecimal, base-32, base-64 non-padded with URL safe characters. These are all fine formats.

> For the curious, my custom format is UUIDv7 that have been compressed and encoded as base-36 so they remain alpha-numeric. Really cuts down on UUID lengths.

## Query Parameters

I mentioned these earlier. Query parameters are the parts that go after the ? at the end of the path segments. These are important for one of the missing keys here, which is filtering. Instead of using
path segments to define quantative or filtering mechanisms, you should use query parameters. Read them as "modifiers" to the base request. Anytime you have the option for how a object, or objects, are
represented you should leave it to the query parameters to decide. It's also best if you provide "reasonable defaults" in the event the query parameter is not supplied.

A great example of this is filtering operations. You want to return a list of objects, but you want to filter them in some way. In this case query parameters are your best friend. Besides just filtering,
you should also use them for sorting, or changing output formats. The path `/articles/by-date` is bad API design, we can do better and remain flexible with queries instead.

```
GET /articles?startDate=2023-11-01&endDate=2023-11-10
GET /articles?sort=date&order=asc
GET /articles?topic=tutorial
GET /articles?search=My%20Query&sort=date&order=desc
```

Notice there is still the same base path and verb in all these examples. The query parameters are just modifying how the results are changed, but the resource type remains the same. They can be mixed,
and matched to the needs of the consumer. In fact, query parameters are prefered for storing state instead of other means like local storage or cookies because they can be bookmarked and shared much
more easily, this allows great resumability and growth.

When chosing names for your query keys, remain consistant throughout the whole API. Always use "search" for search query input, "sort" for sorting, etc.. Never deviate from this, otherwise consumers may
get confused on which parameters will accomplish what they need to.

## In Conclusion

Follow the rules you set forth in your own project as if they are laws. If they are clear and based on these guidelines you should be producing predictable consistant APIs in no time. Some ending examples
of good paths that combine everything we've learned:

```
GET /articles/topic/tutorial
GET /groups/123456/users?search=John
POST /threads/123456/messages
PUT /user/123456/settings/security/password
```

There are plenty of ways to expand on this, make sure you establish rules that work best for your project! Thanks for reading.
