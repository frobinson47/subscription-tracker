/**
 * Brand logo utility — maps subscription names to brand colors
 * and jsDelivr CDN URLs for simple-icons SVGs.
 */

interface BrandInfo {
  slug: string;
  color: string; // hex without #
  svgPath?: string; // inline SVG path data for brands not in simple-icons
}

const BRANDS: Record<string, BrandInfo> = {
  // Streaming
  'netflix': { slug: 'netflix', color: 'E50914' },
  'spotify': { slug: 'spotify', color: '1DB954' },
  'hulu': { slug: 'hulu', color: '1CE783', svgPath: 'M1.6 0C.7 0 0 .7 0 1.6v20.8C0 23.3.7 24 1.6 24h3.2c.9 0 1.6-.7 1.6-1.6V12c0-.9.7-1.6 1.6-1.6h1.6c.9 0 1.6.7 1.6 1.6v10.4c0 .9.7 1.6 1.6 1.6h3.2c.9 0 1.6-.7 1.6-1.6V12c0-4.4-3.6-8-8-8H6.4c-.9 0-1.6-.7-1.6-1.6V1.6C4.8.7 4.1 0 3.2 0z' },
  'disney': { slug: 'disneyplus', color: '113CCF', svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9V7h2v10zm4 0h-2V7h2v10z' },
  'disney+': { slug: 'disneyplus', color: '113CCF', svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9V7h2v10zm4 0h-2V7h2v10z' },
  'youtube': { slug: 'youtube', color: 'FF0000' },
  'youtube premium': { slug: 'youtube', color: 'FF0000' },
  'youtube tv': { slug: 'youtubetv', color: 'FF0000' },
  'amazon prime': { slug: 'amazonprime', color: '0F79AF', svgPath: 'M21.5 16.48a.35.35 0 0 0-.38.04c-2.67 2.02-6.54 3.1-9.87 3.1-4.67 0-8.88-1.77-12.06-4.72-.25-.23-.03-.55.27-.37 3.44 2.05 7.69 3.28 12.08 3.28 2.96 0 6.22-.63 9.22-1.94.45-.2.83.3.38.61h.36zM22.8 14.95c-.34-.45-2.27-.21-3.14-.11-.26.03-.3-.2-.07-.37 1.54-1.1 4.06-.79 4.35-.42.3.38-.08 3.01-1.52 4.27-.22.19-.43.09-.33-.16.33-.82 1.05-2.67.71-3.21z' },
  'prime video': { slug: 'primevideo', color: '1A98FF', svgPath: 'M21.5 16.48a.35.35 0 0 0-.38.04c-2.67 2.02-6.54 3.1-9.87 3.1-4.67 0-8.88-1.77-12.06-4.72-.25-.23-.03-.55.27-.37 3.44 2.05 7.69 3.28 12.08 3.28 2.96 0 6.22-.63 9.22-1.94.45-.2.83.3.38.61h.36zM10 8l5 4-5 4V8z' },
  'apple tv': { slug: 'appletv', color: '000000' },
  'apple tv+': { slug: 'appletv', color: '000000' },
  'apple music': { slug: 'applemusic', color: 'FA243C' },
  'hbo': { slug: 'hbo', color: '000000' },
  'hbo max': { slug: 'hbo', color: '5822B4' },
  'max': { slug: 'hbo', color: '002BE7' },
  'paramount': { slug: 'paramountplus', color: '0064FF' },
  'paramount+': { slug: 'paramountplus', color: '0064FF' },
  'peacock': { slug: 'peacock', color: '000000', svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.79 3 4s-1.34 4-3 4-3-1.79-3-4 1.34-4 3-4zm0 14c-2.67 0-5.02-1.37-6.39-3.44C7.66 14.2 10 13.5 12 13.5s4.34.7 6.39 2.06C17.02 17.63 14.67 19 12 19z' },
  'crunchyroll': { slug: 'crunchyroll', color: 'F47521' },
  'tubi': { slug: 'tubi', color: 'FA382F' },
  'espn': { slug: 'espn', color: 'FF0033', svgPath: 'M2 4v16h20V4H2zm3 12V8h6v2H7v1h3v2H7v1h4v2H5zm8 0V8h4c1.1 0 2 .9 2 2v1c0 .75-.4 1.38-1 1.73V13c.6.35 1 .98 1 1.73V16h-2v-1.5c0-.28-.22-.5-.5-.5H15v2h-2z' },
  'espn+': { slug: 'espn', color: 'FF0033', svgPath: 'M2 4v16h20V4H2zm3 12V8h6v2H7v1h3v2H7v1h4v2H5zm8 0V8h4c1.1 0 2 .9 2 2v1c0 .75-.4 1.38-1 1.73V13c.6.35 1 .98 1 1.73V16h-2v-1.5c0-.28-.22-.5-.5-.5H15v2h-2z' },

  // Music
  'tidal': { slug: 'tidal', color: '000000' },
  'deezer': { slug: 'deezer', color: 'A238FF' },
  'soundcloud': { slug: 'soundcloud', color: 'FF5500' },
  'audible': { slug: 'audible', color: 'F8991C' },
  'pandora': { slug: 'pandora', color: '224099' },

  // Dev tools
  'github': { slug: 'github', color: '181717' },
  'github copilot': { slug: 'githubcopilot', color: '000000' },
  'gitlab': { slug: 'gitlab', color: 'FC6D26' },
  'notion': { slug: 'notion', color: '000000' },
  'slack': { slug: 'slack', color: '4A154B', svgPath: 'M5.04 15.16a2.53 2.53 0 0 1-2.52 2.53A2.53 2.53 0 0 1 0 15.16a2.53 2.53 0 0 1 2.52-2.52h2.52v2.52zm1.27 0a2.53 2.53 0 0 1 2.52-2.52 2.53 2.53 0 0 1 2.52 2.52v6.32A2.53 2.53 0 0 1 8.83 24a2.53 2.53 0 0 1-2.52-2.52v-6.32zM8.83 5.04a2.53 2.53 0 0 1-2.52-2.52A2.53 2.53 0 0 1 8.83 0a2.53 2.53 0 0 1 2.52 2.52v2.52H8.83zm0 1.27a2.53 2.53 0 0 1 2.52 2.52 2.53 2.53 0 0 1-2.52 2.52H2.52A2.53 2.53 0 0 1 0 8.83a2.53 2.53 0 0 1 2.52-2.52h6.31zm10.13 2.52a2.53 2.53 0 0 1 2.52-2.52A2.53 2.53 0 0 1 24 8.83a2.53 2.53 0 0 1-2.52 2.52h-2.52V8.83zm-1.27 0a2.53 2.53 0 0 1-2.52 2.52 2.53 2.53 0 0 1-2.52-2.52V2.52A2.53 2.53 0 0 1 15.17 0a2.53 2.53 0 0 1 2.52 2.52v6.31zm-2.52 10.13a2.53 2.53 0 0 1 2.52 2.52A2.53 2.53 0 0 1 15.17 24a2.53 2.53 0 0 1-2.52-2.52v-2.52h2.52zm0-1.27a2.53 2.53 0 0 1-2.52-2.52 2.53 2.53 0 0 1 2.52-2.52h6.31A2.53 2.53 0 0 1 24 15.17a2.53 2.53 0 0 1-2.52 2.52h-6.31z' },
  'zoom': { slug: 'zoom', color: '0B5CFF' },
  'linear': { slug: 'linear', color: '5E6AD2' },
  'jira': { slug: 'jira', color: '0052CC' },
  'trello': { slug: 'trello', color: '0052CC' },
  'asana': { slug: 'asana', color: 'F06A6A' },
  'monday': { slug: 'mondaydotcom', color: 'FF3D57' },
  'figma': { slug: 'figma', color: 'F24E1E' },
  'canva': { slug: 'canva', color: '00C4CC' },
  'vercel': { slug: 'vercel', color: '000000' },
  'netlify': { slug: 'netlify', color: '00C7B7' },
  'heroku': { slug: 'heroku', color: '430098' },
  'sentry': { slug: 'sentry', color: '362D59' },
  'datadog': { slug: 'datadog', color: '632CA6' },
  'docker': { slug: 'docker', color: '2496ED' },
  'supabase': { slug: 'supabase', color: '3FCF8E' },

  // Cloud & productivity
  'microsoft': { slug: 'microsoft', color: '5E5E5E' },
  'microsoft 365': { slug: 'microsoft365', color: 'E74025' },
  'office': { slug: 'microsoft365', color: 'E74025' },
  'office 365': { slug: 'microsoft365', color: 'E74025' },
  'google': { slug: 'google', color: '4285F4' },
  'google one': { slug: 'googlecloud', color: '4285F4' },
  'google workspace': { slug: 'google', color: '4285F4' },
  'dropbox': { slug: 'dropbox', color: '0061FF' },
  'icloud': { slug: 'icloud', color: '3693F3' },
  'icloud+': { slug: 'icloud', color: '3693F3' },
  'adobe': { slug: 'adobe', color: 'FF0000' },
  'adobe creative cloud': { slug: 'adobecreativecloud', color: 'DA1F26' },
  'photoshop': { slug: 'adobephotoshop', color: '31A8FF' },
  'grammarly': { slug: 'grammarly', color: '15C39A' },
  'todoist': { slug: 'todoist', color: 'E44332' },
  'evernote': { slug: 'evernote', color: '00A82D' },
  'obsidian': { slug: 'obsidian', color: '7C3AED' },

  // AI
  'openai': { slug: 'openai', color: '412991' },
  'chatgpt': { slug: 'openai', color: '412991' },
  'claude': { slug: 'anthropic', color: 'D97757' },
  'anthropic': { slug: 'anthropic', color: 'D97757' },
  'midjourney': { slug: 'midjourney', color: '000000' },
  'copilot': { slug: 'githubcopilot', color: '000000' },

  // Cloud infra
  'aws': { slug: 'amazonwebservices', color: '232F3E' },
  'amazon web services': { slug: 'amazonwebservices', color: '232F3E' },
  'azure': { slug: 'microsoftazure', color: '0078D4' },
  'digitalocean': { slug: 'digitalocean', color: '0080FF' },
  'cloudflare': { slug: 'cloudflare', color: 'F38020' },

  // Gaming
  'twitch': { slug: 'twitch', color: '9146FF' },
  'xbox': { slug: 'xbox', color: '107C10', svgPath: 'M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm-1.05 3.56c-1.1.56-3.4 2.65-4.74 4.25-.08.09-.24.07-.27-.05-.44-1.47-.13-2.6.23-3.17.1-.16.3-.2.46-.12 1.24.63 2.73 1 4.32 1.09zm2.1 0c1.59-.09 3.08-.46 4.32-1.09.16-.08.36-.04.46.12.36.57.67 1.7.23 3.17-.03.12-.19.14-.27.05-1.34-1.6-3.64-3.69-4.74-4.25zm-7.68 5.3c.06-.08.18-.08.23.01 1.72 2.86 4.04 5.98 6.4 8.36.04.04.04.1 0 .14-1.44 1.37-2.9 2.38-3.85 2.82a.22.22 0 0 1-.26-.05C5.52 17.6 3.6 14.49 3.6 12c0-1.2.43-2.28.77-3.14zm17.26 0c.34.86.77 1.94.77 3.14 0 2.49-1.92 5.6-4.29 8.14a.22.22 0 0 1-.26.05c-.95-.44-2.41-1.45-3.85-2.82a.1.1 0 0 1 0-.14c2.36-2.38 4.68-5.5 6.4-8.36.05-.09.17-.09.23-.01z' },
  'xbox game pass': { slug: 'xbox', color: '107C10', svgPath: 'M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm-1.05 3.56c-1.1.56-3.4 2.65-4.74 4.25-.08.09-.24.07-.27-.05-.44-1.47-.13-2.6.23-3.17.1-.16.3-.2.46-.12 1.24.63 2.73 1 4.32 1.09zm2.1 0c1.59-.09 3.08-.46 4.32-1.09.16-.08.36-.04.46.12.36.57.67 1.7.23 3.17-.03.12-.19.14-.27.05-1.34-1.6-3.64-3.69-4.74-4.25zm-7.68 5.3c.06-.08.18-.08.23.01 1.72 2.86 4.04 5.98 6.4 8.36.04.04.04.1 0 .14-1.44 1.37-2.9 2.38-3.85 2.82a.22.22 0 0 1-.26-.05C5.52 17.6 3.6 14.49 3.6 12c0-1.2.43-2.28.77-3.14zm17.26 0c.34.86.77 1.94.77 3.14 0 2.49-1.92 5.6-4.29 8.14a.22.22 0 0 1-.26.05c-.95-.44-2.41-1.45-3.85-2.82a.1.1 0 0 1 0-.14c2.36-2.38 4.68-5.5 6.4-8.36.05-.09.17-.09.23-.01z' },
  'playstation': { slug: 'playstation', color: '003791' },
  'ps plus': { slug: 'playstation', color: '003791' },
  'nintendo': { slug: 'nintendo', color: 'E60012' },
  'nintendo switch online': { slug: 'nintendoswitch', color: 'E60012' },
  'steam': { slug: 'steam', color: '000000' },
  'epic games': { slug: 'epicgames', color: '313131' },
  'ea': { slug: 'ea', color: '000000' },
  'ea play': { slug: 'ea', color: '000000' },

  // Security & VPN
  'nordvpn': { slug: 'nordvpn', color: '4687FF' },
  'expressvpn': { slug: 'expressvpn', color: 'DA3940' },
  '1password': { slug: '1password', color: '3B66BC' },
  'lastpass': { slug: 'lastpass', color: 'D32D27' },
  'bitwarden': { slug: 'bitwarden', color: '175DDC' },
  'dashlane': { slug: 'dashlane', color: '0E353D' },

  // Business & marketing
  'mailchimp': { slug: 'mailchimp', color: 'FFE01B' },
  'stripe': { slug: 'stripe', color: '635BFF' },
  'shopify': { slug: 'shopify', color: '7AB55C' },
  'squarespace': { slug: 'squarespace', color: '000000' },
  'wordpress': { slug: 'wordpress', color: '21759B' },
  'wix': { slug: 'wix', color: '0C6EFC' },
  'twilio': { slug: 'twilio', color: 'F22F46' },

  // Content & social
  'medium': { slug: 'medium', color: '000000' },
  'substack': { slug: 'substack', color: 'FF6719' },
  'patreon': { slug: 'patreon', color: 'FF424D' },
  'linkedin': { slug: 'linkedin', color: '0A66C2' },
  'linkedin premium': { slug: 'linkedin', color: '0A66C2' },
  'twitter': { slug: 'x', color: '000000' },
  'x': { slug: 'x', color: '000000' },
  'x premium': { slug: 'x', color: '000000' },
  'reddit': { slug: 'reddit', color: 'FF4500' },
  'discord': { slug: 'discord', color: '5865F2' },
  'discord nitro': { slug: 'discord', color: '5865F2' },
  'telegram': { slug: 'telegram', color: '26A5E4' },
  'whatsapp': { slug: 'whatsapp', color: '25D366' },
  'signal': { slug: 'signal', color: '3A76F0' },

  // Fitness
  'strava': { slug: 'strava', color: 'FC4C02' },
  'peloton': { slug: 'peloton', color: '181A1D' },
  'duolingo': { slug: 'duolingo', color: '58CC02' },

  // Reading
  'kindle': { slug: 'amazonkindle', color: 'FF9900' },
  'kindle unlimited': { slug: 'amazonkindle', color: 'FF9900' },

  // Databases
  'mongodb': { slug: 'mongodb', color: '47A248' },
  'planetscale': { slug: 'planetscale', color: '000000' },
  'new relic': { slug: 'newrelic', color: '1CE783' },

  // Amazon general
  'amazon': { slug: 'amazon', color: 'FF9900', svgPath: 'M21.5 16.48a.35.35 0 0 0-.38.04c-2.67 2.02-6.54 3.1-9.87 3.1-4.67 0-8.88-1.77-12.06-4.72-.25-.23-.03-.55.27-.37 3.44 2.05 7.69 3.28 12.08 3.28 2.96 0 6.22-.63 9.22-1.94.45-.2.83.3.38.61h.36zM22.8 14.95c-.34-.45-2.27-.21-3.14-.11-.26.03-.3-.2-.07-.37 1.54-1.1 4.06-.79 4.35-.42.3.38-.08 3.01-1.52 4.27-.22.19-.43.09-.33-.16.33-.82 1.05-2.67.71-3.21z' },
};

/**
 * Find the brand slug for a subscription name.
 * Tries exact match first, then partial matching.
 */
function findBrand(name: string): BrandInfo | null {
  const normalized = name.toLowerCase().trim();

  // Exact match
  if (BRANDS[normalized]) {
    return BRANDS[normalized];
  }

  // Partial match: check if any brand key is contained in the name
  for (const [key, info] of Object.entries(BRANDS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return info;
    }
  }

  return null;
}

/**
 * Get brand logo info for a subscription name.
 * Returns the jsDelivr CDN URL for the SVG icon and the brand color.
 */
export function getBrandLogo(name: string): { svgUrl: string; color: string; svgPath?: string } | null {
  const brand = findBrand(name);
  if (!brand) return null;

  return {
    svgUrl: `https://cdn.jsdelivr.net/npm/simple-icons@16/icons/${brand.slug}.svg`,
    color: brand.color,
    svgPath: brand.svgPath,
  };
}

/**
 * Get just the brand color for a subscription name, or null if unknown.
 */
export function getBrandColor(name: string): string | null {
  const brand = findBrand(name);
  return brand ? brand.color : null;
}

/**
 * Brand match result for auto-suggest.
 */
export interface BrandMatch {
  name: string;
  slug: string;
  color: string;
}

/**
 * Search brands by query string. Returns up to 5 matches,
 * prioritizing starts-with over substring matches.
 */
export function searchBrands(query: string): BrandMatch[] {
  if (query.length < 2) return [];
  const q = query.toLowerCase().trim();

  const startsWithMatches: BrandMatch[] = [];
  const substringMatches: BrandMatch[] = [];
  const seen = new Set<string>();

  for (const [key, info] of Object.entries(BRANDS)) {
    if (seen.has(info.slug)) continue;

    if (key.startsWith(q)) {
      seen.add(info.slug);
      startsWithMatches.push({ name: key.charAt(0).toUpperCase() + key.slice(1), slug: info.slug, color: info.color });
    } else if (key.includes(q)) {
      seen.add(info.slug);
      substringMatches.push({ name: key.charAt(0).toUpperCase() + key.slice(1), slug: info.slug, color: info.color });
    }
  }

  return [...startsWithMatches, ...substringMatches].slice(0, 5);
}
