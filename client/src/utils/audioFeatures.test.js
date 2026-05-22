import { describe, it, expect } from 'vitest'

// Fungsi mean dan mode yang diuji
function mean(values) {
  const valid = values.filter((v) => v != null)
  if (valid.length === 0) return null
  return Math.round(valid.reduce((s, v) => s + v, 0) / valid.length)
}

function mode(values) {
  const valid = values.filter((v) => v != null)
  if (valid.length === 0) return null
  const counts = {}
  valid.forEach((v) => { counts[v] = (counts[v] || 0) + 1 })
  return Object.entries(counts).sort(([,a],[,b]) => b - a)[0][0]
}

// ── Mean tests ──
describe('mean()', () => {
  it('hitung rata-rata normal', () => {
    expect(mean([80, 90, 70])).toBe(80)
  })
  it('skip nilai null', () => {
    expect(mean([80, null, 90])).toBe(85)
  })
  it('semua null → return null', () => {
    expect(mean([null, null])).toBe(null)
  })
  it('satu nilai', () => {
    expect(mean([75])).toBe(75)
  })
  it('array kosong → return null', () => {
    expect(mean([])).toBe(null)
  })
})

// ── Mode tests ──
describe('mode()', () => {
  it('nilai paling sering muncul', () => {
    expect(mode(['energetic', 'energetic', 'calm'])).toBe('energetic')
  })
  it('skip nilai null', () => {
    expect(mode([null, 'happy', 'happy'])).toBe('happy')
  })
  it('semua null → return null', () => {
    expect(mode([null, null])).toBe(null)
  })
  it('satu nilai', () => {
    expect(mode(['calm'])).toBe('calm')
  })
  it('array kosong → return null', () => {
    expect(mode([])).toBe(null)
  })
})