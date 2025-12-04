import { useState } from "react";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import { WishItem } from "../interfaces/DashboardInterface";

interface UseWishActionsProps {
  currentUser: any;
  wishes: WishItem[];
  onWishesUpdate: () => Promise<void>;
}

interface UseWishActionsReturn {
  newWish: string;
  setNewWish: (value: string) => void;
  handleAddWish: () => Promise<void>;
  handleDeleteWish: (id: number) => Promise<void>;
}

export function useWishActions({
  currentUser,
  wishes,
  onWishesUpdate,
}: UseWishActionsProps): UseWishActionsReturn {
  const [newWish, setNewWish] = useState("");

  const handleAddWish = async () => {
    if (!newWish.trim() || !currentUser) return;

    const myCount = wishes.filter((w) => w.user_id === currentUser.id).length;
    if (myCount >= 3) {
      alert("¡Ya tienes 3 deseos!");
      return;
    }

    const { error } = await supabase.from("wishes").insert({
      user_id: currentUser.id,
      description: newWish,
    });

    if (!error) {
      setNewWish("");
      await onWishesUpdate();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else {
      alert(error.message);
    }
  };

  const handleDeleteWish = async (id: number) => {
    if (!confirm("¿Borrar este deseo?")) return;

    const { error } = await supabase.from("wishes").delete().eq("id", id);

    if (!error) {
      await onWishesUpdate();
    } else {
      alert(error.message);
    }
  };

  return {
    newWish,
    setNewWish,
    handleAddWish,
    handleDeleteWish,
  };
}
