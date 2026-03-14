import { useState } from "react";
import { ScreenId } from "../lib/gameConstants";
import { votersData, VoterProfile } from "../lib/voterData";
import PixelPortrait from "./PixelPortrait";
import { motion, AnimatePresence } from "framer-motion";

interface ScreenVoterGridProps {
  screen: ScreenId;
  startDebate: () => void;
}

export default function ScreenVoterGrid({ screen, startDebate }: ScreenVoterGridProps) {
  const [selectedVoter, setSelectedVoter] = useState<VoterProfile | null>(null);

  if (screen !== "voter-grid") return null;

  return (
    <div
      id="screen-voter-grid"
      className="screen active h-screen w-full bg-[#6149D2] bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px] sm:overflow-y-auto overflow-hidden flex flex-col items-center justify-center relative"
    >
      <div className="w-full md:max-w-[1900px] mx-auto flex flex-col items-center h-full max-h-screen pt-2 pb-20">
        
        <h2 className="title-text bouncing shrink-0" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", marginBottom: "0.5rem" }}>
          THE JURY
        </h2>
        
        {/* The Grid */}
        <div className="grid grid-cols-4 md:grid-cols-7 gap-1 md:gap-2 lg:gap-3 xl:gap-4 w-full flex-1 min-h-0 content-center px-1 md:px-4">
          {votersData.map((voter, index) => {
            const leanColor = voter.lean === 'CONSERVATIVE' ? '#005696' : 
                              voter.lean === 'PROGRESSIVE' ? '#3B9E3A' : 
                              voter.lean === 'CENTRE' ? '#808080' : '#E06B26';
            
            const styleColor = voter.reasoningStyle === 'POPULIST' ? '#FBB03B' :
                               voter.reasoningStyle === 'RATIONAL' ? '#2196F3' :
                               voter.reasoningStyle === 'EMOTIONAL' ? '#E91E63' :
                               voter.reasoningStyle === 'TRIBAL' ? '#9C27B0' :
                               voter.reasoningStyle === 'IDEOLOGICAL' ? '#00BCD4' : '#000000';
            
            const concernsText = voter.concerns.join(', ').toUpperCase();

            // Auto-size occupation box based on string length (approximate but reliable)
            const occStr = voter.occupation.toUpperCase();
            const occWidth = Math.max(90, Math.min(130, occStr.length * 6 + 10));

            return (
            <motion.div 
              key={voter.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20, 
                delay: index * 0.03 
              }}
              onClick={() => setSelectedVoter(voter)}
              className="cursor-pointer hover:-translate-y-2 transition-transform will-change-transform drop-shadow"
            >
              <svg viewBox="0 0 240 140" className="w-full h-auto drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <clipPath id={`token-clip-${voter.id}`}>
                    <rect x="0" y="0" width="232" height="132" rx="12" />
                  </clipPath>
                </defs>

                <rect x="4" y="4" width="232" height="132" rx="12" fill="#000" opacity="0.3" />
                
                <rect x="0" y="0" width="232" height="132" rx="12" fill="#FFF" stroke="#000" strokeWidth="3" />
                
                <g clipPath={`url(#token-clip-${voter.id})`}>
                  <path d="M 0 0 L 232 0 L 232 35 L 0 55 Z" fill={leanColor} stroke="#000" strokeWidth="2" />
                </g>
                
                <text x="12" y="24" fontFamily="'Titan One', sans-serif" fontSize={voter.name.length > 15 ? "13" : "16"} fill="#FFF">
                  {voter.name.toUpperCase()}
                </text>
                
                <rect x="12" y="65" width={occWidth} height="18" rx="4" fill="#008080" />
                <text x={12 + (occWidth / 2)} y="78" fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="9" fill="#FFF" textAnchor="middle">
                  {occStr}
                </text>

                <g transform="translate(12, 95)">
                  <rect x="0" y="0" width="85" height="16" rx="4" fill={leanColor} />
                  <text x="42.5" y="11.5" fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="8" fill="#FFF" textAnchor="middle">{voter.lean}</text>
                  
                  <rect x="90" y="0" width="85" height="16" rx="4" fill={styleColor} />
                  <text x="132.5" y="11.5" fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="8" fill="#FFF" textAnchor="middle">{voter.reasoningStyle}</text>
                </g>

                <text x="12" y="122" fontFamily="'Nunito', sans-serif" fontSize={concernsText.length > 30 ? "7" : "8"} fill="#E31B23" fontWeight="900">
                  {concernsText}
                </text>
              </svg>
            </motion.div>
          )})}
        </div>

      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center pointer-events-none z-10">
          <button 
            className="btn green-color pointer-events-auto shadow-[4px_4px_0_0_#000] md:shadow-[8px_8px_0_0_#000] text-xl md:text-3xl px-8 py-3" 
            onClick={startDebate}
          >
            START DEBATE
          </button>
      </div>

      {/* Modal for Detailed Voter Profile */}
      <AnimatePresence>
        {selectedVoter && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelectedVoter(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-xl border-4 border-black p-4 flex flex-col relative shadow-[8px_8px_0_0_#000] overflow-hidden max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button 
                className="absolute top-2 right-2 w-8 h-8 bg-black hover:bg-red-500 hover:text-white border-2 border-black rounded-full text-white font-black flex items-center justify-center z-20 shadow-[2px_2px_0_0_#000] transition-colors"
                onClick={() => setSelectedVoter(null)}
              >
                 X
              </button>

              {/* Top Bar with lean color */}
              <div 
                className="absolute top-0 left-0 right-0 h-12 border-b-4 border-black flex items-center px-4 pr-12 z-10"
                style={{
                  backgroundColor: selectedVoter.lean === 'CONSERVATIVE' ? '#005696' : 
                                  selectedVoter.lean === 'PROGRESSIVE' ? '#3B9E3A' : 
                                  selectedVoter.lean === 'CENTRE' ? '#808080' : '#E06B26'
                }}
              >
                <span className="font-['Titan_One',_sans-serif] text-white text-xl drop-shadow-[2px_2px_0_#000] tracking-wide truncate">{selectedVoter.name.toUpperCase()}</span>
              </div>

              <div className="mt-12 flex justify-between items-start gap-4 mb-3">
                <div className="flex-1 pt-2">
                  <p className="font-['Nunito',_sans-serif] text-sm font-bold text-gray-500 mb-1 leading-tight">{selectedVoter.age} • {selectedVoter.location}</p>
                  <div className="bg-[#008080] inline-flex px-2 py-1 rounded text-xs font-['Nunito',_sans-serif] font-black text-white shrink-0 mb-2 leading-none">
                    {selectedVoter.occupation.toUpperCase()}
                  </div>
                </div>
                
                {/* Mini Pixel Avatar */}
                <div className="w-[80px] h-[80px] bg-gray-200 border-2 border-black rounded shrink-0 relative overflow-hidden flex items-center justify-center shadow-[2px_2px_0_0_#000]">
                  <div className="w-[100px] h-[100px]">
                    <PixelPortrait 
                        lean={selectedVoter.lean} 
                        style={selectedVoter.reasoningStyle as any} 
                        scale={6}
                    />
                  </div>
                </div>
              </div>

              <p className="font-['Georgia',_serif] italic text-sm text-gray-700 leading-tight mb-4 flex-1">
                "{selectedVoter.background}"
              </p>

              <div className="border-t-2 border-dashed border-gray-300 pt-3">
                <div className="flex flex-wrap gap-1 text-[10px] font-['Nunito',_sans-serif] font-black items-center mb-2">
                  <span className="text-gray-500 mr-1">CARES ABOUT:</span>
                  {selectedVoter.concerns.map((concern, idx) => (
                    <span key={idx} className="bg-red-100 text-[#E31B23] px-1.5 py-0.5 rounded-full">{concern}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 text-[10px] font-['Nunito',_sans-serif] font-black items-center">
                  <span className="text-gray-500 mr-1">SUSCEPTIBLE TO:</span>
                  <span className="bg-yellow-200 text-yellow-900 border border-yellow-400 px-1.5 py-0.5 rounded-full">{selectedVoter.susceptibleTo}</span>
                </div>
              </div>
              
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
