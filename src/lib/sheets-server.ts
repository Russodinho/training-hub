// Server-only — never import this from a 'use client' component
import 'server-only'

export async function appendToSheet(
  sheetId: string,
  range: string,
  values: (string | number)[][]
): Promise<void> {
  const { google } = await import('googleapis')

  const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  })
}
