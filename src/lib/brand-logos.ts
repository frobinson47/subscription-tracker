/**
 * Brand logo utility — maps subscription names to brand colors
 * and jsDelivr CDN URLs for simple-icons SVGs.
 */

interface BrandInfo {
  slug: string;
  color: string; // hex without #
}

const BRANDS: Record<string, BrandInfo> = {
  // Streaming
  'netflix': { slug: 'netflix', color: 'E50914' },
  'spotify': { slug: 'spotify', color: '1DB954' },
  'hulu': { slug: 'hulu', color: '1CE783' },
  'disney': { slug: 'disneyplus', color: '113CCF' },
  'disney+': { slug: 'disneyplus', color: '113CCF' },
  'youtube': { slug: 'youtube', color: 'FF0000' },
  'youtube premium': { slug: 'youtube', color: 'FF0000' },
  'youtube tv': { slug: 'youtubetv', color: 'FF0000' },
  'amazon prime': { slug: 'amazonprime', color: '0F79AF' },
  'prime video': { slug: 'primevideo', color: '1A98FF' },
  'apple tv': { slug: 'appletv', color: '000000' },
  'apple tv+': { slug: 'appletv', color: '000000' },
  'apple music': { slug: 'applemusic', color: 'FA243C' },
  'hbo': { slug: 'hbo', color: '000000' },
  'hbo max': { slug: 'hbo', color: '5822B4' },
  'max': { slug: 'hbo', color: '002BE7' },
  'paramount': { slug: 'paramountplus', color: '0064FF' },
  'paramount+': { slug: 'paramountplus', color: '0064FF' },
  'peacock': { slug: 'peacock', color: '000000' },
  'crunchyroll': { slug: 'crunchyroll', color: 'F47521' },
  'tubi': { slug: 'tubi', color: 'FA382F' },

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
  'slack': { slug: 'slack', color: '4A154B' },
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
  'xbox': { slug: 'xbox', color: '107C10' },
  'xbox game pass': { slug: 'xbox', color: '107C10' },
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
  'amazon': { slug: 'amazon', color: 'FF9900' },
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
export function getBrandLogo(name: string): { svgUrl: string; color: string } | null {
  const brand = findBrand(name);
  if (!brand) return null;

  return {
    svgUrl: `https://cdn.jsdelivr.net/npm/simple-icons@16/icons/${brand.slug}.svg`,
    color: brand.color,
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
