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

  const supabase = createServiceClient()
  let rows = 0
  let errors = 0

  for (const row of result.data) {
    const date = row['Date'] || row['date']
    if (!date) continue

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
    message: `Imported ${rows} days of nutrition data${errors > 0 ? ` (${errors} errors)` : ''}`,
  })
}
