import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let text = ''

    if (file.name.toLowerCase().endsWith('.pdf')) {
      // Lazy load unpdf to avoid build-time dependencies issues
      const { getDocumentProxy, extractText } = require('unpdf')
      const pdf = await getDocumentProxy(new Uint8Array(buffer))
      const result = await extractText(pdf, { mergePages: true })
      text = result.text || ''
    } else if (file.name.toLowerCase().endsWith('.docx')) {
      // Lazy load mammoth
      const mammoth = require('mammoth')
      const docxData = await mammoth.extractRawText({ buffer })
      text = docxData.value || ''
    } else {
      return NextResponse.json(
        { success: false, error: 'Formato de arquivo não suportado. Envie apenas PDF ou DOCX.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, text: text.trim() })
  } catch (error: any) {
    console.error('Document parsing error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno ao processar o arquivo.' },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
