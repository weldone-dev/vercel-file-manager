import type {NextRequest} from "next/server"
import {NextResponse} from "next/server";
import fs from "fs/promises"
import path from "node:path";

enum Type {
    "File" = 'file',
    "Folder" = 'folder'
}

interface IFiles {
    mime?: string;
    name: string;
    size: number;
    type: Type.File;
    created: number;
    permission: string;
    path: string;
}

interface IFolder {
    has_children: boolean;
    name: string;
    created: number;
    type: Type.Folder;
    permission: string;
    path: string;
}

type IList = (IFiles | IFolder)[]



async function getInfo(pathName: string) {
    const stat = await fs.stat(pathName)
    return {
        path: path.resolve(pathName),
        permission: '0' + (stat.mode & 0o777).toString(8),
        mode: stat.mode,
        directory: stat.isDirectory(),
        file: stat.isFile(),
        symlink: stat.isSymbolicLink(),
        size: stat.size,
        modified: stat.mtime,
        created: stat.birthtime
    }
}


async function getFile(pathName: string) {
    const info = await getInfo(pathName)
    return {
        name: path.basename(pathName),
        size: info.size,
        type: Type.File,
        created: info.created.getTime(),
        permission: info.permission,
        path: pathName
    } as IFiles
}

async function getFolder(pathName: string) {
    const children = await fs.readdir(pathName)
    const info = await getInfo(pathName)
    return {
        name: path.basename(pathName),
        type: Type.Folder,
        has_children: children.length > 0,
        created: info.created.getTime(),
        permission: info.permission,
        path: pathName
    } as IFolder
}

async function getList(pathName: string) {
    const list = await fs.readdir(
        path.resolve(pathName),
        {withFileTypes: true}
    )
    const a = await Promise.race(
        list.map(v => {
            const props = path.join(v.path, v.name)
            if (v.isFile()) {
                return getFile(props)
            }
            return getFolder(props)
        })
    )
    return {
        files: a,
    }
}
const getFixturePath = (filename: string) => path.join(process.cwd(), 'public', filename)
export async function GET(request: NextRequest) {
    const pathName = request.nextUrl.searchParams.get("path") || path.join(process.cwd(), 'public')
    const cmd = request.nextUrl.searchParams.get("cmd") || "list"

    switch (cmd) {
        case "list":
            try {
                return NextResponse.json({
                    ok: true,
                    result: await getList(pathName)
                }, {status: 200})
            } catch (e) {
                return NextResponse.json({
                    ok: false,
                    status: e
                }, {status: 500})
            }
        case "test":
            const list = await fs.readdir(
                getFixturePath(pathName),
                {withFileTypes: true}
            )
            return NextResponse.json({
                ok: true,
                result: {
                    list: list.map(v => ({name: v.name, path: v.path}))
                }
            }, {status: 200})
    }
}