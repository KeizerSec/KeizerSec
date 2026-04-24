#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const USERNAME = process.env.THM_USERNAME || 'Keizer';
const OUTPUT_PATH = process.env.OUTPUT_PATH || 'assets/thm_badge.svg';
const API_URL = `https://tryhackme.com/api/v2/public-profile?username=${encodeURIComponent(USERNAME)}`;

function formatPoints(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (n >= 1_000) return n.toLocaleString('en-US');
  return String(n);
}

function levelToHex(n) {
  return '0x' + n.toString(16).toUpperCase();
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSvg(data) {
  const username = escapeXml(data.username);
  const level = data.level;
  const levelHex = levelToHex(level);
  const rank = data.rank.toLocaleString('en-US');
  const topPct = data.topPercentage;
  const rooms = data.completedRoomsNumber;
  const badges = data.badgesNumber;
  const points = formatPoints(data.totalPoints);
  const league = (data.leagueTier || 'unranked').toUpperCase();
  const updatedAt = new Date().toISOString().slice(0, 10);

  const FONT_MONO = "ui-monospace,'SF Mono','Menlo','Cascadia Code','Consolas','Liberation Mono',monospace";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 180" width="640" height="180" role="img" aria-label="TryHackMe stats for ${username}">
  <title>TryHackMe — ${username} — Top ${topPct}% — Rank #${rank}</title>
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d1117"/>
      <stop offset="100%" stop-color="#161b22"/>
    </linearGradient>
    <linearGradient id="rankGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00FF9D"/>
      <stop offset="100%" stop-color="#00C97D"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00FF9D" stop-opacity="0"/>
      <stop offset="50%" stop-color="#00FF9D" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#00FF9D" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.4" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect x="0.5" y="0.5" width="639" height="179" rx="14" ry="14" fill="url(#bgGrad)" stroke="#00FF9D" stroke-opacity="0.35" stroke-width="1"/>

  <path d="M 14,1 L 70,1 L 14,57 Z" fill="#00FF9D" opacity="0.07"/>
  <path d="M 626,179 L 570,179 L 626,123 Z" fill="#FF5B67" opacity="0.07"/>

  <g transform="translate(28,18)">
    <rect x="0" y="0" width="84" height="18" rx="4" ry="4" fill="#FF5B67" fill-opacity="0.12" stroke="#FF5B67" stroke-opacity="0.5"/>
    <text x="42" y="13" fill="#FF5B67" font-family="${FONT_MONO}" font-size="10" font-weight="700" letter-spacing="2.5" text-anchor="middle">TRYHACKME</text>
  </g>

  <text x="28" y="68" fill="#f0f6fc" font-family="${FONT_MONO}" font-size="30" font-weight="700">${username}</text>

  <text x="28" y="92" fill="#8b949e" font-family="${FONT_MONO}" font-size="11" font-weight="500" letter-spacing="1.2">[${levelHex}] LEGEND · ${league} LEAGUE</text>

  <g transform="translate(612,18)">
    <rect x="-94" y="0" width="94" height="18" rx="4" ry="4" fill="#00FF9D" fill-opacity="0.10" stroke="#00FF9D" stroke-opacity="0.45"/>
    <text x="-47" y="13" fill="#00FF9D" font-family="${FONT_MONO}" font-size="10" font-weight="700" letter-spacing="2.5" text-anchor="middle">WORLD RANK</text>
  </g>
  <text x="612" y="62" fill="url(#rankGrad)" font-family="${FONT_MONO}" font-size="28" font-weight="700" text-anchor="end" filter="url(#glow)">#${rank}</text>
  <text x="612" y="92" fill="#00FF9D" fill-opacity="0.85" font-family="${FONT_MONO}" font-size="11" font-weight="600" letter-spacing="1.2" text-anchor="end">TOP ${topPct}% WORLDWIDE</text>

  <rect x="28" y="106" width="584" height="1" fill="url(#accentGrad)"/>

  <g font-family="${FONT_MONO}" text-anchor="middle">
    <text x="98"  y="142" fill="#f0f6fc" font-size="24" font-weight="700">${rooms}</text>
    <text x="98"  y="161" fill="#8b949e" font-size="9"  font-weight="600" letter-spacing="2.2">ROOMS</text>

    <text x="246" y="142" fill="#f0f6fc" font-size="24" font-weight="700">${badges}</text>
    <text x="246" y="161" fill="#8b949e" font-size="9"  font-weight="600" letter-spacing="2.2">BADGES</text>

    <text x="394" y="142" fill="#f0f6fc" font-size="24" font-weight="700">${points}</text>
    <text x="394" y="161" fill="#8b949e" font-size="9"  font-weight="600" letter-spacing="2.2">POINTS</text>

    <text x="542" y="142" fill="#00FF9D" font-size="24" font-weight="700">${levelHex}</text>
    <text x="542" y="161" fill="#8b949e" font-size="9"  font-weight="600" letter-spacing="2.2">LEVEL</text>
  </g>

  <line x1="172" y1="124" x2="172" y2="168" stroke="#30363d" stroke-width="1"/>
  <line x1="320" y1="124" x2="320" y2="168" stroke="#30363d" stroke-width="1"/>
  <line x1="468" y1="124" x2="468" y2="168" stroke="#30363d" stroke-width="1"/>

  <text x="612" y="174" fill="#484f58" font-family="${FONT_MONO}" font-size="8" font-weight="500" text-anchor="end">updated ${updatedAt}</text>
</svg>
`;
}

async function main() {
  console.log(`[thm-badge] Fetching profile for "${USERNAME}"...`);
  const res = await fetch(API_URL, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'thm-badge-workflow/1.0' },
  });
  if (!res.ok) {
    throw new Error(`API returned ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (json.status !== 'success' || !json.data) {
    throw new Error(`Unexpected API payload: ${JSON.stringify(json).slice(0, 200)}`);
  }

  const svg = buildSvg(json.data);
  const outDir = path.dirname(OUTPUT_PATH);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, svg, 'utf8');

  console.log(`[thm-badge] Wrote ${OUTPUT_PATH}`);
  console.log(`[thm-badge] Stats: rank #${json.data.rank} · top ${json.data.topPercentage}% · ${json.data.completedRoomsNumber} rooms · ${json.data.badgesNumber} badges · level ${json.data.level}`);
}

main().catch(err => {
  console.error('[thm-badge] FAILED:', err.message);
  process.exit(1);
});
