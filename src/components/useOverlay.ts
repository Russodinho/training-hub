'use client'

import { useEffect, useRef } from 'react'

// Shared open/close plumbing for the mobile section-selector sheet and the
// full mobile menu: Escape closes, Tab is trapped inside the panel while
// open, and focus returns to whatever triggered the open once it closes.
// Click-outside/backdrop dismissal is handled by each caller since the two
// surfaces close on a different gesture (click-outside-the-wrap vs. a
// dedicated full-screen backdrop).
export function useOverlay<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const containerRef = useRef<T | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement
    } else if (openerRef.current) {
      openerRef.current.focus()
      openerRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const getFocusable = () =>
      containerRef.current
        ? Array.from(containerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
        : []

    getFocusable()[0]?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const els = getFocusable()
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return containerRef
}
