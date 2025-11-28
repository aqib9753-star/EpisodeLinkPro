export interface ProcessedLink {
  originalUrl: string;
  serverName: string; // e.g., "Voe", "Gdrive", "Server 1"
  quality: string;    // e.g., "480p", "720p", "HD"
  filename?: string;
}

export interface EpisodeGroup {
  id: string;         // Unique key, e.g., "S01E01"
  season: number;
  episode: number;
  fullCode: string;   // "S01E01"
  rawTitle: string;   // Picked from one of the lines, usually the filename
  links: ProcessedLink[];
}

export interface ParseResult {
  groups: EpisodeGroup[];
  totalLinks: number;
}
