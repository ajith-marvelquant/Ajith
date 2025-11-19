<!-- a2232f0d-42a4-4c0b-ae5f-5157a2eb0c7d 5ab9c6ac-a4dc-4301-95ad-4b57bac8ba06 -->
# Add Global Convert Button

1. Update `[resources/app/node_modules/tadviewer/src/components/FormatPanel.tsx](resources/app/node_modules/tadviewer/src/components/FormatPanel.tsx)` to render a red "Convert" button, wire its click handler to apply the 7-decimal interpretation, and persist the preference (e.g., localStorage) so it re-applies on future loads.
2. Extend `[resources/app/node_modules/tadviewer/src/BinaryFormatOptions.ts](resources/app/node_modules/tadviewer/src/BinaryFormatOptions.ts)` to support a new `decimal-scale-7` interpretation that formats values using a 1e7 scale.
3. Ensure the conversion preference is honored on startup: when the format panel mounts (and/or when schema updates), automatically apply the stored preference so every file opens with readable values once the button has been used.
4. Regenerate compiled assets (`tadapp.bundle.js`, related dist files) and repack `app.asar`, then verify the Convert button behavior across multiple files.

### To-dos

- [x] Unpack resources/app.asar into editable directory for inspection
- [x] Find renderer code that formats parquet values for the grid and understand current handling
- [x] Convert binary OHLC values to decimal numbers before rendering, keeping code change minimal
- [x] Repack app.asar with edits and verify Tad displays decimals correctly
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar
- [ ] Add red Convert button to FormatPanel and wire click handler
- [ ] Implement decimal-scale-7 interpretation and persistence logic
- [ ] Rebuild distributables and repack app.asar