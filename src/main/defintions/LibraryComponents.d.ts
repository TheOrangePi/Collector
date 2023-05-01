import * as React from "react"
import { ICollection } from "./LibraryModel"



export interface ILibraryComponent{
}

export interface ICollectionComponent {
    collection: ICollection,
    onRemoveCollection: Function
}

export interface ILibraryHeaderComponent {
    onCreateCollection: Function
}


