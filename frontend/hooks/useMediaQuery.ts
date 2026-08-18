'use client'

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // window.matchMedia não existe no servidor, então o valor real só pode
    // ser lido após o mount — daí a leitura síncrona aqui, não via lazy init.
    const mql = window.matchMedia(query)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(mql.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
