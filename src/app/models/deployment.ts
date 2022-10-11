import { Base } from './base';
import { Collection } from './collection';
import { Platform } from './platform';

export interface Deployment extends Base {
  collection: {
    data: Collection
  };
  deployment_uuid: string;
  distribution: string;
  ledger_uuid?: string;
  platform: {
    data: Platform;
  };
  status: {
    data: DeploymentStatus
  };
}

interface DeploymentStatus extends Base {
  deployment_memo: string;
  deployment_status: string;
}
