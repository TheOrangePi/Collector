import * as React from "react";
//import { useMediaQuery } from 'react-responsive';
//const isMobile = useMediaQuery({ query: `(max-width: 760px)` }); //needto move in function
import { ICollection, IItemIdentity } from "main/defintions/LibraryModel";
import CLibrary from "./Library";
import CShelf from "./Shelf";
import CBook from "./Book";
import { View } from "main/defintions/View.e";
import {Operation} from "main/defintions/Operations.e"

// function CItemDisplay({itemIdentity} : {itemIdentity: IItemIdentity}){
//     return (
//         <p>{itemIdentity.name}</p>
//     );
// }

// function CShelf({collection, onRemoveCollection} : ICollectionComponent) {
//     return (  
//         <section className="row">
//             <h2>{collection.name}<button onClick={() => {onRemoveCollection(collection.id)}}>Remove</button></h2> 
//             {Object.entries(collection.items).map(([id, itemIdentity]) => {
//                 return (
//                     <CItemDisplay key={id} itemIdentity={itemIdentity}/>
//                 )
//             })}
//         </section>
//     );
// }

// function CCreateCollectionForm({onAddCollection, onCancelCreateCollection} : {onAddCollection: Function, onCancelCreateCollection : Function}){
//     const [collectionName, setCollectionName] = React.useState('');
//     return (
// <div>
//             <label >Collection Name<input type="text" value={collectionName} onChange={(e) => setCollectionName(e.target.value)}></input></label>
//             <button onClick={() => {onAddCollection(collectionName)}}>Add</button>
//             <button onClick={()=> {onCancelCreateCollection()}}>Cancel</button>
//             </div>
//     );
// }

// function CLibraryHeader({onCreateCollection} : ILibraryHeaderComponent) {

//     return (
//         <header>
//             <h1>The Library</h1>
//             <button onClick={()=>{onCreateCollection()}}>Create New Collection</button>
//         </header>
//     );
// }





function CLibraryMap({collections, location, onChangeLocation} : {collections: Map<string, ICollection>, location: {shelf: string | null, book: string | null}, onChangeLocation: Function}){
    let collection = undefined;
    let item = undefined;
    if(location.shelf){
        collection = collections.get(location.shelf);
        if(location.book){
            item = collection?.items.get(location.book);
        }
    }
    
   
    return(
        <nav className="nav">
            <ol className="breadcrumb" aria-label="breadcrumb">
            {location.shelf == null || collection == undefined 
                ? <li className="breadcrumb-item active" aria-current="page"><a>Library</a></li>
                : location.book == null || item == undefined
                ? <>
                    <li className="breadcrumb-item"><a href="#" onClick={()=>{onChangeLocation({shelf: null, book: null})}}>Library</a></li>
                    <li className="breadcrumb-item active" aria-current="page"><a>{collection.name}</a></li>
                </> 
                : <>
                <li className="breadcrumb-item"><a href="#" onClick={()=>{onChangeLocation({shelf: null, book: null})}}>Library</a></li>
                <li className="breadcrumb-item"><a href="#" onClick={()=>{onChangeLocation({shelf: location.shelf, book:null})}}>{collection.name}</a></li>	
                <li className="breadcrumb-item active" aria-current="page"><a>{item.name}</a></li>
                </>
            }
            </ol>
        </nav>
    )
}










export default function CLibraryDoor() {
    const [view, setView] = React.useState(View.LOADING)
    const [error, setError] = React.useState("We've Encountered An Unhandled Error")
    const [location, setLocation] =React.useState<{shelf: string | null, book: string | null}>({shelf: null, book: null})
    const [collections, setCollections] = React.useState<Map<string, ICollection>>(new Map());

    //Loading Collections
    React.useEffect(() => {
        setView(View.LOADING);
        window.library.CRUDLibrary(Operation.READ).then((res: any)=>{
            setView(View.LIBRARY);
            setCollections(res);
        }).catch(() =>{
            setView(View.ERROR);
            setError("Couldn't Load Collections");
        });
    }, []);

    //Handlers
    function handleChangeLocation({ shelf, book}: {shelf: string | null, book:string | null}){
        setLocation({shelf, book});
        if(book !== null){
            setView(View.BOOK);
        } else if(shelf !== null) {
            setView(View.SHELF);
        } else {
            setView(View.LIBRARY);
        }
    }

    function handleAddCollection(name: string, onValidate: Function){
        window.library.CRUDLibrary(Operation.CREATE, name).then((response: any) => {
            if(response.success){
                let newCollections : Map<string, ICollection> = new Map(collections);
                let addedCollection : ICollection = response.collection;
                newCollections.set(addedCollection.id, addedCollection);
                setCollections(newCollections);
                onValidate(true);
            }else {
                onValidate(false); 
            }         
        });
    }

    //View Management
    let component;
    switch(view){
        case View.BOOK:
            if(location.shelf === null || location.book === null) {
                setView(View.ERROR);
                setError(`View Mode Book With No Book Location. ${JSON.stringify(location)}`);
                break;
            }
            let item = collections.get(location.shelf)?.items.get(location.book);
            if(item == undefined) {
                setView(View.ERROR);
                setError(`At Empty Book. ${JSON.stringify(location)}`);
                break;
            }
            component = <CBook item={item}/>
            break;
        case View.SHELF:
            if(location.shelf == null) {
                setView(View.ERROR);
                setError(`View Mode Shelf With No Shelf Location. ${JSON.stringify(location)}`);
                break;
            }
            let collection = collections.get(location.shelf);
            if(collection == undefined) {
                setView(View.ERROR);
                setError(`At Empty Shelf. ${JSON.stringify(location)}`);
                break;
            }
            component = <CShelf collection={collection} onChangeLocation={handleChangeLocation}/>
            break;
        case View.LIBRARY:
            component = <CLibrary collections={collections} onChangeLocation={handleChangeLocation} onAddCollection={handleAddCollection}/>
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
            <CLibraryMap collections={collections} location={location} onChangeLocation={handleChangeLocation}/>
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
