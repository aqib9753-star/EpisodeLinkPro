import { EpisodeGroup, ProcessedLink, ParseResult } from '../types';

/**
 * Identifies the server name based on the domain or specific keywords.
 */
const identifyServer = (url: string): string => {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('voe.sx') || lowerUrl.includes('voe.sh')) return 'Voe';
  if (lowerUrl.includes('dintezuvio') || lowerUrl.includes('mixdrop')) return 'Mixdrop';
  if (lowerUrl.includes('mazamo') || lowerUrl.includes('embed4me')) return 'Mazamo';
  if (lowerUrl.includes('hglink') || lowerUrl.includes('hydrax')) return 'HydraX';
  if (lowerUrl.includes('google') || lowerUrl.includes('drive')) return 'GDrive';
  if (lowerUrl.includes('mega.nz') || lowerUrl.includes('mega.co')) return 'Mega';
  if (lowerUrl.includes('mediafire')) return 'MediaFire';
  if (lowerUrl.includes('streamtape')) return 'StreamTape';
  if (lowerUrl.includes('dood')) return 'DoodStream';
  
  // Fallback to extraction of domain name
  try {
    const hostname = new URL(url).hostname;
    // Remove www. and get the first part of domain
    let name = hostname.replace('www.', '').split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch (e) {
    return 'Server';
  }
};

/**
 * Extracts quality from text (480p, 720p, 1080p, etc.)
 */
const identifyQuality = (text: string): string => {
  const qualityRegex = /(480p|720p|1080p|2160p|4k|hd|sd|cam|webrip|bluray)/i;
  const match = text.match(qualityRegex);
  return match ? match[1].toUpperCase() : 'HD'; // Default to HD if not found, looked better than "Unknown"
};

/**
 * Robust episode extraction.
 * Handles: S01E01, 1x01, Episode 1, Ep 1, Season 1 Episode 1
 */
const extractEpisodeInfo = (text: string): { season: number; episode: number } | null => {
  // Pattern 1: S01E01 (Standard) - most reliable
  const sxxexx = /s(\d{1,2})\s*e(\d{1,2})/i.exec(text);
  if (sxxexx) return { season: parseInt(sxxexx[1]), episode: parseInt(sxxexx[2]) };

  // Pattern 2: 1x01 (Short style)
  const xPattern = /\b(\d{1,2})x(\d{1,2})\b/.exec(text);
  if (xPattern) return { season: parseInt(xPattern[1]), episode: parseInt(xPattern[2]) };

  // Pattern 3: Season 1 Episode 1 (Long style)
  const longPattern = /season\s*(\d{1,2}).*?episode\s*(\d{1,2})/i.exec(text);
  if (longPattern) return { season: parseInt(longPattern[1]), episode: parseInt(longPattern[2]) };

  // Pattern 4: Ep 1 or Episode 1 (Assumes Season 1 if no season mentioned nearby)
  // We use \b to ensure we don't match random numbers inside other words
  const epPattern = /\b(?:ep|episode)\s*(\d{1,2})\b/i.exec(text);
  if (epPattern) return { season: 1, episode: parseInt(epPattern[1]) };

  return null;
};

export const parseInputText = (input: string): ParseResult => {
  const groups: Record<string, EpisodeGroup> = {};
  let totalLinksCount = 0;
  
  // State to remember the last identified episode (for header-style formatting)
  let currentContext: { season: number; episode: number; fullCode: string; rawTitle: string } | null = null;

  const lines = input.split(/\r?\n/);

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // 1. Try to extract Episode Info from THIS line
    const epInfo = extractEpisodeInfo(trimmedLine);
    
    // 2. Identify Quality in THIS line
    const quality = identifyQuality(trimmedLine);

    // 3. Find ALL URLs in this line
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = trimmedLine.match(urlRegex) || [];

    // LOGIC: Update Context if Episode Info is found
    if (epInfo) {
      const code = `S${epInfo.season.toString().padStart(2, '0')}E${epInfo.episode.toString().padStart(2, '0')}`;
      // Clean the title by removing URLs to make it look nice
      const cleanTitle = trimmedLine.replace(urlRegex, '').trim() || `Episode ${epInfo.episode}`;
      
      currentContext = {
        season: epInfo.season,
        episode: epInfo.episode,
        fullCode: code,
        rawTitle: cleanTitle
      };
    }

    // LOGIC: If we have URLs, process them
    if (urls.length > 0) {
      // Use current context if available, otherwise default to S01E01
      const effectiveSeason = currentContext?.season || 1;
      const effectiveEpisode = currentContext?.episode || 1;
      const effectiveCode = currentContext?.fullCode || 'S01E01';
      const effectiveTitle = currentContext?.rawTitle || 'Unknown Episode';

      // Ensure group exists
      if (!groups[effectiveCode]) {
        groups[effectiveCode] = {
          id: effectiveCode,
          season: effectiveSeason,
          episode: effectiveEpisode,
          fullCode: effectiveCode,
          rawTitle: effectiveTitle,
          links: []
        };
      }

      // Add all URLs found in this line to the group
      urls.forEach(url => {
        const serverName = identifyServer(url);
        
        // Check if this specific link already exists to prevent exact duplicates
        const exists = groups[effectiveCode].links.some(l => l.originalUrl === url);
        if (!exists) {
          groups[effectiveCode].links.push({
            originalUrl: url,
            serverName: serverName,
            quality: quality, // Applies line-level quality to the link
            filename: effectiveTitle
          });
          totalLinksCount++;
        }
      });
    }
  });

  // Convert map to array and Sort by Season/Episode
  const sortedGroups = Object.values(groups).sort((a, b) => {
    if (a.season !== b.season) return a.season - b.season;
    return a.episode - b.episode;
  });

  // Sort links within groups:
  // 1. By Quality (High to Low logic can be complex, string compare is basic)
  // 2. By Server Name
  sortedGroups.forEach(group => {
    group.links.sort((a, b) => {
      // First by server name
      return a.serverName.localeCompare(b.serverName);
    });
  });

  return {
    groups: sortedGroups,
    totalLinks: totalLinksCount
  };
};

export const generateHtmlForGroup = (group: EpisodeGroup): string => {
  const linksHtml = group.links.map(link => 
    `  <li>
    <a href="${link.originalUrl}" target="_blank" rel="noopener noreferrer" class="download-link">
      <span class="server">${link.serverName}</span> 
      <span class="quality badge">${link.quality}</span>
    </a>
  </li>`
  ).join('\n');

  return `<div class="episode-container" data-episode="${group.fullCode}">
  <h3 class="episode-title">
    <span class="ep-code">${group.fullCode}</span>
  </h3>
  <ul class="link-list">
${linksHtml}
  </ul>
</div>`;
};
