import { ensoService } from '@/lib/services/enso';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const routeParams = await request.json();
        const routerData = await ensoService.getRouterData(routeParams);

        return NextResponse.json(routerData);
    } catch (error) {
        console.error('Error in getRouter API:', error);
        return NextResponse.json(
            { error: 'Failed to get router data' },
            { status: 500 }
        );
    }
} 