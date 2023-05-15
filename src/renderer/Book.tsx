import { ItemTypes } from "main/defintions/ItemTypes.e";
import { IItem } from "main/defintions/LibraryModel";
import { Operation } from "main/defintions/Operations.e";
import React from "react";

export default function CBook({item} : {item: IItem}) {
    //let [item, setItem] = React.useState()

    // React.useEffect(() => {
    //     window.library.CRUDItem(Operation.READ, item.id).then((res: any)=>{
    //         let {itemDetails} = res;
    //         setCollections(collections);
    //         setItems(items);
    //         setLocation([master.id]);
    //         setView(View.LIBRARY);
            
    //     }).catch(() =>{
    //         setView(View.ERROR);
    //         setError("Couldn't Load Collections");
    //     });
    // }, []);

    return (
        <article className= "">
            <div className="row">
            {item.itemType != ItemTypes.BOOK ? <img className="round" src={item.bannerURL}/> : <></>}
            <section className="col-sm-4">
               <h1>{item.name}</h1>
               {item.itemType == ItemTypes.BOOK ? <img className="round" src={item.bannerURL}/> : <></>}
                <p>{item.author?.join(' & ')}</p>
                <p>{item.year}</p>
                <p>{item.genres?.join(', ')}</p>
            </section>
            <section className="col-sm-8">
                    <p dangerouslySetInnerHTML={{__html: item.description}}></p>
            </section> 
            </div>          
        </article>
    )
}