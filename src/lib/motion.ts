import type { Transition, Variants } from 'motion/react';

export const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const easeSoft: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 28,
  mass: 0.8,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 30,
  mass: 0.7,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeSoft },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: easeSoft } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: easeOutExpo },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
};

export const messageVariants: Variants = {
  hidden: (role: 'user' | 'assistant') => ({
    opacity: 0,
    y: 14,
    x: role === 'user' ? 18 : -18,
    scale: 0.97,
  }),
  show: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: springSoft,
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
};

/** Object props (not named variants) so nested stagger/show children are not overridden. */
export const viewSwap = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: easeSoft },
} as const;
