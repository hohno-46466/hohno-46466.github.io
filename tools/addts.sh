#!/bin/sh
while IFS= read -r line; do printf "$(whoami)-$$\t$(date +%s.%3N)\t$line\n"; done 
