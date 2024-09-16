---
# © 2024 Microglot LLC
# SPDX-License-Identifier: CC-BY-SA-4.0
sidebar_position: 2
---

# Compiler Installation And Usage

## Installation

Find your system architecture in the
[latest release](https://github.com/microglot/mglotc/releases), download
and expand the archive, and copy the `mglotc` binary to a directory on your
path.

## Usage

The compiler usage looks like:
```sh
mglotc --root DIR_CONTAINING_IDL -pbplugin PROTOC_PLUGIN IDL_FILE1 IDL_FILE2
```

### Content Roots

The `--root` flag may be used multiple times and each entry, in the order given,
represents a root directory used to search for imported IDL files. This flag is
equivalent to the `-I` flag in protoc.

To illustrate, let's work with the following directory structure:
```
- /
    - project1/
        - proto/
            - foo.proto
    - /project2
        - idl/
            - bar.mglot
    - baz.mglot
```

In this setup the `/project1/proto` directory contains IDL using either the
proto2 or proto3 syntax and the `/project2/idl` directory contains IDL using
the mglot syntax. The top level `baz.mglot` is an IDL file that imports
both `foo.proto` and `bar.mglot`.

Just like imports handled by protoc, all import statements are interpreted as
being relative to some root directory on the file system. For example, an import
path of either `project1/proto/foo.proto` in proto2/3 or
`/project2/idl/bar.mglot` in mglot are searched for by looking for those paths
within one of the defined roots. The compiler `--root` flag establishes an
ordered set of roots to search. Using the above directory structure we could
run the compiler with `mglotc --root . baz.mglot` and the import paths would
resolve because both resolve when evaluated from the project root containing the
`baz.mglot` file. For convenience, the `--root .` flag is set by default unless
other, explicit roots are defined.

### Plugins

Most protoc plugins should be compatible with the mglotc. The CLI syntax is
slightly different: `mglotc --pbplugin protoc-gen-go:arg1=v1,arg2=v2`. The
`--pbplugin` flag is used for identifying protoc plugins. The minimum value to
give with `--pbplugin` is the name of the plugin binary. This is slightly
different to protoc because protoc assumes the prefix `protoc-gen-` for plugins
and mglotc does not. If the protoc plugin accepts additional arguments then they
can be placed after a colon (`:`) and in exactly the same format as with protoc.
The arguments are passed through to the plugin unmodified.

The compiler is designed to handle multi-package inputs but some of the older
protoc plugins fail if given IDL content from multiple packages. The
`--per-package-mode` flag may be added to the compiler flags in order to force
batching of IDL content by package and calling protoc plugins once for each
package.

The compiler currently has only one native plugin called `mglotc-gen-go` and it
is currently embedded in the compiler itself. It is activated with `--plugin
mglotc-gen-go` and can be used in conjunction with protoc plugins. This plugin
generates constants, SDKs, and optionally APIs. The plugin supports the
following arguments:

- `paths=source_relative`
    - Identical to the protoc argument.
- `module=github.com/myproject/foo`
    - Defines the Go package path of the output directory and sets the `paths`
      parameter to `imports`.
- `apis=true`
    - Toggles rendering APIs.

The embedded Go plugin is not yet stable and provided only for experimentation
right now.
