# Huncho Tech Studio — AI Live Video Edits

Next.js app for real-time AI video editing using fal.ai's Lucy 2.5 model over WebRTC.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- `@fal-ai/client` for WebRTC realtime connection to `decart/lucy-2-5/realtime`
- Server-side API route (`/api/fal/realtime-token`) generates short-lived JWT tokens so the FAL_KEY stays server-side

## How it works
1. User clicks "Start session" → browser gets webcam via `getUserMedia`
2. `fal.realtime.connect` opens a WebSocket to fal.ai for signaling
3. Server sends ICE servers → browser creates `RTCPeerConnection`, adds webcam tracks, creates offer
4. SDP offer/answer and ICE candidates are exchanged over the WebSocket
5. Processed video arrives as a remote WebRTC track → displayed in the edited stream panel
6. Prompts and reference images are sent via `connection.send()` to change the edit live

## Secrets
- `FAL_KEY` — fal.ai API key (required for the token endpoint to work). Without it the UI renders but video editing won't start. Get it from https://fal.ai/dashboard/keys

## Running locally
```bash
docker compose -f docker-compose.base44.yml up -d
```
App is served on port 3000.
