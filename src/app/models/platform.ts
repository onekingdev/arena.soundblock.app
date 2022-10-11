import { Base } from './base';
import { PlatformCategory } from '../pages/projects/deployments/deployments.page';

export interface Platform extends Base {
  platform_uuid: string;
  platform_name: string;
  platform_category: PlatformCategory;
}
