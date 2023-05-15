import { ItemTypes } from "./ItemTypes.e"

export interface IChildThing {
    parented: number
}

export interface ISearchItem {
    id: string,
    name: string,
    thumbnailURL: string,
    itemType: ItemTypes
}

export interface IItem {
    id: string,
    name: string,
    itemType: ItemTypes,
    year: string,
    thumbnailURL: string,
    bannerURL: string,
    description: string,
    author: Array<string>,
    genres: Array<string>,    
}

export interface ICollection {
    name: string
    description: string
    id: string
    items: Array<string>  
    subCollections: Array<string>
}

export interface ILibrary {
    masterCollection: ICollection
}