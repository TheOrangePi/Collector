import { ICollection, IItemIdentity } from "main/defintions/LibraryModel";

function CItemDisplay({item, shelf, onChangeLocation} : {item: IItemIdentity, shelf: string, onChangeLocation: Function}) {
    return (
        <section className="col-6 col-sm-4 col-md-3 col-lg-2">
            <div className="card">
            <h3 className="card-title" onClick={()=>onChangeLocation({shelf: shelf, book: item.id})}>{item.name}</h3>
            <div className="card-body">IEWONFoihwighweg</div>
            </div>
        </section>
    )
}

export default function CShelf({collection, onChangeLocation}: {collection: ICollection, onChangeLocation: Function}) {
    return (
        <article>
            <h2>{collection.name}</h2>
            <div className="row">
            {Array.from(collection.items).map(([id, item]) => {
                return <CItemDisplay key={id}  item={item} shelf={collection.id} onChangeLocation={onChangeLocation}/>
            })}
            </div>
        </article>
    )
}