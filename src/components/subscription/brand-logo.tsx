'use client';

import { useMemo, useState } from 'react';
import { getBrandLogo } from '@/lib/brand-logos';
import { AVATAR_COLORS } from '@/lib/constants';

interface BrandLogoProps {
  name: string;
  logoUrl?: string;
  size?: number;
  className?: string;
}

/**
 * Simple string hash to pick a consistent color for a given name.
 */
function hashStringToIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
}

/**
 * Get 1-2 character initials from a subscription name.
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

/**
 * Renders a brand logo for a subscription.
 *
 * Priority:
 * 1. Custom logoUrl (user-uploaded) -- rendered as <img>
 * 2. Known brand -- colored circle with brand color + initials
 * 3. Unknown brand -- fallback colored circle with initials
 *
 * Always renders something visible.
 */
export function BrandLogo({ name, logoUrl, size = 32, className = '' }: BrandLogoProps) {
  const brand = useMemo(() => getBrandLogo(name), [name]);
  const initials = useMemo(() => getInitials(name), [name]);
  const [imgFailed, setImgFailed] = useState(false);

  const sizeStyle = { width: size, height: size, minWidth: size, minHeight: size };
  const fontSize = Math.max(10, Math.round(size * 0.4));
  const iconSize = Math.round(size * 0.55);

  // 1. User-uploaded custom logo
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`rounded-md object-contain ${className}`}
        style={sizeStyle}
      />
    );
  }

  // 2. Known brand — show SVG icon from CDN with brand-colored background
  if (brand && !imgFailed) {
    const isVeryDark = parseInt(brand.color, 16) < 0x333333;
    const iconFilter = isVeryDark
      ? 'invert(1) brightness(0.9)'
      : 'invert(1)';

    return (
      <div
        className={`rounded-md flex items-center justify-center select-none ${className}`}
        style={{
          ...sizeStyle,
          backgroundColor: `#${brand.color}`,
        }}
        aria-label={name}
      >
        <img
          src={brand.svgUrl}
          alt=""
          width={iconSize}
          height={iconSize}
          style={{ filter: iconFilter }}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  // 3. Fallback — colored circle with initials
  const bgColor = brand
    ? `#${brand.color}`
    : AVATAR_COLORS[hashStringToIndex(name, AVATAR_COLORS.length)];

  return (
    <div
      className={`rounded-md flex items-center justify-center font-semibold select-none ${className}`}
      style={{
        ...sizeStyle,
        backgroundColor: bgColor,
        color: '#FFFFFF',
        fontSize,
        lineHeight: 1,
      }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
