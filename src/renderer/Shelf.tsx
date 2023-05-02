import { ItemTypes } from "main/defintions/ItemTypes.e";
import { ICollection, IItemIdentity } from "main/defintions/LibraryModel";
import React from "react";
import { CItemDisplay, CShelfDisplay } from "./Displays";

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
                <button id={`${itemId}-addbutton`} className={`btn btn-sm${existsInCollection? "btn-success" : "btn-outline-secondary"}`} disabled={existsInCollection} onClick={() => {onAddItem(collectionId, itemId, itemType, name, imageURL, author, year, handleValidate)}}>{existsInCollection? "&#x2713;" : "Add"}</button>
            </div>
        </div>
    )
}

function CAddItemForm({collection, onSearch, onAddItem}: {collection: ICollection, onSearch: Function, onAddItem:Function}) {
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
                {Array.from(resultItems).map(({id, itemType, title, author, year, imageURL }, index) => {
                    let existsInCollection = collection.items.has(`${itemType}-${id}`);
                return <CSearchedItem key={index} existsInCollection={existsInCollection} collectionId={collection.id} itemId={id} itemType={itemType} name={title} imageURL={imageURL} author={author} year={year} onAddItem={onAddItem}/>
            })}
                </div>
            </div>
        </div>
        </>
    )
}

function CAddCollectionForm({onAddCollection} : {onAddCollection: Function}){
    const [collectionName, setCollectionName] = React.useState('');
    const [collectionDescription, setcollectionDescription] = React.useState('');

    function handleNameValidation(success: boolean | undefined) {
        let collectioNameInput = document.getElementById('collectionName');
        if(collectioNameInput){
            if(success === false) collectioNameInput.classList.add("is-invalid");
            else if(success === true) {
                collectioNameInput.classList.remove("is-invalid");
                setCollectionName('');
                setcollectionDescription('');
            } else {
                collectioNameInput.classList.remove("is-invalid");
            }
        }  
    }

    return (
        <>
            <button className="btn btn-sm btn-outline-dark" type="button" data-bs-toggle="collapse" data-bs-target="#addCollectionForm" aria-expanded="false" aria-controls="addCollectionForm">
                Create Collection
            </button>
            <div className="row">
                <div className="collapse col-md-6" id="addCollectionForm">            
                    <div className="card card-body">
                        <div className="mb-3">
                        <label htmlFor="collectioName" className="form-label">Collection Name</label>
                        <input type="text" id="collectionName" className="form-control" value={collectionName} onChange={(e) => {setCollectionName(e.target.value); handleNameValidation(undefined)}}></input>
                        <label htmlFor="collectionDescription" className="form-label">Collection Description</label>
                        <textarea id="collectionDescription" className="form-control" value={collectionDescription} onChange={(e) => {setcollectionDescription(e.target.value);}}></textarea>
                        <div className="invalid-feedback">Name Already Exists</div>
                        </div>
                        <div className="btn-group">
                            <button onClick={() => {onAddCollection(collectionName, collectionDescription, handleNameValidation)}} className="btn btn-sm btn-primary">Add</button>
                            <button onClick={() => {handleNameValidation(true)}} className="btn btn-sm btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#addCollectionForm" aria-expanded="false" aria-controls="addCollectionForm">Cancel</button>
                        </div>
                    </div>
               </div>
            </div>
        </>
    )
}


export default function CShelf({collection, onChangeLocation, location, onSearch, onAddItem, onRemoveCollection, onEditCollection, onAddCollection}: {collection: ICollection, onChangeLocation: Function, location:string[], onSearch: Function, onAddItem: Function, onEditCollection: Function, onRemoveCollection: Function, onAddCollection:Function}) {
    return (
        <article>
            <CAddCollectionForm onAddCollection={onAddCollection}/>
            <CAddItemForm onAddItem={onAddItem} collection={collection} onSearch={onSearch}/>
            <h2>{collection.name}</h2>
            <div className="row">
            {Array.from(collection.items).map(([id, item]) => {
                return <CItemDisplay key={id}  item={item} shelf={collection.id} onChangeLocation={onChangeLocation} location={location}/>
            })}
            </div>
            <div className="row">
            {Array.from(collection.subCollections).map(([id, collection]) => {
                return <CShelfDisplay key={id}  location={location} collection={collection} onChangeLocation={onChangeLocation} onRemoveCollection={onRemoveCollection} onEditCollection={onEditCollection}/>
            })}
            </div>
        </article>
    )
}