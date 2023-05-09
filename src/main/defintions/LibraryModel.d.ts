import { ItemTypes } from "./ItemTypes.e"


export interface IItemIdentity {
    id: string,
    name: string,
    itemType: ItemTypes,
    year: string,
    imageURL: string,
    author: string,
    parented: number
}

export interface ICollection {
    name: string
    description: string
    id: string
    parented: number;
    items: Array<string>  
    subCollections: Array<string>
}

export interface ILibrary {
    masterCollection: ICollection
}