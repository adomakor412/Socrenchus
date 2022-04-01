# Setup

## Local development environment

Checkout the repo and install the dependancies...

    cd herd
    npm install

Setup environment variables in `.env` file, take a look at `.env.example`.

Run the server

    npm run server
    
Run the packager

    npm start

Build the native app for the ios simulator...

    npm run build:ios:simulator

Launch the 'iOS Simulator'

    open /Applications/Xcode.app/Contents/Applications/iOS\ Simulator.app

Click on the herd icon and start playing

# Deploy

## Push to Dokku
If you haven't already done so, add the staging server...

    git remote add dokku dokku@a.socrench.us:herd

Then push..

    git push dokku master

## Rebuild iOS app
If native modules changed and the build no longer works, you need to rebuild it.

Then, if you are building for the simulator..
   
    npm run build:ios:simulator

## Generate appetize.io link
1. Go to: https://appetize.io/upload
2. Select the file: `~/Library/Developer/Xcode/DerivedData/Herd-<randomness>/Build/Products/Debug-iphonesimulator/herd`
3. Enter email
4. Copy link and send it out