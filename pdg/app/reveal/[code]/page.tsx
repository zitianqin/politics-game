"use client";

import { useRouter } from "next/navigation";
import ScreenVoterGrid from "@/app/components/ScreenVoterGrid";

export default function RevealPage({ params }: { params: { code: string } }) {
  const router = useRouter();

  const handleStartDebate = () => {
    router.push(`/debate/${params.code}`);
  };

  return (
    <>
      <ScreenVoterGrid screen="voter-grid" startDebate={handleStartDebate} />
    </>
  );
}
