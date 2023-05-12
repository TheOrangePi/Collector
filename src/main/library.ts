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
}

export class Library implements ILibrary{
    masterCollection: Collection
    collections: Map<string, Collection>
    items: Map<string, Item>
    actions: {[event: string] : (instruction: any)=> any} = {
        ["CRUDLibrary"]: ({operation, collectionId, arg}:{operation: Operation, collectionId : string, arg:any})=> this.CRUDCollection(operation, collectionId, arg),
        ["SearchLibrary"] : ({itemType, searchTerm} : {itemType: ItemTypes, searchTerm: string}) => this.SearchLibrary(itemType, searchTerm),
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


    SearchLibrary(itemType: ItemTypes, searchTerm: string) {
        let searchTerms : Array<string> = searchTerm.split(' ');
        switch(itemType){
            case ItemTypes.BOOK:
                return this.bookDB.SearchBooks(searchTerms);
        }

    }

    CRUDItem(operation: Operation, collectionId:string, arg:any) {
        console.log(arg);
        let collection = this.collections.get(collectionId);
        if(collection) {
            let different;
            switch(operation) {
                case Operation.CREATE:
                    different = this.AddItem(collection, arg);
                    this.SignalStateChange();
                    break;
                case Operation.READ:
                  return
                case Operation.UPDATE:
                    return
                case Operation.DELETE:
                    different = this.RemoveItem(collection, arg);
                    this.SignalStateChange();
                    break;
            }
            
            return {collection: collection, different:different};

        } 
        throw new Error(`collection ${collectionId} does not exist when CRUD Item`)
    }

    
    CRUDCollection(operation: Operation, collectionId: string, arg:any) {
        let collection = this.collections.get(collectionId);
        if(collection) {
            let different = undefined;
            switch(operation){
                case Operation.CREATE:
                    different = this.AddCollection(collection, arg);
                    this.SignalStateChange();
                    break;
                case Operation.READ:
                    return this.GetCollections();
                case Operation.UPDATE:
                    different = this.UpdateCollection(arg);
                    this.SignalStateChange();
                    break;
                case Operation.DELETE:
                    different = this.RemoveCollection(collection, arg);
                    this.SignalStateChange(); 
                    break;              
            }
            return {collection: collection, different:different};
        }       
    }

    AddItem(parentCollection: Collection, {itemId, itemType, name, imageURL, author, year}: {itemId : string, itemType : ItemTypes, name :string, imageURL :string, author :string, year :string} ) :  IItemIdentity |undefined{
        let id = `${itemType}-${itemId}`;
        let item = this.items.get(id);
        if(item == undefined) {
            item = new Item(name, id, itemType, imageURL,author, year);
            this.items.set(id, item);
        }

        let index = parentCollection.items.findIndex((value) => {return id === value})
        if(index === -1) {
            parentCollection.items.push(id);
            item.parented++;
        }
       
        return item;
    }

    AddCollection(parentCollection: Collection, {id, name, description}:{id :string |undefined,name: string, description: string} ): ICollection {
        let collection = undefined;
        if(id !== undefined){ // the collection exists already
            collection = this.collections.get(id)    
        }
        if(id == undefined || collection == undefined){ // must create a new collection
            id = nanoid();
            collection = new Collection(name, description, id);
            this.collections.set(id, collection);
        }        
        // enusre the collection is added to its parent collection
        collection.parented++;
        parentCollection.subCollections.push(id);
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

    RemoveCollection(parentCollection: Collection, id:string){
        let index = parentCollection.subCollections.findIndex((value) => {
            return value == id;
        });
        if(index === -1) return;
        let deletedIdArr = parentCollection.subCollections.splice(index,1);
        let deletedId = deletedIdArr[0];
        let deleted = this.collections.get(deletedId);
        if(deleted) {
            deleted.parented--;
            if(deleted.parented <= 0) this.collections.delete(deletedId);
        }

        return deleted;

    }

    RemoveItem(parentCollection: Collection, id: string) {
        let index = parentCollection.items.findIndex((value) => {
            return value == id;
        });
        if(index === -1) return;
        let deletedIdArr = parentCollection.items.splice(index,1);
        let deletedId = deletedIdArr[0];
        let deleted = this.items.get(deletedId);
        if(deleted) {
            deleted.parented--;
            if(deleted.parented <= 0) this.items.delete(deletedId);
        }

        return deleted;
    }

    SignalStateChange() {
        let collections = [...this.collections];
        let items = [...this.items];
        this.libraryStore.SaveJSON({collections: collections, items: items});
    }



    
}