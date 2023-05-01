import { ICollection, IItemIdentity, ILibrary } from "main/defintions/LibraryModel"
import {Operation} from "./defintions/Operations.e"
import { nanoid } from "nanoid";
class Item implements IItemIdentity {
    source: string;
    id: string;
    name: string;
    constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
        this.source = "";
    }
}

class Collection implements ICollection {
    name: string;
    id: string;
    items: Map<string, IItemIdentity>;

    constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
        this.items = new Map();
    }

    AddItem(name: string) : {success: boolean, item: Item | undefined} {
        let id = nanoid(); // this needs to be changed?
        let item = new Item(name, id);
        this.items.set(id, item);
        return{success: true, item: this.items.get(id)}
    }

}

export class Library implements ILibrary{
    collections: Map<string, Collection>
    nameIdPairs: Map<string, string>
    actions: {[event: string] : (instruction: any)=> any} = {
        ["CRUDLibrary"]: ({operation, arg}:{operation: Operation, arg:any})=> this.CRUDLibrary(operation, arg),
    };
    constructor(){
        this.collections = new Map();
        this.nameIdPairs = new Map();
    }
    
    CRUDLibrary(operation: Operation, arg:any) {
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

    AddCollection(name: string ): {success: boolean, collection: ICollection | undefined} {
       let id = nanoid();
       if(this.nameIdPairs.get(name.toLowerCase())){
            return{success: false, collection: undefined};
       }
       let collection = new Collection(name, id);
       this.collections.set(id, collection);
       this.nameIdPairs.set(name.toLowerCase(), id);
       return{success: true, collection: this.collections.get(id)}
    }   
    
    GetCollections() {
        return this.collections;
    }

    UpdateCollection({id, newName} : {id:string, newName:string | undefined, newItems:Map<string, Item>|undefined}): {success: boolean, collection: ICollection | undefined} {
        let collection = this.collections.get(id);
        if(collection == undefined){
            return {success:false, collection: undefined}
        }
        if(newName !== undefined){
            if(this.nameIdPairs.get(newName.toLowerCase())){
                return{success: false, collection: undefined};
            }
            let oldName = collection.name
            collection.name = newName;
            this.nameIdPairs.delete(oldName.toLowerCase());
            this.nameIdPairs.set(newName.toLowerCase(), collection.id);
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