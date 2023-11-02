---
title: "HTMG - Go package for HTML generation"
summary: "Efficient HTML/XML generation package for Go allowing quick development of documents"
timestamp: "2023-11-02T22:41:05+03:00"
heading: "Hyper-Text Markup Generator"
subheading: "Efficient HTML/XML generation package for Go"
tags:
  - Go
  - Library
  - Generation
---
# Hyper-Text Markup Generator

Building out HTML documents in Go can be a pain sometimes. Sure there is the
`html/template` package, but what about something with a bit more *style* to it?

HTMG is the Hyper-Text Markup Generator for Go that provides chainable functions
allowing for the creation of dynamic DOM documents. It provides direct
implementations for the `io.Writer` and `io.StringWriter` interfaces so you can
pipe the generated code directly to your favorite output.

[Check out the repository here!](https://github.com/novafex/htmg)

Install using `go get -u github.com/novafex/htmg` and give it a try. There are
examples for you to check, or just use this one...

```go
package main

import (
	"os"
	"github.com/novafex/htmg"
)

func main() {
	// Build a tree
	doc := htmg.NewElem("html", htmg.NewAttr("lang", "en")).Append(
		htmg.NewElemWithChildren(
			"body",
			htmg.NewElem("h1").Append(
				htmg.NewText("Hello, World!"),
			),
			htmg.NewText("I'm HTMG from Novafex"),
		),
	)

	doc.Write(os.Stdout)
	// <html lang="en"><body><h1>Hello, World!</h1>I'm HTMG from Novafex</body></html>
}
```

Why does it say "Novafex" here? Because Novafex is also me.
