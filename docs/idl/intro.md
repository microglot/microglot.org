---
# © 2024 Microglot LLC
# SPDX-License-Identifier: CC-BY-SA-4.0
sidebar_position: 1
---

# Microglot IDL Intro

The Microglot IDL is an experimental system design language that has:

- Compatibility with proto2 and proto3 syntaxes for Protocol Buffers
- Compatibility with existing
  [protoc](https://github.com/protocolbuffers/protobuf) code generation plugins
- An optional, alternative syntax for Protocol Buffers messages, enums, and
  services
- Support for defining constant values
- Support for defining non-networked APIs

These features will be expanded to include better tools for designing and
specifying the _implementations_ of APIs and not just the APIs themselves. This
includes structured language for describing the behaviors and constraints of an
implementation, operational details such as SLOs, defining implementation
dependencies on other APIs or implementations, generating diagrams, and more.

The overall goal of the Microglot IDL is expand today's code generation tooling
into a more complete software design suite.

## Protocol Buffers Compatibility

If you have an existing project using Protocol Buffers then our compiler,
[mglotc](https://github.com/microglot/mglotc), should be able to replace protoc
in your build chain. We don't yet have a protoc compatible CLI to offer as a
drop-in replacement but see [Compiler Installation And Usage](compiler.md) for
examples of adapting protoc invocations to mglotc.

The majority of existing proto2 and proto3 syntax IDL files should work without
issues but there are a few features that we don't have yet or have only partial
support:

- No support for plugin defined options. Only the global protoc options are
  supported right now.
- No support for `import weak`.
- Limited support for reserved IDs and names. These are currently parsed by the
  compiler but not enforced. We plan to improve support for reservations over
  time.

## Native IDL Syntax

The native IDL syntax is still a work in progress. The features that overlap
with proto2 and proto3 may receive minor syntax changes but the basic feature
set is generally stabilized on what proto2/3 support. Any feature that is not
native to proto2 or proto3 may be more volatile.

Setting the `syntax` property of an IDL file to `mglot0` instead of `proto2` or
`proto3` engages an alternate syntax with an extended feature set compared to
Protocol Buffers. The native syntax can import `proto2` and `proto3` files, has
an equivalent base feature set to Protocol Buffers, and will be expanded over
time to incorporate new features and ideas.

### Built-In Types

The built-in scalar and virtual types mirror those from Protocol Buffers. Here
is a table showing the available scalar types, their equivalent in the proto2/3
syntaxes, range of values, and example literal syntax.

| Type | proto2/3 | Value Range | Example Literal |
|------|----------|-------|---------|
| Bool | bool | true/false | true, false |
| Text | string | \<=2^32 UTF-8 bytes | "example", "☃" |
| Data | bytes | \<=2^32 bytes | 0x"F0123456789ABCDEF", 0x"DEAD BEEF" |
| Int8 | int32 | -2^7 to (2^7)-1 | 1, -100 |
| Int16 | int32 | -2^15 to (2^15)-1 | 1, -100, 1000, -1_000 |
| Int32 | int32 | -2^31 to (2^31)-1 | 1, -100, 1000, -1_000 |
| Int64 | int64 | -2^63 to (2^63)-1 | 1, -100, 1000, -1_000 |
| UInt8 | uint32 | 0 to (2^8)-1 | 1, 100 |
| UInt16 | uint32 | 0 to (2^16)-1 | 1, 100, 1000, 1_000 |
| UInt32 | uint32 | 0 to (2^32)-1 | 1, 100, 1000, 1_000 |
| UInt64 | uint64 | 0 to (2^64)-1 | 1, 100, 1000, 1_000 |
| Float32 | float | 32bit IEEE 754 | 0.0, -1E6, 0x2.p10 |
| Float64 | double | 64bit IEEE 754 | 0.0, -1E6, 0x2.p10 |

In addition to the scalar types, the mglot0 syntax supports the following
virtual types:

| Type | proto2/3 | Constraints | Example Usage |
|------|----------|-------|-----------|
| List\<T> | repeated | Value type cannot be List or Map types | :List\<:Text> |
| Map\<K,V> | map | Keys cannot be Data or Floats, Values cannot be List or Map types | :Map\<:Text, :MyStruct> |
| Presence\<T> | optional | Limited to scalar types | :Presence\<:Bool> |

### Modules

By default, IDL files using the mglot syntax are considered independent
namespaces, equivalent to a package in proto2/3. There is no implicit sharing of
a namespace unless an explicit proto2/3 package name is added using annotations.
Namespace sharing is only currently supported for backwards compatible
translation of proto2/3 syntax to mglot.

### Structs

Structs are equivalent to proto2/3 messages:
```
struct Foo {
    Bar :UInt32 @1
    Baz :Presence<:Bool> @2
} @1
```

Each field must have a name and type definition. The `@` notation assigns an
integer value as the UID, or field number. If no UID is provided then one is
generated for the field. Similarly, structs may be assigned a custom UID or one
will be generated. Field UIDs must be unique within the struct and struct UIDs
must be unique across all user defined types. The range of field UID values is
currently limited to the range of field numbers allowed in proto2/3 for
compatibility reasons.

Struct definitions also support a `union` feature which is equivalent to the
proto2/3 `oneof` feature:
```
struct Foo {
    union {
        Bar :UInt32 @2
        Baz :List<:Bool> @3
    } @1
}
```

Unions may be named or unnamed. If no name is given then the name `Union` is
assumed. The union itself is a field-like concept and has its own UID that must
not conflict with other fields.

### Enums

Enums are equivalent to the same feature in proto2/3:
```
enum Foo {
    Bar @1
    Baz @2
}
```
All enums have an implicit zero value of `None` that is equivalent to:
```
enum Foo {
    None @0
    Bar @1
    Baz @2
}
```
You can rename the zero/undefined value by explicitly adding it:
```
enum Foo {
    Invalid @0
    Bar @1
    Baz @2
}
```

Unlike proto2/3, the enumerant names are encapsulated within the enum namespace
and do not need to be unique across all enum definitions in the module.

### APIs

APIs are equivalent to proto2/3 services:
```
api Foo {
    Bar(:BarInput) returns (:BarOutput)
    Baz(:BazInput) returns (:BazOutput)
}
```

The inputs and outputs of API methods are limited to struct types. Unlike
proto2/3, the mglot syntax does not support streaming API methods.

APIs offer an extension mechanism for sharing methods:
```
api HealthChecker {
    HealthCheck(:Empty) returns (:HealthStatus)
}
api Foo extends (:HealthChecker) {
    Bar(:BarInput) returns (:BarOutput)
    Baz(:BazInput) returns (:BazOutput)
}
```
In the above example, the `Foo` API is considered to contain three methods:
`Bar`, `Baz`, and `HealthCheck`. APIs may extend multiple other APIs and if an
API included in the `extends` list has its own extensions then they are included
as well. Cycles are not allowed. All defined and extended method names must be
unique across the entire set.

### Constants

Constant values may be defined for any scalar type except `Data`:
```
const Foo :Text = "a constant value"
const Bar :UInt16 = 111
const Baz :Float32 = 1.2
const Yes :Bool = true
```

### SDKs

SDKs are a mirror of the API syntax intended for designing in-process code
bindings that are not hosted over a network. These are for building common,
cross-language SDKs or standard libraries.

```
sdk Foo {
    Bar() nothrows
    Baz(v :Int32) returns (:List<:Foo>)
}
```

SDK methods have more flexibility than API definitions because they are not
bound by the same statelessness requirement of APIs. Methods return nothing by
default unless a `returns` clause is added. Methods may optionally add a
`nothrows` clause to indicate that the method cannot fail. Method inputs are
always named and typed, similar to most programming language method signatures.
Finally, SDK methods can accept and return stateful objects such as APIs and
SDKs.
