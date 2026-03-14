import React from 'react';
import type { PoliticalLean, VotingStyle } from './VoterSVG';

interface PixelPortraitProps {
  lean: PoliticalLean;
  style?: VotingStyle; // optional for variations
  age?: string; // used potentially for a seed variation
  variant?: number; // seed variant
  scale?: number; // scaling relative to its container
  xOffset?: number; // X offset if rendered inside an SVG canvas
  yOffset?: number; // Y offset if rendered inside an SVG canvas
}

export default function PixelPortrait({ lean, scale = 6, xOffset = 0, yOffset = 0 }: PixelPortraitProps) {
    const CONSERVATIVE_ART = [
      "                ",
      "     bbbbbb     ",
      "   bbhhhhhhbb   ",
      "  bhhsssssshhb  ",
      "  bhbssssssbhb  ",
      "  bssbbssbbssb  ",
      "  bsbsbsssbsbs  ",
      "  bssssssssssb  ",
      "   bbssssssbb   ",
      " ccbbbbssbbbbcc ",
      "ccccbwtttwbcccc ",
      "cccbwwwtwwwbccc ",
      "cccbbwwtwwbbccc ",
      "ccccbbbTbbbcccc ",
      "ccccccccccccccc ",
      " ccccccccccccc  "
    ];
    const CONSERVATIVE_PAL: Record<string, string> = {
      'h': '#795548', 's': '#FFE0BD', 'c': '#2C3E50', 'w': '#FFFFFF', 't': '#E74C3C', 'T': '#C0392B', 'b': '#000000'
    };

    const PROGRESSIVE_ART = [
      "     bbbbbb     ",
      "   bbhhhhhhbb   ",
      "  bhhhhhhhhhhb  ",
      "  bbbbbbbbbbbb  ",
      "  bssbbssbbssb  ",
      "  bgsbgssbgssb  ",
      "  bgbsbssbsbgb  ",
      "  bbbsbbbbsbbb  ",
      "  bssssssssssb  ",
      "   bbbbssbbbb   ",
      "   bccccccccb   ",
      " bbbccccccccbbb ",
      " bccccccccccccb ",
      " bccccccccccccb ",
      "  bccccccccccb  ",
      "   bbbbbbbbbb   "
    ];
    const PROGRESSIVE_PAL: Record<string, string> = {
      'h': '#FF9800', 's': '#FFE0BD', 'c': '#689F38', 'g': '#E3F2FD', 'b': '#000000'
    };

    const CENTRE_ART = [
      "     bbbbbb     ",
      "   bbhhhhhhbb   ",
      "  bhhsssssshhb  ",
      "  bsbssssssbsb  ",
      "  bssbbssbbssb  ",
      "  bsbsbsssbsbs  ",
      "  bssssssssssb  ",
      "   bbssssssbb   ",
      "  bbbbsbbssbbb  ",
      " bcccbbssbbcccb ",
      "bcccccbssbcccccb",
      "bccccccbbccccccb",
      "bccccccccccccccb",
      "bccccccccccccccb",
      " bbccccccccccbb ",
      "   bbbbbbbbbb   "
    ];
    const CENTRE_PAL: Record<string, string> = {
      'h': '#9E9E9E', 's': '#FFE0BD', 'c': '#81D4FA', 'w': '#FFFFFF', 'b': '#000000'
    };

    const APATHETIC_ART = [
      "     bbbb       ",
      "    bhhhhb      ",
      "  bbhhhhhhbbbb  ",
      " bhhhhhhhhhhhhb ",
      " bhssssssssssh  ",
      " bssbbssbbsssb  ",
      " bsbdbbsbdbbsb  ",
      "  bsssssssssb   ",
      "  bssdsdsdssb   ",
      "   bbdsdsdbb    ",
      " ccbwbbbbwbcc   ",
      "cccbwwwbwwwbccc ",
      "cccbbwbwbwbbccc ",
      "ccccbbwbwbbcccc ",
      "ccccbcbwbcbcccc ",
      " ccccccccccccc  "
    ];
    const APATHETIC_PAL: Record<string, string> = {
      'h': '#212121', 's': '#FFE0BD', 'c': '#607D8B', 'w': '#FFFFFF', 'b': '#000000', 'd': '#D7CCC8'
    };

    let art = APATHETIC_ART;
    let palette = APATHETIC_PAL;

    if (lean === 'CONSERVATIVE') { art = CONSERVATIVE_ART; palette = CONSERVATIVE_PAL; }
    else if (lean === 'PROGRESSIVE') { art = PROGRESSIVE_ART; palette = PROGRESSIVE_PAL; }
    else if (lean === 'CENTRE') { art = CENTRE_ART; palette = CENTRE_PAL; }

    const renderPixels = () => (
      <g transform={`translate(${xOffset}, ${yOffset})`}>
        {xOffset === 0 && yOffset === 0 ? null : (
          <rect x="-12" y="-12" width="120" height="120" fill="#E0E0E0" stroke="#000" strokeWidth="4" />
        )}
        {art.map((row: string, y: number) => 
          row.split('').map((char: string, x: number) => {
            if (char === ' ' || !palette[char]) return null;
            return <rect key={`${char}-${x}-${y}`} x={x * scale} y={y * scale} width={scale} height={scale} fill={palette[char]} stroke="none" />
          })
        )}
      </g>
    );

    // If xOffset and yOffset are 0, it means it's being used as an isolated component (e.g. in HTML)
    // rather than embedded inside another SVG canvas (e.g. VoterSVG)
    if (xOffset === 0 && yOffset === 0) {
      return (
        <svg viewBox="0 0 96 96" className="w-[120%] h-[120%] -ml-[10%] -mt-[10%]">
             {renderPixels()}
        </svg>
      );
    }

    return renderPixels();
}
