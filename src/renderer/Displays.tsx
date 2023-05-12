import { ICollection, IItemIdentity } from "main/defintions/LibraryModel"
import { View } from "main/defintions/View.e"
import React from "react"
import { CConfirmDelete, CEditForm } from "./CollectionForms"
import { CConfirmDeleteItem } from "./ItemForms"


export function CItemDisplay({item, onChangeLocation, location, onRemoveItem} : {item: IItemIdentity, shelf: string, onChangeLocation: Function, location:Array<string>, onRemoveItem: Function}) {
    return (
        <section className="col-6 col-sm-4 col-md-3 col-lg-2 mb-4">
            <div className="card">
                <span className="dropdown">
                    <button className="btn btn-md dropdown-toggle" type="button"  data-bs-toggle="dropdown" aria-expanded="false"/>
                    <ul className="dropdown-menu">
                        <li><button type="button" className="dropdown-item btn btn-default" data-bs-toggle="modal" data-bs-target={`#e${item.id}-editModal`}>Edit</button></li>
                        <li><button type="button" className="dropdown-item btn btn-default" data-bs-toggle="modal" data-bs-target={`#r${item.id}-removeModal`}>Remove</button></li>                      
                    </ul>
                </span>
            <div className="card-link-area">
            <img src={item.imageURL} className="card-img-top"/>
            
                <div className="card-body">
                <h6 className="card-title d-inline"><a className="card-link" target="_blank" onClick={()=>{onChangeLocation([...location, item.id], View.BOOK)}}>{item.name}</a></h6>
                <p className="card-subtitle">{item.author}</p>
                <p>{item.year}</p>
                </div>
            </div>
        </div>
        <CConfirmDeleteItem item={item} onRemoveItem={onRemoveItem} />
        </section>
    )
}

export function CItemSmallDisplay({item, onChangeLocation, location} : {item: IItemIdentity, location: Array<string>, onChangeLocation: Function}) {
    return(
            <img src={item.imageURL} className="card-img small" onClick={()=>{onChangeLocation([...location, item.id], View.BOOK)}}/>
        )
}

export function CShelfDisplay({collection, items, onChangeLocation, location,  onRemoveCollection, onEditCollection} : {collection: ICollection, items: Map<string, IItemIdentity>, onChangeLocation: Function, location:string[], onRemoveCollection: Function, onEditCollection: Function}) {
    return(
        <section className="card mb-1">
            <div className="card-link-area">
                <div className="card-header">
                    <h3 className="card-title d-inline"><a className="card-link" target="_blank" onClick={()=>{onChangeLocation([...location, collection.id], View.SHELF)}}>{collection.name}</a></h3>
                    <span className="dropdown">
                        <button className="btn btn-md dropdown-toggle" type="button"  data-bs-toggle="dropdown" aria-expanded="false"/>
                        <ul className="dropdown-menu">
                        <li><button type="button" className="dropdown-item btn btn-default" data-bs-toggle="modal" data-bs-target={`#e${collection.id}-editModal`}>Edit</button></li>
                        <li><button type="button" className="dropdown-item btn btn-default" data-bs-toggle="modal" data-bs-target={`#r${collection.id}-removeModal`}>Remove</button></li>                      
                        </ul>
                    </span>
                </div>   
            </div>
            <div className="card-body d-none d-sm-block">  
                    <div className="bookshelf">       
                    {collection.items.map((id) => {
                        let item = items.get(id);
                        if(item) return <CItemSmallDisplay key={id}  item={item} location={[...location, collection.id]} onChangeLocation={onChangeLocation}/>
                    })}
                </div>                
            </div>
            <div className="card-footer">
                <p>{collection.description}</p>
            </div>
            <CConfirmDelete collection={collection} onRemoveCollection={onRemoveCollection}/>
            <CEditForm collection={collection} onEditCollection={onEditCollection}/>
        </section>
    )
}