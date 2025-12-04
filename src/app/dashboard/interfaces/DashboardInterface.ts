export interface WishItem {
  id: number;
  description: string | null;
  user_id: string;
  profiles: {
    full_name: string;
    sede: string;
  };
  created_at: string;
}

export interface GroupedWishes {
  name: string;
  sede: string;
  wishes: WishItem[];
}

export interface Assignment {
  recipient: {
    full_name: string;
    sede: string;
    wishes: { description: string }[];
  };
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
}
