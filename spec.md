# Specification

## Summary
**Goal:** Add image sharing and emoji picker support to the ChatFlow messaging experience.

**Planned changes:**
- Extend the backend message data model to include an optional image field (base64 data URL), update send and retrieve functions to handle image messages
- Add an image attachment button to the message input bar that opens a file picker (PNG, JPG, GIF, WebP), shows a thumbnail preview above the input before sending, and displays sent/received images as bubbles in the chat view with tap-to-expand support
- Add an emoji picker button to the message input bar that toggles a compact panel above the input with emoji categories, a search field, and inserts selected emojis at the cursor position

**User-visible outcome:** Users can attach and send images directly in chat, preview them before sending, and view received images inline. Users can also browse and insert emojis into messages via a compact picker panel.
