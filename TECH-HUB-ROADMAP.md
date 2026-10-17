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

## Second review: consistent activity experience

- Shared workspace navigation and charcoal/lime surfaces across all runners and tools.
- Previous domain/mode catalog URLs redirect into the new catalog with matching filters.
- Realistic rendered case and components integrated into the PC Builder.
- Browser-local restoration of installed components, memory slots, cables, and power state; validation must be repeated after restore.
- Optional display name in PC Builder with guest default.
- Browser validation: complete $581 workstation build reached POST PASS and 7/7 requirements; motherboard and CPU persisted across refresh; assessment navigation, capstone review, and Word export worked; mobile PC Builder at 390px showed no horizontal overflow.

Remaining: accounts, synchronized progress, achievements and verified competitive rankings. Images illustrate categories rather than exact product models. Free rotation and physical 3D geometry are not implemented.
