

export interface IItemIdentity {
    source: string //what database
    id: string  //the id as it is in that database to retirve it
    name: string
   //display img??
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