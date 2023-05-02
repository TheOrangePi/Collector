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

    constructor(name: string, description: string, id: string) {
        this.name = name;
        this.description = description;
        this.id = id;
        this.items = new Map();
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
    collections: Map<string, Collection>
    nameIdPairs: Map<string, string>
    actions: {[event: string] : (instruction: any)=> any} = {
        ["CRUDLibrary"]: ({operation, arg}:{operation: Operation, arg:any})=> this.CRUDCollection(operation, arg),
        ["SearchLibrary"] : ({itemType, searchTerm, onResultsFound} : {itemType: ItemTypes, searchTerm: string, onResultsFound: Function}) => this.SearchLibrary(itemType, searchTerm, onResultsFound),
        ["CRUDItem"] : ({operation, collectionId, arg}:{operation: Operation, collectionId:string, arg:any})=> this.CRUDItem(operation, collectionId, arg),
    };

    bookDB : BookDB;

    constructor(){
        this.collections = new Map();
        this.nameIdPairs = new Map();
        this.bookDB = new BookDB();
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
            let success = undefined
            switch(operation) {
                case Operation.CREATE:
                   return {success: collection.AddItem(arg), collection: collection}
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

    
    CRUDCollection(operation: Operation, arg:any) {
        switch(operation){
            case Operation.CREATE:
                return this.AddCollection(arg)
              
            case Operation.READ:
                return this.GetCollections()
              
            case Operation.UPDATE:
                return this.UpdateCollection(arg)
        
            case Operation.DELETE:
                return this.RemoveCollection(arg)
                
        }
    }

    AddCollection({name, description}:{name: string, description: string} ): {success: boolean, collection: ICollection | undefined} {
       let id = nanoid();
       if(this.nameIdPairs.get(name.toLowerCase())){
            return{success: false, collection: undefined};
       }
       let collection = new Collection(name, description, id);
       this.collections.set(id, collection);
       this.nameIdPairs.set(name.toLowerCase(), id);
       return{success: true, collection: this.collections.get(id)}
    }   
    
    GetCollections() {
        return this.collections;
    }

    UpdateCollection({id, name, description} : {id:string, name:string | undefined, description: string |undefined}): {success: boolean, collection: ICollection | undefined} {
        let collection = this.collections.get(id);
        if(collection == undefined){
            return {success:false, collection: undefined}
        }
        if(name !== undefined){
            let otherID =this.nameIdPairs.get(name.toLowerCase())
            if( otherID !== undefined && otherID !== id){
                return{success: false, collection: undefined};
            }
            let oldName = collection.name
            collection.name = name;
            this.nameIdPairs.delete(oldName.toLowerCase());
            this.nameIdPairs.set(name.toLowerCase(), collection.id);
        }
        if(description !== undefined) {
            collection.description = description;
        }
        return {success:true, collection:collection};
    }

    RemoveCollection(id:string){
        let collection : ICollection | undefined = this.collections.get(id);
        if(collection === undefined) return;
        this.nameIdPairs.delete(collection.name.toLowerCase())
        this.collections.delete(id);
    }



    
}