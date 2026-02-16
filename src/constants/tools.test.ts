import { describe, expect, it } from 'vitest'

import { getToolDefinition, getToolsByGroup, TOOL_DEFINITIONS } from '@/constants/tools'

describe('TOOL_DEFINITIONS', () => {
  it('has 18 tools', () => {
    expect(TOOL_DEFINITIONS).toHaveLength(18)
  })

  it('each tool has required fields', () => {
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool).toHaveProperty('id')
      expect(tool).toHaveProperty('label')
      expect(tool).toHaveProperty('icon')
      expect(tool).toHaveProperty('shortcut')
      expect(typeof tool.label).toBe('string')
      expect(typeof tool.shortcut).toBe('string')
    }
  })

  it('has unique ids', () => {
    const ids = TOOL_DEFINITIONS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getToolsByGroup', () => {
  it('returns individual tools', () => {
    const tools = getToolsByGroup('individual')
    expect(tools.length).toBeGreaterThan(0)
    expect(tools.every((t) => t.group === 'individual')).toBe(true)
  })

  it('returns shapes tools', () => {
    const tools = getToolsByGroup('shapes')
    expect(tools.length).toBe(5)
    expect(tools.map((t) => t.id)).toContain('rectangle')
    expect(tools.map((t) => t.id)).toContain('oval')
  })

  it('returns lines tools', () => {
    const tools = getToolsByGroup('lines')
    expect(tools.length).toBe(2)
  })

  it('returns markup tools', () => {
    const tools = getToolsByGroup('markup')
    expect(tools.length).toBe(3)
  })

  it('returns special tools', () => {
    const tools = getToolsByGroup('special')
    expect(tools.length).toBe(4)
  })

  it('returns empty for unknown group', () => {
    expect(getToolsByGroup('nonexistent')).toEqual([])
  })
})

describe('getToolDefinition', () => {
  it('returns tool by id', () => {
    const tool = getToolDefinition('selection')
    expect(tool).toBeDefined()
    expect(tool!.label).toBe('Selection')
  })

  it('returns undefined for unknown id', () => {
    expect(getToolDefinition('unknown' as never)).toBeUndefined()
  })

  it('returns correct tool for each known id', () => {
    expect(getToolDefinition('rectangle')?.label).toBe('Rectangle')
    expect(getToolDefinition('text')?.label).toBe('Text')
    expect(getToolDefinition('freehand')?.label).toBe('Freehand')
    expect(getToolDefinition('arrow')?.label).toBe('Arrow')
    expect(getToolDefinition('highlight')?.label).toBe('Highlight')
  })
})
