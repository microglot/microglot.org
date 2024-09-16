---
# © 2023 Microglot LLC
# SPDX-License-Identifier: CC-BY-SA-4.0
sidebar_position: 3
---

# Microglot IDL Specification

This specification details the syntax, grammar, type system, and compiler
constraints for the microglot IDL. The microglot language is proto2 and proto3
compatible in addition to supporting a new syntax called mglot.

## Meta Syntax

The microglot compiler supports multiple syntaxes. To support switching
between parser modes, every supported language syntax has a consistent
form for identifying the syntax of a document. The first non-comment,
non-empty line of a file must be a syntax specification in the form:

```microglot
syntax = "<SYNTAX>"
```

The supported syntax values are `proto2`, `proto3`, and `mglot0`.

All language syntaxes are UTF-8 encoded text. All syntaxes support an
optional UTF-8 BOM as the first character sequence.

Comments are written in the form `//` and `/* */` for line and block
comments respectively. Both comment forms may be used anywhere in a file
though each language syntax defines special rules for how some comments
are interpreted as documentation.

## Protocol Buffers 2 And 3

When the syntax is specified as `proto2` or `proto3` then the file must contain
valid Protocol Buffers version 2 or 3 content, respectively. Microglot compiler
implementations should follow the language specification and compiler behavior
guide from [protobuf.com](https://protobuf.com/docs/language-spec). This is the
most comprehensive guide for creating a new compiler that is compatible with
`protoc`, the canonical protobuf compiler.

## Microglot 0

The mglot0 syntax is an independent IDL that can import and leverage Protocol
Buffers defined types. The syntax is largely inspired by [Cap'n
Proto](https://capnproto.org) which is a different IDL created by one of the
Protocol Buffers authors.

The mglot0 syntax is experimental.

### Syntax And Grammar

This section contains the lexical and grammar rules that represent valid IDL
content. The focus of this section is on language structure. Interpretation of
language elements and other types of compiler constraints are detailed in a
later section.

#### Notation

Language syntax is specified using Extended Backus-Naur Form (EBNF). This
document uses the following EBNF syntax:
```ebnf
Production  = production_name "=" [ Expression ] "." .
Expression  = Alternative { "|" Alternative } .
Alternative = Term { Term } .
Term        = production_name | token [ "…" token ] | Group | Option | Repetition .
Group       = "(" Expression ")" .
Option      = "[" Expression "]" .
Repetition  = "{" Expression "}" .
```
Productions are expressions constructed from terms and the following operators,
in increasing precedence:

- | alternation
- () grouping
- [] option (0 or 1 times)
- {} repetition (0 to n times)

Lower-case production names are used to identify lexical tokens. Non-terminals
are in PascalCase. Literal tokens are enclosed in double quotes "" or back
quotes \`\`.

The form `a … b` represents the set of characters from a through b as
alternatives. The horizontal ellipsis … is also used elsewhere in the spec to
informally denote various enumerations or code snippets that are not further
specified. The character … (as opposed to the three characters ...) is not a
token of the Microglot IDL.

#### Source Code Representation

Source code is Unicode text encoded in UTF-8. The text is not canonicalized, so
a single accented code point is distinct from the same character constructed
from combining an accent and a letter; those are treated as two code points. For
simplicity, this document will use the unqualified term character to refer to a
Unicode code point in the source text. Each code point is distinct; for
instance, upper and lower case letters are different characters.

The `NUL` character (U+0000) is not allowed in source text.

A UTF-8 byte order mark (U+FEFF) is only allowed as the first unicode code point
in the source text but will be ignored. This is intended to provide
compatibility with tools that require the BOM to recognized UTF-8 text. The BOM
may not appear anywhere else in the source code.

#### Lexical Elements

##### Characters

The following terms are used to denote specific Unicode character classes:
```ebnf
newline             = /* the Unicode code point U+000A */ .
unicode_char        = /* an arbitrary Unicode code point except newline */ .
unicode_prose_char  = /* an arbitrary Unicode code point except tick (`) */ .
unicode_letter      = /* a Unicode code point classified as "Letter" */ .
unicode_digit       = /* a Unicode code point classified as "Number, decimal digit" */ .
```

In The [Unicode Standard 8.0](https://www.unicode.org/versions/Unicode8.0.0/),
Section 4.5 "General Category" defines a set of character categories. Microglot
treats all characters in any of the Letter categories `Lu`, `Ll`, `Lt`, `Lm`, or
`Lo` as Unicode letters, and those in the Number category `Nd` as Unicode
digits.

##### Letters and digits

The underscore character `_` (U+005F) is considered a letter.

```ebnf
letter        = unicode_letter | "_" .
decimal_digit = "0" … "9" .
binary_digit  = "0" | "1" .
octal_digit   = "0" … "7" .
hex_digit     = "0" … "9" | "A" … "F" | "a" … "f" .
```
##### White Space

White space characters are generally ignored except when they separate tokens
that would otherwise combine into a single token. White space consists of the
space (U+0020), horizontal tab (U+0009), carriage return (U+000D), and newline
(U+000A).

#### Tokens

Tokens form the vocabulary of the Microglot IDL. There are four classes:
identifiers, keywords, operators, and literals.

##### Identifiers

Identifiers name program entities such as constants and types. An identifier is
a sequence of one or more letters and digits. The first character of an
identifier must be a letter.

```ebnf
identifier = letter { letter | unicode_digit } .
```

Examples:
```
a
_x9
ThisIsAnIdentifier
αβ
```

##### Keywords

The following keywords are reserved and may not be used as identifiers.

```ebnf
import = "import".
as = "as" .
const = "const" .
annotation = "annotation" .
struct = "struct" .
field = "field".
union = "union" .
enum = "enum" .
enumerant = "enumerant" .
api = "api" .
apimethod = "apimethod" .
sdk = "sdk" .
sdkmethod = "sdkmethod" .
module = "module" .
syntax = "syntax" .
extends = "extends" .
nothrows = "nothrows" .
returns = "returns" .
impl = "impl" .
throw = "throw" .
catch = "catch" .
return = "return" .
switch = "switch".
var = "var" .
for = "for" .
in = "in" .
while = "while" .
set = "set".
requires = "requires" .
case = "case" .
if = "if" .
else = "else".
async = "async"
await = "await"
```

##### Punctuation

The following tokens represent punctuation, or operators, that are used to
either define contextual boundaries in the code or to combine operands:

```ebnf
equal_compare = "==" .
equal_not = "!=" .
equal_lesser = "<=" .
equal_greater = ">=" .
bool_and = "&&" .
bool_or = "||" .
bin_and = "&" .
bin_or = "|" .
bin_xor = "^" .
shift_left = "<<" .
shift_right = ">>" .
equal = "=" .
plus = "+" .
minus = "-" .
bang = "!" .
comment_start_line = "//" .
comment_start_block = "/*" .
comment_end_block = "*/" .
slash = "/" .
star = "*" .
mod = "%" .
comma = "," .
colon = ":" .
dot = "." .
at = "@" .
dollar = "$" .
tick = "`" .
curly_open = "{" .
curl_close = "}" .
square_open = "[" .
square_close = "]" .
paren_open = "(" .
paren_close = ")" .
angle_open = "<" .
angle_close = ">" .
```

##### Literals

Literals represent non-identifier sequences of characters that have a special
interpretation in compilers. Literal values generally represent user-defined
values of a specific data type. For example, literals include text, integers,
and floats, etc.

###### Integer Literals

An integer literal is a sequence of digits representing an integer constant. An
optional prefix sets a non-decimal base: `0b` or `0B` for binary, `0`, `0o`, or
`0O` for octal, and `0x` or `0X` for hexadecimal. A single `0` is considered a
decimal zero. In hexadecimal literals, letters `a` through `f` and `A` through
`F` represent values `10` through `15`.

For readability, an underscore character (`_`) may appear after a base prefix or
between successive digits; such underscores do not change the literal's value.

```ebnf
int_lit        = decimal_lit | binary_lit | octal_lit | hex_lit .
decimal_lit    = "0" | ( "1" … "9" ) [ [ "_" ] decimal_digits ] .
binary_lit     = "0" ( "b" | "B" ) [ "_" ] binary_digits .
octal_lit      = "0" [ "o" | "O" ] [ "_" ] octal_digits .
hex_lit        = "0" ( "x" | "X" ) [ "_" ] hex_digits .

decimal_digits = decimal_digit { [ "_" ] decimal_digit } .
binary_digits  = binary_digit { [ "_" ] binary_digit } .
octal_digits   = octal_digit { [ "_" ] octal_digit } .
hex_digits     = hex_digit { [ "_" ] hex_digit } .
```

Examples:
```
42
4_2
0600
0_600
0o600
0O600       # second character is capital letter 'O'
0xBadFace
0xBad_Face
0x_67_7a_2f_cc_40_c6
170141183460469231731687303715884105727
170_141183_460469_231731_687303_715884_105727

_42         # an identifier, not an integer literal
42_         # invalid: _ must separate successive digits
4__2        # invalid: only one _ at a time
0_xBadFace  # invalid: _ must only come after base prefix
```

###### Floating-Point Literals

A floating-point literal is a decimal or hexadecimal representation of a
floating-point constant.

A decimal floating-point literal consists of an integer part (decimal digits), a
decimal point, a fractional part (decimal digits), and an exponent part (e or E
followed by an optional sign and decimal digits). One of the integer part or the
fractional part may be elided; one of the decimal point or the exponent part may
be elided. An exponent value `exp` scales the mantissa (integer and fractional
part) by `10^exp`.

A hexadecimal floating-point literal consists of a `0x` or `0X` prefix, an
integer part (hexadecimal digits), a radix point, a fractional part (hexadecimal
digits), and an exponent part (`p` or `P` followed by an optional sign and
decimal digits). One of the integer part or the fractional part may be elided;
the radix point may be elided as well, but the exponent part is required. (This
syntax matches the one given in IEEE 754-2008 §5.12.3.) An exponent value `exp`
scales the mantissa (integer and fractional part) by `2^exp`.

For readability, an underscore character (`_`) may appear after a base prefix or
between successive digits; such underscores do not change the literal value.

```ebnf
float_lit         = decimal_float_lit | hex_float_lit .

decimal_float_lit = decimal_digits "." [ decimal_digits ] [ decimal_exponent ] |
                    decimal_digits decimal_exponent |
                    "." decimal_digits [ decimal_exponent ] .
decimal_exponent  = ( "e" | "E" ) [ "+" | "-" ] decimal_digits .

hex_float_lit     = "0" ( "x" | "X" ) hex_mantissa hex_exponent .
hex_mantissa      = [ "_" ] hex_digits "." [ hex_digits ] |
                    [ "_" ] hex_digits |
                    "." hex_digits .
hex_exponent      = ( "p" | "P" ) [ "+" | "-" ] decimal_digits .
```

Examples:
```
0.
72.40
2.71828
1.e+0
6.67428e-11
1E6
.25
.12345E+5
1_5.         # == 15.0
0.15e+0_2    # == 15.0

0x1p-2       # == 0.25
0x2.p10      # == 2048.0
0x1.Fp+0     # == 1.9375
0X.8p-0      # == 0.5
0X_1FFFP-16  # == 0.1249847412109375

0x15e-2      # invalid: missing p exponent, 0x15e - 2 is integer subtraction which is not supported
0x.p1        # invalid: mantissa has no digits
1p-2         # invalid: p exponent requires hexadecimal mantissa
0x1.5e-2     # invalid: hexadecimal mantissa requires p exponent
1_.5         # invalid: _ must separate successive digits
1._5         # invalid: _ must separate successive digits
1.5_e1       # invalid: _ must separate successive digits
1.5e_1       # invalid: _ must separate successive digits
1.5e1_       # invalid: _ must separate successive digits
```

###### Text Literals

A text literal represents a string constant obtained from concatenating a
sequence of characters.

Text literals are character sequences between double quotes, as in `"bar"`.
Within the quotes, any character may appear except an unescaped double quote.
The text between the quotes forms the value of the literal. All text is
interpreted as UTF-8.

```ebnf
escaped_char            = `\` ( "a" | "b" | "f" | "n" | "r" | "t" | "v" | `\` | `"` ) .
unicode_value           = unicode_char | escaped_char .
text_value              = unicode_value | newline
text_lit                = `"` { text_value } `"` .
```

Examples:
```
"abc"
"\n"
"\""
"Hello, world!\n"
"汉语"
```

###### Data Literals

A data literal represents a byte sequence obtained from concatenating a sequence
of hex digits.

Data literals are character sequences beginning with a hex integer base prefix
(`0x` or `0X`) followed by a quote enclosed value. The enclosed value is a
series of hex digits where each two successive digits constitute a byte.
Successive bytes may be adjacent, separated by spaces, or separated by
underscores. Any separating characters are ignored and do not change the value
of the literal.

```ebnf
data_lit        = "0" ( "x" | "X" ) `"` hex_digits `"` .
data_bytes      = data_byte { { "_" | " " } data_byte } .
data_byte       = hex_digit hex_digit .
```

Examples:
```
0X"Bad_Face0"
0X"Ba dF ac e0"
```

##### Bool Literals

A bool literal represents a boolean, or true/false, value.

Bool literals are expressed only using the keywords `true` and `false`.

```ebnf
bool_lit    = true | false  .
```

##### Comments

Comments are used to capture documentation and should not be ignored. Comments
have two forms: line and block. Line comments begin with `//` and end at the end
of the line. Block comments begin with `/*` and end with `*/`.

```ebnf
comment_line = comment_start_line {unicode_value} newline .
comment_block = comment_start_block {unicode_value | newline} comment_end_block .
comment = comment_line | comment_block
```

Examples:
```
// This is a comment line.
/* This is
    a comment
block */
```

A comment cannot start inside a text literal, data literal, or another comment.

##### Prose

Prose represent free-form, natural language descriptions of impl method bodies.
Each prose begins and ends with a tick (`\``).

```ebnf
prose = tick {unicode_prose_char} tick
```

#### Production Rules

This section covers the rules governing parsing of IDL. Each section is
specialized to a specific construct.

Note that this section only describes the structure and order of the IDL. It
does not include much, if any, rationale into the choices and does not expand on
non-grammar rules such as those related to type checking or other forms of
validation of the content.

##### Common Elements

Some syntax elements are pervasive throughout the language and used in multiple
other elements. These include UIDs, annotation applications, and comment blocks.

###### UID Assignments

Most elements in the language support providing an optional UID for the purposes
of either optimizing the value or resolving conflicts from the automatic UID
generation. Generally, any element that may be referenced outside a given module
must support a UID value.

```ebnf
UID = at int_lit .
```

Examples:
```
@0x12
@100
@0o777
```

###### Comment Line Blocks

In addition to the comment block syntax, a series of individual line comments
may be used to form a block:

```ebnf
CommentBlock = comment {comment}
```

Example:

```
// This is part of a block
// This is part of the same block

// This is also part of the above block
/*
    This is also part of the above comment block
*/
```

Empty lines between comments are ignored and blocks are associated with specific
elements. All comment blocks must appear within or *after* the documented
element as defined by the element's grammar rules.

###### Annotation Applications

Annotations are applied to specific language elements using a common syntax.

```ebnf
AnnotationInstance      = [identifier dot] identifier paren_open Value paren_close .
AnnotationApplication   = dollar paren_open [AnnotationInstance] { comma AnnotationInstance } [comma] paren_close .
```

Examples:
```
$(B(true))
$(M(1234), Mod("text value"))
```

Annotations applications have no immediate effect on the compiler and do not
change the grammar of any given element. These values exist to be used by
compiler implementations or plugins to modify other behaviors.

###### Qualified Identifier

A qualified identifier is used for scoped access. In the simplest form, a
qualified identifier is only a single identifier that references a value in the
immediate scope. Qualified identifiers may have any number of scope specifiers.

```ebnf
QualifiedIdentifier = identifier { dot identifier } .
```

Examples:
```
a
a.b
a.b.c.d.e.f
```

###### Type Names

User defined types are all named with a valid identifier.

```ebnf
TypeParameters = angle_open TypeSpecifier {comma TypeSpecifier} [comma] angle_close
TypeName = identifer [TypeParameters] .
```

Examples:
```
MyTypeName
AnotherTypeName<:Text>
```

###### Type Specifiers

Type specifiers are a dedicated syntax for referencing types rather than values.

```ebnf
QualifiedTypeName = [identifier dot] TypeName .
TypeSpecifier = colon QualifiedTypeName .
```

Examples:
```
:Text
:Bool
:MyType
:SomeModule.SomeType
:List<:Int64>
:Map<:Text, :Int64>
```

##### Modules

Each source file represents a "Module". A module is an independent namespace in
which users may define types or constants.

```ebnf
Module = [ModuleHeader] StatementSyntax StatementModuleMeta {ModuleElement} .

ModuleElement = StatementImport |
                StatementAnnotation |
                StatementConst |
                StatementEnum |
                StatementStruct |
                StatementAPI |
                StatementSDK .
```

###### Module Headers

A module header is a comment block that appears as the first element of a
module. This header is not considered module level documentation as that use
case is covered by the module meta element. Instead, a module header exists to
support common licensing requirements such as annotating the top of every file
with some specific licensing statement. The header may be used for any purpose
but licensing is the primary intention.

```ebnf
ModuleHeader = CommentBlock .
```

Example:
```
// This work is licensed under a Creative Commons Attribution 3.0 Unported License.
// View the license at http://creativecommons.org/licenses/by/3.0/.

syntax = "1.0.0"
```

###### Module Syntax Statement

The syntax statement identifies which version of the grammar is used within the
module. The version value is a text literal. The module syntax statement must be
the first non-empty, non-comment line in the file.

```ebnf
StatementSyntax = syntax equal text_lit .
```

Example:
```
syntax = "mglot0"
```

If a syntax statement is not given then the assumed value is the most recent
version supported by the compiler. This value appears first or immediately after
a module header so that compilers may read it and optionally switch which
grammar is applied to remaining source code.

###### Module Meta Statement

The module meta statement identifies the UID of the module and provides a place
for both documenting and annotating the module.

```ebnf
StatementModuleMeta = module equal UID [AnnotationApplication] [CommentBlock] .
```

Example:
```
module = @1234 $(
    AnnotateModule(true),
)
// This is documentation that applies to the module scope.
```

This statement is required for all modules.

##### Import Statements

Modules may reference other modules on which they depend by using import
statements. Imported modules are referenced by some environmentally specific
identifier since modules do not have names and the UID of a module is contained
within the file contents.

```ebnf
ModuleName      = ( identifier | dot ) .
ImportURI       = text_lit .
StatementImport = import ImportURI as ModuleName [CommentBlock] .
```

Examples:
```
import "/path/to/file" as SomeModuleName
import "file:///path/to/file" as another_module_name
import "/path/to/file" as .
```

##### Annotation Statements

Annotations are arbitrary, user defined identifiers that can be associated with
arbitrary types. Annotations have no direct impact on the IDL and are intended
as an extension mechanism for downstream effects. For example, IDL users can
define and use annotations in order to enable or disable features in code
generation plugins.

```ebnf
AnnotationScope     = module | union | struct | field | enumerant | enum | api | apimethod | sdk | sdkmethod | const | star .
StatementAnnotation = annotation identifier paren_open AnnotationScope {comma AnnotationScope} [comma] paren_close TypeSpecifier [UID] [CommentBlock] .
```

Examples:
```
annotation B(*) :Bool // Annotates any element with a boolean.
annotation M(method) :UInt64 // Annotates any API, impl, or SDK method.
annotation Mod(module) :Text @55 // Annotates an entire module at the file level.
```

Each annotation has a name, one or more scopes, and an associated type. The
scopes specify which elements of the language can receive the annotation. The
`*` value indicates that all language elements may be annotated.

Note that annotations cannot be the target of annotations.

##### Const Statements

Constants represent a specific and unchanging value.

```ebnf
StatementConst = const identifier TypeSpecifier equal Value [UID] [AnnotationApplication] [CommentBlock] .
```

Examples:
```
const Foo :Text = "foo"
const Bar :Text = Foo @13
```

##### Enum Statements

Enums are containers of symbolic names that have no specified type.

```ebnf
Enumerant       = identifier [UID] [AnnotationApplication] [CommentBlock] .
StatementEnum = enum identifier brace_open [CommentBlock] { Enumerant } brace_close [UID] [AnnotationApplication] [CommentBlock] .
```

Examples:
```
enum Empty {}
enum E {
    A @0
    B
    C
}
```

##### Struct Statements

Structs are container types that have no associated behavior. A struct is always
named and contains zero or more fields. Each field must have a defined type.

```ebnf
Field           = identifier TypeSpecifier [equal Value] [UID] [AnnotationApplication] [CommentBlock]  .
UnionField      = identifier TypeSpecifier [UID] [AnnotationApplication] [CommentBlock]  .
Union           = union [identifier] brace_open [CommentBlock] { UnionField } brace_close [UID] [AnnotationApplication] [CommentBlock] .
StructElement   = Field | Union .
StatementStruct = struct TypeName brace_open [CommentBlock] { StructElement } brace_close [UID] [AnnotationApplication] [CommentBlock] .
```

Examples:
```
struct Empty {} @9
struct HasFields {
    FieldOne :Text
    FieldTwo :Bool = true @23
}
struct HasFieldsUnion {
    FieldOne :HasFields @1
    union A {
        FieldTwo :Bool @2
        FieldThree :Text @3
    } @4
}
```

Fields within a union may not have an assigned value. Otherwise, fields within
and outside a union clause are identical. Unions may be named or unnamed.

##### API Statements

APIs are collections of behaviors with no associated data. An API is always
named and contains zero or more methods.

```ebnf
StatementAPI = api TypeName [Extension] brace_open [CommentBlock] { APIMethod } brace_close [UID] [AnnotationApplication] [CommentBlock] .
```

Examples:
```
api Empty {}

api I {
    Method(:Empty) returns (:Empty) @2
}

api I2 extends (:I, :Empty) {}
```

###### API Method Signatures

API methods are typed input/output contracts:

```ebnf
APIMethodInput    = paren_open TypeSpecifier paren_close .
APIMethodReturns  = returns paren_open TypeSpecifier paren_close .
APIMethod         = identifier APIMethodInput APIMethodReturns [UID] [AnnotationApplication] [CommentBlock] .
```

Examples:
```
api I {
    Method(:Empty) returns (:Empty) @2
}
```

###### API Extensions

APIs support a form of composition using the `extends` clause of the api syntax.

```ebnf
Extension = extends paren_open TypeSpecifier { comma TypeSpecifier } [comma] paren_close .
```

Examples:
```
api I extends (:Another, :AnotherTwo) {}
```

##### SDK Statements

The SDK is a variant of the API with a different method signature syntax and
intended for a specialized purpose that is documented in later sections.

```ebnf
StatementSDK        = sdk TypeName [Extension] brace_open [CommentBlock] { SDKMethod } brace_close [UID] [AnnotationApplication] [CommentBlock] .
```

Examples:
```
sdk Empty {}

sdk S {
    Close() nothrows
    GetValueByName(name :Text) returns (:Value)
}
```

###### SDK Method Signatures

The method signature requires, at minimum, a method name, an open parenthesis,
and a close parenthesis. Methods may have zero or more named parameters, a
return type, and an exception handling mode.

```ebnf
SDKMethodParameter  = identifier TypeSpecifier .
SDKMethodInput      = paren_open [SDKMethodParameter {comma SDKMethodParameter} [comma]] paren_close .
SDKMethodReturns    = returns paren_open TypeSpecifier paren_close .
SDKMethod           = identifier SDKMethodInput [SDKMethodReturns] [nothrows] [UID] [AnnotationApplication] [CommentBlock] .
```

Examples
```
sdk S {
    HasParams(one :Text, two :Bool, three :S) nothrows
    HasReturn() returns (:Text) nothrows
    HasException()
}
```

If a `returns` clause is provided then it must identify a single type. The
output parameter may not have a name.

```
sdk S {
    HasReturn() returns (:Text) nothrows
    ThisToo() returns (:S) nothrows
}
```

SDK methods may optionally indicate that they cannot throw an exception
by using the `nothrows` keyword.

```
sdk S {
    HasException()
    NotMe() nothrows
}
```

###### SDK Extensions

SDK extensions are structurally identical to API extensions.

##### Impl Statements

The structure of impl is a hybrid between API and SDK.

```ebnf
ImplAs          = as paren_open TypeSpecifier { comma TypeSpecifier } [comma] paren_close .
StatementImpl   = impl TypeName ImplAs brace_open [CommentBlock] [ImplRequires] { ImplMethod } brace_close [UID] [AnnotationApplication] [CommentBlock] .
```

Examples:
```
impl X as (:Y) {
    requires {
        Z :SomeAPI
        A :SomeSDK
    }
    MethodFromY(:Input) returns (:Output) {

    }
}
```

###### Impl Requires

The `requires` element of the impl is similar to that of a lightweight struct.

```ebnf
ImplRequirement = identifier TypeSpecifier [CommentBlock] .
ImplRequires    = requires curly_open { ImplRequirement } curl_close .
```

Examples:
```
impl X as (:Y) {
    requires {
        Z :SomeAPI
        A :SomeSDK
    }
}
```

Note that requirements support neither user defined UIDs nor annotation
applications.

###### Impl Method Signatures

The syntax of impl methods allows for both API and SDK styles. In addition to a
method signature, impl methods also require a method body.

```ebnf
ImplAPIMethod = identifier APIMethodInput APIMethodReturns ImplBlock [UID] [AnnotationApplication] [CommentBlock] .
ImplSDKMethod = identifier SDKMethodInput [SDKMethodReturns] [nothrows] ImplBlock [UID] [AnnotationApplication] [CommentBlock] .
ImplMethod      = ( ImplAPIMethod | ImplSDKMethod ) .
```

Examples:
```
impl X as (:Y, :Z) {
    LikeAPI(:Empty) returns (:Empty) {}
    LikeSDK(a :Int8, b :Text) nothrows {}
}
```

###### Impl Method Bodies

The bodies of impl methods contain zero or more logical steps.

```ebnf
ImplBlockStep = StepProse |
                StepVar |
                StepSet |
                StepIf |
                StepSwitch |
                StepWhile |
                StepFor |
                StepReturn |
                StepThrow |
                StepExec .

ImplBlock  = curly_open { ImplBlockStep } curl_close .
```

###### Impl Identifiers

There is a special identifier form available within the context of an impl
method body that allows the impl to reference itself as part of a fully
qualified identifier.

```
ImplIdentifier = [dollar dot] QualifiedIdentifier
```

Examples:
```
$.NameOfRequirement.MethodName
$.OtherMethodOfImpl
```

###### Var Statements

A var statement declares a variable and optionally assigns an initial value.

```ebnf
ValueOrInvocation = Invocation | Value .
StepVar = var identifier TypeSpecifier [equal ValueOrInvocation] .
```

Examples:
```
var X :Text
var Y :Int64 = 123
var Z :List<:Bool> = $.A.B()
```

Each variable must have an explicit type specifier.

###### Prose Statements

A prose statement is free-form, multi-line text that may be embedded within the
body of an impl method.

```ebnf
StepProse = prose .
```

Examples:
```
`This is a prose statement.


It can span multiple lines.

It can include any character but the tick which is used to end the prose.
`
```

###### Set Statements

A set statement assigns a value to some variable.

```ebnf
StepSet = set QualifiedIdentifier equal ValueOrInvocation .
```

Examples:
```
set X = "text"
set Y = 999
set Z = [false, false, true]
set a.b.c = 1.2
```

###### If-Else Statements

If/Else statements represent branching logic based on boolean conditions.

```ebnf
Else = else ImplBlock .
ElseIf = else if ValueBinary ImplBlock .
StepIf = if ValueBinary ImplBlock {ElseIf} [Else] .
```

Example:
```
if (true == true) {}

if (Y == true) {

} else {

}

if (X < 100) {

} else if (X < 200) {

} else {

}
```

Each branch re-uses the grammar of the full impl method body.

###### Switch Statements

Switch statements represent branching logic with multiple conditions based on
value equivalence.

```ebnf
SwitchCase = case Value {comma Value} ImplBlock .
SwitchDefault = default ImplBlock .
SwitchElement = SwitchCase | SwitchDefault .
StepSwitch = switch Value curly_open {SwitchElement} curl_close .
```

Examples:
```
switch TextValue {
    case "one" {}
    case "two" {}
    case "three", "four" {}
    default {}
}
```

###### While Statements

While statements represent looping based on a boolean condition.

```ebnf
StepWhile = while ValueBinary ImplBlock .
```

Example:
```
    while (true == true) {}

    while (x < 100) {}
```

###### For Statements

For statements represent looping based on elements of a List or Map type.

```ebnf
ForValueName = identifier .
ForKeyName = identifier .
StepFor = for ForKeyName comma ForValueName in Value ImplBlock .
```

Examples:
```
for idx, value in [1,2,3,4] {}

for key, value in MapValue {}
```

###### Return Statements

Return statements indicate the end of logic for a method and set the return
value.

```ebnf
StepReturn = return [Value] .
```

Examples:
```
return 1234
return SomeValue
return {FieldOne: "text", FieldTwo: true}
return
```

###### Throw Statements

Throw statements indicate the end of logic for a method and set the exception
value.

```ebnf
StepThrow = throw Value .
```

Examples:
```
throw SomeException
throw {FieldOne: "text", FieldTwo: true}
```

###### Exec Statements

Exec statements indicate the invocation of a method but without assignment of
the return value, if any, to variable.

```ebnf
StepExec = exec Invocation .
```

Examples:
```
exec Some.MethodInvocation()
```

##### Values

The IDL has support for some forms of values or expressions.

###### General Values

The general Value represents literals, identifiers, and booleans.

```ebnf
Value = ValueUnary | ValueBinary | ValueLiteral | ValueIdentifier .
```

###### List Literals

A list literal represents a sequence of values. List literals are defined as a
sequence of other values within square brackets (`[` and `]`).

```ebnf
ValueLiteralList    = square_open [Value {comma Value} {comma}] square_close .
```

Examples:
```
[1,2,3,4]
[]
["one", "two", "three",]
```

###### Struct Literals

A struct literal represents the instantiation of a user-defined type. Struct
literals are enclosed within curly braces (`{` and `}`) and contain comma
separated key/value pairs. Each key/value pair is split using the colon (`:`)
character and consecutive pairs are separated by a comma (`,`).

```ebnf
ValueLiteralStruct         = brace_open [ValueLiteralStructPair {comma ValueLiteralStructPair} {comma}] brace_close .
ValueLiteralStructPair    = identifier colon Value .
```

Examples:
```
{}
{key: "value}
{key: 1, key2: 2, key3: 3,}
```

###### Literal Values

All literal values are valid for usage of `Value`. Numeric literals may
optionally have a sign character.

```ebnf
ValueLiteralBool   = bool_lit .
ValueLiteralInt    = int_lit .
ValueLiteralFloat  = float_lit .
ValueLiteralText   = text_lit .
ValueLiteralData   = data_lit .

ValueLiteral =  ValueLiteralBool |
                ValueLiteralInt |
                ValueLiteralFloat |
                ValueLiteralText |
                ValueLiteralData |
                ValueLiteralList |
                ValueLiteralStruct .
```

Examples:
```
123
"text"
true
{}
[]
```

###### Identifier Values

All qualified identifiers are syntactically valid values.

```ebnf
ValueIdentifier = QualifiedIdentifier .
```

Examples:
```
a
a.b.c
b
```

###### Unary Operator Values

A small set of unary operators are available for values.

```ebnf
ValueUnary =  (plus | minus | bang ) Value
```

Examples:
```
-123
+a.b.c
!true
```

###### Binary Operator Values

A set of binary operators are also available for values.

```ebnf
ValueBinary = paren_open Value ( equal_compare | equal_not | equal_lesser | equal_greater | bool_and | bool_or | bin_and | bin_or | bin_xor | shift_left | shift_right | plus | slash | star | mod ) Value paren_close
```

Examples:
```
(a >= b)
(1 + 2)
(8 << 2)
((0 & 1) | 0)
```

##### Method Invocations

A method invocation can take one of three forms: direct, async, and await.

```ebnf
Invocation = InvocationAwait | InvocationAsync | InvocationDirect .
```

###### Direct Invocations

A direct invocation is a standard method call. Each invocation may have an
optional catch clause for exception handling.

```ebnf
InvocationParameters  = Value {comma Value} [comma] .
InvocationCatch       = catch identifier ImplBlock .
InvocationDirect      = ImplIdentifier paren_open [InvocationParameters] paren_close [InvocationCatch] .
```

Examples:

```
SomeMethod()
AnotherMethod(true, 123, [1.2, 2.3])
a.method.from.somewhere()
$.MethodWithCatch() catch ex {}
```

###### Async Invocations

Async invocations are a modified direct invocation that is prefixed with the
`async` keyword and does not allow a catch clause.

```ebnf
InvocationAsync = async ImplIdentifier paren_open [InvocationParameters] paren_close .
```

Examples:
```
async SomeMethod()
async $.AnotherMethod(true, 123, [1.2, 2.3])
async a.method.from.somewhere()
```

###### Await Invocations

Await invocations are the compliment to async invocations. Await invocations do
not support parameters but do support the catch clause.

```ebnf
InvocationAwait = await identifier [InvocationCatch] .
```

Examples:

```
await SomeVariable
await SomeVariable catch e {}
```

### Language Interpretation And Compiler Rules

This section contains compiler implementation constraints and requirements that
extend beyond the language grammar.

#### Reserved Identifiers

The follow identifiers represent the built-in type names and are reserved by the
compiler:

```
Bool    Text      Data
Int8    Int16     Int32   Int64
UInt8   UInt16    UInt32  UInt64
Float32 Float64
List    Map
Empty   Presence  AsyncTask
```

User defined types may not use these identifiers as names. However, struct
fields, api methods, sdk methods and sdk input parameters may use these
identifiers as names because they do not do not conflict with use of the
predeclared identifiers as type specifiers.

Predeclared identifiers are inherent in each module but cannot be imported by
another modules. For example, the following is invalid:

```
import "/path/to/module" as Other
const X :Other.Int64 = 1
```

#### Boolean

The type specifier `:Bool` is used to indicate use of the boolean type. Booleans
have no numeric value and resolve only to the `true` and `false` keywords.

#### Integer

The IDL supports fixed size integer types, signed and unsigned.

|Name |Description|
|------|----------|
|Int8 |8bit signed integers in the range of -2^7 to (2^7)-1|
|Int16 |16bit signed integers in the range of -2^15 to (2^15)-1|
|Int32 |32bit signed integers in the range of -2^31 to (2^31)-1|
|Int64 |64bit signed integers in the range of -2^63 to (2^63)-1|
|UInt8 |8bit unsigned integers in the range of 0 to (2^8)-1|
|UInt16 |16bit unsigned integers in the range of 0 to (2^16)-1|
|UInt32 |32bit unsigned integers in the range of 0 to (2^32)-1|
|UInt64 |64bit unsigned integers in the range of 0 to (2^64)-1|

There is no unsized `Int` or `Uint` type.

#### Floating Point

Floating point numbers in the IDL match the IEEE 754 specification with the
exception that `+Inf`, `-Inf`, and `NaN` are not valid values. Only finite
numeric values are allowed.

|Name |Description |
|-----|------------|
|Float32 |32bit IEEE 754 floating point numbers|
|Float64 |64bit IEEE 754 floating point numbers|

There is no unsized `Float` type.

#### Text

Text, or strings, are denoted with the `:Text` type specifier and represent a
sequence UTF-8 characters, or code points. The default maximum size in bytes of
a string is `2^31-2` to make strings compatible with 32bit and greater systems
that use an unsized integer to track string length. Special compiler modes and
annotations may adjust this limit.

#### Data

Data, or byte strings, are denoted with the `:Data` type specifier and represent
a sequence of bytes. A byte is equivalent to an unsigned 8bit integer. The
default maximum size in bytes of data is `2^31-2` to make data compatible with
32bit and greater systems that use an unsized integer to track string length.
Special compiler modes and annotations may adjust this limit.

#### List

Lists are denoted with the `:List<:T>` type specifier and represent an ordered
sequence of values where all values are of the same type. Declaring a list type
requires providing a type parameter like:

```
:List<:Int64>
:List<:Text>
:List<:MyStruct>
```

However, the list type is not a typical generic type. The type parameter of a
list may not be a List or Map type.

The IDL does not have a specific memory model for lists so there are no
requirements for lists to be rendered in a specific form in target languages.
Compiler implementations and code generators are free to determine the best
expression of the list concept for a target language.

#### Map

Maps are denoted with the `:Map<:K,:V>` type specifier and represent an
unordered set of key/value pairs where all keys or of the same type and values
are of the same type but keys and values may be of separate types. Declaring a
map type requires providing two type parameters like:

```
:Map<:Text,:Text>
:Map<:Text,:UInt64>
:Map<:Int32,:MyStruct>
```

Like lists, maps are not a typical generic type. The type parameter for keys may
be Bool, Text, Int8, Int16, Int32, Int64, UInt8, UInt16, UInt32, or UInt64. The
type parameter for values may be any primitive type (Bool, Text, Data, Int8,
Int16, Int32, Int64, UInt8, UInt16, UInt32, UInt64, Float32, Float64), a user
defined struct, or enum. Maps may not contain list or map type values.

The IDL does not have a specific model for map types. Instead, it converts all
map fields into `:List<:MapEntry>` where `MapEntry` is a generated type. Map
entry types always have a `Key` and `Value` field with types that match the map
key and map value types respectively. The resulting field must be marked as both
`IsList` and `IsMap` with the field type referencing the generated map entry.
The resulting map entry struct must be marked as `IsSynthetic` to identify it as
a generated type.

There are no requirements for maps to be rendered in a specific form in target
languages. Compiler implementations and code generators are free to determine
the best expression of the map concept for a target language. This includes, for
example, choosing not to render the synthetic map entry struct and using a
native map type instead.

#### Empty

The predeclared identifier `Empty` represents a struct with no fields. It is
equivalent to:

```
struct Empty {}
```

#### Presence

Presence types are denoted with the `Presence<:T>` specifier and represent value
that may not be present. Declaring an option type requires providing a type
parameter like:

```
:Presence<:Text>
:Presence<:Int32>
:Presence<:MyStruct>
```

Presence is not a typical generic type. The type parameter may only be one of
the primitive types (Bool, Text, Data, Int8, Int16, Int32, Int64, UInt8, UInt16,
UInt32, UInt64, Float32, Float64). Struct, SDK, and API types have an implied
`Presence<>` decorator and should always be rendered in a presence aware form.
Enums have a meaningful and presence related zero value such that a presence
indicator is redundant.

Compiler implementations and code generators are free to determine the best
expression of the `Presence` concept for a target language.

#### Import

The import statement grammar asserts that every import has two parts: a text
value indicating the location of a module and a local alias to represent the
imported module. For example:

```
import "/path/to/file" as SomeModuleName
import "file:///path/to/file" as .
```

The text value that indicates the module location may be in one of two forms: an
absolute file system path or a URI. Compilers are required to support local file
system paths and `file:` URIs. Compilers may optionally support other types of
URIs.

All local system paths and file URIs must use the unix style path separator of
`/`. All paths should be absolute (beginning with a `/`). However, compilers may
choose to interpret relative paths as absolute by prepending a `/`. For the
purposes of importing, `/path/to/file` and `file:///path/to/file` are considered
equivalent in all ways.

All system import paths are relative to one or more search roots. How and where
those search roots are configured is implementation specific. The general note
is that relative imports are not supported. For example, given a search root
such as:

```
/
    /foo
        foo.mglot
    /bar
        bar.mglot
```

The module `foo.mglot` may import `bar.mglot` as either `/bar/bar.mglot` or
`file:///bar/bar.mglot`. It may not import the module as `../bar/bar.mglot` or
any other equivalent relative path.

When the imported module alias is a name, such as `import "/file" as File` then
all declarations from the imported file are available under the name `File`,
such as `File.Element`. If the imported module alias is `.` instead of a name,
such as `import "/file" as .`, then it indicates that all declarations of the
imported module are imported into the current module namespace. This means that
all elements of the imported module are available without going through an
alias. This effect is transitive such that if `a` dot imports `b` which dot
imports `c` then `a` contains all the declarations of `a`, `b`, and `c`. Any
file that imports `a` with an alias such as `import "/a" as A` can access
content from all three modules.

Dot imports exist only to support conversions to and from Protocol Buffers. Dot
imports without a Protocol Buffers conversion annotation,
`$(Protobuf.PublicImport(true))`, should be considered errors and must result
in, at least, a warning.

#### Annotations

Annotations are limited in their possible input types to any primitive type
(Bool, Text, Data, Int8, Int16, Int32, Int64, UInt8, UInt16, UInt32, UInt64,
Float32, Float64) or structs. List and map types are not supported except as
fields on a struct.

#### Const

Constants are limited in their possible types to primitive types except for
Data. The full set of supported types for constants is: Bool, Text, Int8, Int16,
Int32, Int64, UInt8, UInt16, UInt32, UInt64, Float32, and Float64.

Text is supported while Data is not because there is widespread support in most
target languages for defining string constants but very little support for
defining byte string constants. Most widely used programming languages treat
byte strings as composite types for which a constant may not be defined. If a
general purpose or widely applicable workaround for this issue is found then
future versions of this specification may allow for Data constants.

#### Enum

All enums, even empty ones, have an implicit value named `None` that is assigned
the UID value `0`. This is the zero value of the enum. That is, if no explicit
enumerant is chosen then the value of an enum is `None`.

Users may override this behavior by providing their own zero value in the form
of:
```
enum E {
    MyNone @0
}
```

Explicitly identifying any enumerant as UID value `0` removes the implicit
`None` and replaces it with the user selection.

Enumerants in the IDL have no concrete value other than their name or symbol.
That is, enumerants are not numbers or strings as they might commonly be
presented in target programming languages. Exactly how an enum is rendered to a
target language is implementation specific and determined by the compiler or
code generator.

In order to adapt to the variety of ways in which individual target languages
may handle enums combined with the purpose of the IDL as a tool for
communicating data between systems, there is an additional implicit enumerant
named `_Unknown`. The `_Unknown` enumerant cannot be overridden and represents
the condition where a system is handling an enumerant for which it does not have
the matching IDL definition. To illustrate, consider two systems communicating
using an enum defined as:
```
enum E {
    One
    Two
}
```

Both systems should be constrained to sending and receiving either `One`, `Two`,
or `None` because these represent the entirety of the possible enumerants.
However, the expected common case is that there is no guaranteed coordination
between any two parties regarding when and where updates to IDL are
incorporated. For example, the above enumerant might be expanded to:

```
enum E {
    One
    Two
    Three
}
```

If only one of the two systems (A) updates to incorporate the new enumerant and
sends the value `Three` to the other system (B) which has not been updated then
system B receives an enumerant value that it cannot interpret because it does
not have a matching symbol. Instead, system B will convert all unknown
enumerants to `_Unknown` so that code using the enum value can make an informed
decision on how to handle the unknown value rather than defaulting to an
exception or error of some kind.

In other words, the built-in `_Unknown` value in all enums is a best-effort
attempt at forwards compatibility.

#### Struct

##### Fields

Struct fields are all explicitly typed. Fields may be defined as any primitive
type, enum, or struct value. Struct fields may not be API, SDK, or impl types.

##### Union

Structs may define any number of unions. Each union is conceptually a [tagged
union](https://en.wikipedia.org/wiki/Tagged_union) where at most one element of
the union may be set at a given time and there is a value that indicates which
of the fields is set. Unions may be named or unnamed. Unnamed unions have a
default name of `Union`. As such, there can be only one unnamed union in a
struct or it would be equivalent to defining two fields named `Union`.

Unions are fields of the struct and exist in the same namespace and UID space as
ordinary fields. However, unions do not have a concrete type or expression
beyond the fact that they group fields into a mutually exclusive set. The exact
representation of this concept in a target language is not specified so that the
most reasonable representation may be used. Additionally, whether the union
field is included in encoding or transmission schemes is not specified.

##### Default Values

Unless otherwise specified, all fields default to their zero value. Users may
re-define the zero value of a specific field through assignment. For example,
the zero value of a boolean is `false` but the default for a field may be set to
`true` using:

```
struct S {
    F1 :Bool = true
}
```

This feature is limited to the set of types supported by constants and
identifiers that reference either enumerant or constant values. Unary operators
applied to all of these types are also allowed for cases such as negation of an
integer or boolean.

#### API

##### Methods

The most minimal method definition allowed is:

```
api I {
    Method(:Empty) returns (:Empty)
}
```

Input and return types must be a structs. The structs may not directly or
indirectly contain API or SDK types.

All API method signature have an implied exception type that may be raised,
thrown, returned, or any other style of exception handling that a target
language implements. The exact details of the exception type are dependent on
the compiler such that all APIs compiled by the same implementation throw the
same exception types.

##### Extensions

APIs support a form of inheritance or composition through the `extends`
syntax:

```
api I extends (:I2, :I3) {}
```

An extension chain for an API includes all extended APIs and all APIs extended
by those APIs, recursively. To illustrate, given the these API definitions:

```
api One {}
api Two extends (:One) {}
api Three extends (:Two) {}
```

the following are equivalent:
```
    api Four extends (:Three) {}
    api Four extends (:One, :Two, :Three) {}
```

The full API extension chain may contain up to (2^8)-1 other APIs. Adding an
extension to an API is equivalent to saying "implementations of A must also
implement B". This property holds true for any depth of extension chains The
exact expression of this is implementation and code generation dependent.

In order to support a wide array of API extension models, the following
constraints are set for all compiler implementations:

-   APIs may only extend APIs.
-   Extensions chains may not contain cycles.
-   Method names must be unique within the entire set of methods
    comprising an extension chain.
-   APIs always maintain their own UID space such that an API and every
    API it extends may have a method with UID 1 without conflict.
-   APIs that appear multiple times in an extension chain are treated as
    being present only once.
-   Each unique API in the chain counts towards the (2^8)-1 limit.

#### SDK

##### Methods

SDK methods have several optional parts. The most minimal method definition
allowed is:
```
sdk S {
    Method()
}
```

If no input type is given then the method accepts no input. Any number of named
input parameters may be defined and as any type:
```
sdk S {
    Method(one :Struct, two :API, three: SDK, four :Text)
}
```

Methods may optionally define a `returns` clause. If a method does not contain a
`returns` clause then it does not return a value. If a `returns` clause is
present then it must define an explicit return type:
```
sdk S {
    Method() returns (:Empty)
}
```

Return values for SDK methods may be of any type.

SDK methods, like API methods, have an implied exception type that may be
raised, thrown, returned, or any other style of exception handling that a target
language implements. The exact details of the exception type are dependent on
the compiler such that all APIs compiled by the same implementation throw the
same exception types. Unlike API methods, SDK methods may have the exception
behavior disabled using `nothrows`:

```
sdk S {
    Method() nothrows
}
```

This indicates that the method cannot fail. Compilers and code generators should
choose an appropriate form in target languages when handling `nothrows` methods.

##### Extensions

SDKs support a form of inheritance or composition through the `extends` syntax:

```
sdk S extends (:S2, :S3) {}
```

An extension chain for an SDK includes all extended SDKs and all SDKs extended
by those SDKs, recursively. To illustrate, given the these SDK definitions:

```
sdk One {}
sdk Two extends (:One) {}
sdk Three extends (:Two) {}
```

the following are equivalent:
```
sdk Four extends (:Three) {}
sdk Four extends (:One, :Two, :Three) {}
```

The full SDK extension chain may contain up to (2^8)-1 other SDKs. Adding an
extension to an SDK is equivalent to saying "implementations of A must also
implement B". This property holds true for any depth of extension chains The
exact expression of this is implementation and code generation dependent.

In order to support a wide array of SDK extension models, the following
constraints are set for all compiler implementations:

-   SDKs may only extend SDKs.
-   Extensions chains may not contain cycles.
-   Method names must be unique within the entire set of methods
    comprising an extension chain.
-   SDKs always maintain their own UID space such that an SDK and every
    SDK it extends may have a method with UID 1 without conflict.
-   SDKs that appear multiple times in an extension chain are treated as
    being present only once.
-   Each unique SDK in the chain counts towards the (2^8)-1 limit.

#### Impl

##### Impl Requirements

The `requires` element of the impl declares which APIs and SDKs the impl
requires to perform its behaviors. If there is no `requires` clause then the
impl is assumed to have no requirements. If present, the `requires` clause must
contain named parameters that appear similar to struct fields. All requirements
must be of either an API or SDK type.

##### Impl As

The `as` portion of the impl declares which APIs and SDKs that the type
implements. The list of types identified in the `as` section works similarly to
the `extends` clause in APIs and SDKs.

The full set of types in the `as` is determined by calculating the `extends`
portion of each API and SDK identified. The resulting set represents all the
methods that the impl must implement.

##### Impl Methods

The grammar and syntax of impls allows them to contain methods in both API and
SDK forms. The actual valid form of the method, though, is determined by the
type in `as` that defines the method.

Each impl must define all methods represented by the types in `as`. The method
names and signatures must match exactly though the UID values of each method may
differ to avoid conflicts.

An impl may not define methods that are not part of the `as`.

##### Impl Async/Await

The impl template language supports a limited form of concurrency with the
`async` and `await` keywords. The compiler implementation and code generators
may determine the most appropriate form, if any, that these take in a target
language. That is, the code resulting from `async` and `await` is not required
to be asynchronous, supporting of concurrency, or directly express an equivalent
to the `AsyncTask` that is generated from use of the `async` operator.

From an IDL perspective, all use of `async` results in a `AsyncTask` with the
following interface:

```
sdk AsyncTask {
    Wait()
    Cancel()
}
```

Note that neither method provides a return value. The only way to extract a
value from a task is to use `await`. The return value of `await` is matched to
the return type of the method that was invoked with `async` to produce the
`AsyncTask`. For example:

```
sdk S {
    Method() returns (:Int64)
}
api I {
    AnotherMethod()
}
impl Impl as :I {
    requires {
        S :S
    }
    AnotherMethod() {
        var F :AsyncTask = async $.S.Method()
        var FV :Int64 = await F catch e {}
    }
}
```

If the method is defined with `nothrows` then it is not valid to use `catch`
when applying `await` to the `AsyncTask`. Otherwise, the end-user may add
exception handling at the point of `await`.

#### UID Values

All user defined types and values must have an associated UID. UID values are
unique, numeric identifiers that are either provided by a user or automatically
generated. All UID values are typed as a UInt64.

##### Module UIDs

No module may use the UID value `0`. The module `0` is a virtual module that
contains all built-in types. The module UID values `1` - `255` are reserved for
use by projects that implement a compiler. The range of UID values allowed for
end-users is `256` - `(2^64)-1`.

Module UIDs must be unique within the set of all modules compiled together.
Generally, module UIDs are expected to be universally unique across all modules
that exist. As such, compilers should provide a tool that generates random
module UIDs for users in an effort to minimize the chance of conflicts.

This is the only UID value that *must* be present in a module. All other UIDs
may be automatically generated.

##### Top-Level Element UIDs

Top level elements include `annotation`, `const`, `struct`, `union`, `enum`,
`api`, and `sdk`. All top-level element UIDs can span the range of `1` -
`(2^64)-1`.

Top level element UIDs must be unique within the module. If a top-level element
does not have a user provided UID then one may be generated by taking the bytes
of the module UID in little endian order, appending the bytes of the element
name, and computing a SHA256 of the resulting byte string. The first 8 bytes of
the output become the integer UID value for the element.

##### Sub-Element UIDs

Sub-elements include struct fields, unions within a struct, enumerants, and
methods. All sub-element UIDs can span the range of `1` - `(2^64)-1` with the
UID `0` being reserved for compiler implementation use. Enumerants, however, may
span the full range of `0` - `(2^64)-1` with `0` representing the default
enumerant of an enum.

If a sub-element is defined without a user provided UID then one may be
generated by taking the bytes of the parent element UID in little endian order,
appending the bytes of the sub-element name, and computing a SHA256. The first 8
bytes of the output become the integer UID value for the sub-element.

#### Type Compatibility

All elements of the Microglot IDL are typed. The constants, annotations, default
field values, and impl bodies all allow some form of assigning values to a typed
element. Compilers must assert that all assignments and operations target the
appropriate types. Any two values of exactly the same type are, by definition,
compatible. However, there are additional rules that allow some types to be
compatible with others.

Note that these compatibility rules regard only assignments and operations
within the IDL. Wire protocols and serialization formats may define their own
compatibility rules to bridge between external values and IDL types.

##### Safe Compatibility

The following table lists a receiver type on the left and all safe types that
may be assigned to it on the right:

|Type |Compatible With |Comments|
|-----|----------------|---------|
|:Bool |:Bool |Booleans are not numeric values so assigning 1 or 0 is
not safely compatible|
|:Text |:Text |Text is always UTF-8 encoded so it is not safe to assign
an arbitrary Data value|
|:Data |:Data :Text |All Text values may be downgraded to Data safely
because they are already a specialized form of a byte string|
|:Int8 |:Int8 ||
|:Int16 |:Int16 :Int8 |All integers types of the same sign may safely
receive a smaller value|
|:Int32 |:Int32 :Int16 :Int8 ||
|:Int64 |:Int64 :Int32 :Int16 :Int8 ||
|:UInt8 |:UInt8 ||
|:UInt16 |:UInt16 :UInt8 ||
|:UInt32 |:UInt32 :UInt16 :UInt8 ||
|:UInt64 |:UInt64 :UInt32 :UInt16 :UInt8 ||
|:Float32 |:Float32 ||
|:Float64 |:Float64 |Float sizes have different precision and are not
safely compatible|

All of the right-hand-side types may be assigned to the left-hand-side type
without any loss of information. This is what defines them as "safe" and is
irrespective of the concrete values being used.

##### Unsafe Compatibility

Unsafe compatibility, or the ability for a user to explicitly allow a conversion
between types where information loss may occur, is not currently supported.

#### Zero And Default Values

The IDL has no expressed concept of `NULL`. Compiler implementations and code
generators are free to use a `NULL` equivalent as needed or as it fits a
particular use case. The IDL, however, does not formally include this concept.
Instead, all typed elements have a default value which is their nearest
equivalent value to zero:

|Type |Default Value|
|-----|-------------|
|`:Bool` |false|
|`:Text` |""|
|`:Data` |0x""|
|`:Int8` |0|
|`:Int16` |0|
|`:Int32` |0|
|`:Int64` |0|
|`:UInt8` |0|
|`:UInt16` |0|
|`:UInt32` |0|
|`:UInt64` |0|
|`:Float32` |0.0|
|`:Float64` |0.0|
|`:List<T>` |`unset`|
|`:Map<K,V>` |`unset`|
|`:Present<T>` |`unset`|

All complex and user defined types have an implicit `:Presence<T>` wrapper so
the default for these is "unset". This may be expressed in any way by compilers
and code generators for a target language.

Enum types default to the `0` UID value whether that is the implicit enumerant
or an end-user defined `0` enumerant.

## IDL Descriptor

The compiler's primary output is a descriptor object that contains a complete
representation of the compiled content. The exact structure of the descriptor is
expected to change until v1 of this specification at which point it will be
embedded here. The descriptor type is designed to encompass input from all
supported syntaxes. Other specifications will define the serialization formats,
generated code outputs, and compiler plugin protocols.

The microglot language and descriptor are designed to provide compatibility with
the Protocol Buffer syntaxes and descriptor. The following sections detail the
process of converting between the descriptor types.

### Protocol Buffers To Microglot Descriptor Conversions

As part of the Protocol Buffers compatibility support, compilers must be able to
accept and output Protocol Buffers descriptors in addition to Microglot
descriptors. This means that compilers must have the ability to convert between
the two types as needed. While the Microglot IDL supports the majority of
Protocol Buffers features it is not a strict superset. Additionally, the
Microglot IDL supports features that cannot be expressed in Protocol Buffers.
The following sections cover how Protocol Buffers descriptors are converted to
Microglot descriptors including cases where conversion is not possible.

#### Enums

The Protocol Buffers enum type is virtually identical to the Microglot IDL enum
type and converts directly. Duplicated enumerant UID values enabled by the
`allow_alias` option are removed. Only the first entry with a given UID should
be converted.

#### Messages

Messages convert to structs which are a similar construct. The message container
converts directly but there are some differences in the field mapping that must
be accounted for.

##### Scalar Types

Protocol Bufferes supports a variety of scalar types that represent the same
value range but are conveyed with a different encoding. All integer types
convert to their closest equivalent using the following table:

|Protocol Buffers |Microglot|
|-----------------|---------|
|int32, sint32, sfixed32 |Int32|
|int64, sint64, sfixed64 |Int64|
|uint32, fixed32 |UInt32|
|uint64, fixed64 |UInt64|
|float |Float32|
|double |Float64|
|bool |Bool|
|string |Text|
|bytes |Data|

When the `sint*`, `sfixed*`, or `fixed*` are converted then the field should
also receive the `$(Protobuf.FieldType("sfixed32"))` annotation so that there is
no loss when converting back to a ProtocolBuffers descriptor and so that
serialization of the resulting type can be performed correctly.

##### Packed Fields

The `packed = true` option for proto2 has not been relevant or required for a
long time. All modern Protocol Buffers implementations are capable of receiving
both packed and unpacked encoding for repeated integer fields such that the
packed option can be considered an optimizing hint rather than a distinct type.

Generally, all repeated fields should be converted while ignoring the packed
option unless it is explicitly set to false (`packed = false`). The explicit
negative value is likely an indicator that a system interacts with a legacy
system that predates protoc `v2.3.0`. In this case the relevant field option,
`$(Protobuf.Field({Packed: false}))`, should be set to false to indicate the
exclusion. All other repeated fields will be assumed as `packed = true` and the
option will be added on all conversions back from Microglot IDL.

##### Nested Types

The Microglot descriptor does not support nested types but Protocol Buffers
messages may have either enums or messages defined within them. All nested types
must be converted to Microglot IDL as independent types. For a nested type
`Foo.Bar` the resulting type should become `Foo_Bar`. While the new type name
causes a conflict a suffix of `X` is added. For example, if `Foo_Bar` conflicts
with another type then it becomes `Foo_BarX` and if that still conflicts with
another type then it becomes `Foo_BarXX`, and so on. This is similar to how
protoc constructs synthetic types and guarantees to converge on a unique name
for the new type.

A compiler should emit a warning if it must append one or more `X` values to the
nested type name because this is a potentially breaking condition for
interoperability. Notably, a different number of conflicts between compilations
will result in different type names and UIDs which will break any existing
references to the old type name and/or UID.

The `$(Protobuf.NestedTypeInfo({}))` annotation should be used on all isolated
child types to preserve the nested nature when converting back to protobuf.

##### Proto2 Default Values

Default values in proto2 are defined using the option `default = value`.
However, the `default` option is not a true option because it is converted to an
attribute of the field rather than being stored with other options. The default
value converts to a Microglot IDL value which is also an attribute of the field
descriptor.

##### Proto3 Optional

The `optional` modifier from proto3 works differently than the modifier with the
same name in proto2. All proto3 fields defined with `optional` should set the
`HasPresence` value to true in the Microglot descriptor.

The `optional` modifier in proto3 also results in the construction of a
synthetic `oneof` field being added to the Protocol Buffers descriptor. This
synthetic `oneof` does not convert to Microglot IDL as the presence indicator is
implemented differently. Only the field is converted with the `HasPresence` set
to true.

##### Proto2 Required/Optional

The proto2 form of `optional` is the default form of all fields in Microglot
IDL. If the field as the `mglot_field_presence = true` option then it should
convert into the `Presence` form of the field type.

The proto2 `required` indicator has no equivalent in Microglot IDL. Required
fields are converted as ordinary fields. The converted field should receive the
`$(Protobuf.Required(true))` annotation.

##### Proto2 Group

The proto2 group feature is not supported in Microglot IDL.

##### Extensions

Proto3 only allows extensions on the messages that define options. All of these
are ignored because the Microglot descriptor tracks only official options.

Proto2 provides a general purpose mechanism for enabling messages to be extended
with new fields. Proto2 extension fields are merged into the type descriptor
they extend such that they appear as normal fields. The only indicator that a
field is an extension is a populated `extendee` attribute. Extension fields
convert as normal fields. The `extend` directives are lost during the conversion
such that converting back results in the extended object being rendered with all
extension fields.

#### Services

Services convert to APIs which are nearly identical in structure. Services that
use streaming input or output cannot convert.

#### Built-In Options

Protocol Buffers has a number of options defined as part of the core descriptor
object. All of these options are represented as annotations in the included
protobuf.mglot file. All relevant protobuf options should be converted to those
microglot options and attached to the relevant element.

#### Import Weak/Public

Weak imports are effectively deprecated and explicitly discouraged from use.
There is no weak import equivalent in Microglot IDL. All weak imports convert to
regular imports. They should be annotated with `$(Protobuf.WeakImport(true))`.

Public imports are a supported feature of both proto2 and proto3. Microglot IDL
has limited support for public imports in order to enable conversions to and
from Protocol Buffers. Public imports convert into dot imports and all imported
names must be converted into `DotImport` elements in the descriptor. All
converted public imports must be annotated with `$(Protobuf.PublicImport(true))`
as a best effort indicator that the public imports were converted from protobuf.

#### Map Types

Map types in proto2 and proto3 result in the generation of a synthetic message
that represents the map entry. The compiled field type for a map is not a map at
all but a repeated field of the synthetic entry message. The synthetic message
is annotated with the `map_entry = true` option to identify that it is intended
as a map.

The Microglot descriptor handles map values in a nearly identical way. The
biggest difference is that the Microglot descriptor does not generate a nested
type and instead generates a top level type to represent the map entry. To
convert a map field, first convert the nested synthetic type into a top-level
type as with any nested type. The resulting microglot struct must be marked
`IsSynthetic`. Then convert the field as with any other field but setting
`IsMap` to true.

#### Synthetic UID Generation

All addressable elements in Microglot IDL have a UID. All UID values are
unsigned 64bit integers. Proto2 and proto3 only require and handle UID values
for fields and enumerants. This leaves the file, top-level types, and service
methods lacking any useful UID values.

The file UID is generated by taking the SHA256 of the package name combined with
the file path and then selecting the first 8 bytes. All top-level declaration
UIDs, such as for messages and services, are generated by concatenating the
declaration name to the byte value of the file UID, taking a SHA256, and then
selecting the first 8 bytes. Service methods follow the same pattern by
concatenating the method name to the byte value of the service UID, taking a
SHA256, and then selecting the first 8 bytes. Aside from the file UID, all UIDs
are generated by concatenating the name of the element to the bytes of the
parent UID value, hashing that value with SHA256, and then extracting a 64bit
unsigned integer from the first 8 bytes.

Note that the file UID is potentially unstable as moving the file or running the
compiler with a different root configuration will result in the UID changing.
The compiler will tolerate the unstable value but systems built from generated
code will likely fail to correctly interoperate if the value is not consistent.
To stabilize the value, import the mglot.proto file and apply the options
within. There is an option for each type of Protocol Buffers declaration that
sets the UID. Compilers should check for these options and defer to any set
value rather than generate new UID values. When Microglot IDL is converted to
Protocol Buffers it should include these options so that any subsequent
compilation leverages a stable value.

#### Package Paths

A package name in Protocol Buffers is optional. It primarily acts as a text
prefix for all the types declared within a file. If a file contains a package
path then it should be converted to a file annotation using
`$(Protobuf.Package(""))` so that conversion back to Protocol buffers will
retain the original prefix.

### Microglot IDL To Protocol Buffers Conversion

#### Module UID

Protocol Buffers does not have a concept of a UID beyond struct fields. When
converting to Protocol Buffers the UID should be stored as a file option using
`mglot_module_uid = <UID>`. If the module has a file annotation containing the
Protocol Buffers package then this should be included as the package value for
the file.

#### Proto2 Or Proto3 Syntax

Proto3 is the default syntax to use when converting. However, any use of default
field values within a module require that the conversion target be proto2. This
is because only proto2 supports default values. If any field within a module is
annotated with `Protobuf.Required(true)` then the conversion must also target
proto2 because that is the only version that supports required fields. Also, if
any module contains constant definitions then the target must be proto2 because
the conversion of constants requires use of default values as described in a
later section.

#### Enums

Enums convert to a mostly identical structure in the Protocol Buffers
descriptor. One exception is for enum values that have been annotated with
`NestedType` which generally only appears for previously converted Protocol
Buffers descriptors. If this annotation is applied to an enum then it must be
converted to Protocol Buffers as a nested type.

Another exception is that enumerants in Protocol Buffers must be globally unique
within their package whereas Microglot IDL enumerants are encapsulated within
the namespace of the enum. When converting enumerants, the name of the enum must
be prepended to guarantee uniqueness. For example `None` becomes `Foo_None`.
The `mglot_original_name = "None"` options must be added during conversion.

All converted enums and enumerants should be annotated with the appropriate UID
option for their type.

#### Structs

Structs are generally compatible with Protocol Bufferes messages but there are
some small exceptions.

Any struct that is annotated as being a nested type, like enums, must be
converted as a child type of the identified parent. The resulting message and
fields should be annotated with the relevant UID options.

If converting to proto3 then all use of `Presence` converts to an optional
field. If converting to proto2 then `Presence` converts to both an optional
field and an option identifying the use of presence as `mglot_field_presence =
true`. This is to handle an ambiguity in proto2 where use of optional fields is
not always related to presence. Adding the option allows conversion back to the
appropriate type.

#### Scalar Types

Microglot IDL supports a different, but largely overlapping, set of scalar types
than Protocol Buffers. The following table details the conversion of types:

|Microglot |Protobuf|
|----------|--------|
|Bool |bool|
|Text |string|
|Data |bytes|
|Int8, Int16, Int32 |int32|
|Int64 |int64|
|UInt8, UInt16, UInt32 |uint32|
|UInt64 |uint64|
|Float32 |float|
|Float64 |double|

Protocol Buffers does not support 8 or 16 bit integers so these must be
converted to 32 bit. The `mglot_field_type` should be set to the name of the
original microglot field type so that converting back results in the correct
type being used.

If the `$(Protobuf.FieldType(""))` annotation is present for any field then the
identified field type should be used instead of the conversion table. The
`mglot_field_type` should still be set as usual.

#### Default Values

Protocol Buffer options, which are used to set default values in proto2, can
contain integer, float, string, boolean, and identifier values which overlaps
exactly with microglot support for default values. The exact specification for
the value formats is documented
[here](https://protobuf.dev/reference/protobuf/proto2-spec/#constant).

The scalar values convert directly without issues. Identifiers, though, may
require some special handling. Enumerant identifiers convert directly to
Protocol Buffers identifiers as this is a supported feature. However, Microglot
IDL default values that reference constants do not directly translate because
Protocol Buffers does not support the concept of a named constant. The exact
value of any constant reference replaces the reference during conversion. For
example, `f :Int32 = MyConst` becomes `f :Int32 = -1234` and the materialized
value is then used as the default. When this happens the `mglot_field_default`
option should be set to the original reference so that it can be converted back.

#### Constant Values

Protocol Buffers does not support named constants but named constants may be
used in Microglot IDL when assigning a default field value. If constants have no
presence in a Protocol Buffers file then they are lost when converting back to
Microglot IDL.

To resolve this, all constants within a module are converted into struct fields
and written to a struct called `MglotConstants`. If creating this type would
result in a conflict then the character `X` is appended to the string until
there is no conflict (ex: `MglotConstantsXXXXX`). Each constant value is
then converted into a field of the same type with the default value set to the
constant value.

The generate message must be annotated with the `mglot_struct_constants = true`
option to identify it as a container of constants and not a regular message.

#### Annotations

Any annotations from protobuf.mglot that are used in Microglot IDL should be
converted to their respective Protocol Buffers form. No other annotations are
converted at this time. Future versions of this specification may include a
method of storing arbitrary annotations in Protocol Buffers.

#### Imports

All imports in Microglot IDL convert to standard imports in Protocol Buffers.
Any imports annotated with `$(Protobuf.WeakImport(true))` or
`$(Protobuf.PublicImport(true))` are converted to their appropriate import types
and to the appropriate entries in the descriptor.

#### Map Types

Maps in Microglot IDL and Protocol Buffers work similarly. Convert the synthetic
map entry struct into a nested type and add the `map_entry = true` option to the
nested message. The field otherwise converts as any other field.

#### SDK and Impl Types

SDK and impl types do not convert to Protocol Buffers as there is no reasonable
match for their contents. Future revisions of this specification may outline a
way to encode SDK and impl values for the purposes of supporting lossless,
bidirectional conversion but they cannot be made available as types in Protocol
Buffers with equivalent features.

## License

Microglot IDL Specification © 2020 by Microglot LLC is licensed under
Attribution-ShareAlike 4.0 International. To view a copy of this license, visit
http://creativecommons.org/licenses/by-sa/4.0/

### Attribution

Portions of this specification are either heavily inspired by or directly copied
from other open source works. Specifically, the Go language specification and
the Cap'n Proto schema documentation are used.

[Go language specification](https://go.dev/ref/spec): "The Go Authors".

[Cap'n Proto schema documentation](https://capnproto.org/language.html):
"Sandstorm Development Group, Inc.; Cloudflare, Inc.; and other
contributors."
