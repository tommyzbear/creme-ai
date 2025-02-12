import { safeService } from '@/lib/services/safe'
import { grantTokenPermissions } from '../../../lib/services/zodiac'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const result = await safeService.grantZodiacRole()
        // const result = await safeService.setupZodiacRole(
        //     "0xd9CfA3466C6f075dEE7055082709fC000358DD81",
        //     "0xd9CfA3466C6f075dEE7055082709fC000358DD81",
        //     "0xd9CfA3466C6f075dEE7055082709fC000358DD81",
        //     true
        // )
        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        console.error('Error granting token permissions:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        })
    }
}

