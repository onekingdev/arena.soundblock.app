import { Base } from './base';
import { Deserializable } from './deserializable';

export class Artist implements Base, Deserializable{
    artist_uuid: string;
    account_uuid: string;
    artist_name: string;
    stamp_created: number;
    stamp_created_by: {
    uuid: string;
    name: string;
    };
    stamp_updated: number;
    stamp_updated_by: {
    uuid: string;
    name: string;
    };
    constructor() { }

    deserialize(input: any) {
      Object.assign(this, input);
      return this;
    }

}
export class Artists implements Deserializable{
    data?: Artist[];
    status:any;
    constructor() {
        this.data = new Array<Artist>(0);
      
    }
    deserialize(input: any) {
        Object.assign(this, input);
        this.data = input.data.map(artist => new Artist().deserialize(artist));
        return this;
      }
}
export class CreateArtistRequest{
    account:string;
    artist_name: string;
}
export class GetArtistRequest{
    account:string;
    artist:string;
}
export class UpdateArtistRequest{
    account:string;
    artist:string;
    artist_name:string;
}
