@echo off
git status > status_check.txt 2>&1
echo ---LOG--- >> status_check.txt
git log -1 >> status_check.txt 2>&1
