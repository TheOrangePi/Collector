import { ICollection, IItemIdentity } from "main/defintions/LibraryModel";
import React from "react";
import { CShelfDisplay } from "./Displays";

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

export default function CLibrary({master, collections, items, onChangeLocation, location, onAddCollection, onRemoveCollection, onEditCollection} : {master: ICollection,collections: Map<string,ICollection>, items: Map<string, IItemIdentity>, onChangeLocation: Function, location:string[], onAddCollection: Function, onRemoveCollection: Function, onEditCollection: Function}) {
    
    return (
        <article>
            <CAddCollectionForm onAddCollection={onAddCollection}/>
            <h2>{master.name}</h2>
            {master.subCollections.map((id) => {
                let collection = collections.get(id);
                if(collection)return <CShelfDisplay key={id} items = {items} location={location} collection={collection} onChangeLocation={onChangeLocation} onRemoveCollection={onRemoveCollection} onEditCollection={onEditCollection}/>
            })}
        </article>
    );
}
