mimosa-volo
===========

## Overview

This a mimosa module that will import GitHub dependencies using the Volo tool.  It also serves as an example for how to create Mimosa modules that enrich Mimosa with extra commands.

Valid with Mimosa version `0.7.2` and above.

For more information regarding Mimosa, see http://mimosa.io

## Usage

Install `mimosa-volo` using `mimosa mod:install mimosa-volo`.  Once it is installed, the `mimosa-volo` module adds an `import` command that exposes the module functionality.

## Functionality

The `import` command will use [Volo](https://github.com/volojs/volo)to import dependencies. Mimosa will first ask where to place the dependency, then it will use Volo to go fetch it from GitHub. Whenever possible, Volo tries to get AMD versions of files so they do not need to be wrapped. See the [Volo documentation](http://volojs.org/) for more details.

```
$ mimosa import jquery
```

The only Volo option exposed by Mimosa at this time is the ability to turn on and off whether to look for AMD or non-AMD libraries. AMD is the default. If you wish a non-AMD version of a library, provide a `--noamd` flag.

```
$ mimosa import backbone --noamd
```

If you are a big Volo fan, and would like to see more functionality exposed via this module, [just ask](https://github.com/dbashford/mimosa-volo/issues)!
