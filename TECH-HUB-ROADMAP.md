# Tech-Hub

Tech-Hub evolves Server Admin Academy into a public technology learning platform. The original repository remains independent.

## First review: learning workspace

- Refined dark interface with responsive sidebar navigation.
- Search and track/difficulty filters over the existing activity catalog.
- Guest dashboard using browser-local activity history.
- Completion hooks for resolved ticket sets, passed assessments, and validated simulator builds.
- Progress export and a dashboard-only reset.
- Clear availability labels: accounts, shared rankings, and verified scoring are not implemented yet.

Progress is local practice history, not tamper-proof evidence. No new account or personal information collection is introduced. Existing activity metadata fields remain part of the legacy runners.

## Next: realistic PC Builder

- Consistent fixed-angle case and component imagery with transparent backgrounds.
- Original or appropriately licensed photographs/renders, with an asset attribution record.
- Correct scale, component layering, placement targets, and close-up inspection.
- Full build persistence and resume, with scenario version handling.
- Preserve compatibility, power, POST, and workload requirement rules.

## Then: identity and competition

- Optional accounts and public display names; retain instant guest access.
- Cross-device progress with per-user access controls.
- Server-validated scoring before public leaderboards.
- Achievements, learning sequences, and optional public profiles.

## Run locally

Serve the repository with a static HTTP server. The workspace entry point is `index.html`; legacy runners remain at their existing paths.

## Private review deployment

Run `node scripts/build-static.cjs`. Sites uses the generated `dist/` directory. The tracked `.openai/hosting.json` identifies the private review deployment. Keep its audience private during development.
