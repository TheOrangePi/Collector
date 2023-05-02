import * as React from "react";
//import { useMediaQuery } from 'react-responsive';
//const isMobile = useMediaQuery({ query: `(max-width: 760px)` }); //needto move in function
import { ICollection, IItemIdentity } from "main/defintions/LibraryModel";
import CLibrary from "./Library";
import CShelf from "./Shelf";
import CBook from "./Book";
import { View } from "main/defintions/View.e";
import {Operation} from "main/defintions/Operations.e"
import { ItemTypes } from "main/defintions/ItemTypes.e";

function FollowPath(collection: ICollection, location: Array<string>, start: number = 0) : ICollection {
    start++;
    let next = location[start];
    let childCollection = collection.subCollections.get(next);
    if(childCollection == undefined) return collection;
    if(start >= location.length-1) return childCollection;
    return FollowPath(childCollection, location, start);
}

function CLibraryMap({masterCollection, location, onChangeLocation} : {masterCollection: ICollection, location: Array<string>, onChangeLocation: Function}){   
    let previousCollection = masterCollection;
    let count = 1
    return(
        <nav className="nav">
            <ol className="breadcrumb" aria-label="breadcrumb">
                {location.length > 0 ? <li className="breadcrumb-item active"><a href="#" onClick={()=> {onChangeLocation([masterCollection.id], View.LIBRARY)}}>Library</a></li> : <li className="breadcrumb-item">Library</li>}
                {location.map((locationId) => {
                        let nextCollection = previousCollection.subCollections.get(locationId);
                        count++;
                        if(nextCollection){
                            previousCollection = nextCollection;
                            if(count < location.length -1) return <li key={locationId} className="breadcrumb-item"><a href="#" onClick={()=>{onChangeLocation(location.slice(0, count), View.SHELF)}}>{nextCollection.name}</a></li>
                            else return <li  key={locationId} className="breadcrumb-item active">{nextCollection.name}</li>
                        } else {
                            let item = previousCollection.items.get(locationId);
                            if(item)return <li  key={locationId} className="breadcrumb-item active">{item.name}</li>
                        }
                    })
                }
            </ol>
        </nav>
    )
}

export default function CLibraryDoor() {
    const [view, setView] = React.useState(View.LOADING)
    const [error, setError] = React.useState("We've Encountered An Unhandled Error")
    const [location, setLocation] =React.useState<Array<string>>(["0"])
    let dummy : ICollection = {id: "", name: "", description: "", subCollections: new Map(), items: new Map()}
    const [masterCollection, setMasterCollection] = React.useState<ICollection>(dummy);

    //Loading Collections
    React.useEffect(() => {
        setView(View.LOADING);
        window.library.CRUDLibrary(Operation.READ, "0").then((res: any)=>{
            setLocation([res.id]);
            setView(View.LIBRARY);
            setMasterCollection(res);
        }).catch(() =>{
            setView(View.ERROR);
            setError("Couldn't Load Collections");
        });
    }, []);

    //Handlers
    function handleChangeLocation(location: Array<string>, view: View){
        setLocation(location);
        setView(view);      
    }

    function handleAddCollection(name: string, description: string, onValidate: Function){
        window.library.CRUDLibrary(Operation.CREATE, location[location.length-1], {name:name, description:description}).then((response: any) => {
           console.log(response);
            if(response){
                let newMaster = Object.assign({}, masterCollection);
                let currentCollection = FollowPath(newMaster, location);
                let addedCollection : ICollection = response;
                currentCollection.subCollections.set(addedCollection.id, addedCollection);
                setMasterCollection(newMaster);
                onValidate(true);
            }else {
                onValidate(false);
            }         
        });
    }

    function handleRemoveCollection(id: string) {
        let newMaster = Object.assign({}, masterCollection);
        let currentCollection = FollowPath(newMaster, location)
        currentCollection.subCollections.delete(id);
        setMasterCollection(newMaster);
        window.library.CRUDLibrary(Operation.DELETE,currentCollection.id, id);
    }

    function handleEditCollection(id: string, name:string, description: string, onValidate: Function) {
        window.library.CRUDLibrary(Operation.UPDATE, location[location.length-1], {id:id, name:name, description:description}).then((response: any) => {
            if(response){
                let newMaster = Object.assign({}, masterCollection)
                let currentCollection = FollowPath(newMaster, location)
                let updatedCollection : ICollection = response;
                currentCollection?.subCollections.set(updatedCollection.id, updatedCollection);
                setMasterCollection(newMaster);
                onValidate(true);
            }else {
                onValidate(false); 
            }         
        });
    }

    function handleSearch(itemType: ItemTypes, searchTerm: string, onResultsFound: Function) {
        window.library.SearchLibrary(itemType, searchTerm).then((response: any) => {
            onResultsFound(response);
        })
    }

    function handleAddItem(collectionId :string, itemId : string, itemType : ItemTypes, name:string, imageURL:string, author:string, year:string, onValidate: Function){
        window.library.CRUDItem(Operation.CREATE, collectionId, {itemId, itemType, name, imageURL, author, year}).then((response:any) => {
            // if(response.success){
            //     let newCollections : Map<string, ICollection> = new Map(collections);
            //     let addedItemCollection : ICollection = response.collection;
            //     newCollections.set(addedItemCollection.id, addedItemCollection);
            //     setCollections(newCollections);
            //     onValidate(true);
            // }else {
            //     onValidate(false); 
            // }         
        })
    }

    //View Management
    let component;
    let currentCollection = FollowPath(masterCollection, location);
    switch(view){
        case View.BOOK:
            let item = currentCollection.items.get(location[location.length-1]);
            if(item == undefined) {
                setView(View.ERROR);
                setError(`At Empty Book. ${JSON.stringify(location)}`);
                break;
            }
            component = <CBook item={item}/>
            break;
        case View.SHELF:
            component = <CShelf collection={currentCollection} onChangeLocation={handleChangeLocation} location={location} onSearch={handleSearch}onRemoveCollection={handleRemoveCollection} onEditCollection={handleEditCollection} onAddCollection={handleAddCollection} onAddItem={handleAddItem} />
            break;
        case View.LIBRARY:
            if(masterCollection == undefined) {
                setView(View.ERROR);
                setError(`Libary Master Collection does not exist`);
                break;
            }
            component = <CLibrary masterCollection={masterCollection} location={location} onChangeLocation={handleChangeLocation} onAddCollection={handleAddCollection} onRemoveCollection={handleRemoveCollection} onEditCollection={handleEditCollection}/>
            break;
        case View.ERROR:
            component = <CError message={error}/>
            break;
        default:
            component = <CLoading/>
            break;
    }

    return (
    <div className="container">
        <header>
            <h1>The Library</h1>
            {
                masterCollection ? <CLibraryMap masterCollection={masterCollection} location={location} onChangeLocation={handleChangeLocation}/> : <></>
            }            
        </header>
        {component}
    </div>
    )
}

function CLoading(){
    return <div>Loading</div>
}

function CError({message}: {message:string}) {
    return <div>{message}</div>
}







//     const [collections, setCollections] = React.useState<{[id: string] : ICollection}>({});
//     const [loaded, setLoaded] = React.useState(false); 
//     const [creatingCollection, setCreatingCollection] = React.useState(false);

//     function handleAddCollection(name: string) {
//         //create new and update business logic
//         console.log("handling AddCollection");
//         window.library.addCollection(name).then((response: any) => {
//             if(response.success){
//                 let newCollections : {[id: string] : ICollection} = Object.assign({}, collections);
//                 let addedCollection : ICollection = response.collection;
//                 newCollections[addedCollection.id] = addedCollection;
//                 setCollections(newCollections);
//                 setCreatingCollection(false);
//             }else{
//                 console.log(`Collection ${name} already Exists`);
//             }
             
//         });
       
//     }

//     function handleCreateCollection() {
//         console.log("handlingCreateCollection");
//         setCreatingCollection(true); 
//     }

//     function handleCancelCreateCollection() {
//         setCreatingCollection(false);
//     }

//     function handleRemoveCollection(id: string) {
//         let newCollections : {[id: string] : ICollection} = Object.assign({}, collections);
//         delete newCollections[id];
//         setCollections(newCollections);
//         window.library.removeCollection(id);
//     }

//     if(!loaded) {
//         requestCollections().then((response) => {
//                 setCollections(response);
//                 setLoaded(true);
//             });
//         return <div>Loading</div>;
//     }

//     if(creatingCollection){
//         return (
//             <CCreateCollectionForm onAddCollection={handleAddCollection} onCancelCreateCollection={handleCancelCreateCollection}/>
//         );
//     }

//     return (
//         <article>
//                 <CLibraryHeader onCreateCollection={handleCreateCollection}/>
//                 {Object.entries(collections).map(([id, collection]) => {
//                     return <CShelf key={id} onRemoveCollection={handleRemoveCollection} collection={collection}/>
//                 })}
//         </article>
//     );
// }

// async function requestCollections(){
//     let response = await window.library.loadCollections();
//     return response;
// }
