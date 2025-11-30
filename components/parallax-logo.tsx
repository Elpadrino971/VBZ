interface ParallaxLogoProps {
  className?: string
}

export function ParallaxLogo({ className = "" }: ParallaxLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="VYBZZZ Logo"
      className={`w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 animate-logo-bounce animate-logo-glow object-contain drop-shadow-2xl ${className}`}
    />
  )
}

