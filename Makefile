GIT=git

STROPHEJS_GIT=git://github.com/owengriffin/strophejs.git
STROPHEJS_BRANCH=master
STROPHEJS_DIR=strophejs

ACTIVITYSTREAMS_GIT=git://github.com/harlanji/activitystreams-js.git
ACTIVITYSTREAMS_BRANCH=master
ACTIVITYSTREAMS_DIR=activitystreams-js

# override branches in Local.mk, which is ignored by git.
-include Local.mk

all:	deps

$(STROPHEJS_DIR):
	$(GIT) clone -b $(STROPHEJS_BRANCH) $(STROPHEJS_GIT) $(STROPHEJS_DIR)

$(ACTIVITYSTREAMS_DIR):
	$(GIT) clone -b $(ACTIVITYSTREAMS_BRANCH) $(ACTIVITYSTREAMS_GIT) $(ACTIVITYSTREAMS_DIR)


deps:	$(STROPHEJS_DIR) $(ACTIVITYSTREAMS_DIR)
	

clean:
	rm -rf $(STROPHEJS_DIR) $(ACTIVITYSTREAMS_DIR)
