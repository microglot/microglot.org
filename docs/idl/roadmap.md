---
# © 2024 Microglot LLC
# SPDX-License-Identifier: CC-BY-SA-4.0
sidebar_position: 99
---

# Roadmap

The initial development roadmap will focus on Go as the target language for code
generation and will expand to other target languages once the IDL is more
stable. The rough outline and order of features we're thinking about are:

- Improved compatibility with Protocol Buffers
- An `impl` type for defining implementation details
- An embedded scripting language to describe implementation logic that generates
  to code
- Ability to describe implementation dependencies
- Syntax for defining operational constraints such as SLOs and idempotency
- Generation of contract tests
- Native compiler plugin protocol
- Language expansion (Python, JS/TS, Java)
- Dev tooling (language server, syntax highlighting, etc.)

We don't have any timeline to offer for when these will be done or a guarantee
that any individual item will actually be worked on.
