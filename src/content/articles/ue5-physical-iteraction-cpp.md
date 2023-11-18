---
title: "Physical Interaction in Unreal Engine 5"
summary: "An exploration in building a physical interaction system for Unreal Engine 5, allowing for grabbing and manipulating objects in-game."
timestamp: 2023-02-17T06:02:36Z
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
if you are coming from UE4.[^1]

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

You'll notice I included some bonus-points Blueprint helper functions to get
these variables. This is useful for any classes outside of this one
(they are public after all).

The only change we are going to make to the `Tick()` event is to just call this
new method `PerformLookTest()`. I'll also scaffold the method just so we have it
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
      traceEnd,           // Ending location in WS
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

## Chapter 2 - Grabbing Stuff

Now that we know how to "see" things in front of us. It's now time to actually
do the whole "grabbing" part. And wouldn't you know it, UE has our backs covered
with this one. This whole process becomes even easier thanks to a built in
Component `UPhysicsHandleComponent` that will do most if not all the work for
us.

So to get started, we need to add a new member variable to our Character class
header to save this new component. In addition to this, we're going to setup
some addition variables to help track if we are grabbing something, what it is,
and how far it is from the camera.

```cpp
class MYGAME_API ACustomCharacter : public ACharacter {
protected:
  UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Interaction")
  class UPhysicsHandleComponent GrabComponent;

private:

  // Are we currently grabbing something
  bool bGrabbing;

  // The actor we are grabbing
  AActor* GrabbingActor;

  // The component on the actor we are grabbing (the actual collision object)
  UPrimitiveComponent* GrabbingComponent;

  // How far from the camera the object is
  float GrabDistance;

  // The orientation of the object as we hold it
  FRotator GrabRotation;
}
```

In your constructor, add the following to instantiate the new component

```cpp
#include <PhysicsEngine/PhysicsHandleComponent.h>

ACustomCharacter::ACustomCharacter() {
  // ... previous code

  GrabComponent = CreateDefaultSubobject<UPhysicsHandleComponent>(TEXT("Grab Handle"));
}
```

### A Note About Input

As I've mentioned throughout this article, I'm not covering the input setup for
this.[^1] But that doesn't mean we don't need it. In fact, we most certainly do.
In the sense that we need some sort of Action that we can listen for to start
grabbing something and when to release it.

For this, I've used an _Action Binding_ on the Input Controller so we know when
the action starts and ends. Excluding the binding itself, just know this is
bound to new methods `HandleGrabStart()` and `HandleGrabEnd()` we will add now.

```cpp
class MYGAME_API ACustomCharacter : public ACharacter {
protected:

  // Fires when the input starts
  virtual void HandleGrabStart();

  // Fires when the input stops
  virtual void HandleGrabEnd();
```

In my project I've bound these to the Middle Mouse Button so that when the
input starts it fires `HandleGrabStart()` and when it's released it fires the
`HandleGrabEnd()` method. We'll implement these next.

### Starting The Grab

We have the two methods declared, time to implement them. To start, we will do
some guards to ensure we can actually do the grab.

```cpp
void ACustomCharacter::HandleGrabStart() {
  // Check that we can even do this operation
  if(!bLookingAt || !bLookingAtInteractable)
    return;

  // Check we aren't already grabbing something
  if(bGrabbing)
    return;
}
```

You could add a `UE_LOG` statement there to help debugging. Notice we are also
ensuring that we aren't already grabbing. This is to protect the input from
being fired to many times and ensures that the rest of the function should only
run once until it is release.

Either way, now that we have ensured we are looking at something, and that it is
interactable we can now start the grabbing process.

```cpp
#include <Kismet/KismetMathLibrary.h>

void ACustomCharacter::HandleGrabStart() {
  // ... previous code

  // Save the objects
  GrabbingActor = LookingAtHit.GetActor();
  GrabbingComponent = LookingAtHit.GetComponent();

  // If for some reason, the handle didn't release, fix it now
  if(GrabComponent->GrabbedComponent != nullptr)
    GrabComponent->ReleaseComponent();

  // Calculate the distance the object is now so we can maintain that distance
  GrabDistance = FVector::Distance(
      CameraComponent->GetComponentLocation(),
      GrabbingActor->GetActorLocation()
    );

  // Save the orientation based on how we saw the object
  GrabRotation = UKismetMathLibrary::MakeRotFromX(LookingAtHit.Normal);

  // Tell the PhysicsHandleComponent to start grabbing
  GrabComponent->GrabComponentAtLocationWithRotation(
      GrabbingComponent,                  // The component to grab
      NAME_None,                          // Socket on the component to grab
      GrabbingActor->GetActorLocation(),  // The location of the object
      GrabRotation                        // Desired rotation of the object
    );

  // Prevent the Chaos gotcha
  GrabbingComponent->WakeRigidBody();

  // Update the character state
  bGrabbing = true;
}
```

There's a bit to unpack here, but let's step through it. First, we are gonna
cache the actor and component from the look test so we know what we are
manipulating.

Next, to prevent any future issues, we'll drop whatever we have if for some
reason we don't properly clean that up later. Not sure if this is needed, it
just helps me sleep better.

After that, we calculate the distance from the camera to the actor we are
grabbing. This will help us maintain the same distance throughout the grabbing
process as we move around. Notice that this is to the actor, and not the component
or the hit location. You can do those, I just think this felt a bit better.

Once we have the distance, we just cache the rotation of the object based on how
we saw it from the look test. This will keep the object "frozen" in it's
orientation. There are ways to tell the `UPhysicsHandleComponent` to be soft
about orientation and whether to lock it (or attempt to) at all. Change those
settings and any others in the component to your tastes.

The big magic happens now when we call `GrabComponentAtLocationWithRotation()`.
This will start the whole process for us and get the component working on it.

#### Watch Out For This Gotcha'

The next line is more important than you think. `GrabbingComponent->WakeRigidBody()`.
I found that initially when I tried this, the object did not move at all. After
some research it seems that when UE5 switched to Chaos for it's physics engine
it broke some of the functionality in `UPhysicsHandleComponent`.

One of the things Physics Engines may do to keep performance good is put objects
to "sleep" if they haven't moved for a while. In this mode, the object can skip
any physics calculations until something influences it. In our case, there's a
good chance whatever we are trying to grab, is "asleep".

This results in essentially the object being frozen, and as such, the Physics
Handle can't move or manipulate it. But thankfully, with the `WakeRigidBody()`
call we can force the object to wake up.

### Releasing The Grab

Now that we have the object "grabbed", we should also drop or release it when
the input has concluded. We have `HandleGrabEnd()` method ready to handle this.

Should be an easy one, we just need to reset any state variables related to this.

```cpp
void ACustomCharacter::HandleGrabEnd() {
  // Guard against nullptr errors
  if(!bGrabbing || !GrabbingActor || !GrabbingComponent)
    return;

  // Tell the Physics Handle to release the object
  GrabComponent->ReleaseComponent();

  // HACK: Make sure chaos updates this
  GrabbingComponent->WakeRigidBody();
  GrabbingComponent->AddImpulse(FVector::UpVector * 10.f, NAME_None, true);

  // Clear the state variables
  GrabbingComponent = nullptr;
  GrabbingActor = nullptr;
  bGrabbing = false;
}
```

We start by guarding in case this event fires at an unfortunate time. Feel free
to add a `UE_LOG` or something to debug it easier.

We can easily release the object by telling the `UPhysicsHandleComponent` to let
go using the `ReleaseComponent()` method. After this, we do some hack fixes to
make sure Chaos updates the awake state. This prevents a bug in which if the
player hasn't moved the object in a bit (could be as quick as a second) and then
releases it, the object may already by "asleep" in the physics engine. This will
result in the object hovering where it is until it's interacted with again. No
good, so we ensure DOUBLY that it is awake using `WakeRigidBody()` and the
`AddImpulse()` to just touch it a little bit.

From here, we just zero out our state variables so nothing is left hanging
around.

<details>
  <summary>Bonus Points</summary>

  It may not be neccessary, but you may consider calling this method
  `HandleGrabEnd()` manually at the end of the character lifecycle. This can be
  in a overriden `EndPlay()` method. Additionally, if you know when the character
  is "UnPossessed" you should do it there as well.

  This may help prevent bugs of Character "death" or swapping Characters from
  keeping the Grab functionality going.
</details>

### Moving The Grabbed Object

Now that we have started and ended the grabbing process, there's only one thing
left to do. We need to update the `UPhysicsHandleComponent` manually to tell it
the new looking direction. This way, when our Character moves and looks around
they'll be "dragging" this object around.

For this, we are gonna setup another Character class method to perform this, and
make sure the `Tick()` event is calling it.

```cpp
class MYGAME_API ACustomCharacter : public ACharacter {
protected:

  // Update the Physics Handle to move any grabbed objects
  virtual void UpdateGrabbedObject();
```

To start implementing it, we just need to make sure we are in the process of
grabbing something. As well as tie into the `Tick()` event as mentioned.

```cpp
void ACustomCharacter::Tick(float delta) {
  // ... previous code

  UpdateGrabbedObject();
}

void ACustomCharacter::UpdateGrabbedObject() {
  if(!bGrabbing)
    return;
}
```

One of the things we are going to need to provide is a new "location" for the
object as we move around. Once we have this, we can tell the Physics Handle that
it is the new _desired_ transform. The `UPhysicsHandleComponent` will do the
interpolation for us giving us a smooth transition with almost a "lag" effect.
You can adjust those interpolation settings in the component itself.

```cpp
void ACustomCharacter::UpdateGrabbedObject() {
  if(!bGrabbing || !GrabbedComponent)
    return;

  // Calculate our new ending location
  FVector offset = CameraComponent()->GetForwardVector() * GrabDistance;
  FVector newLocation = CameraComponent->GetComponentLocation() + offset;

  // Tell the Physics Handle the new desired location and rotation
  GrabComponent->SetTargetLocationAndRotation(newLocation, GrabRotation);

  // Just to be safe, I put this here as well
  GrabbedComponent->WakeRigidBody();
}
```

As you can see the new locaation is calculated by basically moving forward
through the camera by the given distance we calculated from the start.

After updating the desired location, everything should be working now as
desired. As you see, I put an extra assurrance that the physics body remains
awake. I noticed if you stay in the same spot for too long it may freeze up
again.

### Now Where We Stand

At this point, you could probably call it a day. We've done what we set out to
do. We can pick up objects, drag them around, and release them back into the
world. There could be future considerations though...

## Chapter 3 - Going Some Steps Further

We can move stuff around, and that's pretty good. But surely there's some ideas
of things we can additionally do. So I'd thought I'd give you some inspiration
for ways to expand on this. Most of these, I've implemented in my own project.

### Moving The Object In & Out

Sometimes just dragging something around can be, well, lackluster. At the very
minimum we could allow the Player to push the object in, and out, of their view.
Such as moving it forwards and backwards in distance.

Luckily, we already have the setup for this. Using the `GrabDistance` variable
we can manipulate it to move the object in and out. It's really that easy. I
bound an event to Mouse Wheel that allowed for this kind of manipulation. Scroll
down and it moves closer, scroll up and it moves further away.

One consideration is that there should be minimums and maximums set so it's not
_too_ unwielding. Consider the following:

```cpp
void ACustomCharacter::HandleGrabShift(float axis) {
  GrabDistance = FMath::Clamp(GrabDistance + axis, 50.f, 250.f);
}
```

Something like that can help ensure the distance remains between 50cm and 250cm
away from the camera. But one of the things I figured is that objects are
different sizes. Something small should be able to get closer than something
large. This is especially important considering we are moving from the objects
center, and the object will collide with our own Capsule Collider providing an
odd collision experience. To correct for this, we can do some work with the bounds
and our collision to find a healthy medium.

```cpp
void ACustomCharacter::HandleGrabShift(float axis) {
  FVector actorOrigin;
  FVector actorExtent;
  GrabbedActor->GetActorBounds(false, actorOrigin, actorExtent, true);

  const float GAP = 10.f;
  float minDistance = actorExtent.Length() + GetCapsuleComponent()->GetScaledCapsuleRadius() + GAP;

  GrabDistance = FMath::Clamp(GrabDistance + axis, minDistance, 250.f);
}
```

Here I made a calculation by getting the rough "size" of the object we are
grabbing, and adding the radius of our own Capsule Component. With the addition
of a small gap to prevent things from getting absolutely on the edge close. With
this addition, the new minimum distance should take into account the size of the
object being grabbed.



[^1]: Input setup isn't covered in this article because there's a few (at least
two) ways to do it. In my project I've used _Enhanced Input Subsystem_ which is
new to late-UE4/UE5. This is a complicated beast in it's own right and would be
far too much boilerplate for this article.
