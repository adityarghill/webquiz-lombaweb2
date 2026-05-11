// ─── Lottie animations ────────────────────────────────────────────────────────
import catIdle   from "@/assets/game/catidle.json";
import catHappy  from "@/assets/game/cathappy.json";
import catBored  from "@/assets/game/catbored.json";
import dogIdle   from "@/assets/game/dogidle.json";
import dogHappy  from "@/assets/game/doghappy.json";
import dogBored  from "@/assets/game/dogbored.json";
import frogIdle  from "@/assets/game/frogidle.json";
import frogHappy from "@/assets/game/froghappy.json";
import frogBored from "@/assets/game/frogbored.json";
import lambIdle  from "@/assets/game/lambidle.json";
import lambHappy from "@/assets/game/lambhappy.json";
import lambBored from "@/assets/game/lambbored.json";
import catIcon   from "@/assets/game/caticon.png";
import dogIcon   from "@/assets/game/dogicon.png";
import frogIcon  from "@/assets/game/frogicon.png";
import lambIcon  from "@/assets/game/lambicon.png";

export { default as happyMoodImg } from "@/assets/game/happymood.png";
export { default as sadMoodImg   } from "@/assets/game/sadmood.png";
export { default as heartImg     } from "@/assets/game/heart.png";
export { default as zapImg       } from "@/assets/game/zap.png";
export { default as gameMusicSrc } from "@/assets/game/gamemusic.ogg";

/**
 * PETS — Pet catalogue
 * 
 * price:       XP cost to unlock (0 = free / default)
 * rarity:      "free" | "common" | "rare" | "epic"
 * rarityColor: badge colour
 * description: flavour text shown in shop
 */
export const PETS = [
  {
    id: "cat", label: "Cat",
    icon: catIcon, idle: catIdle, happy: catHappy, bored: catBored,
    price: 0,
    rarity: "free",
    rarityColor: "#22C55E",
    description: "Default companion. Always here for you.",
  },
  {
    id: "dog", label: "Dog",
    icon: dogIcon, idle: dogIdle, happy: dogHappy, bored: dogBored,
    price: 150,
    rarity: "common",
    rarityColor: "#3B82F6",
    description: "Loyal & energetic. Loves a good quiz session!",
  },
  {
    id: "frog", label: "Frog",
    icon: frogIcon, idle: frogIdle, happy: frogHappy, bored: frogBored,
    price: 300,
    rarity: "rare",
    rarityColor: "#A855F7",
    description: "Mysterious swamp scholar. Rare and wise.",
  },
  {
    id: "lamb", label: "Lamb",
    icon: lambIcon, idle: lambIdle, happy: lambHappy, bored: lambBored,
    price: 500,
    rarity: "epic",
    rarityColor: "#F59E0B",
    description: "Legendary floof. Worth every EXP point.",
  },
];

export const BOREDOM_MAX             = 100;
export const BOREDOM_DECAY           = 0.5;
export const BOREDOM_HAPPY_THRESHOLD = 50;
export const BOREDOM_BORED_THRESHOLD = 25;
export const HAPPY_ANIM_DURATION     = 3000;
export const BORED_ANIM_DURATION     = 3000;
export const CLICK_BOREDOM_GAIN      = 8;
export const ZAP_BOREDOM_LOSS        = 15;

export const WINDOW_COLORS = {
  boredom : { bg: "#fff8dc", title: "#ffd43b" },
  pet     : { bg: "#ffc8d0", title: "#ff6b81" },
  mood    : { bg: "#b8e8ff", title: "#5bc8ef" },
  select  : { bg: "#c8f5a0", title: "#82d63a" },
  shop    : { bg: "#f3e8ff", title: "#a855f7" },  // ← new
};

export const PET_BG_PALETTE = [
  "#fff8f8", "#f0fff4", "#f0f0ff", "#fffbf0",
  "#fff0fb", "#e8f7ff", "#1e1e2e", "#2d2d2d",
];

export const WIN_CONSTRAINTS = {
  pet    : { minW: 180, maxW: 500, minH: 220, maxH: 520 },
  mood   : { minW: 150, maxW: 350, minH: 180, maxH: 360 },
  select : { minW: 220, maxW: 480, minH: 180, maxH: 380 },
  boredom: { minW: 220, maxW: 520, minH: 52,  maxH: 80  },
  shop   : { minW: 260, maxW: 520, minH: 260, maxH: 560 },
};