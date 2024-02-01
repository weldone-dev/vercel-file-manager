import {NextRequest, NextResponse} from "next/server";
import path from "node:path";
import fs from "fs/promises";
const getFixturePath = (filename: string) => path.join(process.cwd(), 'public', filename)
export async function GET(request: NextRequest) {
    const file = await fs.readFile(getFixturePath(`data.json`), {
        encoding: "utf-8"
    })
    return NextResponse.json({
        path: getFixturePath(`data.json`),
        data: JSON.parse(file)
    })
}