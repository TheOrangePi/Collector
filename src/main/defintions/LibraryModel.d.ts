import { ItemTypes } from "./ItemTypes.e"


export interface IItemIdentity {
    id: string,
    name: string,
    itemType: ItemTypes,
    year: string,
    imageURL: string,
    author: string,
}

export interface ICollection {
    name: string
    description: string
    id: string
    items: Map<string, IItemIdentity>  
}

export interface ILibrary {
    collections: Map<string, ICollection>
    nameIdPairs: Map<string, string>
}