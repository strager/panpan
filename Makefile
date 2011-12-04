ROOT := $(CURDIR)
BIN_DIR := $(ROOT)/bin
PROD_DIR := $(ROOT)/prod_tmp

DEPLOY_DEST := panpan:panpan-game

SOURCE_FILES = \
	$(shell find src spaceport assets -name '*.js' -or -name '*.jvo' -or -name '*.swf') \
	index.html \
	vendor/q/q.js vendor/unrequire/lib/unrequire.js

DEST_FILES = $(SOURCE_FILES)

all: sgf_jvo

sgf_jvo:
	+makesgf $(MAKEFLAGS) --no-print-directory -C assets/ all

help:
	@echo "make one of:"
	@echo "  deploy"

deploy: $(PROD_DIR)
	rsync -rlt -zv $(PROD_DIR)/ $(DEPLOY_DEST)

# TODO make sgf_jvo a prereq
$(PROD_DIR): $(DEST_FILES)
	@rm -rf $(PROD_DIR)
	@mkdir -p "$@"
	cp -r --parents $^ $(PROD_DIR)

.PHONY: all sgf_jvo help deploy $(PROD_DIR)
