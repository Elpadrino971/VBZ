"use client"

import { useEffect, useRef } from "react"

export function ScrollToTopOnMount() {
  const hasScrolledRef = useRef(false)

  useEffect(() => {
    // Empêcher le scroll automatique et forcer le scroll en haut
    const preventScroll = () => {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
        if (document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
          document.documentElement.style.scrollBehavior = "auto"
          document.documentElement.scrollTop = 0
          document.body.scrollTop = 0
        }
      }
    }

    // Immédiatement
    preventScroll()

    // Après plusieurs délais pour s'assurer que le DOM est prêt
    const timeouts = [
      setTimeout(preventScroll, 0),
      setTimeout(preventScroll, 50),
      setTimeout(preventScroll, 100),
      setTimeout(preventScroll, 200),
      setTimeout(preventScroll, 500),
    ]

    // Empêcher le scroll pendant les premières secondes
    const handleScroll = (e: Event) => {
      if (!hasScrolledRef.current && (window.scrollY > 50 || document.documentElement.scrollTop > 50)) {
        e.preventDefault()
        e.stopPropagation()
        preventScroll()
      }
    }

    // Empêcher le scroll pendant 2 secondes après le chargement
    window.addEventListener("scroll", handleScroll, { passive: false, capture: true })
    
    setTimeout(() => {
      hasScrolledRef.current = true
      window.removeEventListener("scroll", handleScroll, { capture: true })
    }, 2000)

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
      window.removeEventListener("scroll", handleScroll, { capture: true })
    }
  }, [])

  return null
}

