---
title: Kismet Devlog 1 - In Utero
summary: First day on the new project, setting up VS2020 for C++
timestamp: 2024-02-17T14:31:03-08:00
tags:
    - Game
    - DevLog
    - RPG
    - Kismet
part: 1
---
# Kismet Devlog 1 - In Utero

First day, new project. My task today is to setup the essentials of the project
so I can start slinging code. The IDE and language of choice here is Visual Studio
2020, using C++20. So to kick things off, I created a new VS20 solution with an
empty project in it. The solution is called "Kismet" and the project is "Game".
My plan here is to have multiple projects for all the utilities and mod support,
so the Game project will hold the actual application code.

The first thing I did, was drop the `x86` platform target from the solution. I
think x86 is good and gone and don't need to clutter what will already become a
massive undertaking by supporting dual architectures. From there, I heavily
edited the project settings to fit my needs:

### All Configurations - x64 Platform

- General Properties
    - Output Directory: `$(SolutionDir)Build\$(Configuration)\`
    - Intermediate Directory: `$(SolutionDir)Build\$(ProjectName)\`
    - Target Name: `Kismet`
    - C++ Language Standard: `ISO C++20 Standard (/std:c++20)`
- Advanced Properties
    - Preferred Build Tool Architecture: `64-bit (x64)`
    - Copy Content to OutDir: `Yes`
    - Copy Project References to OutDir: `Yes`
    - Character Set `Use Unicode Character Set`
- C/C++ > General
    - Scan Sources for Module Dependencies: `Yes`
    - Translate Includes to Imports: `Yes (/translateInclude)`
- C/C++ > Language
    - Enable Experimental C++ Standard Library Modules: `Yes (/experimental:module)`
- Linker > System
    - SubSystem: `Windows (/SUBSYSTEM:WINDOWS)`
- Linker > Advanced
    - Entry Point: `mainCRTStartup`

Notice that the sub-system was changed, and with it the entry point. This is
because I don't want to use the `winMain` entry point that Win32 applications
generally use, and would prefer the standard `main` one. This is for some resemblance
of cross-platform preparedness.

## Code Layout

The first file I added was a `main.cpp` file to the `Source Files` filter. I will
be using C++20 Modules so this will be one of the few traditional CPP files.

From here I created 3 module files...
- `Kismet.ixx` is a barrel file to re-export the namespace.
- `Window.ixx` will handle the Win32 stuff for creating and accessing the window.
- `Application.ixx` will provide the utilities for joining all the parts together.

The modules I'm created almost follow a more C# style of namespacing using what
I refer to as L-Tree naming, such as `Kismet.Application`. Because C++20 Modules
consider the dot character to be part of the name, it is considered a single 
unique module. But to the reader, it seems as a tree of sorts. Internal to these
modules, I am exporting namespaced members under the `Kismet::Application` style,
or however the module appears.

I'll have to explore the idea of how to do stubs for the purpose of public modding
support. Essentially, traditional headers make sharing public declarations easier
since you only have to provide the header files and a DLL/SO to link against for
modders to use and can still keep the implementation private. I believe Module 
Partitions is the trick for this.

Oh! Before I forget, both the Window and Application modules are not class based.
They are just straight CPP code with exported functions. My idea with this, is
that they are singletons. And what better way to prevent singleton leaking than
to not actually make a class that can be instantiated. Instead, it's almost C-style
in that the variables are global (to that module) and it exports what it needs to.

## TOML Dependency

The first dependency I want is a TOML parser. I'll be using TOML for the config
files at minimum, so I'll need a parser/serializer for this. YAML was a consideration,
but I wanted a bit more type safety. JSON was out because I want to maintain a
bit more human-readability for this. Also, INI was out because it's a little too
simple and I'll probably need arrays and object collections.

Anyways, I decided to try out the [toml++](https://github.com/marzer/tomlplusplus)
library since it says it's C++17 with some C++20 flavours added.

I'm using modules, so I don't really want to deal with the single-header style
installation. So I'll take the whole include and implementation folders so that
VS20 can do it's own optimizations on the code base.

As for installing it, I went with the kind-of-usually-hated Git Submodules way.
I created a root folder `External` where I'll keep the deps and added the submodule
there so I can keep track of the version in case of later updates or rollbacks.
There is a lot of stuff in that repository. Stuff I don't need. So I'll combine
submodules with sparse checkout to just grab the include file.

```console
Kismet\External> git submodule add https://github.com/marzer/tomlplusplus.git
Kismet\External> cd tomlplusplus
Kismet\External\tomlplusplus> git config core.sparseCheckout true
Kismet\External\tomlplusplus> cd ..\..\
Kismet> code .git/modules/External/tomlplusplus/info/sparse-checkout
Kismet> git submodule update --init --recursive
Kismet> git add .
Kismet> git commit -m "dep: added toml++ submodule"
```

The `sparse-checkout` file looks like this:

```
/include/
/.git*
/*.md
/LICENSE
```

To add it, it was classic fashion of adding the new include folder for the VS20
project. I used a macro'd path of `$(SolutionDir)External\tomlplusplus\include`
so it would stay relative.

Now, since I'm using C++20 modules, I really didn't want to do their "super easy
one header include" method. So I just created a new module `Kismet.Config` since
it's the only place currently using it, and just as the `Kismet.Window` module
was, I did the `#include` in the global module scope.

```c++
// Config.ixx
module;

#include <toml++/toml.hpp>

export module Kismet.Config;

export namespace Kismet {
	class Config {
        // ... my implementation
	};
}
```

Hopefully that keeps the scope clean and improves compile times a bit. As an
aside. This new module style makes things a bit cleaner IMO. But! I'd like to
support public interfaces, maybe. And I think to do that I have to split my
implementation and interfaces. Which does look like a more complicated version
of the preprocessor style that we are all used to. Oh well, it still is a bit
nicer, right?

```c++
// Config.ixx
export module Kismet.Config;

export class Config {
public:
	Config(string path);
};
```

``` c++
// Config.impl.ixx
export module Kismet.Config:impl;

import Kismet.Config;

Config::Config(string path) {
	// STUB
}
```

And on this topic, I actually replaced all the others like `Window` and `Application`
to be this style as well. I might actually rip all this out into a shared code
project so that I can support making DLLs easier, but that's for later. Complete
rebuild of the solution so far only takes 2 seconds. That's nice, while it lasts.

When parsing these TOML files, I opted to keep the exceptions for now, since there
isn't much depth for the call stack to jump through. For bonus points, heres a
macro I made which applies a property from a table to a local property keeping
the current value as a safe default. Basically, an auto-override-if-found macro

```c++
#define APPLY(SRC, PROP, TARGET) TARGET = SRC->get(#PROP)->value_or(TARGET);
```

## Bonus Points

I needed a way to output to the console since this is a Windows application, so
the `cout` or `printf` won't do anything. Found this lovely snippet which I put
into a header file which let's me do it...

```c++
// debug_out.h
#ifdef _DEBUG
#include <Windows.h>
#include <iostream>
#include <sstream>
#define DBOUT(STR) {						\
	std::ostringstream _os;					\
	_os << STR << std::endl;				\
	OutputDebugStringA(_os.str().c_str());	\
}
#elif
#define DBOUT(STR)
#endif // _DEBUG
```

Notice the use of `OutputDebugStringA`, this version is for ANSI/ASCII characters
and not the UTF8 ones the rest of the application uses. This may bite me later,
but for now it's the easiest for me to avoid Windows wide character strings.
