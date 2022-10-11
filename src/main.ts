import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/local';
import * as Sentry from "@sentry/angular";
import {RewriteFrames} from '@sentry/integrations';


Sentry.init({
  dsn: 'https://05a39f8cc40c4b6aae2817b6361aba29@o697314.ingest.sentry.io/5776513',
  tracesSampleRate: 1.0,
  environment: environment.envName,
  release: 'soundblock-dashboard-app@' + environment.gitSha,
  integrations: [
    new RewriteFrames()
  ]
});

if (environment.envName === 'production') {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.log(err));
