import * as uml from "./uml.meta.model.type"
import { Doc, Sec, P } from "aelastics-synthesis"  

export const generateCD = (cd:uml.IClassDiagram):string => {
const result:string [] = []

cd.elements.forEach((el)=> 
 
// if (el.typeof is uml:Class) 
    generateClass(el as uml.IClass))

return result.join()
}

const generateClass = (c:uml.IClass) => {
    
} 

const generateAssoc = (c:uml.IAssociation) => {

} 