'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return

      // / — focus search
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]')
        searchInput?.focus()
      }

      // Cmd/Ctrl+K — open search (prevent browser default)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        router.push('/productos')
        setTimeout(() => {
          const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]')
          searchInput?.focus()
        }, 100)
      }

      // Escape — close any open dropdown/modal
      if (e.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement
        if (activeElement?.tagName === 'BUTTON' || activeElement?.closest('[role="menu"]') || activeElement?.closest('[role="dialog"]')) {
          activeElement.blur()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])
}
