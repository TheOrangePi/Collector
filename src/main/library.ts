import { ICollection, IItemIdentity, ILibrary } from "main/defintions/LibraryModel"
import {Operation} from "./defintions/Operations.e"
import { nanoid } from "nanoid";
import { ItemTypes } from "./defintions/ItemTypes.e";
import BookDB from "./bookDB";

class Item implements IItemIdentity {
    id: string;
    name: string;
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
    }
   
}

class Collection implements ICollection {
    name: string;
    description: string;
    id: string;
    items: Map<string, IItemIdentity>;
    subCollections: Map<string, ICollection>;

    constructor(name: string, description: string, id: string) {
        this.name = name;
        this.description = description;
        this.id = id;
        this.items = new Map();
        this.subCollections = new Map();
    }   

    AddItem({itemId, itemType, name, imageURL, author, year}: {itemId : string, itemType : ItemTypes, name :string, imageURL :string, author :string, year :string} ) :  boolean {
        let id = `${itemType}-${itemId}`;
        if(this.items.has(id)) return true;
        let item = new Item(name, id, itemType, imageURL, author, year);
        this.items.set(id, item);
        return true;
    }

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

    bookDB : BookDB;

    constructor(){
        this.bookDB = new BookDB();
        this.collections = new Map();
        this.items = new Map();
        this.masterCollection = new Collection("Book Shelves", "", "0");
        this.collections.set(this.masterCollection.id, this.masterCollection);    
    }


    SearchLibrary(itemType: ItemTypes, searchTerm: string , onResultsFound: Function) {
        let searchTerms : Array<string> = searchTerm.split(' ');
        switch(itemType){
            case ItemTypes.BOOK:
                return this.bookDB.SearchBooks(searchTerms);
        }

    }

    CRUDItem(operation: Operation, collectionId:string, arg:any) {
        // let collection = this.collections.get(collectionId);
        // if(collection) {
        //     let success = undefined
        //     switch(operation) {
        //         case Operation.CREATE:
        //            return {success: collection.AddItem(arg), collection: collection}
        //         case Operation.READ:
        //           return
        //         case Operation.UPDATE:
        //             return
        //         case Operation.DELETE:
        //             return
        //     }
        // } 
        // throw new Error(`collection ${collectionId} does not exist when CRUD Item`)
    }

    
    CRUDCollection(operation: Operation, collectionId: string, arg:any) {
        let collection = this.collections.get(collectionId);
        if(collection) {
            switch(operation){
                case Operation.CREATE:
                    return this.AddCollection(collectionId, arg)
                case Operation.READ:
                    return this.GetCollections()
                  
                case Operation.UPDATE:
                    return this.UpdateCollection(arg)
            
                case Operation.DELETE:
                    return this.RemoveCollection(collectionId, arg)
                    
            }
        }

        
       
    }

    AddCollection(collectionId: string, {name, description}:{name: string, description: string} ): ICollection {
        let id = nanoid();
        let collection = new Collection(name, description, id);
        this.collections.set(id, collection);
        this.collections.get(collectionId)?.subCollections.set(id, collection);
        console.log(collection)
        return collection;
     }   
     
     GetCollections() {
         return this.masterCollection;
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
         collection.subCollections.delete(id);
     }



    
}