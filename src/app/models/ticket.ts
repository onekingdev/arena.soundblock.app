import { Deserializable } from './deserializable';
import { Base } from './base';

// tslint:disable: variable-name
export class TicketMessage implements Base, Deserializable {

  message_uuid?: string;
  ticket_uuid?: string;
  user?: any;
  message_text?: string;
  flag_attachment?: number;
  flag_status?: string;
  attachments?: any;
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
    this.user = input.user.data;
    this.attachments = input.attachments.data;
    return this;
  }
}

export class TicketInfo implements Base, Deserializable {
  support_uuid?: string;
  support_category?: string;
  app?: any;
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

export class Ticket implements Base, Deserializable {
  ticket_uuid?: string;
  user?: any;
  ticket_title?: string;
  flag_status?: string;
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
  support?: TicketInfo;
  messages?: TicketMessage[];

  constructor() {
    this.support = new TicketInfo();
  }

  deserialize(input: any) {
    Object.assign(this, input);
    // this.user = input.user.data;
    this.support = new TicketInfo().deserialize(input.support);
    return this;
  }
}
export class TicketResponse {
  data: Ticket;
  meta?: any;
  status?: any;
}
