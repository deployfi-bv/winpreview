import { describe, expect, it } from 'vitest'

import { SHORTCUTS } from '@/constants/shortcuts'

import type { ShortcutDefinition } from '@/constants/shortcuts'

describe('SHORTCUTS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(SHORTCUTS)).toBe(true)
    expect(SHORTCUTS.length).toBeGreaterThan(0)
  })

  it('each shortcut has required fields', () => {
    for (const s of SHORTCUTS) {
      expect(s).toHaveProperty('key')
      expect(s).toHaveProperty('requiresDocument')
      expect(s).toHaveProperty('action')
      expect(typeof s.key).toBe('string')
      expect(typeof s.requiresDocument).toBe('boolean')
      expect(typeof s.action).toBe('string')
    }
  })

  it('has common shortcuts', () => {
    const actions = SHORTCUTS.map((s: ShortcutDefinition) => s.action)
    expect(actions).toContain('open')
    expect(actions).toContain('save')
    expect(actions).toContain('undo')
    expect(actions).toContain('redo')
    expect(actions).toContain('zoom-in')
    expect(actions).toContain('zoom-out')
    expect(actions).toContain('delete')
  })

  it('Ctrl+O opens file', () => {
    const open = SHORTCUTS.find((s) => s.key === 'o' && s.ctrl)
    expect(open).toBeDefined()
    expect(open!.action).toBe('open')
    expect(open!.requiresDocument).toBe(false)
  })

  it('Ctrl+S saves document', () => {
    const save = SHORTCUTS.find((s) => s.key === 's' && s.ctrl && !s.shift)
    expect(save).toBeDefined()
    expect(save!.action).toBe('save')
    expect(save!.requiresDocument).toBe(true)
  })

  it('Ctrl+Z is undo', () => {
    const undo = SHORTCUTS.find((s) => s.key === 'z' && s.ctrl && !s.shift)
    expect(undo).toBeDefined()
    expect(undo!.action).toBe('undo')
  })

  it('Escape is available without document', () => {
    const esc = SHORTCUTS.find((s) => s.key === 'Escape')
    expect(esc).toBeDefined()
    expect(esc!.requiresDocument).toBe(false)
  })

  it('tool shortcuts require document', () => {
    const toolShortcuts = SHORTCUTS.filter((s) => s.action.startsWith('tool-'))
    expect(toolShortcuts.length).toBeGreaterThan(0)
    expect(toolShortcuts.every((s) => s.requiresDocument)).toBe(true)
  })
})
