import { IChildThing, ICollection, IEngagement, IItem, ILibrary, ISearchItem } from "main/defintions/LibraryModel"
import {Operation} from "./defintions/Operations.e"
import { nanoid } from "nanoid";
import { ItemTypes } from "./defintions/ItemTypes.e";
import BookDB from "./bookDB";
import { library } from "webpack";
import FileStore from "./filestore";
import MovieDB from "./movieDB";
import VideoGameDB from "./videogameDB";
import TableTopDB from "./tabletopDB";

class Item implements IItem, IChildThing {
    id: string;
    name: string;
    parented: number;
    itemType: ItemTypes;
    year: string;
    author: Array<string>;
    thumbnailURL: string;
    bannerURL: string;
    description: string;
    genres: Array<string>
    owned: boolean;
    wishlisted: boolean ;
    favourite: boolean;
    engagement: IEngagement[];

    constructor({name, id, itemType, thumbnailURL, bannerURL, author, year, description, genres} : IItem) {
        this.name = name;
        this.id = id;
        this.itemType = itemType;
        this.thumbnailURL = thumbnailURL;
        this.bannerURL = bannerURL;
        this.author = author;
        this.description = description;
        this.year = year;
        this.parented = 0;
        this.genres = genres;
        this.wishlisted = false;
        this.owned = false;
        this.favourite = false;
        this.engagement = new Array();
    }   
}

class Collection implements ICollection , IChildThing {
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
    movieDB : MovieDB;
    videogameDB: VideoGameDB;
    tabletopDB: TableTopDB;

    constructor(libraryStore: FileStore, api: any){
        this.bookDB = new BookDB(api.books);
        this.movieDB = new MovieDB(api.moviestv);
        this.videogameDB = new VideoGameDB(api.videogames);
        this.tabletopDB = new TableTopDB(api.tabletopgames);

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
                return this.bookDB.Search(searchTerms);
            case ItemTypes.MOVIETV:
                return this.movieDB.Search(searchTerms);
            case ItemTypes.VIDEOGAME:
                return this.videogameDB.Search(searchTerms);
            case ItemTypes.TABLETOPGAME:
                return this.tabletopDB.Search(searchTerms);
            default:
                throw new Error("Undefined Item type in searchLibrary")
        }

    }

    CRUDItem(operation: Operation, collectionId:string, arg:any) {
        let collection = this.collections.get(collectionId);
        if(collection) {
            let different;
            switch(operation) {
                case Operation.CREATE:
                    different = this.AddItem(collection, arg);
                    this.SignalStateChange();
                    break;
                case Operation.READ:
                    return different = this.GetItem(arg);
                case Operation.UPDATE:
                    different = this.UpdateItem(arg);
                    this.SignalStateChange();
                    break;
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

    AddItem(parentCollection: Collection, itemDetails: IItem ) :  IItem |undefined{
        let id = `${itemDetails.itemType}-${itemDetails.id}`;
        let item = this.items.get(id);
        if(item == undefined) {
            itemDetails.id = id;
            item = new Item(itemDetails);
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

    GetItem(searchDetails: ISearchItem) {
        switch(searchDetails.itemType){
            case ItemTypes.BOOK:
                return this.bookDB.GetDetailed(searchDetails.id);
            case ItemTypes.MOVIETV:
                return this.movieDB.GetDetailed(searchDetails.id);
            case ItemTypes.VIDEOGAME:
                return this.videogameDB.GetDetailed(searchDetails.id);
            case ItemTypes.TABLETOPGAME:
                return this.tabletopDB.GetDetailed(searchDetails.id);
            default:
                throw new Error("Undefined ItemType in GetItem");
        }
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

    UpdateItem({id, wishlist, owned, favourite, engagement} : {id:string, wishlist: boolean, owned: boolean, favourite: boolean, engagement: IEngagement}){
        let item = this.items.get(id);
        if(item == undefined) {
            return undefined;
        }
        if(wishlist !== undefined) {
            item.wishlisted = wishlist;
        }
        if(owned !== undefined) {
            item.owned = owned;
        }
        if(favourite !== undefined) {
            item.favourite = favourite;
        }
        if(engagement !== undefined) {
            console.log(item);
            item.engagement.push(engagement);
        }
        return item;

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
            if(deleted.parented <= 0) {
                for(let subItem of deleted.items){
                    this.RemoveItem(deleted, subItem);
                }
                for(let subCol of deleted.subCollections){
                    this.RemoveCollection(deleted, subCol);
                }
                this.collections.delete(deletedId);

            }
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