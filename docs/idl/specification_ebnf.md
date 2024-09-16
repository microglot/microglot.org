---
# © 2023 Microglot LLC
# SPDX-License-Identifier: CC-BY-SA-4.0
sidebar_position: 4
---

# EBNF Notation Of The Microglot IDL

```ebnf

Production  = production_name "=" [ Expression ] "." .
Expression  = Alternative { "|" Alternative } .
Alternative = Term { Term } .
Term        = production_name | token [ "…" token ] | Group | Option | Repetition .
Group       = "(" Expression ")" .
Option      = "[" Expression "]" .
Repetition  = "{" Expression "}" .

newline             = /* the Unicode code point U+000A */ .
unicode_char        = /* an arbitrary Unicode code point except newline */ .
unicode_prose_char  = /* an arbitrary Unicode code point except tick () */ .
unicode_letter      = /* a Unicode code point classified as "Letter" */ .
unicode_digit       = /* a Unicode code point classified as "Number, decimal digit" */ .

letter        = unicode_letter | "_" .
decimal_digit = "0" … "9" .
binary_digit  = "0" | "1" .
octal_digit   = "0" … "7" .
hex_digit     = "0" … "9" | "A" … "F" | "a" … "f" .

identifier = letter { letter | unicode_digit } .

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
tick = "" .
curly_open = "{" .
curl_close = "}" .
square_open = "[" .
square_close = "]" .
paren_open = "(" .
paren_close = ")" .
angle_open = "<" .
angle_close = ">" .

int_lit        = decimal_lit | binary_lit | octal_lit | hex_lit .
decimal_lit    = "0" | ( "1" … "9" ) [ [ "_" ] decimal_digits ] .
binary_lit     = "0" ( "b" | "B" ) [ "_" ] binary_digits .
octal_lit      = "0" [ "o" | "O" ] [ "_" ] octal_digits .
hex_lit        = "0" ( "x" | "X" ) [ "_" ] hex_digits .

decimal_digits = decimal_digit { [ "_" ] decimal_digit } .
binary_digits  = binary_digit { [ "_" ] binary_digit } .
octal_digits   = octal_digit { [ "_" ] octal_digit } .
hex_digits     = hex_digit { [ "_" ] hex_digit } .

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

escaped_char            = \ ( "a" | "b" | "f" | "n" | "r" | "t" | "v" | \ | " ) .
unicode_value           = unicode_char | escaped_char .
text_value              = unicode_value | newline
text_lit                = " { text_value } " .

data_lit        = "0" ( "x" | "X" ) " hex_digits " .
data_bytes      = data_byte { { "_" | " " } data_byte } .
data_byte       = hex_digit hex_digit .

bool_lit    = true | false  .

comment_line = comment_start_line {unicode_value} newline .
comment_block = comment_start_block {unicode_value | newline} comment_end_block .
comment = comment_line | comment_block

prose = tick {unicode_prose_char} tick

UID = at int_lit .

CommentBlock = comment {comment}

AnnotationInstance      = [identifier dot] identifier paren_open Value paren_close .
AnnotationApplication   = dollar paren_open [AnnotationInstance] { comma AnnotationInstance } [comma] paren_close .

QualifiedIdentifier = identifier { dot identifier } .

TypeParameters = angle_open TypeSpecifier {comma TypeSpecifier} [comma] angle_close
TypeName = identifer [TypeParameters] .

QualifiedTypeName = [identifier dot] TypeName .
TypeSpecifier = colon QualifiedTypeName .

Module = [ModuleHeader] StatementSyntax StatementModuleMeta {ModuleElement} .

ModuleElement = StatementImport |
                StatementAnnotation |
                StatementConst |
                StatementEnum |
                StatementStruct |
                StatementAPI |
                StatementSDK .

ModuleHeader = CommentBlock .

StatementSyntax = syntax equal text_lit .

StatementModuleMeta = module equal UID [AnnotationApplication] [CommentBlock] .

ModuleName      = ( identifier | dot ) .
ImportURI       = text_lit .
StatementImport = import ImportURI as ModuleName [CommentBlock] .

AnnotationScope     = module | union | struct | field | enumerant | enum | api | apimethod | sdk | sdkmethod | const | star .
StatementAnnotation = annotation identifier paren_open AnnotationScope {comma AnnotationScope} [comma] paren_close TypeSpecifier [UID] [CommentBlock] .

StatementConst = const identifier TypeSpecifier equal Value [UID] [AnnotationApplication] [CommentBlock] .

Enumerant       = identifier [UID] [AnnotationApplication] [CommentBlock] .
StatementEnum = enum identifier brace_open [CommentBlock] { Enumerant } brace_close [UID] [AnnotationApplication] [CommentBlock] .

Field           = identifier TypeSpecifier [equal Value] [UID] [AnnotationApplication] [CommentBlock]  .
UnionField      = identifier TypeSpecifier [UID] [AnnotationApplication] [CommentBlock]  .
Union           = union [identifier] brace_open [CommentBlock] { UnionField } brace_close [UID] [AnnotationApplication] [CommentBlock] .
StructElement   = Field | Union .
StatementStruct = struct TypeName brace_open [CommentBlock] { StructElement } brace_close [UID] [AnnotationApplication] [CommentBlock] .

StatementAPI = api TypeName [Extension] brace_open [CommentBlock] { APIMethod } brace_close [UID] [AnnotationApplication] [CommentBlock] .

APIMethodInput    = paren_open TypeSpecifier paren_close .
APIMethodReturns  = returns paren_open TypeSpecifier paren_close .
APIMethod         = identifier APIMethodInput APIMethodReturns [UID] [AnnotationApplication] [CommentBlock] .

Extension = extends paren_open TypeSpecifier { comma TypeSpecifier } [comma] paren_close .

StatementSDK        = sdk TypeName [Extension] brace_open [CommentBlock] { SDKMethod } brace_close [UID] [AnnotationApplication] [CommentBlock] .

SDKMethodParameter  = identifier TypeSpecifier .
SDKMethodInput      = paren_open [SDKMethodParameter {comma SDKMethodParameter} [comma]] paren_close .
SDKMethodReturns    = returns paren_open TypeSpecifier paren_close .
SDKMethod           = identifier SDKMethodInput [SDKMethodReturns] [nothrows] [UID] [AnnotationApplication] [CommentBlock] .

ImplAs          = as paren_open TypeSpecifier { comma TypeSpecifier } [comma] paren_close .
StatementImpl   = impl TypeName ImplAs brace_open [CommentBlock] [ImplRequires] { ImplMethod } brace_close [UID] [AnnotationApplication] [CommentBlock] .

ImplRequirement = identifier TypeSpecifier [CommentBlock] .
ImplRequires    = requires curly_open { ImplRequirement } curl_close .

ImplAPIMethod = identifier APIMethodInput APIMethodReturns ImplBlock [UID] [AnnotationApplication] [CommentBlock] .
ImplSDKMethod = identifier SDKMethodInput [SDKMethodReturns] [nothrows] ImplBlock [UID] [AnnotationApplication] [CommentBlock] .
ImplMethod      = ( ImplAPIMethod | ImplSDKMethod ) .

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

ValueOrInvocation = Invocation | Value .
StepVar = var identifier TypeSpecifier [equal ValueOrInvocation] .

StepProse = prose .

StepSet = set QualifiedIdentifier equal ValueOrInvocation .

Else = else ImplBlock .
ElseIf = else if ValueBinary ImplBlock .
StepIf = if ValueBinary ImplBlock {ElseIf} [Else] .

SwitchCase = case Value {comma Value} ImplBlock .
SwitchDefault = default ImplBlock .
SwitchElement = SwitchCase | SwitchDefault .
StepSwitch = switch Value curly_open {SwitchElement} curl_close .

StepWhile = while ValueBinary ImplBlock .

ForValueName = identifier .
ForKeyName = identifier .
StepFor = for ForKeyName comma ForValueName in Value ImplBlock .

StepReturn = return [Value] .

StepThrow = throw Value .

StepExec = exec Invocation .

Value = ValueUnary | ValueBinary | ValueLiteral | ValueIdentifier .

ValueLiteralList    = square_open [Value {comma Value} {comma}] square_close .

ValueLiteralStruct         = brace_open [ValueLiteralStructPair {comma ValueLiteralStructPair} {comma}] brace_close .
ValueLiteralStructPair    = identifier colon Value .

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

ValueIdentifier = QualifiedIdentifier .

ValueUnary =  (plus | minus | bang ) Value

ValueBinary = paren_open Value ( equal_compare | equal_not | equal_lesser | equal_greater | bool_and | bool_or | bin_and | bin_or | bin_xor | shift_left | shift_right | plus | slash | star | mod ) Value paren_close

Invocation = InvocationAwait | InvocationAsync | InvocationDirect .

InvocationParameters  = Value {comma Value} [comma] .
InvocationCatch       = catch identifier ImplBlock .
InvocationDirect      = ImplIdentifier paren_open [InvocationParameters] paren_close [InvocationCatch] .

InvocationAsync = async ImplIdentifier paren_open [InvocationParameters] paren_close .

InvocationAwait = await identifier [InvocationCatch] .
```
