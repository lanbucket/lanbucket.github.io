# LANBucket Changelog

---

## 1.4.0 — August 23, 2026

- **Much faster file verification.** LANBucket now uses the BLAKE3 hash function instead of SHA-256 for improved performance.
- **New shares reach other people sooner.** Reduced latency for when other clients will discover your shared file.
- **Usable on low-resolution displays.** The window can now be resized far smaller, so the interface stays workable on small or low-resolution screens.

---

## 1.3.1 — July 6, 2026

- **Protection against deleting the original.** "Delete Download" is now greyed out for the person who originally shared an item.
- **Confirmation when closing during active transfers.** Closing LANBucket while work is in flight now warns you..

---

## 1.3.0 — July 6, 2026

- **Name collisions handled properly.** Files and folders that share a name with something already present are no longer confused with each other.
- **Compression tip.** A notice now points out that LANBucket compresses files automatically as it sends them, so there's no need to zip them up first.
- Fixed the "Delete Download" context-menu item not working correctly.

---

## 1.2.2 — July 4, 2026

- **LANBucket is now available in 13 languages:** Arabic, Chinese (Simplified), English, French, German, Hindi, Italian, Japanese, Korean, Portuguese (Brazil), Russian, Spanish, and Vietnamese.

---

## 1.2.1 — July 4, 2026

- **More reliable shutdown.** Fixed the app exit path so LANBucket closes cleanly more reliably.
- Fixed a bug affecting transfers of very large folders.

---

## 1.2.0 — June 22, 2026

- **Reworked delete behavior.** Deleting a downloaded item, or a single file out of a downloaded folder, now behaves more predictably.

---

## 1.1.70 — June 12, 2026

- **Faster, steadier transfers.** A new congestion-control approach keeps throughput high and much less bursty, especially when several clients are swarming at once.
- **Automatic transport selection.** LANBucket now picks the best protocol for your connection, depending on if your client is on WiFi or Ethernet.

---

## 1.1.2 — May 19, 2026

- **Better compression.** Switched to Zstandard for on-the-wire compression, further improving throughput on compressible files.
- Fixed crashes introduced by the new compression support.

---

## 1.1.0 — May 17, 2026

- **Automatic compression during transfer.** Data is compressed using LZ4 as it's sent, improving throughput for compressible files.
- **Network problem detection.** LANBucket now recognizes and warns you about the most common causes of failed or slow transfers
- **Incompatible version warning.** Warns you if another user on your network is running an incompatible version of LANBucket.
- **UI cleanup** better file and folder icons, plus cleanup in the expert settings page.
- **Graceful handling when you run out of disk space** rather than a failed or corrupt download.
- Large-folder performance improvements.
- Fixed the heuristic that decides when to download a file in sequential mode.

---

## 1.0.142 — May 5, 2026

- **Meaningful progress for partial downloads.** Downloading part of a folder now reports progress accurately, and LANBucket automatically picks the best internal format based on how large the share is.
- **Collapse All**, plus a **light/dark mode setting**.
- Fixed the context menu behaving incorrectly during an active download, and fixed double-clicking items in the downloads list.
- Fixed deleting a download triggering an unwanted background re-fetch.

---

## 1.0.138 — April 30, 2026

- **Major transfer performance work** producing significantly higher and more consistent speeds when sharing a file to multiple machines.
---

## 1.0.39 — February 27, 2026

First public release!

- **Cloud discovery service.** Peers can now find each other even when local network discovery alone isn't enough to see one another.
- Restructured the About page and added a "report a bug" link.

---

## 1.0.32 — February 23, 2026

- **Fuzzy search**, so you can find shared items without typing names exactly.
- **Improved "add peer manually" flow**, including a warning if you enter your own address.
- "Open in Explorer" is now greyed out when the files or folders no longer exist on disk.
- More reliable peer status exchange, fixing peers showing stale or incorrect state.
- Fixed a flickering Download button and incorrect authorship display.
- Fixed a crash that could occur while the app was shutting down.

---

## 1.0 — November 2025 – February 2026

Start of the project, a complete rewrite of LANBucket in C++ with a native WinUI interface, replacing the previous C# prototype.

**Interface**

- Explorer-style tree view with lazy loading.
- Drag and drop files into the app to share them.
- Sorting shared items.
- Hashing progress dialog.
- Transfer statistics dialog.
- Resizable left pane and horizontal scrolling in the transfers list.
- First-run tutorial, settings dialog with validation, and an About dialog with acknowledgments.
- Shutdown spinner, since closing can take a moment while data is flushed.

**Fixes and refinements**

- Move and cancel in-progress downloads.
- Scalability and responsiveness fixes for folders containing large numbers of files.
- Fixed sharing single-file folders, and folder sharing bugs generally.
- Fixed the app freezing on close and various shutdown hangs.
- Fixed download progress and completion state not always updating correctly.
