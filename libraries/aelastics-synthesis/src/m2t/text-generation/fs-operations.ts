import * as fs from "fs"

export async function createDir(path:string):Promise<boolean> {
    if(!fs.existsSync(path))
            fs.mkdirSync(path)
    return true
}

export async function createFile(path:string, data:string):Promise<boolean> {

    fs.writeFileSync(path, data)
    return true
}