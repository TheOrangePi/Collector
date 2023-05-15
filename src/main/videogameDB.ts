import { waitFor } from "@testing-library/react";
import { ItemTypes } from "./defintions/ItemTypes.e";
import { IItem, ISearchItem } from "./defintions/LibraryModel";


export default class VideoGameDB implements IDB {
    apiDestination: string;
    apiKey : string;
    
    constructor({key, destination}: {key:string, destination:string}) {
        this.apiDestination = destination;
        this.apiKey = key;
    }
    
    GetDetailed(id: string){
        let dbid = id;
        let url = `${this.apiDestination}games/${dbid}?key=${this.apiKey}`;
        return new Promise((resolve, reject) => {
            fetch(url).then((response) => {
                response.json().then((result) => {
                    let name = result.name;
                    let thumbnailURL = result.background_image;
                    let bannerURL = result.background_image_additional ?? result.background_image;
                    let year = result.released.split("-")[0];
                    let author = result.developers.map((value: any) => {
                        return value.name;
                    });
                    let description = result.description;
                    let genres = result.genres.map((value: any) => {
                        return value.name;
                    });
                    let itemType = ItemTypes.VIDEOGAME;
                    let item : IItem = {id, itemType, name, thumbnailURL, bannerURL, year, author, description, genres}
                    resolve(item);
                });
            });
        });
    }

    Search(searchTerms: string[]) {
        let startIndex = 0; //this is for pagination of results if wanted.
        let maxResults = 40;
        let searchString = searchTerms.join("-").toLowerCase();
        let url = `${this.apiDestination}games?key=${this.apiKey}&search=${searchString}`;
        console.log(url);
        return new Promise((resolve, reject) => {
            fetch(url).then((response) => {
                response.json().then((page) => {
                    let results = page.results;
                    let items = Array<ISearchItem>(results.length);
                    for(let i = 0; i < results.length; i++) {
                        let game = results[i];
                        let id = game.id
                        let itemType = ItemTypes.VIDEOGAME;
                        let name = game.name;
                        let thumbnailURL = game.background_image;
                        items[i] = {id, itemType, name, thumbnailURL}
                    }

                    resolve(items);
                });
            });
        });
       
    }
}