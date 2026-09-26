import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

type OrbSize = 'xs' | 'sm' | 'hero';

const sizes: Record<OrbSize, string> = {
  xs: 'h-2.5 w-2.5',
  sm: 'h-8 w-8',
  hero: 'h-[118px] w-[118px] sm:h-[148px] sm:w-[148px]',
};

export function AnimatedOrb({
  size = 'hero',
  className,
}: {
  size?: OrbSize;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const isHero = size === 'hero';

  if (reduce) {
    return (
      <span className={cn('relative inline-grid place-items-center', sizes[size], className)} aria-hidden>
        <span className="glow-orb absolute inset-0 rounded-full" />
      </span>
    );
  }

  return (
    <motion.span
      className={cn('relative inline-grid place-items-center', sizes[size], className)}
      aria-hidden
      animate={
        isHero
          ? { y: [0, -6, 0] }
          : size === 'sm'
            ? { y: [0, -2, 0] }
            : undefined
      }
      transition={
        isHero || size === 'sm'
          ? { duration: isHero ? 5.2 : 3.6, repeat: Infinity, ease: 'easeInOut' }
          : undefined
      }
    >
      {isHero ? (
        <>
          <motion.span
            className="pointer-events-none absolute -inset-[28%] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.35)_0%,rgba(91,108,255,0.12)_45%,transparent_70%)] blur-xl"
            animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.92, 1.08, 0.92] }}
            transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="pointer-events-none absolute -inset-[14%] rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(139,108,255,0.55) 55deg, transparent 120deg, rgba(59,130,246,0.45) 200deg, transparent 280deg)',
              maskImage: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
              WebkitMaskImage:
                'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
          <motion.span
            className="pointer-events-none absolute -inset-[6%] rounded-full border border-violet-300/20"
            animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.04, 1] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      ) : null}

      <motion.span
        className={cn(
          'glow-orb relative z-[1] rounded-full',
          isHero ? 'h-full w-full' : 'absolute inset-0',
        )}
        animate={{
          scale: isHero ? [1, 1.04, 1] : size === 'sm' ? [1, 1.06, 1] : [1, 1.15, 1],
          boxShadow: isHero
            ? [
                '0 0 24px rgba(139,108,255,0.65), 0 0 56px rgba(59,130,246,0.28), 0 0 90px rgba(139,108,255,0.18)',
                '0 0 34px rgba(167,139,250,0.85), 0 0 72px rgba(91,108,255,0.4), 0 0 120px rgba(139,108,255,0.28)',
                '0 0 24px rgba(139,108,255,0.65), 0 0 56px rgba(59,130,246,0.28), 0 0 90px rgba(139,108,255,0.18)',
              ]
            : undefined,
        }}
        transition={{
          duration: isHero ? 4.6 : size === 'sm' ? 3.2 : 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={isHero ? { scale: 1.06 } : undefined}
      >
        {isHero || size === 'sm' ? (
          <motion.span
            className="pointer-events-none absolute left-[18%] top-[16%] h-[28%] w-[28%] rounded-full bg-white/55 blur-[2px]"
            animate={{ opacity: [0.35, 0.7, 0.35], x: [0, 3, 0], y: [0, -2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : null}
      </motion.span>
    </motion.span>
  );
}
