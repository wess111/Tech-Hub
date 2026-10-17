# Tech-Hub

A hands-on technology learning workspace for IT support, hardware, systems, cloud, and cybersecurity. Built from Server Admin Academy, with an independent repository and private review deployment.

## Available now

- Refined dark workspace across the homepage, lab catalog, ticket runner, assessments, capstone, incident investigation, and documentation tools.
- Search and filters by track, activity type, and difficulty.
- Guest dashboard with browser-local activity history, completion records, and progress export.
- PC Builder with original realistic hardware renders, image-based placement targets, specifications research, compatibility checks, power connections, POST, and validation.
- Full PC build persistence across refreshes. Restored builds require fresh validation before a report can be generated.
- Local Word and printable completion reports.

## Still planned

Optional accounts, cross-device progress, public profiles, achievements, and server-verified leaderboards. Current local completion data is for practice, not trusted competitive scoring.

Hardware images are AI-generated category illustrations, not photographs of the catalog's specific manufacturer models. See [asset provenance](assets/hardware/README.md).

## Development

Serve this directory with a static HTTP server, then open `index.html`. JSON activity data requires HTTP rather than a `file:` URL.

Run `node scripts/build-static.cjs` to prepare `dist/`. `.openai/hosting.json` identifies the private review site. Keep its access private while the redesign is under review.

The original project's detailed content and engine documentation is retained in [docs/legacy-academy.md](docs/legacy-academy.md).
