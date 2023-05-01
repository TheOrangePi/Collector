import { IItemIdentity } from "main/defintions/LibraryModel";

export default function CBook({item} : {item: IItemIdentity}) {
    return (
        <article>
            <h1>{item.name}</h1>
        </article>
    )
}