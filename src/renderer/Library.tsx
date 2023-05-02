import { ICollection, IItemIdentity } from "main/defintions/LibraryModel";
import React from "react";

function CEditForm({collection, onEditCollection} : {collection: ICollection, onEditCollection: Function }) {
    let [collectionName, setCollectionName] = React.useState<string|undefined>(collection.name);
    let [collectionDescription, setCollectionDescription] = React.useState<string|undefined>(collection.description);

    function handleNameValidation(success: boolean | undefined) {
        
        let collectionNameInput = document.getElementById(`${collection.id}-editCollectionName`);
        let collectionDescriptionInput = document.getElementById(`${collection.id}-editCollectionDescription`)
        if(collectionNameInput && collectionDescriptionInput){
            if(success === false) {
                console.log("false");
                collectionNameInput.classList.add("is-invalid");
                collectionNameInput.classList.remove("is-valid");
                collectionDescriptionInput.classList.remove("is-valid");
            }
            else if(success === true) {
                console.log("True")
                collectionNameInput.classList.remove("is-invalid");
                collectionNameInput.classList.add("is-valid");
                collectionDescriptionInput.classList.add("is-valid");
            } else {
                console.log("its undefined");
                collectionNameInput.classList.remove("is-invalid");
                collectionNameInput.classList.remove("is-valid");
                collectionDescriptionInput.classList.remove("is-valid");
            }
        }  
    }

    function handleResetValues(){
        setCollectionDescription(collection.description);
        setCollectionName(collection.name);
    }

    return (
        <div className="modal fade" id={`${collection.id}-editModal`} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby={`${collection.id}-editModalLabel`} aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id={`${collection.id}-editModalLabel`}>Make Changes to {collection.name}</h5>
                        <button type="button"  onClick={()=> {handleNameValidation(undefined); handleResetValues()}} className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">New Name:</span>
                            <input type="text" id={`${collection.id}-editCollectionName`} className="form-control" value={collectionName} onChange={(e) => {setCollectionName(e.target.value); handleNameValidation(undefined)}} placeholder={collection.name} aria-label="Username" aria-describedby="basic-addon1" required={true}/>
                            <div className="invalid-feedback">New Name Already Exists</div>
                        </div>
                        <div className="input-group">
                            <span className="input-group-text">Description</span>
                            <textarea id={`${collection.id}-editCollectionDescription`} className="form-control" value={collectionDescription} onChange={(e) => {setCollectionDescription(e.target.value); handleNameValidation(undefined)}} placeholder={collection.description} aria-label="With textarea" required={true}></textarea>
                            <div className="valid-feedback">Changes Accepted</div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button onClick={()=> {handleNameValidation(undefined); handleResetValues()}} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button onClick={() => {onEditCollection(collection.id, collectionName, collectionDescription, handleNameValidation)}} type="button" className="btn btn-warning">Update</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CConfirmDelete({collection, onRemoveCollection} : {collection: ICollection, onRemoveCollection: Function }) {
    return (
        <div className="modal fade" id={`${collection.id}-removeModal`} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby={`${collection.id}-removeModalLabel`} aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id={`${collection.id}-removeModalLabel`}>Are You Sure?</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                    Do you want to remove {collection.name}?
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Keep</button>
                        <button onClick={() => {onRemoveCollection(collection.id)}} type="button" className="btn btn-danger" data-bs-dismiss="modal">Remove</button>
                    </div>
                </div>
            </div>
        </div>
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

function CItemDisplay({item, shelf, onChangeLocation} : {item: IItemIdentity, shelf: string, onChangeLocation: Function}) {
    return(
        <div className="card" onClick={()=>{onChangeLocation({shelf: shelf, book:item.id})}}>
            <img src={item.imageURL} className="card-img"/>
        </div>
        )
}

function CShelfDisplay({collection, onChangeLocation, onRemoveCollection, onEditCollection} : {collection: ICollection, onChangeLocation: Function, onRemoveCollection: Function, onEditCollection: Function}){

    return(
        <section className="card mb-1">
            <div className="card-link-area">
                <div className="card-header">
                    <h3 className="card-title d-inline"><a className="card-link" target="_blank" onClick={()=>{onChangeLocation({shelf: collection.id, book:null})}}>{collection.name}</a></h3>
                    <span className="dropdown">
                        <button className="btn btn-md dropdown-toggle" type="button"  data-bs-toggle="dropdown" aria-expanded="false"/>
                        <ul className="dropdown-menu">
                        <li><button type="button" className="dropdown-item btn btn-default" data-bs-toggle="modal" data-bs-target={`#${collection.id}-editModal`}>Edit</button></li>
                        <li><button type="button" className="dropdown-item btn btn-default" data-bs-toggle="modal" data-bs-target={`#${collection.id}-removeModal`}>Remove</button></li>                      
                        </ul>
                    </span>
                </div>   
            </div>
            <div className="card-body d-none d-sm-block">  
                    <div className="bookshelf">       
                    {Array.from(collection.items).map(([id, item]) => {
                        return <CItemDisplay key={id}  item={item} shelf={collection.id} onChangeLocation={onChangeLocation}/>
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

export default function CLibrary({collections, onChangeLocation, onAddCollection, onRemoveCollection, onEditCollection} : {collections: Map<string, ICollection>, onChangeLocation: Function, onAddCollection: Function, onRemoveCollection: Function, onEditCollection: Function}) {

    return (
        <article>
            <CAddCollectionForm onAddCollection={onAddCollection}/>
            <h2>BookShelves</h2>
            {Array.from(collections).map(([id, collection]) => {
                return <CShelfDisplay key={id}  collection={collection} onChangeLocation={onChangeLocation} onRemoveCollection={onRemoveCollection} onEditCollection={onEditCollection}/>
            })}
        </article>
    );
}
