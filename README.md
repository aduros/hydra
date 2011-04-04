Hydra
=====

Hydra is a Javascript game engine for mobile browsers.

Documentation is sorely lacking, but I've dogfooded it with a few games:

* [Block Dream](http://aduros.emufarmers.com/html5/blockdream) ([source](http://github.com/aduros/hydra/tree/master/projects/tetris/))
* [Fruit Link](http://aduros.emufarmers.com/html5/fruitlink) ([source](http://github.com/aduros/hydra/tree/master/projects/jam/))
* [Snow Bound](http://aduros.emufarmers.com/html5/snowbound) ([source](http://github.com/aduros/hydra/tree/master/projects/ski/))
* [Blast Effect](http://aduros.emufarmers.com/html5/blasteffect) ([source](http://github.com/aduros/hydra/tree/master/projects/chain/), WebKit only for now)

Design
------

Hydra aims to be fast:

* Animations are implemented as CSS transitions, which can be hardware accelerated.
* All game updates are performed on a single setInterval callback.
* Games are compiled with Google's Closure Compiler in "advanced" mode, allowing aggressive inlining and dead-code elimination.

Hydra also aims to be functional:

* Animations can programmatically be started, paused, and sequenced together.
* Games are composed from scenes, entities (which live in scenes) and tasks (which act upon entities).
* Has the usual collection of utility functions and classes, supplemented by the massive Closure Library.
* Needless abstractions are avoided, you should still know how to work with the DOM and skin your game with CSS.

Platforms
---------

Hydra currently has three heads:

* iOS 3+ (iPhone, iPod touch, iPad)
* Android 2.1+
* Desktop browsers: Chrome, Safari, Firefox, Opera

Targets under development:

* Opera Mobile 10
* Desktop browsers: Internet Explorer 9
