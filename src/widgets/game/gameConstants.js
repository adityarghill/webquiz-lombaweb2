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

export const PETS = [
  { id: "cat",  label: "Cat",  icon: catIcon,  idle: catIdle,  happy: catHappy,  bored: catBored  },
  { id: "dog",  label: "Dog",  icon: dogIcon,  idle: dogIdle,  happy: dogHappy,  bored: dogBored  },
  { id: "frog", label: "Frog", icon: frogIcon, idle: frogIdle, happy: frogHappy, bored: frogBored },
  { id: "lamb", label: "Lamb", icon: lambIcon, idle: lambIdle, happy: lambHappy, bored: lambBored },
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
};

export const PET_BG_PALETTE = [
  "#fff8f8", "#f0fff4", "#f0f0ff", "#fffbf0",
  "#fff0fb", "#e8f7ff", "#1e1e2e", "#2d2d2d",
];

// Min/max size constraints per window (px)
export const WIN_CONSTRAINTS = {
  pet    : { minW: 180, maxW: 500, minH: 220, maxH: 520 },
  mood   : { minW: 150, maxW: 350, minH: 180, maxH: 360 },
  select : { minW: 200, maxW: 420, minH: 130, maxH: 300 },
  boredom: { minW: 220, maxW: 520, minH: 52,  maxH: 80  },
};