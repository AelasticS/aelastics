import { mkdir, writeFile } from "fs/promises"

export async function createDir(path:string):Promise<boolean> {
    await mkdir(path)
    return true
}

export async function createFile(path:string, data:string):Promise<boolean> {

    await writeFile(path, data)
    return true
}