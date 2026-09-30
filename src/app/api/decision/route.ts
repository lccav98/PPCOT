import { NextRequest, NextResponse } from 'next/server'
import { evaluateDecisionWithJev } from '@/lib/jevDecisionEngine'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { linhasAcao, criterios, context, targetUnit } = body

    if (!linhasAcao || !Array.isArray(linhasAcao) || linhasAcao.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lista de Linhas de Ação inválida ou vazia.' },
        { status: 400 }
      )
    }

    if (!criterios || !Array.isArray(criterios) || criterios.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lista de Critérios de Avaliação inválida ou vazia.' },
        { status: 400 }
      )
    }

    const result = await evaluateDecisionWithJev({
      linhasAcao,
      criterios,
      context,
      targetUnit
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[JEV Decision Engine Error]:', msg)
    return NextResponse.json(
      {
        success: false,
        error: msg
      },
      { status: 500 }
    )
  }
}
