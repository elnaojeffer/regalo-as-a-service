export interface Match {
  id: number;
  created_at: string;
  santa: { full_name: string } | null;
  recipient: { full_name: string } | null;
}

export interface ConfigData {
  key: string;
  value: string;
}
