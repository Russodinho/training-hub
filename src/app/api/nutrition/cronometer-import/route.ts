import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { createServiceClient } from '@/lib/supabase'

// Dedicated automation endpoint for cronometer_sync.ps1 (watches Downloads
// for cronometer*.csv exports). Accepts the same { csv: string } JSON
// contract as /api/nutrition/upload and /api/biometrics/upload (see
// fuel/page.tsx's handleFile) — the script reads the file as text and
// posts it the same way a browser upload would, so no multipart handling
// is needed here.
export async function POST(req: NextRequest) {
  const { csv } = await req.json()
  if (!csv) return NextResponse.json({ error: 'No CSV provided' }, { status: 400 })

  const result = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  })

  const supabase = createServiceClient()
  let rows = 0
  let errors = 0
  let skipped = 0

  for (const row of result.data) {
    const date = row['Date'] || row['date']
    if (!date) { skipped++; continue }

    const calories = parseFloat(row['Energy (kcal)'] || row['Calories'] || '') || null
    const protein = parseFloat(row['Protein (g)'] || row['Protein'] || '') || null
    const fat = parseFloat(row['Fat (g)'] || row['Fat'] || row['Total Fat (g)'] || '') || null
    const carbs = parseFloat(row['Carbs (g)'] || row['Net Carbs (g)'] || row['Carbohydrates (g)'] || '') || null
    const fiber = parseFloat(row['Fiber (g)'] || row['Dietary Fiber (g)'] || '') || null

    const { error } = await supabase.from('nutrition_actuals').upsert({
      date,
      calories,
      protein,
      fat,
      carbs,
      fiber,
      raw_data: row,
    }, { onConflict: 'date' })

    if (error) errors++
    else rows++
  }

  return NextResponse.json({
    rows,
    errors,
    skipped,
    message: `Imported ${rows} day(s) of nutrition data from Cronometer${errors > 0 ? `, ${errors} errors` : ''}${skipped > 0 ? `, skipped ${skipped} row(s) with no date` : ''}`,
  })
}
