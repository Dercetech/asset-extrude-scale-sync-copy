import { WatchEntry } from "./features/core/models/entry.models";

const watchlist: Record<string, WatchEntry> = {};
(process.env as any).ignoreInfoSegments = 6;

// Tilesets: main game tileset //
watchlist["/Users/jem/OneDrive/Game design/assets/blocky lion/tilesets/lion-tiles.png"] = {
  type: "tileset",
  copy: {
    path: "/Users/jem/Desktop/workspace/blockys-quest-demo/tiled/tilesets/lion-tiles.png",
  },
  extrude: {
    width: 16,
    height: 16,
  },
  scale: {
    scales: [2, 3],
    path: "/Users/jem/Desktop/workspace/blockys-quest-demo/src/assets/game-lion/tiles/",
  },
};

// Folder: Props/collectable (ask Texture Packer to compile) //
watchlist["/Users/jem/OneDrive/Game design/assets/blocky lion/sprites/items/"] = {
  type: "texture-packer",
  cwd: "/Users/jem/OneDrive/Game design/assets/blocky lion/sprites/",
  command: "texturepacker _sprites.tps",
  copyTo: "/Users/jem/Desktop/workspace/blockys-quest-demo/tiled/templates/_images/",
};

// Folder: Props/world (ask Texture Packer to compile) //
watchlist["/Users/jem/OneDrive/Game design/assets/blocky lion/sprites/world/"] = {
  type: "texture-packer",
  cwd: "/Users/jem/OneDrive/Game design/assets/blocky lion/sprites/",
  command: "texturepacker _sprites.tps",
  copyTo: "/Users/jem/Desktop/workspace/blockys-quest-demo/tiled/templates/_images/",
};

// Folder: Props (compiled) //
watchlist["/Users/jem/OneDrive/Game design/assets/blocky lion/sprites/_out/"] = {
  type: "folder",
  copyTo: "/Users/jem/Desktop/workspace/blockys-quest-demo/src/assets/game-lion/atlas/",
};

// Folder: UI: iMothep atlas //
watchlist["/Users/jem/OneDrive/Game design/assets/blocky lion/ui - imhotep/_out/"] = {
  type: "folder",
  copyTo: "/Users/jem/Desktop/workspace/blockys-quest-demo/src/assets/game-lion/features/egyptos/",
};

// Folder: UI: conversations //
watchlist["/Users/jem/OneDrive/Game design/assets/blocky lion/ui/conversation/_out/"] = {
  type: "folder",
  copyTo: "/Users/jem/Desktop/workspace/blockys-quest-demo/src/assets/game-lion/features/egyptos/",
};

// // Folder: tiled sprites //
// watchlist["/Users/jem/OneDrive/Game design/assets/blocky lion/sprites/_tiles/"] = {
//   type: "folder",
//   copyTo: "/Users/jem/Desktop/workspace/blockys-quest-demo/tiled/templates/_images/",
// };

export { watchlist };
