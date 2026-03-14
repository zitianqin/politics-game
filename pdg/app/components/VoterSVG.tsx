import React from 'react';
import PixelPortrait from './PixelPortrait';export type PoliticalLean = 'CONSERVATIVE' | 'PROGRESSIVE' | 'CENTRE' | 'APATHETIC';
export type VotingStyle = 'POPULIST' | 'RATIONAL' | 'EMOTIONAL' | 'TRIBAL' | 'IDEOLOGICAL';

export interface VoterProfileProps {
  name: string;
  age: number;
  location: string;
  occupation: string;
  quote: string[];
  lean: PoliticalLean;
  votingStyle: VotingStyle;
  concerns: string[];
  vulnerableTo: string;
}

export function VoterSVG({ profile, lean }: { profile: VoterProfileProps, lean: PoliticalLean }) {
  // Define colors based on lean
  const leanColors = {
    CONSERVATIVE: '#005696',
    PROGRESSIVE: '#4CAF50',
    CENTRE: '#9E9E9E',
    APATHETIC: '#FF9800'
  };
  
  const leanColor = leanColors[lean];

  // Colors for styling block
  const styleColors = {
    POPULIST: '#FBB03B',
    RATIONAL: '#2196F3',
    EMOTIONAL: '#E91E63',
    TRIBAL: '#9C27B0',
    IDEOLOGICAL: '#00BCD4'
  };
  
  const styleColor = styleColors[profile.votingStyle];

  const renderPortrait = () => {
    return <PixelPortrait lean={lean} xOffset={272} yOffset={82} scale={6} />;
  }

  return (
    <svg viewBox="0 0 400 550" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[300px]">
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="5" dy="5" stdDeviation="0" floodColor="#000000" />
        </filter>
      </defs>

      <rect x="10" y="10" width="380" height="530" rx="15" fill="#FFFFFF" stroke="#000" strokeWidth="4" filter="url(#shadow)"/>
      
      {/* Top Header Background */}
      <path d="M 12 25 A 13 13 0 0 1 25 12 L 375 12 A 13 13 0 0 1 388 25 L 388 100 L 12 115 Z" fill={leanColor} stroke="#000" strokeWidth="3" />
      <text x="30" y="55" fontFamily="Titan One, Arial Black, sans-serif" fontSize="30" fill="#FFFFFF" filter="url(#shadow)">{profile.name.toUpperCase()}</text>
      <text x="32" y="85" fontFamily="Nunito, Arial Narrow, sans-serif" fontSize="18" fill="#FFD700" fontWeight="bold">{profile.age} • {profile.location.toUpperCase()}</text>

      {/* Portrait */}
      {renderPortrait()}

      {/* Occupation Badge */}
      <rect x="30" y="145" width="200" height="30" rx="5" fill="#008080" />
      <text x="130" y="165" fontFamily="Nunito, Arial Black, sans-serif" fontSize="14" fontWeight="900" fill="#FFF" textAnchor="middle">{profile.occupation.toUpperCase()}</text>

      {/* Quote */}
      <text x="30" y="210" fontFamily="Georgia, serif" fontSize="16" fill="#333" fontStyle="italic">
        {profile.quote.map((line, i) => (
          <tspan key={i} x="30" dy={i === 0 ? "0" : "22"}>"{line}"</tspan>
        ))}
      </text>

      <line x1="30" y1="285" x2="370" y2="285" stroke="#CCC" strokeWidth="2" strokeDasharray="5,5" />

      {/* Attributes */}
      <g transform="translate(30, 310)">
        <text x="0" y="0" fontFamily="Nunito, Arial Black, sans-serif" fontWeight="900" fontSize="12" fill="#666">POLITICAL LEAN</text>
        <rect x="0" y="10" width="110" height="25" fill={leanColor} rx="5" />
        <text x="55" y="27" fontFamily="Nunito, Arial Black, sans-serif" fontWeight="900" fontSize="12" fill="#FFF" textAnchor="middle">{profile.lean}</text>

        <text x="130" y="0" fontFamily="Nunito, Arial Black, sans-serif" fontWeight="900" fontSize="12" fill="#666">VOTING STYLE</text>
        <rect x="130" y="10" width="110" height="25" fill={styleColor} rx="5" />
        <text x="185" y="27" fontFamily="Nunito, Arial Black, sans-serif" fontWeight="900" fontSize="12" fill="#FFF" textAnchor="middle">{profile.votingStyle}</text>
      </g>

      <text x="30" y="380" fontFamily="Nunito, Arial Black, sans-serif" fontWeight="900" fontSize="12" fill="#666">CORE CONCERNS</text>
      <g transform="translate(30, 395)">
        {profile.concerns.map((concern, i) => (
            <React.Fragment key={i}>
                <rect x={i * 115} y="0" width="105" height="25" rx="12" fill="#E31B23" opacity="0.1" />
                <text x={(i * 115) + 52} y="17" fontFamily="Nunito, Arial, sans-serif" fontSize="11" fill="#E31B23" textAnchor="middle" fontWeight="bold">
                    {concern.length > 14 ? concern.substring(0, 12) + "..." : concern}
                </text>
            </React.Fragment>
        ))}
      </g>

      {/* Vulnerable To Footer Block */}
      {/* We use a path to round the bottom corners without overflowing */}
      <path d="M 12 470 L 388 470 L 388 525 A 13 13 0 0 1 375 538 L 25 538 A 13 13 0 0 1 12 525 Z" fill="#F2F2F2" stroke="#000" strokeWidth="2" />
      <text x="30" y="495" fontFamily="Nunito, Arial Black, sans-serif" fontWeight="900" fontSize="12" fill="#999">VULNERABLE TO:</text>
      <text x="30" y="520" fontFamily="Titan One, Arial Black, sans-serif" fontSize="18" fill="#000">{profile.vulnerableTo.toUpperCase()}</text>
    </svg>
  );
}
