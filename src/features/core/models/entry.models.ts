export interface EntryExtrude {
  width: number;
  height: number;
  // path: string;
}

export interface EntryCopy {
  path: string;
}

export interface EntryScale {
  scales: number[];
  path: string;
}

export interface AbstractWatchEntry {
  lastTime?: number;
}

export interface TilesetWatchEntry extends AbstractWatchEntry {
  type: "tileset";
  extrude: EntryExtrude;
  copy: EntryCopy;
  scale: EntryScale;
}

export interface TexturePackerWatchEntry extends AbstractWatchEntry {
  type: "texture-packer";
  cwd: string;
  command: string;
  copyTo?: string;
  delay?: number;
}

export interface FolderWatchEntry extends AbstractWatchEntry {
  type: "folder";
  copyTo: string;
}

export type WatchEntry = FolderWatchEntry | TilesetWatchEntry | TexturePackerWatchEntry;
