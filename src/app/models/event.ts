export interface Event {
    event_uuid: string;
    user_uuid: string;
    event_memo: string;
    flag_processed: number;
    stamp_created: number;
    stamp_updated: number;
}
