const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const chokidar = require("chokidar");
const Jimp = require("jimp");
const { extrudeTilesetToImage } = require("tile-extruder");

import { EntryExtrude, EntryScale, FolderWatchEntry, TexturePackerWatchEntry, TilesetWatchEntry, WatchEntry } from "./models/entry.models";

let watchlist: Record<string, WatchEntry>;

function start(_watchlist: Record<string, WatchEntry>) {
  // watchlist = _watchlist;

  watchlist = Object.keys(_watchlist).reduce((acc, current) => {
    const entry = _watchlist[current];
    const fixedUrl = addSuffixSeparator(current);
    return { ...acc, [fixedUrl]: validatePaths(entry) };
  }, {});

  Object.keys(watchlist).forEach((filepath) => registerWatcher(filepath));
}

function validatePaths(entry: WatchEntry): WatchEntry {
  switch (entry.type) {
    case "folder": {
      return { ...entry, copyTo: addSuffixSeparator(entry.copyTo) } as FolderWatchEntry;
    }
    case "texture-packer": {
      return { ...entry, copyTo: addSuffixSeparator(entry.copyTo) } as TexturePackerWatchEntry;
    }
    case "tileset": {
      return { ...entry, copy: { ...entry.copy, path: addSuffixSeparator(entry.copy.path) } } as TilesetWatchEntry;
    }
  }
}

function addSuffixSeparator(filepath: string) {
  return filepath ? `${filepath}${filepath[filepath.length - 1] === path.sep ? "" : path.sep}` : null;
}

function registerWatcher(filePath: string) {
  console.log(
    "[Core] Now watching " +
      filePath
        .split(path.sep)
        .slice((process.env as any).ignoreInfoSegments as number)
        .join(path.sep)
  );

  const watcher = chokidar.watch(filePath, { ignoreInitial: true });
  // const parentFolder: string = filePath.split(path.sep).slice(0, -1).join(path.sep);

  // const entry: WatchEntry = watchlist[filePath] || watchlist[parentFolder + "/*.png"];

  const entry: WatchEntry = watchlist[filePath];
  switch (entry.type) {
    case "folder": {
      const handler = getFolderHandler(entry);
      watcher.on("add", handler);
      watcher.on("change", handler);
      break;
    }

    case "texture-packer": {
      const handler = getTexturePackerHandler(entry);
      watcher.on("add", handler);
      watcher.on("change", handler);
      break;
    }

    case "tileset": {
      watcher.on("change", getTilesetHandler(entry));
      break;
    }
  }
}

function getFolderHandler(entry: FolderWatchEntry) {
  return (changedPath: string) => {
    printSeparator();

    if ([".png", ".jpg", ".json"].reduce((acc, current) => (changedPath.indexOf(current) > -1 ? true : acc), false)) {
      const filename: string = changedPath.split(path.sep).pop() as string;
      copyEntry(changedPath, entry.copyTo + filename);
    } else {
      console.log("[Core > Folder] Ignoring " + changedPath);
    }
  };
}

function getTexturePackerHandler(entry: TexturePackerWatchEntry) {
  return (changedPath: string) => {
    if ([".png", ".jpg", ".json"].reduce((acc, current) => (changedPath.indexOf(current) > -1 ? true : acc), false)) {
      if (entry.copyTo) {
        const filename: string = changedPath.split(path.sep).pop() as string;
        copyEntry(changedPath, entry.copyTo + filename);
      }

      delayOperation(
        entry,
        10000, // in case of batch writing (ie. aseprite frames export) we don't want to run texture packer multiple times
        5000, // Same thing. Don't re-create texture atlas upon first write. Waiting a delay is a safe way to run after the last write.
        async () => {
          printSeparator();
          console.log("[Core > Folder] running " + entry.command + " ...");
          exec(entry.command, { cwd: entry.cwd }, function (error: any, stdout: any, stderr: any) {
            if (error) {
              console.error("[Core > TexturePacker] Error " + error);
            } else {
              console.log("[Core > Folder] " + entry.command + " successful!");
            }
          });
        }
        // Ignore bursts
        // () => console.log("[Core > Folder] Ignoring (burst) " + changedPath)
      );
    } else {
      // Ignore file types
      console.log("[Core > Folder] Ignoring file type" + changedPath);
    }
  };
}

function getTilesetHandler(entry: TilesetWatchEntry) {
  return (changedPath: string) => {
    printSeparator();
    delayOperation(entry, 5000, 2000, async () => {
      copyEntry(changedPath, entry.copy.path);
      const extrudedFilePath = await extrude(changedPath, entry.extrude);
      scale(extrudedFilePath, entry.scale);
    });
  };
}

function printSeparator() {
  console.log("------------");
  printDate();
}

function delayOperation(entry: WatchEntry, minDelay: number, timeout: number, onOk: () => void, onReject?: () => void) {
  const now = new Date().getTime();
  if (now > (entry?.lastTime || 0) + minDelay) {
    entry.lastTime = now;
    setTimeout(onOk, timeout);
  } else if (onReject) {
    onReject();
  }
}

function printDate() {
  const date = new Date();
  console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
}

async function extrude(srcPath: string, config: EntryExtrude) {
  const targetPath = srcPath.replace(".png", "-extruded.png");
  await extrudeTilesetToImage(config.width, config.height, srcPath, targetPath);
  console.log("[core] extruded: " + targetPath.split(path.sep).pop());
  return targetPath;
}

async function scale(srcPath: string, config: EntryScale) {
  const srcFileName = srcPath.split(path.sep).pop() as string;

  console.log("[core] copying: " + srcFileName);

  return Promise.all([
    // copy the no-scale version
    fsCopy(srcPath, config.path + srcFileName),
    // create scaled versions
    config.scales.map((scale) =>
      Jimp.read(srcPath).then((image: any) => {
        const targetFileName = srcFileName.replace(".png", `@${scale}x.png`);
        const scaledPath = config.path + targetFileName;
        console.log("[core] scaling: " + targetFileName);
        return image.scale(scale, Jimp.RESIZE_NEAREST_NEIGHBOR).write(scaledPath);
      })
    ),
  ]);
}

async function copyEntry(srcPath: string, destPath: string) {
  await fsCopy(srcPath, destPath);
  console.log("[core] copy to workspace / tiled : " + srcPath.split(path.sep).pop());
}

async function fsCopy(source: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.copyFile(source, dest, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export { start };
