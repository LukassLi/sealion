@echo off
..\node_modules\.bin\tsc -target es5 runSingleTest.ts && node runSingleTest.js && del /s *.js 1>nul