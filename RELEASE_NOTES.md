# Release Notes

## v0.3.0 - 2026-05-24

This release turns Codex Voice Reply from a script-centered voice helper into a more complete project voice configuration experience.

### Highlights

- Added a local configuration UI at `http://127.0.0.1:47321/` for choosing per-project voice modes without hand-editing JSON.
- Added user-facing project tags such as `coding_quiet`, `product_warm`, `learning_narrator`, `voice_lab_cute`, and `silent_project`.
- Added automatic voice-mode assignment for projects without local voice settings.
- Added multilingual UI and preview support for Simplified Chinese, English, French, Japanese, and Korean.
- Added temporary custom voice draft generation from a user-provided name and preference prompt.
- Added preview generation for selected voices and custom voice drafts.
- Expanded built-in voice sample metadata with A-series baseline samples and anime-style role samples.
- Refactored the README for GitHub discovery: value proposition, pain points, target users, feature highlights, use cases, and roadmap.

### Validation Checklist

- JSON configuration files parse successfully.
- PowerShell scripts parse successfully.
- Neural TTS can generate an MP3 with `-NoPlay`.
- The local configuration UI can start and serve the static app.
- Generated output, virtual environments, local project settings, logs, and cache files remain ignored.

### Notes

- `v0.2.0` already exists as a tag on the previous `main` state, so this release is prepared as `v0.3.0`.
- The configuration UI writes local project files only after explicit user action.
- Custom voice generation maps preferences to available edge-tts voices and parameters; it does not train or clone a voice model.

### Next Roadmap

- Add a one-command health check for Python, edge-tts, players, permissions, project settings, silence rules, output paths, and network access.
- Add schema validation and a `resolve-voice-strategy` helper so users can see exactly why a project will speak or stay silent.
- Improve the configuration UI with import/export, diff, rollback, batch preview, project search, pinned projects, and clearer error states.
- Add event-specific voice triggers for test pass/fail, waiting for user input, downloads, command timeouts, authorization, and unexpected failures.
- Build voice sample comparison reports with listening lists, parameter tables, use-case notes, user ratings, and recommendations.
- Strengthen cross-platform fallback playback for Linux and offline macOS scenarios.
- Prepare release assets, privacy scans, demo material, and plugin marketplace packaging for broader GitHub discovery.
