# © 2024 Microglot LLC
# SPDX-License-Identifier: CC-BY-SA-4.0

BUILD_DIR = $(PROJECT_PATH)/build
PROJECT_NAME = microglot-dot-org

.PHONY: build preview

preview:
	@ npm run start

build:
	@ npm run build

release: | $(BUILD_DIR)
	@ npx wrangler pages deploy $(BUILD_DIR) --project-name=$(PROJECT_NAME)

ebnf:
	@ scripts/gen-ebnf-idl docs/idl/spec.md docs/idl/spec_ebnf.md

test/license:
	@ pipx run reuse lint
