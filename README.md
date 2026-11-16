# Buddy website

Public static website for https://meetbuddy.me.

Source: https://github.com/ilinii/buddy, AGPL-3.0-only.

Built from source commit d46f7df using `npm ci`, `BUDDY_VOICE_GATEWAY` set to the public gateway origin, and `npm run website:build`. Only generated public website files belong here. Keep CNAME and .nojekyll.

The browser demo uses local storage and clearly marked sample meetings. The explicit 45-second live voice trial calls a separately hosted, bounded gateway. Its Deepgram key is a server-side secret; this repository has no provider credentials. Durable limits: 20 starts/day and 100 total. Native transcription is configured separately in Buddy.
