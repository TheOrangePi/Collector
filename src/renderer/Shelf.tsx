import { ItemTypes } from "main/defintions/ItemTypes.e";
import { ICollection, IItemIdentity } from "main/defintions/LibraryModel";
import React from "react";
import { CItemDisplay, CShelfDisplay } from "./Displays";
import { CAddCollectionForm } from "./CollectionForms";
import { CAddItemForm } from "./ItemForms";





export default function CShelf({collection, collections, items, onChangeLocation, location, onSearch, onAddItem, onRemoveCollection, onRemoveItem, onEditCollection, onAddCollection}: {collection: ICollection, collections: Map<string, ICollection>, items: Map<string, IItemIdentity>, onChangeLocation: Function, location:string[], onSearch: Function, onAddItem: Function, onRemoveItem:Function, onEditCollection: Function, onRemoveCollection: Function, onAddCollection:Function}) {
    return (
        <article>
            <CAddCollectionForm collections={collections} onAddCollection={onAddCollection}/>
            <CAddItemForm onAddItem={onAddItem} collection={collection} onSearch={onSearch}/>
            <h2>{collection.name}</h2>
            <div className="row">
            {collection.items.map((id) => {
                let item = items.get(id);
                if(item) return <CItemDisplay key={id}  item={item} shelf={collection.id} onChangeLocation={onChangeLocation} location={location} onRemoveItem={onRemoveItem}/>
            })}
            </div>
            <div className="row">
            {collection.subCollections.map((id) => {
                let collection = collections.get(id);
                if(collection) return <CShelfDisplay key={id} items={items}  location={location} collection={collection} onChangeLocation={onChangeLocation} onRemoveCollection={onRemoveCollection} onEditCollection={onEditCollection}/>
            })}
            </div>
        </article>
    )
}