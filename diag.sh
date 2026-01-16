#!/bin/bash
echo "Running diagnostics..." > diag_log.txt
echo "Node version:" >> diag_log.txt
node -v >> diag_log.txt
echo "NPM version:" >> diag_log.txt
npm -v >> diag_log.txt
echo "Running npm run build..." >> diag_log.txt
npm run build >> diag_log.txt 2>&1
echo "Running npx vite --version..." >> diag_log.txt
npx vite --version >> diag_log.txt 2>&1
echo "Listing node_modules/.bin..." >> diag_log.txt
ls node_modules/.bin >> diag_log.txt 2>&1
