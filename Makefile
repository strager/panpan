ROOT := $(CURDIR)
PROD_ROOT := $(ROOT)/prod_tmp
PROD_WWW := $(PROD_ROOT)/www
PROD_SERVER := $(PROD_ROOT)/server

DEPLOY_WWW_HOST := panpan
DEPLOY_WWW_PATH := panpan/www

DEPLOY_SERVER_HOST := panpan
DEPLOY_SERVER_PATH := panpan/server

WWW_FILES = \
	$(shell find $(ROOT)/./src $(ROOT)/./spaceport $(ROOT)/./assets -name '*.js' -or -name '*.jvo' -or -name '*.swf') \
	$(ROOT)/./index.html \
	$(ROOT)/./vendor/q/q.js $(ROOT)/./vendor/unrequire/lib/unrequire.js

SERVER_FILES = \
       $(shell find $(ROOT)/server/. -path '**/node_modules' -prune -or \( -name '*.js' -or -name 'package.json' \) -print) \
       server/./pub/ \
       server/./restart.sh

all: sgf_jvo

clean:
	@rm -rf $(PROD_ROOT)
	@+makesgf $(MAKEFLAGS) --no-print-directory -C assets/ clean

sgf_jvo:
	+makesgf $(MAKEFLAGS) --no-print-directory -C assets/ all

help:
	@echo "make one of:"
	@echo "  deploy"

deploy: $(PROD_WWW) $(PROD_SERVER)
	rsync -azv $(PROD_WWW)/ $(DEPLOY_WWW_HOST):$(DEPLOY_WWW_PATH)
	rsync -azv $(PROD_SERVER)/ $(DEPLOY_SERVER_HOST):$(DEPLOY_SERVER_PATH)
	ssh $(DEPLOY_SERVER_HOST) -- source '$$HOME/.profile' '&&' cd $(DEPLOY_SERVER_PATH) '&&' ./restart.sh

$(PROD_ROOT): $(PROD_WWW) $(PROD_SERVER)

# TODO make sgf_jvo a prereq
$(PROD_WWW): $(WWW_FILES)
	@rm -rf "$@"
	@mkdir -p "$@"
	rsync -aR $^ "$@"

$(PROD_SERVER): $(SERVER_FILES)
	@rm -rf "$@"
	@mkdir -p "$@"
	rsync -aR $^ "$@"

.PHONY: all sgf_jvo help deploy $(PROD_DIR)
