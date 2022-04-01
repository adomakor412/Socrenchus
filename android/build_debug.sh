#!/bin/bash

sed -i -e 's/com.herditall.herd/com.herditall.herd.debug/g' app/build.gradle
./gradlew assembleDebug
sed -i -e 's/com.herditall.herd.debug/com.herditall.herd/g' app/build.gradle
