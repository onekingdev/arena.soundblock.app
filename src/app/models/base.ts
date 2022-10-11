export interface Base {
  stamp_created: number;
  stamp_created_by: {
    uuid: string;
    name: string;
    avatar?: string;
  };
  stamp_updated: number;
  stamp_updated_by: {
    uuid: string;
    name: string;
    avatar?: string;
  };
}
