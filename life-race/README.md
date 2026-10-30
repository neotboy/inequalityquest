# Life Race — The Unequal Starting Line

Hosted at https://neotboy.github.io/socialstudies1800/life-race/

The app has a working solo classroom demo. **Live multiplayer only works after a Firebase Realtime Database and anonymous Authentication are provisioned.** GitHub Pages hosts static files and cannot create the Firebase project by itself.

## Firebase setup
1. Create a Firebase project. Enable Authentication > Anonymous sign-in.
2. Create a Realtime Database, in locked mode. Replace its rules with database.rules.json. Be aware these are classroom-demo rules, not anti-cheating production security.
3. Register Web App in Firebase. Paste the Firebase config object into firebase-config.js, replacing null. Include databaseURL.
4. Add neotboy.github.io to Firebase Authentication authorized domains if required.
5. Reload game on GitHub Pages, host a room, test with two different browsers.

Teacher has the lobby code. Each student uses a nickname, no login. Teacher advances 10 shared weeks; each player has 3 actions a week. Extreme class positions are fictional examples, not real data.

Caution: self-managed demo is not a secured, cheat-proof assessment. Nicknames and room codes aren't secret credentials.
