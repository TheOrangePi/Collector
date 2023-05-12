import { ItemTypes } from "./defintions/ItemTypes.e";


export default class BookDB implements IDB {
    apiDestination: string;
    apiKey: string;
    
    constructor() {
        this.apiDestination = "https://www.googleapis.com/books/"
        this.apiKey = 
    }

    SearchBooks (searchTerms: string[]) {
        let startIndex = 0; //this is for pagination of results if wanted.
        let maxResults = 40;
        let searchString = searchTerms.join("+");
        let url = `${this.apiDestination}v1/volumes/?q=${searchString}&startIndex=${startIndex}&maxResults=${maxResults}&key=${this.apiKey}`
        return new Promise((resolve, reject) => {
            fetch(url).then((response) => {
                response.json().then((results) => {
                    let returned = results.items.length;
                    let items = Array(returned);
                    for(let i = 0; i < returned; i++) {
                        let book = results.items[i];
                        let id = book.id
                        let itemType = ItemTypes.BOOK;
                        let title = book.volumeInfo?.title;
                        let author = book.volumeInfo?.authors?.join(' & ');
                        let year = book.volumeInfo?.publishedDate?.split("-")[0]
                        let imageURL = book.volumeInfo?.imageLinks?.smallThumbnail;
                        items[i] = {id, itemType, title, author, year, imageURL}
                    }

                    resolve(items);
                });
            });
        });
       
    }
}