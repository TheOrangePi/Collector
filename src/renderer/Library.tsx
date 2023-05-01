import { ICollection, IItemIdentity } from "main/defintions/LibraryModel";
import React from "react";

function CAddCollectionForm({onAddCollection} : {onAddCollection: Function}){
    const [collectionName, setCollectionName] = React.useState('');

    function handleNameValidation(success: boolean | undefined) {
        let collectioNameInput = document.getElementById('collectionName');
        if(collectioNameInput){
            if(success === false) collectioNameInput.classList.add("is-invalid");
            else if(success === true) {
                collectioNameInput.classList.remove("is-invalid");
                setCollectionName('');
            } else {
                collectioNameInput.classList.remove("is-invalid");
            }
        }  
    }

    return (
        <div>
            <button className="btn btn-sm btn-outline-dark" type="button" data-bs-toggle="collapse" data-bs-target="#addCollectionForm" aria-expanded="false" aria-controls="collapseExample">
                Create Collection
            </button>
            <div className="row">
                <div className="collapse col-md-6" id="addCollectionForm">            
                    <div className="card card-body">
                        <label htmlFor="collectioName" className="form-label">Collection Name</label>
                        <input type="text" id="collectionName" className="form-control" value={collectionName} onChange={(e) => {setCollectionName(e.target.value); handleNameValidation(undefined)}}></input>
                        <div className="invalid-feedback">Name Already Exists</div>
                        <div className="btn-group">
                            <button onClick={() => {onAddCollection(collectionName, handleNameValidation)}} className="btn btn-sm btn-outline-primary">Add</button>
                            <button onClick={() => {handleNameValidation(true)}} className="btn btn-sm btn-outline-danger  col-6 col-md-3 col-lg-2" type="button" data-bs-toggle="collapse" data-bs-target="#addCollectionForm" aria-expanded="false" aria-controls="collapseExample">Cancel</button>
                        </div>
                    </div>
               </div>
            </div>
        </div>
    )
}

function CItemDisplay({item, shelf, onChangeLocation} : {item: IItemIdentity, shelf: string, onChangeLocation: Function}) {
    return(
        <div className="card" onClick={()=>{onChangeLocation({shelf: shelf, book:item.id})}}>{item.name} </div>
        )
}

function CShelfDisplay({collection, onChangeLocation} : {collection: ICollection, onChangeLocation: Function}){
    return(
        <section className="card">
            <div className="card-header">
                <div className="card-link-area">
                    <h3 className="card-title d-inline"><a className="card-link" target="_blank" onClick={()=>{onChangeLocation({shelf: collection.id, book:null})}}>{collection.name}</a></h3>
                    <span className="dropdown">
                        <button className="btn btn-sm dropdown-toggle" type="button"  data-bs-toggle="dropdown" aria-expanded="false"/>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#" onClick={()=>{}}>Rename</a></li>
                            <li><a className="dropdown-item" href="#">Remove</a></li>
                        </ul>
                    </span>
                </div>   
            </div>
            <div className="d-none d-sm-block card-body">
                <div className="bookshelf">            
                {Array.from(collection.items).map(([id, item]) => {
                    return <CItemDisplay key={id}  item={item} shelf={collection.id} onChangeLocation={onChangeLocation}/>
                })}
                </div>
            </div>
        </section>
    )
}

export default function CLibrary({collections, onChangeLocation, onAddCollection} : {collections: Map<string, ICollection>, onChangeLocation: Function, onAddCollection: Function}) {

    return (
        <article>
            <CAddCollectionForm onAddCollection={onAddCollection}/>
            <h2>BookShelves</h2>
            {Array.from(collections).map(([id, collection]) => {
                return <CShelfDisplay key={id}  collection={collection} onChangeLocation={onChangeLocation}/>
            })}
        </article>
    );
}
