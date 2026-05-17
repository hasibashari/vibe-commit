export interface UserStats {
  id?: string;
  name?: string;
  title?: string;
  avatar_color?: string;
  avatar_icon?: string;
  custom_main_bg?: string;
  custom_char_bg?: string;
  custom_character?: string;
  theme_vibe?: string;
  bgm_theme?: string;
  bgm_muted?: number | boolean;
  hp: number;
  mana: number;
  level: number;
  exp: number;
  spent_coins?: number;
  last_penalty_date?: string | null;
  shield_until?: string | null;
  unlocked_items?: string;
}
