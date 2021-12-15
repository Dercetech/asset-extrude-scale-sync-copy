# Jem's Video game asset sync agent

This utility will watch your source folders. The tool is to be used as-is, forked, enjoyed and improved.

## Motivation

My pipeline involve the following tools, and manual processes:

- Aseprtie
  - Need to export @2x and @3x in separate export steps. Waste of time.
- Tiled
  - Need to keep object sprites in sync with latest design from my workspace.
- Texture Packer
  - Need to manually copy the atlases (png, json, @2x, @3x)

Separate computers involve more copying:

- Graphics design PC with Wacom screen:
  - Draw art.
  - Save to network drive / cloud sync folder.
- Macbook, from could/network drive:
  - extrude & scale tilsets.
  - package atlases.
  - import updated object sprites into tiled.
  - import results into in git workspace.

I needed to take a few shortcuts as these quickly became a waste of time and need a lot of open windows and manual steps.

## Solution

See example
asset-extrude-scale-sync-copy

## How-to use?

- Fork, then create a branch per computer that performs the integration work.
- In that branch, adjust ./src/config.ts.

I left a few configuration items to give you an idea of this tool is used:

Sections below refer to the comments in that file.

### // Tilesets: main game tileset //

- lion-tiles.png is a tileset.
- as such, each update need to overwrite the local working copy in tiled.
- then this tileset needs to be extruded (to avoid sprite bleeding).
- following extrusion, two scaled versions are exported to my git workspace's (pixel art, nearest neighbor algo is used) on top of the unscaled base extruded version.

### // Folder: Props //

Like for the following folders:

- every time a file is modified OR added to one of these folders, then the file is also copied in my git's workspace folder.

## Questions

### Why don't you directly export from your design workspace into your git workspace?

Because multiple computers.

More seriously, I believe it's a better practice to separate the heavy (psd, base textures, etc.) work files from their output. The git folder should only contain output, not source graphics. I rely on a cloud drive (OneDrive, you can tell) to sync between the computers of my company.

### Does this work on Windows computers?

Yep. I'll soon create a branch "xeon-wacom" to show a working example.

## Voila

Hope you like it and that it helps saving some time.

Don't hesitate to share your work with my via twitter:
[@Dercetech](https://twitter.com/dercetech).
