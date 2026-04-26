import { useEffect, useRef } from "react";
import lottie from "lottie-web";

/**
 * LottiePlayer
 * Efficient Lottie renderer. Re-initializes only when animData object reference changes.
 */
export default function LottiePlayer({ animData, size = 180 }) {
  const containerRef = useRef(null);
  const animRef      = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !animData) return;
    if (animRef.current) { animRef.current.destroy(); animRef.current = null; }
    containerRef.current.innerHTML = "";
    animRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: animData,
    });
    return () => {
      if (animRef.current) { animRef.current.destroy(); animRef.current = null; }
    };
  }, [animData]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size, flexShrink: 0 }}
    />
  );
}