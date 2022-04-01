#!/bin/bash
cat ~/herdRelease.password | jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/herdRelease.keystore ./build/outputs/apk/app-release-unsigned.apk herd
$ANDROID_HOME/build-tools/23.0.1/zipalign -f -v 4 ./build/outputs/apk/app-release-unsigned.apk ./build/outputs/apk/app-release-aligned.apk
