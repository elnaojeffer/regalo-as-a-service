import {
  WishItem,
  GroupedWishes,
} from "@/app/dashboard/interfaces/DashboardInterface";

export function groupWishesByUser(
  wishes: WishItem[],
  currentUserId?: string
): GroupedWishes[] {
  const groups: Record<string, GroupedWishes> = {};

  wishes.forEach((wish) => {
    // Excluir deseos del usuario actual
    if (wish.user_id === currentUserId) return;

    if (!groups[wish.user_id]) {
      groups[wish.user_id] = {
        name: wish.profiles.full_name,
        sede: wish.profiles.sede,
        wishes: [],
      };
    }
    groups[wish.user_id].wishes.push(wish);
  });

  return Object.values(groups);
}

export function filterMyWishes(
  wishes: WishItem[],
  userId?: string
): WishItem[] {
  if (!userId) return [];
  return wishes.filter((w) => w.user_id === userId);
}
