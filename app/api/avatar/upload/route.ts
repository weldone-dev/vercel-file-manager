import { put } from '@vercel/blob';
import {type NextRequest, NextResponse} from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || "empty";

    if (request.body){
        const blob = await put(filename, request.body, {
            access: 'public',
        });
        return NextResponse.json(blob);
    }
    return NextResponse.json({ok: false, status: "Error, didn't body"})




}

// The next lines are required for Pages API Routes only
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
