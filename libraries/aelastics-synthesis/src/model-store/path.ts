export enum PathType {
  ABS_PROTOCOL,       // absolute path with protocol  (e.g. jsx-file://www.aelastics.com/n1/n2 )  
  ABS_NO_PROTOCOL,    // absolute path without protocol, starting with double slash (e.g. //aelastics.com/n1/n2)
  REL_NAME,           // relative path with names and '..' (e.g. "../../n2")
  REL_POINT,          // relative path starting with point  (e.g. "./n0/n1/n2")
  REL_SLASH           // relative path startimg with single slash "/n1/n2"
}


export function doParseURL(url:string): [type: PathType, segments: string[]] {
  // trim and split
  const segments = url.replace(/\s/g, '').split("/")
  
  if (segments.length === 1 && segments[0] === "") 
    throw new Error(`doParseURL: bad url:${url}`)

  if (segments[0].length > 0 && segments[1]?.length === 0 && segments[2]?.length >= 0)
    return [PathType.ABS_PROTOCOL, segments]

  if (segments[0].length === 0 && segments[1]?.length === 0)
    return [PathType.ABS_NO_PROTOCOL, segments]

  if (segments[0].length === 1 && segments[0] === ".")
    return [PathType.REL_POINT, segments]

  if (segments[0].length === 0 && segments[1]?.length >= 0)
    return [PathType.REL_POINT, segments]

  return [PathType.REL_NAME, segments]
}