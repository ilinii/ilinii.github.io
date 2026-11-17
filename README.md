# Buddy website

Public static website for https://meetbuddy.me.

Source: https://github.com/ilinii/buddy, AGPL-3.0-only.

Built from source commit dd00dc2 using `npm ci`, `BUDDY_VOICE_GATEWAY` set to the public gateway origin, and `npm run website:build`. Only generated public website files belong here. Keep CNAME and .nojekyll.

The browser demo uses local storage and clearly marked sample meetings. The explicit 45-second live voice trial calls a separately hosted, bounded gateway. Its Deepgram key is a server-side secret; this repository has no provider credentials. Durable limits: 20 starts/day and 100 total. Native transcription is configured separately in Buddy.

The compact page leads with live transcription, combines workspace/context into one walkthrough, and shows the owner-proposed managed plan from $8.90/month as Coming soon. It does not accept payments or provision managed accounts.

17 November: restored seven glass FAQ answers; Record / Ask walkthrough; free-local setup title; public GitHub stars; real unsigned Windows preview download. Both hostnames are configured for certificate renewal; do not claim www TLS is repaired until it validates.
