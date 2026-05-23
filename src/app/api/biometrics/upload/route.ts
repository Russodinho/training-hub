import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { csv } = await req.json()
  if (!csv) return NextResponse.json({ error: 'No CSV provided' }, { status: 400 })

  const result = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  })

  // Cronometer biometrics is long format: Date, Time, Measurement, Value, Unit
  const byDate: Record<string, { weight_lbs: number | null; body_fat_pct: number | null }> = {}

  for (const row of result.data) {
    const date = row['Date'] || row['date']
    if (!date) continue

    if (!byDate[date]) byDate[date] = { weight_lbs: null, body_fat_pct: null }

    const measurement = (row['Measurement'] || row['Metric'] || row['measurement'] || '').toLowerCase()
    const rawValue = row['Value'] || row['Amount'] || row['value'] || ''
    const value = parseFloat(rawValue)
    const unit = (row['Unit'] || row['unit'] || '').toLowerCase()

    if (isNaN(value)) continue

    if (measurement.includes('weight')) {
      // Convert kg → lbs if needed
      byDate[date].weight_lbs = unit === 'kg' ? Math.round(value * 2.20462 * 10) / 10 : value
    } else if (measurement.includes('body fat') || measurement.includes('bodyfat') || measurement.includes('fat %') || measurement.includes('fat percentage')) {
      byDate[date].body_fat_pct = value
    }
  }

  const supabase = createServiceClient()
  let rows = 0
  let errors = 0

  for (const [date, vals] of Object.entries(byDate)) {
    if (vals.weight_lbs === null && vals.body_fat_pct === null) continue

    const w = vals.weight_lbs
    const bf = vals.body_fat_pct
    const lean = w && bf ? Math.round(w * (1 - bf / 100) * 10) / 10 : null
    const fat = w && bf ? Math.round(w * (bf / 100) * 10) / 10 : null

    const { error } = await supabase.from('biometrics').upsert({
      date,
      weight_lbs: w,
      body_fat_pct: bf,
      lean_mass_lbs: lean,
      fat_mass_lbs: fat,
    }, { onConflict: 'date' })

    if (error) errors++
    else rows++
  }

  return NextResponse.json({
    rows,
    errors,
    message: `Imported ${rows} biometric entries${errors > 0 ? ` (${errors} errors)` : ''}`,
  })
}
