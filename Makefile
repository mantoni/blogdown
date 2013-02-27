SHELL := /bin/bash

default: lint test

lint:
	@node_modules/.bin/autolint --once

.PHONY: test
test:
	@node -e "require('urun')('test', { include: /\-test\.js$$/ });"

compile: lint test
	@nomo
	@node_modules/.bin/uglifyjs hub.js > hub.min.js

version := $(shell node -e "console.log(require('./package.json').version)")

release:
ifeq (v${version},$(shell git tag -l v${version}))
	@echo "Version ${version} already released!"
	@exit 1
endif
	@echo "Creating tag v${version}"
	@git tag -a -m "Release ${version}" v${version}
	@git push --tags
	@echo "Publishing to NPM"
	@npm publish
