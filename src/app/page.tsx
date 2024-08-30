import { supabase } from "@/utils/supabase";
import FighterForm from "@/components/FighterForm";

export const revalidate = 0;

async function getItems() {
  const { data } = await supabase.from("items").select("*");
  return data;
}

export default function Home() {
  return (
    <main className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Welcome to the Fighter App</h1>
      <p>This is the public facing page.</p>
    </main>
  );
}
