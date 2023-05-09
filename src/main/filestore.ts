import fs from "fs"

export default class FileStore {
    filename :fs.PathOrFileDescriptor;
    constructor(filename: fs.PathOrFileDescriptor) {
        this.filename = filename;
    }

    LoadJSON() {
        let jsonString = fs.readFileSync(this.filename, "utf8");
        try{
            return JSON.parse(jsonString);
        } catch {
            return undefined;
        }
        
    }

    SaveJSON(JSONobj: any) {
        let JSONstring = JSON.stringify(JSONobj);
        fs.writeFileSync(this.filename, JSONstring);
    }
}