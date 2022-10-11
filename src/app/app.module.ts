import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import * as Sentry from "@sentry/angular";
import { RouteReuseStrategy, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  NbThemeModule,
  NbIconModule,
  NbDatepickerModule,
  NbMenuModule,
  NbLayoutModule,
  NbStepperModule,
  NbButtonModule,
  NbSelectModule,
  NbAccordionModule,
  NbAlertModule,
  NbCardModule,
  NbTabsetModule,
  NbDialogModule,
  NbUserModule,
  NbTooltipModule,
  NbTreeGridModule,
  NbToastrModule,
  NbPopoverModule
} from '@nebular/theme';

import { AppComponent } from './ui';
import { AppRoutingModule } from './app-routing.module';

/* Layout components */
import { HeaderPageModule } from './layout/header/header.module';
import { PageFooterPageModule } from './layout/footer/page-footer.module';

/* Common component modules */
import { ProjectComponentsModule } from './components/project.module';
import { CommonComponentsModule } from './components/common.module';

/* Services */
import { StartupService } from './services/shared/startup';

/* Directives */
import { PipeModule } from './core/pipes/pipe.module';

/* Guards */

/* Interceptors */
import { JwtInterceptor } from './core/interceptors/jwtInterceptor';

/* Factory */
import { startupServiceFactory } from './core/factories/startup';
import { SignUpGuard } from './core/guard/sign-up';

@NgModule({
  declarations: [
    // Components
    AppComponent
  ],
  imports: [
    // Core modules
    FormsModule, BrowserAnimationsModule, ReactiveFormsModule, HttpClientModule, IonicModule.forRoot(),

    // Nebular modules
    NbSelectModule, NbAccordionModule, NbTabsetModule, NbAlertModule, NbLayoutModule, NbTooltipModule, NbStepperModule, NbUserModule,
    NbButtonModule, NbTreeGridModule, NbCardModule, NbIconModule, NbUserModule, NbPopoverModule,
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbThemeModule.forRoot(),
    NbToastrModule.forRoot(),
    AppRoutingModule,
    HeaderPageModule,
    PageFooterPageModule,
    ProjectComponentsModule,
    CommonComponentsModule,
    PipeModule
    // BsDropdownModule.forRoot(),
    // ButtonsModule.forRoot()
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    StatusBar,
    SplashScreen,
    SignUpGuard,
    CookieService,
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
      }),
    },
    { provide: APP_INITIALIZER, 
      useFactory: startupServiceFactory,
       multi: true, deps: [StartupService, Sentry.TraceService] },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
