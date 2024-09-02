"use client";

import { useState, useEffect } from "react";
import DeleteFighterModal from "./DeleteFighterModal";
import { supabase } from "../utils/supabase";
import { Fighter } from "../types/schema";

export default function FighterList() {
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fighterToDelete, setFighterToDelete] = useState<Fighter | null>(null);

  useEffect(() => {
    fetchFighters();
  }, []);

  async function fetchFighters() {
    const { data, error } = await supabase.from("fighters").select("*");
    if (error) {
      console.error("Error fetching fighters:", error);
    } else {
      setFighters(data || []);
    }
  }

  const handleDeleteClick = (fighter: Fighter) => {
    setFighterToDelete(fighter);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (fighterToDelete) {
      try {
        // Delete related matches first
        const { error: matchesError } = await supabase
          .from("matches")
          .delete()
          .or(
            `fighter1_id.eq.${fighterToDelete.id},fighter2_id.eq.${fighterToDelete.id}`
          );

        if (matchesError) throw matchesError;

        // Then delete the fighter
        const { error: fighterError } = await supabase
          .from("fighters")
          .delete()
          .eq("id", fighterToDelete.id);

        if (fighterError) throw fighterError;

        setFighters(fighters.filter(f => f.id !== fighterToDelete.id));
        setIsDeleteModalOpen(false);
        console.log(
          `${fighterToDelete.username} and related matches have been removed.`
        );
      } catch (error) {
        console.error("Error deleting fighter:", error);
        console.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div>
      <h2 className='text-xl font-semibold mb-4'>Fighter List</h2>
      <ul>
        {fighters.map(fighter => (
          <li
            key={fighter.id}
            className='mb-2 flex items-center justify-between'>
            <span>{fighter.username}</span>
            <button
              className='bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm'
              onClick={() => handleDeleteClick(fighter)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <DeleteFighterModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        fighterName={fighterToDelete?.username || ""}
      />
    </div>
  );
}
