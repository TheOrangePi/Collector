import { match } from "assert";
import { ICollection } from "main/defintions/LibraryModel";
import React from "react";

export function CAddCollectionForm({collections, onAddCollection} : {collections: Map<string, ICollection>, onAddCollection: Function}){
    const [collectionName, setCollectionName] = React.useState('');
    const [collectionDescription, setcollectionDescription] = React.useState('');
    const [matches, setMatches] = React.useState<Array<ICollection>>(new Array());

    function handleNameValidation(success: boolean | undefined) {
        let collectioNameInput = document.getElementById('collectionName');
        if(collectioNameInput){
            if(success === false) collectioNameInput.classList.add("is-invalid");
            else if(success === true) {
                collectioNameInput.classList.remove("is-invalid");
                setCollectionName('');
                setcollectionDescription('');
                setMatches([]);
            } else {
                collectioNameInput.classList.remove("is-invalid");
            }
        }  
    }

    function matchCollections(collections: Map<string, ICollection>, term: string){
        let matches = [];
        if(term.trim() !== ""){
            var reg = new RegExp(term, 'i')
            for(let [id, collection] of collections.entries()) {
                if(id === "0") {continue;}
                let match = collection.name.match(reg)
                match = match ?? collection.description.match(reg);
                if(match) {matches.push(collection)}
            }
        }        
        setMatches(matches);        
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
                        <input type="text" id="collectionName" className="form-control" value={collectionName} onChange={(e) => {setCollectionName(e.target.value); handleNameValidation(undefined); matchCollections(collections, e.target.value)}}></input>
                            <ul className="list-group">
                                {
                                    matches.map((matchCollection) => {
                                        return  <li key={matchCollection.id} className="list-group-item"><small>{matchCollection.name} : {matchCollection.description.substring(0, 40)}...</small> <button className="btn btn-small btn-primary" onClick={()=>{onAddCollection(matchCollection.id, matchCollection.name, matchCollection.description, handleNameValidation)}}>Add</button></li>
                                    })
                                }
                            </ul>                        
                        <label htmlFor="collectionDescription" className="form-label">Collection Description</label>
                        <textarea id="collectionDescription" className="form-control" value={collectionDescription} onChange={(e) => {setcollectionDescription(e.target.value);}}></textarea>
                        <div className="invalid-feedback">Name Already Exists</div>
                        </div>
                        <div className="btn-group">
                            <button onClick={() => {onAddCollection(undefined, collectionName, collectionDescription, handleNameValidation)}} className="btn btn-sm btn-primary">Add</button>
                            <button onClick={() => {handleNameValidation(true)}} className="btn btn-sm btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#addCollectionForm" aria-expanded="false" aria-controls="addCollectionForm">Cancel</button>
                        </div>
                    </div>
               </div>
            </div>
        </>
    )
}