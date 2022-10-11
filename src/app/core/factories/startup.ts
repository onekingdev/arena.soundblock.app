import { StartupService } from 'src/app/services/shared/startup';

export function startupServiceFactory(startupService: StartupService) {
    return (): Promise<any> => {
        startupService.bootLoadData();
        return startupService.bootload() 
    };
}
