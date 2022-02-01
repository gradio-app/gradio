
# Table of Contents

1.  [NAME](#orge2e86e0)
2.  [SYNOPSIS](#org204fb4c)
        1.  [running:](#orgb50b6e4)
        2.  [produces:](#orgf51f8f5)
        3.  [running:](#org8f49204)
        4.  [produces:](#org3b1d910)
        5.  [running:](#org24a1193)
        6.  [produces:](#org12e29d4)
3.  [INSTALLATION](#orgc33d993)
    1.  [Stand-alone version](#org837b3bd)
    2.  [NPM version](#orga066938)
4.  [USAGE](#org55285ce)
    1.  [LOADING](#org9df0af8)
    2.  [CONFIGURING](#org5b0ccb9)
        1.  [options](#org4ec5cb9)
        2.  [arguments](#org73cc3f3)
        3.  [help text generator](#org69f67a1)
5.  [AUTHOR / CHANGELOG / LICENSE](#org702885b)

Find the full documentation, source code, and examples online at <https://khtdr.com/opts>.

Or download this README as a man-page.

    curl -o opts.3 https://raw.githubusercontent.com/khtdr/opts/master/man.3
    man ./opts.3


<a id="orge2e86e0"></a>

# NAME

opts.js - a command line parser for options and arguments


<a id="org204fb4c"></a>

# SYNOPSIS

The following example uses a custom **version** function, and opts in to the automatic help text. No pun intended.

    var opts = require('opts');
    
    var options = [
      { short       : 'v'
      , long        : 'version'
      , description : 'Show version and exit'
      , callback    : function () { console.log('v1.0'); process.exit(1); }
      }
    ];
    
    opts.parse(options, true);
    console.log('Example 1');
    process.exit(0);

See <https://raw.githubusercontent.com/khtdr/opts/master/examples/example1.js>


<a id="orgb50b6e4"></a>

### running:

    $ node ./example1


<a id="orgf51f8f5"></a>

### produces:

    Example 1


<a id="org8f49204"></a>

### running:

    $ node ./example1 --help


<a id="org3b1d910"></a>

### produces:

    Usage: node ./example1 [options]
    Show this help message
       --help
    Show version and exit
       -v, --version


<a id="org24a1193"></a>

### running:

    node ./example1 -v


<a id="org12e29d4"></a>

### produces:

    v1.0


<a id="orgc33d993"></a>

# INSTALLATION

You do not need to use NPM or any package manager. It is written in plain-old Javascript and can be downloaded and included in your Node.js project, as-is. All of the examples use this approach.
.RE
See <https://github.com/khtdr/opts/tree/master/examples>


<a id="org837b3bd"></a>

## Stand-alone version

    cd /path/to/your/project
    curl -o opts.js https://raw.githubusercontent.com/khtdr/opts/master/src/opts.js


<a id="orga066938"></a>

## NPM version

    npm install opts


<a id="org55285ce"></a>

# USAGE


<a id="org9df0af8"></a>

## LOADING

With classic syntax:

    var opts = require('opts');
    opts.parse(options, arguments, help);

With modern syntax:

    import * as opts from 'opts';
    opts.parse(options, arguments, help);

If you installed `opts` with NPM, the typescript definitions should automatically be available in your editor. Otherwise you can download the .d.ts file manually.
.RE
See <https://raw.githubusercontent.com/khtdr/opts/master/src/opts.d.ts>


<a id="org5b0ccb9"></a>

## CONFIGURING

`opts.parse(options, arguments, help)`

Options are flag-arguments. Arguments are everything else. Consider the following hypothetical command for starting a server that listens on <http://0.0.0.0:4000>

    node ./my-app start --host 0.0.0.0 -p 4000

In this example, the options are `--host 0.0.0.0` and `-p 4000`. The argument is `start`. The arguments can be after, before, or among the options.


<a id="org4ec5cb9"></a>

### options

`options` is an array of option objects. Each option in the array can have the following fields. None are required, but you should at least provide a short or long name.

    let options = [
      { short       : 'l',
        long        : 'list',
        description : 'Show a list',
        value       : false, // default false
        required    : true, // default false
        callback    : function (value) { ... },
      }, // ... followed by more options
    ];


<a id="org73cc3f3"></a>

### arguments

`arguments` require less configuration. This is an optional argument to `opts.parse`:

    let arguments =
      { name     : 'script',
        required : true, // not required by default
        callback : function (value) { ... },
      };


<a id="org69f67a1"></a>

### help text generator

Finally, you can add an automatically generated help message by passing
a last parameter of `true`. This is also an optional argument to `opts.parse`.

    opts.parse(options, true);
    // or if you want more control, you can do:
    /*
      options.push({
        long        : 'help',
        description : 'Show this help message',
        callback    : require('opts').help,
      }
      opts.parse(options);
    */


<a id="org702885b"></a>

# AUTHOR / CHANGELOG / LICENSE

Email: ohkay@khtdr.com

Relatively unchanged since 2010.
.RE
See <https://github.com/khtdr/opts/blob/master/CHANGES.org>

BSD 2-Clause License
.RE
See <https://github.com/khtdr/opts/blob/master/LICENSE.txt>

