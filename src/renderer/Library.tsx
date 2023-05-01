import { ICollection, IItemIdentity } from "main/defintions/LibraryModel";


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
                        <button className="btn-small dropdown-toggle" type="button"  data-bs-toggle="dropdown" aria-expanded="false"/>
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
                    console.log(item)
                    return <CItemDisplay key={id}  item={item} shelf={collection.id} onChangeLocation={onChangeLocation}/>
                })}
                </div>
            </div>
        </section>
    )
}

export default function CLibrary({collections, onChangeLocation} : {collections: Map<string, ICollection>, onChangeLocation: Function}) {

    return (
        <article>
            <h2>BookShelves</h2>
            {Array.from(collections).map(([id, collection]) => {
                return <CShelfDisplay key={id}  collection={collection} onChangeLocation={onChangeLocation}/>
            })}
        </article>
    );
}
