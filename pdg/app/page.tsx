import { getSupabaseClient } from "./lib/supabase";
import { Suspense } from "react";

async function InstrumentsData() {
  const supabase = getSupabaseClient();

  const { data: instruments, error } = await supabase
    .from("instruments")
    .select("*");

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}

export default function Instruments() {
  return (
    <Suspense fallback={<div>Loading instruments...</div>}>
      <InstrumentsData />
    </Suspense>
  );
}