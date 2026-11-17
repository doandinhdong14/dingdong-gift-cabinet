/**
 * placeholders.ts
 *
 * Self-contained aesthetic memory placeholders for LoveUniverse01.
 * Strict compliance with user specifications:
 * - NO Polaroid frames, NO white borders, NO captions, NO icons, NO social card styling.
 * - Pure borderless rectangular 3D photo planes (3:4 portrait aspect ratio).
 * - Neutral aesthetic romantic illustrations/gradients.
 * - Does NOT download strangers' photos from the internet.
 */

function createBorderlessPhotoSvg(
  bgColor1: string,
  bgColor2: string,
  innerArtworkSvg: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
  <defs>
    <linearGradient id="photoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor1}"/>
      <stop offset="100%" stop-color="${bgColor2}"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="40%" stop-color="#FFF" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.38"/>
    </radialGradient>
  </defs>

  <!-- Full Bleed Borderless Photo Area -->
  <rect x="0" y="0" width="300" height="400" fill="url(#photoGrad)"/>

  <!-- Romantic Ambient Artwork -->
  <g>
    ${innerArtworkSvg}
  </g>

  <!-- Photographic Subtle Lens Vignette -->
  <rect x="0" y="0" width="300" height="400" fill="url(#vignette)" style="mix-blend-mode: multiply;"/>
</svg>`;

  if (typeof btoa !== 'undefined') {
    try {
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } catch {
      // fallback
    }
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_UNIVERSE_PLACEHOLDERS: string[] = [
  // 1. Romantic Sunset Mountain Silhouette
  createBorderlessPhotoSvg(
    '#FD746C',
    '#2C3E50',
    `<g opacity="0.95">
      <circle cx="150" cy="140" r="55" fill="#FFEAA7" opacity="0.85"/>
      <path d="M 0,400 L 75,250 L 150,330 L 235,190 L 300,400 Z" fill="#1E272E" opacity="0.9"/>
      <path d="M 120,400 L 205,270 L 300,400 Z" fill="#2C3A47" opacity="0.95"/>
      <circle cx="85" cy="80" r="2.5" fill="#FFF"/>
      <circle cx="225" cy="95" r="2" fill="#FFF"/>
      <circle cx="255" cy="65" r="3" fill="#FFF"/>
    </g>`
  ),

  // 2. Stargazing Under Galaxy
  createBorderlessPhotoSvg(
    '#130f40',
    '#30336b',
    `<g opacity="0.95">
      <ellipse cx="150" cy="180" rx="120" ry="70" fill="none" stroke="#7ed6df" stroke-width="1.5" stroke-dasharray="4,6" opacity="0.6"/>
      <circle cx="150" cy="180" r="30" fill="#f9ca24" opacity="0.25"/>
      <circle cx="150" cy="180" r="16" fill="#f6e58d"/>
      <path d="M 130,360 C 140,320 145,320 150,360 Z" fill="#dff9fb"/>
      <path d="M 152,360 C 160,320 165,320 172,360 Z" fill="#ffbe76"/>
      <circle cx="55" cy="100" r="2" fill="#FFF"/>
      <circle cx="105" cy="50" r="3" fill="#FFF"/>
      <circle cx="245" cy="110" r="2.5" fill="#FFF"/>
      <circle cx="275" cy="200" r="2" fill="#FFF"/>
    </g>`
  ),

  // 3. Sweet Golden Hour Warm Silhouette
  createBorderlessPhotoSvg(
    '#ff9966',
    '#ff5e62',
    `<g opacity="0.95">
      <circle cx="150" cy="160" r="70" fill="#FFF9E6" opacity="0.3"/>
      <circle cx="150" cy="160" r="45" fill="#FFF9E6" opacity="0.6"/>
      <path d="M 60,300 C 100,240 200,240 240,300 L 240,400 L 60,400 Z" fill="#6D214F" opacity="0.75"/>
      <circle cx="150" cy="125" r="10" fill="#FF4757"/>
      <circle cx="105" cy="80" r="2.5" fill="#FFF"/>
      <circle cx="205" cy="90" r="2" fill="#FFF"/>
    </g>`
  ),

  // 4. Soft Pastel Blossom Petals
  createBorderlessPhotoSvg(
    '#a18cd1',
    '#fbc2eb',
    `<g opacity="0.95">
      <circle cx="150" cy="170" r="60" fill="#FFFFFF" opacity="0.4"/>
      <path d="M 150,130 C 170,90 210,110 195,155 C 180,185 150,210 150,210 C 150,210 120,185 105,155 C 90,110 130,90 150,130 Z" fill="#FF6B81"/>
      <circle cx="65" cy="115" r="4" fill="#FFF" opacity="0.8"/>
      <circle cx="235" cy="105" r="5" fill="#FFF" opacity="0.8"/>
      <circle cx="250" cy="245" r="3" fill="#FFF" opacity="0.8"/>
    </g>`
  ),

  // 5. Twilight Crescent Moon Over Lake
  createBorderlessPhotoSvg(
    '#0f2027',
    '#203a43',
    `<g opacity="0.95">
      <path d="M 140,90 A 55,55 0 0,0 195,185 A 46,46 0 0,1 140,90 Z" fill="#FEEAA7"/>
      <circle cx="175" cy="110" r="3" fill="#FFF"/>
      <circle cx="75" cy="165" r="2" fill="#FFF"/>
      <circle cx="225" cy="175" r="2" fill="#FFF"/>
      <path d="M 0,330 C 70,290 140,340 210,310 C 270,280 300,310 300,330 L 300,400 L 0,400 Z" fill="#2C3A47"/>
    </g>`
  ),

  // 6. Sparkling Midnight Lights
  createBorderlessPhotoSvg(
    '#3a1c71',
    '#d76d77',
    `<g opacity="0.95">
      <circle cx="150" cy="160" r="4" fill="#FFF"/>
      <line x1="150" y1="160" x2="150" y2="95" stroke="#FFEAA7" stroke-width="2" stroke-linecap="round"/>
      <line x1="150" y1="160" x2="210" y2="120" stroke="#FFEAA7" stroke-width="2" stroke-linecap="round"/>
      <line x1="150" y1="160" x2="205" y2="205" stroke="#FFEAA7" stroke-width="2" stroke-linecap="round"/>
      <line x1="150" y1="160" x2="150" y2="225" stroke="#FFEAA7" stroke-width="2" stroke-linecap="round"/>
      <line x1="150" y1="160" x2="90" y2="205" stroke="#FFEAA7" stroke-width="2" stroke-linecap="round"/>
      <line x1="150" y1="160" x2="85" y2="120" stroke="#FFEAA7" stroke-width="2" stroke-linecap="round"/>
      <circle cx="150" cy="85" r="5" fill="#FF7675"/>
      <circle cx="215" cy="115" r="5" fill="#74B9FF"/>
      <circle cx="210" cy="210" r="5" fill="#55EFC4"/>
      <circle cx="150" cy="230" r="5" fill="#FDCB6E"/>
      <circle cx="85" cy="210" r="5" fill="#E84393"/>
      <circle cx="80" cy="115" r="5" fill="#A29BFE"/>
    </g>`
  ),
];
