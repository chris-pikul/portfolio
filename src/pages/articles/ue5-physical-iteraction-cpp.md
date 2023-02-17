---
title: "Physical Interaction in Unreal Engine 5"
summary: "An exploration in building a physical interaction system for Unreal Engine 5, allowing for grabbing and manipulating objects in-game."
timestamp: "2023-02-17T06:02:36Z"
tags:
  - Unreal
  - UE5
  - C++
---
# Physical Interaction in Unreal Engine 5

For one of my recent game projects **ETOR Project**, I wanted to have what I
believe is called a "Physical Interaction System". Basically, what these are, is
a system in which the character can grab objects in the world and manipulate
them in some way. In it's basic form, which it exists in as of now, it allows
our player to pick up objects and move them around the world as they see fit.

I am trying to do as much as I can in this project using Unreal C++, it can be
done just as easily in Blueprints though with a lot of the same methods. I don't
believe there is any glaring improvement to doing this in native code, I just
enjoy the process and code feels a bit more natural to me. Additionally, there's
probably hundreds of video tutorials showing how to do this, but they all choose
Blueprints because it's easier for beginners. My general goal with my personal
articles, is to write for those that are beyond beginner and may have a need
that requires a bit more setup, or "deeper subjects".

## Project Setup

If you are following along, I'm assuming you have a UE5 project setup and
working with C++ code enabled. I'll be copying code as it applies to my own
project so some other setup may be missing and you'll have to infer what I mean
based on the context in which I'm describing it.

I will note that given I'm on UE5, I do have my project setup with the newer API
of _Enhanced Input Subsystem_ which will change how my input and control works
if you are coming from UE4.

The only really necessary thing to get this working is a C++ Character class you
can edit freely. Some way to move around the world and look with your camera
will suffice. Should note, there is a `CameraComponent` member here for tracking
the Character's "eyes".

I've summarized the code here, feel free to include your own work for setting
up input, component construction, other assets, etc.

```cpp
// Copyright 2022 Chris Pikul and Chronophase, All Rights Reserved.
#pragma once

#include <CoreMinimal.h>
#include <GameFramework/Character.h>

#include "CustomCharacter.generated.h"

/**
 * Character for walking around during game play
 */
UCLASS(Blueprintable)
class MYGAME_API ACustomCharacter : public ACharacter {
  GENERATED_BODY()
public:

  ACustomCharacter();

  virtual void Tick(float delta) override;

protected:

  // The character's "eyes"
  UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
  class UCameraComponent* CameraComponent;
};
```

You'll notice that I don't adhere to Epic Game's coding standards, or those of
Microsoft's suggestion in Visual Studio. It's just a force of habbit from my
work in other languages.

## Chapter 1 - We Must See, Before We Can Act

To get started, one the most basic functionalities needed here is for the
character to be able to track what they are looking at. For this, I'll be using
the `Tick()` event to update what the camera is looking at at all times during
the gameplay. Some people swear by timers instead of tick, but I find it to be
an unneccessary optimization that I don't believe is actually proven to be
beneficial. If tick was so evil, why is it still in the engine and all the
documentation? Anyways, to help promote good code health I'll split the "looking"
code into it's own method and try to prefix any member variables refering to it.

Speaking of member variables and methods, we'll need a few. I can tell you right
off the bat if you haven't already guessed; I'll be using the _Line Trace_ method
for this feature. Given that, we're gonna need to track the hit results of this
line trace as well as some way to know that what we are looking at can be
interacted with in some way.

For this article, I'll use a boolean to track whether the hit result is
"interactable", and I'll just use the `FHitResult` for tracking the last looked
at object.

<details>
  <summary>Further Expansion</summary>

  In my actual project it's a bit more complicated. I actually have a custom
  Enum that tracks the "interactability" of the looked at object so that there
  are multiple ways an object can be used. Think: grabbable, collectable,
  controllable, drivable, etc.. Additionally, I make use of _interfaces_ and
  _Gameplay Tags_ to help have custom objects report their usability. That's
  beyond this article, but wanted you to know as much.
</details>

To prepare all this, we modify our Character class header to add the new methods
and members:

```cpp
class MYGAME_API ACustomCharacter : public ACharacter {
public:

  // Are we currently looking at "something"
  UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Interaction")
  bool IsLookingAtSomething() const { return bLookingAt; }

  // The last hit result we cached
  UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Interaction")
  const FHitResult& GetLastLookingAtHit() const { return LookingAtHit; }

  // Is the object we are looking at "interactable"
  UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Interaction")
  bool IsLookingAtInteractable() const { return bLookingAt && bLookigAtInteractable; }

protected:

  // Handles the Line Trace logic to check if the camera is looking at something
  virtual void PerformLookTest();

private:

  // Tells us whether anything was looked at, at all
  bool bLookingAt;

  // Tracks the last hit result we had
  FHitResult LookingAtHit;

  // Is the thing we are looking at "interactable"
  bool bLookingAtInteractable;
};
```

You'll notice I includes some bonus-points Blueprint helper functions to get
these variables. This is useful for any Blueprint classes outside of this one
(they are public after all).

The only change we are going to make to the `Tick()` event is to just call this
new method `PerformLookTest()`. I'll also scaffold the method just we have it
ready.

```cpp
void ACustomCharacter::Tick(float delta) {
  Super::Tick(delta);

  // Update the camera's looking at target
  PerformLookTest();
}

void ACustomCharacter::PerformLookTest() {
  // STUB
}
```

From there we can actually start doing the bulk work.

### Implementing the Look Test

One of the first tricks we need to do, is get the current `UCameraComponent`
that represents the character's "eyes". In my Character class, I've already done
this setup and saved it as a member variable `CameraComponent`.

From there, we cache the location the camera is in, which direction it is pointing,
and then calculate an end location in _world space coordinates_ for our line-trace.
The math here is easy enough.

```cpp
void ACustomCharacter::PerformLookTest() {
  // How far in UE units (cm) can we look before it's out of reach
  const float DEPTH_RANGE = 250.f; // 1/4 meter

  // Calculate the start and end points for the line trace.
  FVector traceStart = CameraComponent->GetComponentLocation();
  FVector traceEnd = traceStart + (CameraComponent->GetForwardVector() * DEPTH_RANGE);
}
```

<details>
  <summary>Recommendation</summary>

  I would strongly recommend you save the depth range value as a member in
  your own Character class. This way you can dynamically modify later whenever
  you need. For now, it's provided as a `const`.
</details>

Next, we are ready to perform the _Line Trace_. Thankfully, UE provides us with
a globally accessible way to do this using `GetWorld()->LineTraceSingleByChannel()`.
Alternatively there is `LineTraceSingleByObjectType()` as well, choose which
works best for you.

I've used the _by channel_ style of Line Trace because I've already setup a
custom _Collision Trace Channel_ in my project. You can follow the steps here at
[Add a Custom Trace Type to your Project](https://docs.unrealengine.com/5.1/en-US/add-a-custom-trace-type-to-your-project-in-unreal-engine/)
on the official docs for more info. In the C++ world, these are all saved as constants
such as `ECC_GameTraceChannel1`. I'd suggest sticking these in a header file as
a macro you can reference wherever. I've done so as such:

```cpp
// CustomCollision.h
#pragma once

#include <CoreMinimal.h>

#define TRACE_Interactive  ECC_GameTraceChannel1
```

Essentially, this will shoot out a "ray" from the start point, to the end point.
If it runs into anything that matches the _Collision Trace Channel_ specified it
will return `true` and populate the `FHitResult` struct provided.

Let's modify our method now to add this bit, remembering that we created a custom
collision channel as well.

```cpp
// Our own helper header to keep track of the custom channels
#include "CustomCollision.h"

void ACustomCharacter::PerformLookTest() {
  // ... previous calculation

  // Dummy parameters to satisfy the method
  FCollisionQueryParams traceParams;

  // Perfom the line-trace using our own channel
  if(GetWorld()->LineTraceSingleByChannel(
      LookingAtHit,       // Member variable holding the FHitResult
      traceStart,         // Starting location in WS
      traceEnd,           // Wnding location in WS
      TRACE_Interactive,  // Custom collision trace channel
      traceParams         // Dummy parameters to satisfy the call
    )) {

    // We hit something
    bLookingAt = true;

  } else {

    // We did NOT hit anything
    bLookingAt = false;
    bLookingAtInteractable = false;
  }
}
```

Great! We now at least know that we hit something that belongs to our custom
trace channel. You have some options from here as mentioned in an above note
"Further Expansion" you could test for _Interfaces_, or _Gameplay Tags_, to
ensure further this object can be interacted with. For now, I'll play it safe
in just knowing that it responds to the trace channel we specified.

To narrow down a little further though, I'd like to make sure the object we are
looking at is simulating physics. Since our `bLookingAtInteractable` and this
whole system is designed for "grabbing" objects, this check will be the definitive
one for remaining parts.

```cpp
void ACustomCharacter::PerformLookTest() {
  if(GetWorld()->LineTraceSingleByChannel( ... )) {
    bLookingAt = true;

    // Save if we are looking at something interactable
    bLookingAtInteractable = LookingAtHit.GetComponent()->IsSimulatingPhysics();
  } else {
    bLookingAt = false;
    bLookingAtInteractable = false;
  }
}
```

We need to check the `Component` that was hit to see if it's simulating physics.
Unfortunately the method isn't available on the `Actor` itself, so don't get
tripped up by this. The thought process here, is that _Collision_ itself is
handled by components. So the only thing that *could* respond to our trace would
be the Collision Volume on the actor. And since collision drives the physics, it
makes sense this is how we would test if the object is "kinematic".

### Where We Stand

This essentially concludes the basic look test. Feel free to go wild with
expanding on this. But to summarize we now have the following:

- Updating the "look" trace every tick so it's fresh.
- Tracking the camera "eye" movement so it responds to movement correctly.
- Only testing for objects we purposely set to "interactable" using a collision
  channel.
- Saving these tests so we can access them anywhere else in this class or in others.
- Ensuring the interactable object can be physically manipulated.

<details>
  <summary>CustomCharacter.h</summary>

  ```cpp
// Copyright 2022 Chris Pikul and Chronophase, All Rights Reserved.
#pragma once

#include <CoreMinimal.h>
#include <GameFramework/Character.h>

#include "CustomCharacter.generated.h"

/**
 * Character for walking around during game play
 */
UCLASS(Blueprintable)
class MYGAME_API ACustomCharacter : public ACharacter {
  GENERATED_BODY()
public:

  ACustomCharacter();

  virtual void Tick(float delta) override;

  // Are we currently looking at "something"
  UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Interaction")
  bool IsLookingAtSomething() const { return bLookingAt; }

  // The last hit result we cached
  UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Interaction")
  const FHitResult& GetLastLookingAtHit() const { return LookingAtHit; }

  // Is the object we are looking at "interactable"
  UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Interaction")
  bool IsLookingAtInteractable() const { return bLookingAt && bLookigAtInteractable; }

protected:

  // Handles the Line Trace logic to check if the camera is looking at something
  virtual void PerformLookTest();

  // The character's "eyes"
  UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
  class UCameraComponent* CameraComponent;

private:

  // Tells us whether anything was looked at, at all
  bool bLookingAt;

  // Tracks the last hit result we had
  FHitResult LookingAtHit;

  // Is the thing we are looking at "interactable"
  bool bLookingAtInteractable;
}
  ```
</details>

<details>
  <summary>CustomCharacter.cpp</summary>

```cpp
// Copyright 2022 Chris Pikul and Chronophase, All Rights Reserved.
#include "CustomCharacter.h"

#include <Camera/CameraComponent.h>

#include "CustomCollision.h"

ACustomCharacter::ACustomCharacter() {
  PrimaryActorTick.bCanEverTick = true;
  AutoPossessPlayer = EAutoReceiveInput::Player0;

  CameraComponent = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
  CameraComponent->SetupAttachment(RootComponent);
  CameraComponent->SetRelativeLocation(FVector(0.f, 0.f, BaseEyeHeight));
  CameraComponent->bUsePawnControlRotation = true;
}

// NOTE: Input system is excluded

void ACustomCharacter::Tick(float delta) {
  Super::Tick(delta);

  PerformLookTest();
}

void ACustomCharacter::PerformLookTest() {
  // How far in UE units (cm) can we look before it's out of reach
  const float DEPTH_RANGE = 250.f; // 1/4 meter

  // Calculate the start and end points for the line trace.
  FVector traceStart = CameraComponent->GetComponentLocation();
  FVector traceEnd = traceStart + (CameraComponent->GetForwardVector() * DEPTH_RANGE);

  // Dummy parameters to satisfy the method
  FCollisionQueryParams traceParams;

  // Perfom the line-trace using our own channel
  if(GetWorld()->LineTraceSingleByChannel(
      LookingAtHit,       // Member variable holding the FHitResult
      traceStart,         // Starting location in WS
      traceEnd,           // Wnding location in WS
      TRACE_Interactive,  // Custom collision trace channel
      traceParams         // Dummy parameters to satisfy the call
    )) {
    // We hit something
    bLookingAt = true;

    // Save if we are looking at something interactable
    bLookingAtInteractable = LookingAtHit.GetComponent()->IsSimulatingPhysics();
  } else {
    // We did NOT hit anything
    bLookingAt = false;
    bLookingAtInteractable = false;
  }
}
```
</details>
