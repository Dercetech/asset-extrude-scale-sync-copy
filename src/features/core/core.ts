const path = require("path");
const fs = require("fs");

const chokidar = require("chokidar");
const Jimp = require("jimp");
const { extrudeTilesetToImage } = require("tile-extruder");

import { EntryExtrude, EntryScale, FolderWatchEntry, TilesetWatchEntry, WatchEntry } from "./models/entry.models";

let watchlist: Record<string, WatchEntry>;

function start(_watchlist: Record<string, WatchEntry>) {
  watchlist = _watchlist;
  Object.keys(watchlist).forEach((filepath) => registerWatcher(filepath));
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

    case "tileset": {
      watcher.on("change", getTilesetHandler(entry));
      break;
    }
  }
}

function getFolderHandler(entry: FolderWatchEntry) {
  return (changedPath: string) => {
    console.log("------------");
    printDate();

    if ([".png", ".jpg", ".json"].reduce((acc, current) => (changedPath.indexOf(current) > -1 ? true : acc), false)) {
      const filename: string = changedPath.split(path.sep).pop() as string;
      copyEntry(changedPath, entry.copyTo + filename);
    } else {
      console.log("[Core > Folder] Ignoring " + changedPath);
    }
  };
}

function getTilesetHandler(entry: TilesetWatchEntry) {
  return (changedPath: string) => {
    const now = new Date().getTime();
    if (now > (entry?.lastTime || 0) + 5000) {
      console.log("------------");
      entry.lastTime = now;

      setTimeout(async () => {
        copyEntry(changedPath, entry.copy.path);
        const extrudedFilePath = await extrude(changedPath, entry.extrude);
        scale(extrudedFilePath, entry.scale);
      }, 2000);
    }
  };
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
  console.log("[core] tiled copy: " + srcPath.split(path.sep).pop());
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
