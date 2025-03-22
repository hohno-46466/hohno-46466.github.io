#!/bin/sh

DIRNAME=$(basename $(pwd))
TARGET="hohno-46466.github.io"

rsync "$@" -av \
  --exclude '*.swp' \
  --exclude '.DS_Store' \
  --exclude '._*' \
  --exclude '.Trash*' \
  ./ ~/GitHub/${TARGET}/p5.js/${DIRNAME}

