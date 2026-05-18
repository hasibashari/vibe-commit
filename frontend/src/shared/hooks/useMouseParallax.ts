import { useEffect } from 'react';
import { useMotionValue, useSpring, useTransform } from 'motion/react';

export const useMouseParallax = (baseParallax: number = 10, multiplier: number = 1) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 30, stiffness: 100, mass: 0.5 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);
  
  const parallaxAmt = baseParallax * multiplier;
  
  const x = useTransform(mouseXSpring, [-1, 1], [parallaxAmt, -parallaxAmt]);
  const y = useTransform(mouseYSpring, [-1, 1], [parallaxAmt, -parallaxAmt]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return { x, y };
};
