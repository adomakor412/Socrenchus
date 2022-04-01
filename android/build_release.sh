#!/bin/bash

mv ../.env ../.env.tmp
cp ../.env.production ../.env
vim ./app/build.gradle
./gradlew assembleRelease
cd app/
./sign_apk.sh
mv ../../.env.tmp ../../.env
