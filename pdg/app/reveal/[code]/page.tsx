"use client";

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { votersData } from '../../lib/voterData';
import PixelPortrait from '../../components/PixelPortrait';

export default function RevealPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);
  const [mounted, setMounted] = useState(false);
  const [selectedVoters] = useState(() =>
    [...votersData].sort(() => Math.random() - 0.5).slice(0, 5)
  );

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // useEffect(() => {
  //   if (countdown === 0) {
  //     router.push(`/debate/${code}`);
  //   }
  // }, [countdown, code, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#6149D2] bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px] flex flex-col items-center p-8 overflow-y-auto font-sans">
      
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-7xl flex justify-between items-center mb-6"
      >
        <div className="bg-[#FFEB3B] px-6 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000]">
          <h1 className="font-['Titan_One'] text-3xl text-black">ROOM CODE: {code.toUpperCase()}</h1>
        </div>
        <div className="bg-white px-6 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000]">
          <h2 className="font-['Titan_One'] text-2xl text-red-600">DEBATE STARTS IN: {countdown}s</h2>
        </div>
      </motion.div>

      <motion.h2 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-6xl text-white font-['Titan_One'] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] mb-8"
      >
        THE JURY (5 VOTERS)
      </motion.h2>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl"
      >
        {selectedVoters.map((voter) => (
          <div 
            key={voter.id}
            className="bg-white rounded-xl border-4 border-black p-4 flex flex-col relative shadow-[4px_4px_0_0_#000] overflow-hidden mt-4"
          >
            <div 
              className="absolute top-0 left-0 right-0 h-10 border-b-4 border-black flex items-center px-4"
              style={{
                backgroundColor: voter.lean === 'CONSERVATIVE' ? '#005696' : 
                                voter.lean === 'PROGRESSIVE' ? '#3B9E3A' : 
                                voter.lean === 'CENTRE' ? '#808080' : '#E06B26'
              }}
            >
               <span className="font-['Titan_One'] text-white text-lg drop-shadow-[2px_2px_0_#000]">{voter.name.toUpperCase()}</span>
            </div>

            <div className="mt-8 flex justify-between items-start gap-4 mb-3">
              <div className="flex-1 pt-2">
                <p className="font-['Nunito'] text-sm font-bold text-gray-500 mb-1">{voter.age} • {voter.location}</p>
                <div className="bg-[#008080] inline-block px-2 py-1 rounded text-xs font-['Nunito'] font-black text-white shrink-0 mb-2">
                  {voter.occupation.toUpperCase()}
                </div>
              </div>
              
              <div className="w-[60px] h-[60px] bg-gray-200 border-2 border-black rounded shrink-0 relative overflow-hidden">
                 <PixelPortrait 
                    lean={voter.lean} 
                    style={voter.reasoningStyle} 
                    age={voter.age.toString()}
                    variant={voter.id}
                 />
              </div>
            </div>

            <p className="font-['Georgia'] italic text-sm text-gray-700 leading-tight mb-4 flex-1">
              &quot;{voter.background}&quot;
            </p>

            <div className="border-t-2 border-dashed border-gray-300 pt-3">
               <div className="flex flex-wrap gap-2 text-xs font-['Nunito'] font-black">
                 <span className="text-gray-500">CARES ABOUT:</span>
                 {voter.concerns.map((concern, idx) => (
                   <span key={idx} className="bg-red-100 text-[#E31B23] px-2 py-0.5 rounded-full">{concern}</span>
                 ))}
               </div>
            </div>
            
          </div>
        ))}
      </motion.div>
    </div>
  );
}
