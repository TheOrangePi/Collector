import { ICollection, IItemIdentity, ILibrary } from "main/defintions/LibraryModel"
import {Operation} from "./defintions/Operations.e"
import { nanoid } from "nanoid";
import { ItemTypes } from "./defintions/ItemTypes.e";
import BookDB from "./bookDB";
import { library } from "webpack";
import FileStore from "./filestore";

class Item implements IItemIdentity {
    id: string;
    name: string;
    parented: number;
    itemType: ItemTypes;
    year: string;
    imageURL: string;
    author: string;

    constructor(name: string, id: string, itemType: ItemTypes, imageURL: string, author: string, year:string) {
        this.name = name;
        this.id = id;
        this.itemType = itemType;
        this.imageURL = imageURL;
        this.author = author;
        this.year = year;
        this.parented = 0;
    }
   
}

class Collection implements ICollection {
    name: string;
    description: string;
    id: string;
    items: Array<string>;
    subCollections: Array<string>;
    parented: number;

    constructor(name: string, description: string, id: string) {
        this.name = name;
        this.description = description;
        this.id = id;
        this.items = new Array();
        this.subCollections = new Array();
        this.parented = 0;
    }   

//     AddItem({itemId, itemType, name, imageURL, author, year}: {itemId : string, itemType : ItemTypes, name :string, imageURL :string, author :string, year :string} ) :  IItemIdentity |undefined{
//         let id = `${itemType}-${itemId}`;
//         let index = this.items.findIndex((value) => {return id === value})
//         if(index === -1) {
//             let item = new Item(name, id, itemType, imageURL, author, year);
//             this.items.push(id);
//         }       
//         return this.items[]
//     }

}

export class Library implements ILibrary{
    masterCollection: Collection
    collections: Map<string, Collection>
    items: Map<string, Item>
    actions: {[event: string] : (instruction: any)=> any} = {
        ["CRUDLibrary"]: ({operation, collectionId, arg}:{operation: Operation, collectionId : string, arg:any})=> this.CRUDCollection(operation, collectionId, arg),
        ["SearchLibrary"] : ({itemType, searchTerm, onResultsFound} : {itemType: ItemTypes, searchTerm: string, onResultsFound: Function}) => this.SearchLibrary(itemType, searchTerm, onResultsFound),
        ["CRUDItem"] : ({operation, collectionId, arg}:{operation: Operation, collectionId:string, arg:any})=> this.CRUDItem(operation, collectionId, arg),
    };

    libraryStore: FileStore;

    bookDB : BookDB;

    constructor(libraryStore: FileStore){
        this.bookDB = new BookDB();
        this.libraryStore = libraryStore;
        let loadedLibrary = libraryStore.LoadJSON();
        this.items = new Map(loadedLibrary.items) ?? new Map();
        this.collections = new Map(loadedLibrary.collections) ?? new Map();
        let master = this.collections.get("0");
        if(master){
            this.masterCollection = master;
        } else {
            this.masterCollection = new Collection("Book Shelves", "The Master Collection", "0");
            this.collections.set(this.masterCollection.id, this.masterCollection); 
        }
    }


    SearchLibrary(itemType: ItemTypes, searchTerm: string , onResultsFound: Function) {
        let searchTerms : Array<string> = searchTerm.split(' ');
        switch(itemType){
            case ItemTypes.BOOK:
                return this.bookDB.SearchBooks(searchTerms);
        }

    }

    CRUDItem(operation: Operation, collectionId:string, arg:any) {
        let collection = this.collections.get(collectionId);
        if(collection) {
            switch(operation) {
                case Operation.CREATE:
                   //let added = collection.AddItem(arg);
                   this.SignalStateChange();
                  // return added;
                case Operation.READ:
                  return
                case Operation.UPDATE:
                    return
                case Operation.DELETE:
                    return
            }
        } 
        throw new Error(`collection ${collectionId} does not exist when CRUD Item`)
    }

    
    CRUDCollection(operation: Operation, collectionId: string, arg:any) {
        let collection = this.collections.get(collectionId);
        if(collection) {
            let different = undefined;
            switch(operation){
                case Operation.CREATE:
                    different = this.AddCollection(collectionId, arg);
                    this.SignalStateChange();
                    break;
                case Operation.READ:
                    return this.GetCollections();
                case Operation.UPDATE:
                    different = this.UpdateCollection(arg);
                    this.SignalStateChange();
                    break;
                case Operation.DELETE:
                    this.RemoveCollection(collectionId, arg);
                    this.SignalStateChange(); 
                    break;              
            }
            return {collection: collection, different:different};
        }

        
       
    }

    AddCollection(collectionId: string, {name, description}:{name: string, description: string} ): ICollection {
        let id = nanoid();
        let collection = new Collection(name, description, id);
        this.collections.set(id, collection);
        this.collections.get(collectionId)?.subCollections.push(id);
        console.log(collection)
        return collection;
     }   
     
    GetCollections() {
        return {master: this.masterCollection, collections: this.collections, items: this.items};
    }

    UpdateCollection({id, name, description} : {id:string, name:string | undefined, description: string |undefined}): ICollection |undefined {
        let collection = this.collections.get(id);
        if(collection == undefined){
            return undefined
        }
        if(name !== undefined){
            collection.name = name;
        }
        if(description !== undefined) {
            collection.description = description;
        }
        return collection;
    }
///Not that this doesn't remove it from the collections entity. May be a problemt has can;t ever actully delete collections.
    RemoveCollection(collectionId: string, id:string){
        let collection : ICollection | undefined = this.collections.get(collectionId);
        if(collection === undefined) return;
        let index = collection.subCollections.findIndex((value) => {
            return value == id;
        });
        if(index === -1) return;
        let deletedIdArr = collection.subCollections.splice(index,1);
        let deletedId = deletedIdArr[0];
        let deleted = this.collections.get(deletedId);
        if(deleted && deleted.parented <= 0) {
            this.collections.delete(deletedId);
        }

    }

    SignalStateChange() {
        let collections = [...this.collections];
        let items = [...this.items];
        this.libraryStore.SaveJSON({collections: collections, items: items});
    }



    
}