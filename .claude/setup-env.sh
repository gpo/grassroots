#!/bin/bash
# Claude Code cloud environments: reference this from the environment's
# Setup script field (see README) to pre-bake this repo's dependencies into
# the cached environment image. Sessions then start warm; the SessionStart
# hook re-runs the same steps per session as a fast, idempotent reconciler
# (and restarts services, which the image cache never preserves).
#
# Fail-soft: a broken install must not block environment creation.
set -u
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

CLAUDE_CODE_REMOTE=true CLAUDE_PROJECT_DIR="$REPO_DIR" \
  bash "$REPO_DIR/.claude/hooks/session-start.sh" || true
