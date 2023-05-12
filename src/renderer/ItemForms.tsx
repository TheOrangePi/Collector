import { ItemTypes } from "main/defintions/ItemTypes.e";
import { ICollection, IItemIdentity } from "main/defintions/LibraryModel";
import React from "react";

function CSearchedItem({existsInCollection, collectionId, itemId, itemType, name, imageURL, author, year, onAddItem} : { existsInCollection:boolean, collectionId : string, itemId: string, name:string, itemType: ItemTypes, imageURL: string, author: Array<string>, year: string, onAddItem: Function}){
    
    function handleValidate(success: boolean | undefined){
        if(success) {
            let itemAddButton = document.getElementById(`${itemId}-addbutton`);
            if(itemAddButton){
                SetButtonStatus(true);
            }
        }
    }

    function SetButtonStatus(added: boolean){
        let itemAddButton = document.getElementById(`${itemId}-addbutton`);
        if(added && itemAddButton){
            itemAddButton.classList.remove("btn-outline-secondary");
            itemAddButton.classList.add("btn-success");
            itemAddButton.textContent=("Added");
            itemAddButton.setAttribute("disabled", "false");
        } else if(itemAddButton) {
            itemAddButton.classList.remove("btn-success");
            itemAddButton.classList.add("btn-outline-secondary");           
            itemAddButton.textContent=("Add");
            itemAddButton.setAttribute("disabled", "true");
        }
    }

    return (
        <div className="card col-6">
            <img src={imageURL} className="card-img-top"/>
            <div className="card-body">
            <h6 className="card-title">{name}</h6>
            <p className="card-subtitle">{author}</p>
            <p>{year}</p>
            </div>
            <div className="card-footer">
                <button id={`${itemId}-addbutton`} className={`btn btn-sm${existsInCollection? "btn-success" : "btn-outline-secondary"}`} disabled={existsInCollection} onClick={() => {onAddItem(itemId, itemType, name, imageURL, author, year, handleValidate)}}>{existsInCollection? "U+2714" : "Add"}</button>
            </div>
        </div>
    )
}

export function CAddItemForm({collection, onSearch, onAddItem}: {collection: ICollection, onSearch: Function, onAddItem:Function}) {
    let [itemType, setItemType] = React.useState(ItemTypes.BOOK)
    let [searchTerm, setSearchTerm] = React.useState('');
    let [resultItems, setResultItems] = React.useState<any[]>([]);

    function resetValues() {
        setSearchTerm('');
        setResultItems([]);
    }

    function handleResultsFound (results: any){
        setResultItems(results);
    }

    return (
        <>
        <button className="btn btn-outline-dark" type="button" data-bs-toggle="offcanvas" data-bs-target="#addItemForm" aria-controls="addItemForm">
        Add Item
        </button>
        <div className="offcanvas offcanvas-end" tabIndex={-1} id="addItemForm" aria-labelledby="addItemFormLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="addItemFormLabel">Search</h5>
                <button type="button" onClick={resetValues} className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                <div className="input-group mb-3">
                    <input type="text" className="form-control" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value)}} aria-label="Text input with segmented dropdown button"/>
                    <button type="button" onClick={() =>{onSearch(itemType, searchTerm , handleResultsFound)}} className="btn btn-outline-secondary">Search {itemType}</button>
                    <button type="button" className="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                        <span className="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul className="dropdown-menu">
                        <li><a className="dropdown-item" onClick={()=> {setItemType(ItemTypes.BOOK)}} href="#">Books</a></li>
                        <li><a className="dropdown-item" onClick={()=> {setItemType(ItemTypes.MOVIETV)}} href="#">Movies/TV</a></li>
                        <li><a className="dropdown-item" onClick={()=> {setItemType(ItemTypes.BOARDGAME)}} href="#">Boardgames</a></li>                        
                        <li><a className="dropdown-item" onClick={()=> {setItemType(ItemTypes.VIDEOGAME)}} href="#">Videogames</a></li>
                        <li><a className="dropdown-item" onClick={()=> {setItemType(ItemTypes.TTRPG)}} href="#">TTRPGs</a></li>
                    </ul>
                </div>
                <div className="scrollable row">
                {resultItems.map(({id, itemType, title, author, year, imageURL }, index) => {
                    let existsInCollection = collection.items.find((id) => {
                        return id === `${itemType}-${id}`}) !== undefined;
                    return <CSearchedItem key={index} existsInCollection={existsInCollection} collectionId={collection.id} itemId={id} itemType={itemType} name={title} imageURL={imageURL} author={author} year={year} onAddItem={onAddItem}/>
            })}
                </div>
            </div>
        </div>
        </>
    )
}

export function CConfirmDeleteItem({item, onRemoveItem} : {item: IItemIdentity, onRemoveItem: Function }) {
    return (
        <div className="modal fade" id={`r${item.id}-removeModal`} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby={`r${item.id}-removeModalLabel`} aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id={`r${item.id}-removeModalLabel`}>Are You Sure?</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                    Do you want to remove {item.name}?
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Keep</button>
                        <button onClick={() => {onRemoveItem(item.id)}} type="button" className="btn btn-danger" data-bs-dismiss="modal">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    )
}