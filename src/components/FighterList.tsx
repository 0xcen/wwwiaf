"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/utils/supabase";

interface Fighter {
  id: number;
  username: string;
  image: string;
}

export default function FighterList() {
  const [fighters, setFighters] = useState<Fighter[]>([]);

  useEffect(() => {
    async function fetchFighters() {
      const { data, error } = await supabase.from("fighters").select("*");
      if (error) {
        console.error("Error fetching fighters:", error);
      } else {
        setFighters(data || []);
      }
    }

    fetchFighters();
  }, []);

  return (
    <div>
      <h2 className='text-xl font-bold mt-8 mb-4'>Existing Fighters</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {fighters.map(fighter => (
          <div key={fighter.id} className='border p-4 rounded'>
            <h3 className='font-bold mb-2'>{fighter.username}</h3>
            {fighter.image &&
              (fighter.image.startsWith("data:image") ? (
                <img
                  src={fighter.image}
                  alt={fighter.username}
                  width={200}
                  height={200}
                  className='object-cover'
                />
              ) : (
                <Image
                  src={fighter.image}
                  alt={fighter.username}
                  width={200}
                  height={200}
                  className='object-cover'
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
