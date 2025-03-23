#!/bin/sh

DIRNAME=$(basename $(pwd))
GITHUBNAME="$(grep 'name = ' ~/.gitconfig | awk '{print $3}')"
TARGET="${GITHUBNAME}.github.io"

rsync "$@" -av \
  --exclude '*.swp' \
  --exclude '.DS_Store' \
  --exclude '._*' \
  --exclude '.Trash*' \
  --exclude 'Makefile' \
  ./ ~/GitHub/${TARGET}/p5.js/${DIRNAME}

