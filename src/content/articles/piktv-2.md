---
title: "Linux For Your TV - Part 2"
summary: "Continueing the saga, we move into the graphical world of X11"
timestamp: 2023-12-17T17:21:36+03:00
heading: Linux For Your TV
subheading: Part 2 - X11 and the joys of GUIs
tags:
  - Linux
  - OS
  - Embedded
---
# Linux For Your TV

From [last time](./piktv-1) we had setup a Debian installation with some initial
boot loading splash graphics to get our feet wet. Today, I wanted those feet even
wetter by jumping into X11 and it's gloriously antiquated APIs.

## Our First Window Manager

X11 should have been installed from the last series based on the VirtualBox guest
addons step. But I would actually need a window manager to see if things where
working. There are many many choices here, but I chose to go with [DWM](https://dwm.suckless.org/)
because it was bare simple, C code that offered Tiling mode and more importantly
a "Monacle" mode for single apps on screen. You could go with any other variety
of window managers and desktop environments, but I needed to get something on
screen quickly.

The inventors of DWM have made things difficult on purpose. They claim "elitist"
intentions, which is an odd thing to proclaim proudly. It's really not that
difficult, and I shall share the secret recipe with you now:

```bash
wget https://dl.suckless.org/dwm/dwm-6.4.tar.gz
tar xf dwm-6.4.tar.gz
cd dwm-6.4
apt install libx11-dev libxft-dev libxinerama-dev xorg
make clean install
```

I installed the dependencies just in case, but in reality you should try each
one-by-one so you have a more minimal installation. Either way, that's really it
and it's ready to go. It installs to `/usr/local/bin/dwm` so it's already available
in your path.

There where suggestions to add a startup script so you could just use `startx`
instead of any other setup, so I did that as well. Just make a file `~/.xinitrc`
using `micro` or whatever else and add the single line...

```
exec dwm
```

Now you can start it with `startx`. Once it starts, it may or may not display a
mostly black screen with a gray-ish status bar on the top.

### VirtualBox Glitch with DWM

Now my attempt at this, did not in fact show a brutalist gray status bar. It
actually did not show anything at all except some corrupted pixels. So that was
a problem.

To save you the trouble, I have learned to not trust VirtualBox at all when
something goes wrong. And I was right here as well. Got to switch the devices
graphics settings to get it to work. I didn't play with this much, but I had the
VM setup on "VMSVGA" for the driver with 3D acceleration turned on.

What I did to correct it was switch it to "VBoxSVGA" and turn 3D acceleration
off. Not sure which one did the trick because I was rushing, but a quick reboot
and the `startx` now boots correctly.

### Continuing With DWM

The magic keybinding to know when DWM starts is `Alt + Shift + Q` which is the
quit binding. Otherwise, the `Alt + Shift + Enter` command starts a terminal
emulator. Which speaking of, I need one of those. The guys at Suckless have
provided one of those too, so I'll use theirs.

```bash
wget https://dl.suckless.org/st/st-0.9.tar.gz
tar xf st-0.9.tar.gz
cd st-0.9
make clean install
```

Thats it for that one. Now with DWM running I can press the `Alt+Shift+Enter`
key combo and get a terminal up-front-and-center.

## Screen Resolution

At some point in this adventure I had notice I lost my 1024x678 screen resolution
after Plytmouth stopped. I do not know why, but I knew I wanted at least DWM to
run in that mode. My thought I suppose was that eventually I wanted Plymouth to
go straight into DWM anyways, so I'd start at the end and work backwards.

X11 makes it a joy to set a default resolution (nope, not at all). Depending on
which decade it is, X11 will look for configurations in 1 of 50 places. Lets go
with the choice that seems to exist on my Debian installation, which is in the
`/etc/X11/xorg.conf.d` folder. Side note: I love of the X11 folder is case-sensitive,
but only in that one spot. Anyways, heroes of the internet say I need a configuration,
so configuration I will give them. The heroes also say I will need some cryptic
string called a "ModeLine" to do this, and I do not know where to get that. I
checked the logs at `/var/log/Xorg.0.log` and found some there but it didn't work.
Also, checkout that casing again. Anyways, apparently there is a `xrandr` command
you can run from within a X Session that will tell you, but that's not very useful
before you get to that needed session. Turns out a tool comes with xorg for this
as `gtf`. Ok, that'll work.

Now, to create the configuration. I made a file called `/etc/X11/xorg.conf.d/99-virtualbox.conf`
and used my `micro` tool to make the additions. First, I needed that modeline in there,
and without a clipboard. Hmmmm... echo append maybe?

```bash
touch /etc/X11/xorg.conf.d/99-virtualbox.conf
gtf 1024 768 60 >> /etc/X11/xorg.conf.d/99-virtualbox.conf
micro /etc/X11/xorg.conf.d/99-virtualbox.conf
```

I use micro because it has cool bindings such as `Alt+ArrowUp` to re-arrange
existing lines. Otherwise `Ctrl+K` to cut a whole line, and `Ctrl+V` to paste it
back. Anyways, here is my config for Virtual Box...

```
Section "Modes"
    Identifier      "1k"
    Modeline        "1024x768_60.00"  64.11  1024 1080 1184 1344  768 769 772 795  -HSync +VSync
EndSection

Section "Monitor"
    Identifier      "VGA-1"
    UseModes        "1k"
    Option          "PreferredMode" "1024x768_60.00"
EndSection
```

Saving that and then running `startx` again seems to work. DWM now starts in the
1024x768 resolution. I'm still wondering why bash is in some weird 800-ish
resolution now, but that's a problem for later.

## Autologin

I had created a user earlier called `piktv` for just the purpose of autologin and
starting the applications. Nows the time to try it. Basically, when the system
starts I want it to boot straight into this new DWM as the regular user. Guest-mode/Kiosk if you will. Debian already has `systemd` installed, so we can use that.

Finding some resources online pointed me to this solution...

```bash
mkdir /etc/systemd/system/getty@tty1.service.d
micro /etc/systemd/system/getty@tty1.service.d/override.conf
systemctl daemon-reload
```

For the configuration itself, it's pretty easy.

```
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin piktv --noclear %I $TERM
```

I do not know why there are two lines for ExecStart, but whatever there it is
anyways. Next I need to add to the user's profile so it can automatically run the
`startx` command and get stuck in the loop to maybe prevent returning to the
original terminal.

For this, since I'm root I can do `micro /home/piktv/.profile` and add the following
to the bottom of the existing file...

```
# Run StartX Automatically
if [[ -z "$DISPLAY" ]] && [[ $(tty) = /dev/tty1 ]]; then
    . startx
    logout
fi
```

For good luck I added the `.xinitrc` file that I used for the root profile and
copied over. It's the same thing, just to start the DWM already.

### Another Thing I Did That Is Probably Unnecessary.

I don't know if this is actually useful, but a [forum post](https://forums.debian.net/viewtopic.php?t=143970) I read suggested setting the `x-session-manager`
alternatives so it will always pick DWM. I did it anyways, but I have no idea
if it was necessary. If you want to do it too...

```bash
update-alternatives --install /usr/bin/x-session-manager x-session-manager /usr/local/bin/dwm 50
```

## The Text Is Back

Avoiding white text, on black background, is apparently impossible in the land
of linux. So we got the GRUB splash, which gives way to a black screen for a
couple seconds. Then, it goes back to the splash via Plymouth which is good. But
then, it gives way to the getty autologin which prints a bunch of X11 stuff before
the actual DWM starts up and takes control. To add to this problem, the resolution
is gone again.  Oh boy.

### Making The Resolution Stick

I reset the resolution once I was in DWM by opening the terminal with
`Alt+Shift+Enter` and running `xrandr` to output the modes. Then I set the mode
with...

```bash
xrandr --output VGA-1 --mode 1024x768 --rate 60
```

Which snaps the virtualbox back into 1024x768. But I need to make it stick, which
actually turned out to be pretty easy, if not mysterious.

I tried to adjust the config file, and applying that seems to work? Basically,
instead of the identifier `VGA-1` I had to use `<default monitor>`. So I applied
it and rebooted, and it stuck!

### Allow The Guest To Shutdown

I understand linux is usually designed to focus on multi-user systems, and as
such powering off the system could be rude to the other users. But not in this
case. I definitely want the guest user to be able to shutdown. To approach this,
I went with the "group" option with some extra utility just in case.

```bash
groupadd power
usermod -a -G power piktv
```

I created a new user group called `power` and added the `piktv` user to it. Now,
I was going to use `sudo` for this work, but it turns out I didn't have it. That's
ok, we can fix that with `apt install sudo` and be ready. Next, to make the technique
work I need to allow the `power` group to use sudo in a special way. So I created
a script in the `/etc/sudoers.d` configuration directory. The old way was to edit
the actual `/etc/sudoers` file, but this seemed cleaner. The name of the file
didn't matter so I just went with `micro /etc/sudoers.d/power`

```
# Allows users in the power group to perform shutdown andn the like
%power ALL=(root) NOPASSWD: /sbin/reboot
%power ALL=(root) NOPASSWD: /sbin/halt
%power ALL=(root) NOPASSWD: /sbin/shutdown
```

Now the trick is, the user has to use the `sudo` command for this to work. I will
for sure forget this, so I added a useful script shortcut that ensures that.

I created `/usr/bin/power` and added the following:

```bash
#!/bin/sh

sudo /sbin/shutdown $*
```

And made sure it was runnable with the following:

```bash
chown root:power /usr/bin/power
chmod +x /usr/bin/power
```

At least within the terminal in DWM the `piktv` user can execute `power now` and
shutdown the system. I would like this to happen automatically after the DWM
session closes, and to do so took some figuring out. I though, rather incorrectly
it turns out, that if I appended the shutdown command after the startx command
in the `.profile` file it would work. But nope, didn't work. What I did figure out,
was to instead add it to the `.xinitrc` file after DWM is ran. In order for this
to work, I needed to remove the `exec` part of the command since I guess that only
continues if the process fails which seems odd to me but ok. Anyways, here's the
new simple contents of `/home/piktv/.xinitrc` to do this...

```
dwm
power now
```

That's really it. Now when I exit DWM via `Alt+Shift+Q`, it goes directly into
power down.

### On A Mission To Remove Text

That's right, the startup text. I was annoyed by it. I remember now, because I
just saw it again during my testing. So I've done some research on this topic as
well and it seems to be a multi-phase thing. Some sources say to add an empty
file in the home directory as `~/.hushlogin`, and this does seem to get rid of
the initial login text. Powered with an adjustment to the getty autologin script,
get's rid of all of the text displayed on screen up to the X11 starting point.

```
# /etc/systemd/system/getty@tty1.service.d/override.conf
[Service]
ExecStart=-/sbin/agetty --skip-login --noclear --noissue --login-options "-f piktv" %I $TERM
```

Now to get rid of the X11 stuff, I tracked down a command that seems to just send
it all to `/dev/null`, which is ok. We have the log file anyways. So to add this
fix we adjust the `/home/piktv/.profile` script where the `startx` is to turn all
the noise off.

```
if [[ -z "$DISPLAY" ]] && [[ $(tty) = /dev/tty1 ]]; then
    . startx -- -nocursor &> /dev/null
fi
```

With those fixes we get login and startx done with no text on screen. There is a
dancing cursor that navigates around, and the entire screen is black. But at least
there isn't shocking white debug text. So how do I cover up the black screen?

### Trying Yet Another Splash

A lovely [forum post](https://www.linux.org/threads/systemd-and-boot-splash-page-rpi4-bullseye.46583/) has been monumental in figuring
this out and an individual has suggested making a splash service to keep the image
up. So that's what I did, I made a new service to keep the splash up. I did have
to install FBI via `apt install fbi` which took more space than I wanted from something that would just output an image to the framebuffer, but ok.

Created the script at `/etc/systemd/system/splash.service`

```
[Unit]
Description=Splash Screen
After=local-fs.target

[Service]
ExecStart=/usr/bin/fbi -d /dev/fb0 --noverbose -a /boot/grub/splash-1024.png
Type=oneshot
StandardInput=tty
StandardOutput=tty

[Install]
WantedBy=sysinit.target
```

And enable it with `systemctl enable splash`. It, does something? Theres a lot of
black, then picture, then black, then picture over and over. But it's something.

I also added `vt.global_cursor_default=0` to the `/etc/default/grub` command line
and refreshed it with `update-grub2` which gets rid of the white underscores.

No smooth transitions yet. But getting closer, I can feel it.

### Some Final Adjustments For This Part

So attacking the blank screen problem, I checked if maybe it was modesetting and
the virtual box drivers getting loaded/unloaded and switching around. For this,
I added a driver setting in the initramfs modules to get the suggested drivers
going. `micro /etc/initramfs-tools/modules`

```
drm
vboxvideo modeset=1
```

And then update with `update-initramfs -u` and check with `reboot`. This actually
made some of the boot process cleaner. Still blank spots. But a noticeable step
in the right direction. Also, I lowered the loglevel even further in the grub
configuration and reloaded with that. It's now at 0. Getting much much closer.

## I Have An Idea

So for my splash screen problem (yes I'm still on about that), I actually needed
something else anyways, which may help me with the splash. For this to be useful
I need DWM to start a program, when it starts. And by this, I mean the whole thing,
not much of a TV OS if it doesn't do anything when it starts. So I need to get
DWM to execute something when it starts up, which can be achieved using the patching
process as mentioned on their site. This is a unique way to do things, but ok!

To do this, I deleted the original DWM directory in my root home folder, and
instead grabbed the git version. Then I downloaded the "autostart" patch file and
applied it. Finally, I rebuilt DWM and got the new startup script ready.

```bash
rm -r ~/dwm-6.4
git clone https://git.suckless.org/dwm
cd dwm
mkdir patches
cd patches
wget https://dwm.suckless.org/patches/autostart/dwm-autostart-20210120-cb3f58a.diff
cd ..
git apply patches/dwm-autostart-20210120-cb3f58a.diff
cp config.def.h config.h
make clean install
mkdir /home/piktv/.dwm
chown piktv:piktv /home/piktv/.dwm
chmod 755 /home/piktv/.dwm
touch /home/piktv/.dwm/autostart.sh
chmod +x /home/piktv/.dwm/autostart.sh
```

With that done I just added two characters to the autostart. `st`. That's the
terminal emulator I installed earlier. Save and exit and reboot. It goes straight
to DWM with the terminal emulator launched. Great! Now what?

### The Evil Plan

I think I can tweak the Plymouth service to never exit maybe? And then have DWM
terminate it once it loads? That's the idea anyways. At this part of the article,
I'm free writing and have no idea if this will work.

First, to find the service that does the stopping. Running `systemctl` shows a
suspiciously named service `plymouth-quit-wait.service` and `plymouth-quit.service`.
If you want to know where those service definitions are, you can actually just run
`systemctl status [TARGET SERVICE]` and replace the service name with the one you
want. Not only does it show the status (duh), but it does reveal the location of
the script.

For me they where located at:

- `/lib/systemd/system/plymouth-quit-wait.service`
- `/lib/systemd/system/plymouth-quit.service`

