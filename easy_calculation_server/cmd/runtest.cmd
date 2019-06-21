@echo off
..\node_modules\.bin\tsc -target es5 runTest.ts && node runTest.js && del /s *.js 1>nul