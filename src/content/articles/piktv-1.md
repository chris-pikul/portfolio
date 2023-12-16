---
title: "Linux For Your TV - Part 1"
summary: "I wanted to build a custom Linux distro specifically for use on a Raspberry PI for multimedia usage. Here is how it went..."
timestamp: 2023-12-16T22:41:49+03:00
heading: Linux For Your TV
subheading: Building a custom linux distro - Part 1
tags:
  - Linux
  - OS
  - Embedded
---
# Linux For Your TV

I know there already exists some solutions for linux based distros that target
embedded systems, and provide multimedia solutions. I am doing things the hard
way, because I want to. Also, because it's good learning. And finally, because
that's really the linux way isn't it?

So here is what I have... I have a Raspberry PI 4 (because 5 isn't out yet for me).
I have VirtualBox on my development laptop. And I have a copy of Debian 12. How
can I turn these things into a solution that will provide me a way to boot the
Raspberry straight to video mode on my TV to provide custom apps.

The goal than is to get a full-screen application showing on my TV in which I can
control it using some sort of remote. These applications should be expandable, as
in I can add more if needed. Basically an OS for a supplemental TV device. Now
I am pretty sure the existing solutions won't let me do this very well. Of course
there are things like Plex and the like that offer all-in-one-media solutions,
but I don't want to be limited to media. What if I want an emulator for my old
games so I don't have to hack the PS2 back into working? And as I mentioned
earlier, what's the fun in that?

## Previous Attempt

Just so you know, this article is documenting my second trial at this. So I
figured I would briefly outline the first attempt. First off, I wanted to use
Wayland on linux because I read that it's supposed to be the new standard and all
that. While it might be, VirtualBox apparently doesn't like it. So my attempts to
get a simple Wayland based desktop environment failed miserably. For those wondering,
I was looking at [Cage](https://github.com/cage-kiosk/cage) because it offered
full-screen kiosk mode for an application which sounded great. Unfortunately I
could not get it working great on a bare Debian installation. Wayland requires
XWayland, which requires X11. At least on VirtualBox it does. And if I was going
to have to install X11 anyways, it seemed easier to just skip the wayland process
all together. A primary goal here, given that RasberryPI is the target is to run
as lean and mean as possible. And having a layer of indirection just seemed to
be ridiculous.

Anyways, after giving up on that, I had a hell of a time getting my Debian
setup to work properly after I had butchered it trying to get Wayland to work.
Oops. So I decided for a fresh install. This time I looked at using Ubuntu Base
which is supposed to be a minimal install of Ubuntu. I chose Ubuntu because it
is usually my daily driver. This task failed miserably. Installing Ubuntu Base
is a complicated expert-mode process, and I was doing this in free time. Gave up
on that after a day.

## The Start Of An Adventure

So I have a fresh minimal installation of Debian 12 Bookworm on a VirtualBox
emulation running and ready. Nothing is installed, and already there are problems.
For those unfamiliar (as I was the first go around), VirtualBox needs some additional
help to get anything remotely useful working in it's guest VM. I guess I should
have read the instructions. I knew it going into it this time though! So first
thing I did was install the guest extensions. In the final version, I will skip
this as Raspberry PI doesn't need them.

> Note: I setup the Debian system with a root login (against it's recommendations)
> because this is a VM. And also because it's for a TV box.

```bash
echo "deb http://fasttrack.debian.net/debian-fasttrack/ bookworm-fasttrack main contrib" >> /etc/apt/sources.list
echo "deb http://fasttrack.debian.net/debian-fasttrack/ bookworm-backports-staging main contrib" >> /etc/apt/sources.list
apt update
apt install virtualbox-guest-x11
```

Apparently for Debian you need to use the "fasttrack" channel to get ahold of the
VirtualBox binaries for guest additions (or are they tools?). Anyways, these
snippets worked easy for Debian Bookworm (12) and got the x11 installed.

Next I wanted a text editor, because as much as I am fine with Nano, these days
we can do better. I went with [Micro](https://micro-editor.github.io/).

```bash
apt install curl
curl https://getmic.ro | bash
mv ~/micro /usr/bin
chmod -R 755 /usr/bin/micro
```

Not sure if the chmod was needed, but it doesn't hurt I suppose.

## A User For My TV

I know I will need a less privileged user once the system is actually working,
so I created one of those now just to have it and test with. Look, I'm going
fast and loose here, but I don't want to be extra insane. Anyways, this user
will be added to the groups I think are correct. I suppose it's one of those
things that I'll find out later was either pointless or wrong. Anyways, easy to
do...

```bash
adduser piktv
usermod -a -G audio,video,games,input,render,bluetooth piktv
```

I just picked some obvious choices for now.

## TVs Are For Pictures

Ok the preliminary work seems to be out of the way. I have a box that works and
I can log into it and muck around in the files. Pretty nice. Except it is not
pretty, it's all just text stuff that looks terrible on anything that isn't a
phosphor CRT.

I need to waste time and add a pointless boot splash! This will solve another
problem I don't like, which is the GRUB boot menu. So I want to get rid of both,
in one feature.

> Note: When I setup Debian I disabled the os.probe in GRUB from there, I don't
> need to dual-boot so I didn't need that process.

I edited by GRUB configuration via `micro /etc/default/grub` and changed some
settings. For brevity, I'll list the changes I made and not the whole file.

```
# Use the first entry for the OS
GRUB_DEFAULT=0

# Disabled the boot menu by not waiting for a selection
GRUB_TIMEOUT=0

# Set the kernel parameters
GRUB_CMDLINE_LINUX_DEFAULT="ro quiet loglevel=3 udev.log-priority=3 splash $vt_handoff"

# Enable the graphics mode from the start
GRUB_GFXMODE=1024x768

# Show a splash image
GRUB_BACKGROUND=/boot/grub/splash-1024.png

# Possibly let the graphics mode stay between mode change
GRUB_GFXPAYLOAD_LINUX="keep"
```

There is a bit of stuff in that command line setting for kernel parameters which
could be explained. Here is the breakdown as far as I understand it:

- `ro` means to setup the disk in Read-Only mode. I've read this is faster and
safer, so I added it.
- `quiet` mutes some of the text output that GRUB would normally output during
boot. You'll need to disable this temporarily if something catastrophic happens.
- `loglevel=3` and `udev.log-priority=3` where added because I read somewhere that
it silences an additional boot message I was getting about spectre vulnerabilities.
This is VirtualBox so I don't care about those messages, and on a TV I also
would not care. So this gets rid of more messages.
- `splash` tells GRUB to use a background image.
- `$vt_handoff` is here because I read somewhere that it helps the handoff process
when changing graphics mode to the next splash system. I don't know if it's
needed, but it didn't break anything. [Update: It's Ubuntu specific, not needed]

Also to note is the last line about `GRUB_GFXPAYLOAD_LINUX` which is again
supposed to help with the mode switching.

To add the image I had to setup a Shared Folder in virtualbox and mount it inside
the guest to copy an image from my host to the VM. It's in the top menu under
Devices to do that. Then I just had to mount it where I could then copy my file. I made the
image real quick and made sure to export as PNG. Following that, it was a simple copy job.

> Note: you may be tempted to use a JPEG image, but I had no luck with that.
> Searching the internet found that it is essentially broken even though it
> acts like it isn't. Save yourself the pain, and just use PNG.

```bash
mount -t vboxsf shared /mnt/shared
cp /mnt/shared/splash-1024.png /boot/grub/splash-1024.png
```

With those changes, I had to apply them so GRUB would install the necessary
configurations. Being I was already in root, no sudo needed but the command is
as simple as `update-grub2`. You can also use `update-grub`. I believe they are
aliased to each other anyways.

With that a quick `reboot` tested it out and it worked.

### A Small Annoyance

Rebooting to test GRUB showed an annoying starting message that says `Welcome to GRUB!`
for a second or two before going into the splash image. This would not do. My TV
should not be saying GRUB to my guests!

The GRUB package is amazing, but for some reason this has never been removed or
put into an option that I can find. The interwebs geniuses suggest I download the
source code and modify it to my needs and install from a local version. That would
be difficult to do in a reproducible way, so I chose to just... not do that.

Instead, I found a GitHub repository promising me automated glory. So I chose to
do that instead. I downloaded [grub-shusher](https://github.com/ccontavalli/grub-shusher)
via Git. Unfortunately, I didn't have git yet so I had to install it. I feel like
this is going to increase bloat, but I really wanted it gone.

```bash
git clone https://github.com/ccontavalli/grub-shusher.git
apt install git make gcc
cd grub-shusher
./setup-debian.sh /dev/sda
```

Ok so turns out I needed Git, Make, and GCC to build and perform this process. But
it worked! It patched it right out. Rebooting showed a black screen for a second
with a white underscore cursor, but that was more acceptable than the previous
message. Now that it's patched, I could remove the dependencies I had to install,
but I will keep them around for now.

### Even More Pretty

Ok so the initial GRUB boot splash was covered, but the linux initialization
process that comes next had a whole bunch more confusing garbage that should
probably come with an epileptic warning. I had to get rid of that too. It seems
the goto package for it is [Plymouth](https://wiki.debian.org/plymouth) which I
promptly installed.

```bash
apt install plymouth plymouth-themes
plymouth-set-default-theme -l
plymouth-set-default-theme -R fade-in
```

Installation was pretty simple. I didn't have any Nvidia drivers so no need for
special treatment. My GRUB configuration was already setup from the previous
splash so that was OK as well. I just chose a random built-in theme to get started
with the process.

The handoff between GRUB and the new Plymouth splash was a bit slow, so I had
read to do some tweaks to GRUB which I have already mentioned with the `$vt_handoff`
and all. An additional change was made to the plymouth configuration at
`/etc/plymouth/plymouthd.conf`

```
# /etc/plymouth/plymouthd.conf
[Daemon]
Theme=image
ShowDelay=0
```

A savvy reader may notice that I set the `Theme` value to something called image.
This is a custom theme that I created with the purpose of showing the same splash
image that I had setup for GRUB. To do this, I created a new folder in
`/usr/share/plymouth/themes/image` and added the necessary files for it.

```bash
mkdir /usr/share/plymouth/themes/image
micro /usr/share/plymouth/themes/image/image.plymouth
micro /usr/share/plymouth/themes/image/image.script
copy /boot/grub/splash-1024.png /usr/share/plymouth/themes/image
update-initramfs -u
```

The theme file at `image.plymouth` is here:
```
[Plymouth Theme]
Name=Simple Image
Description=Shows a static image
ModuleName=script

[script]
ImageDir=/usr/share/plymouth/themes/image
ScriptFile=/usr/share/plymouth/themes/image/image.script
```

And the script at `image.script` is here:
```
image = Image("splash-1024.png");
pos_x = Window.GetWidth()/2 - image.GetWidth()/2;
pos_y = Window.GetHeight()/2 - image.GetHeight()/2;

sprite = Sprite(image);
sprite.SetX(pos_x);
sprite.SetY(pos_y);

fun refresh() {
    sprite.SetOpacity(1);
    sprite.SetZ(15);
}
Plymouth.SetRefreshFunction(refresh);
```

The whole theme was based on some code I found [here](https://github.com/barskern/plymouth-theme-simple-image).

I did have to copy the image from the GRUB folder as trying to reference it from
there did not work. Maybe a symbolic link would work? But I don't plan on changing
it any time soon so it will work for now.

Make sure you do the `update-initramfs -u` command in order to apply the changes.

If you want to test locally, I created a bash script to do that for me that was
pretty easy. I made this in my home directory since it's just a test...

```bash
#!/bin/bash

plymouthd
plymouth --show-splash
sleep 5
plymouth quit
```

Remember to `chmod +x ./test-plymouth.sh` before trying, and run it to test.

# Conclusion

There is still an annoying black screen between GRUB and Plymouth, but I can work
on that later. Otherwise, it looks great. Now to actually make something useful.

On the next installment, I'll work on adding a display manager probably. I imagine
something like LightDM will help with the auto-login and getting my to the window
manager.

I'm still looking for a window manager for that matter. Stacking style will not
work for a TV system, and Tiling is no good either. I really just need a full-screen
one-app-at-a-time window manager. XMonad can do this, and so can DWM with it's
"monacle" setting. But these seem cumbersome for what I am trying to achieve.

Hopefully I won't have to write one myself, but I imagine that is coming. Anyways,
happy hacking and until next time!
