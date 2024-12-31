import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import {
  provideCharts,
  withDefaultRegisterables,
} from 'ng2-charts';
import { provideToastr } from 'ngx-toastr';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { tokenInterceptor } from './app/utils/token.interceptor';

bootstrapApplication(AppComponent, {
  ...appConfig, 
  providers: [
    ...appConfig.providers, 
    provideAnimations(), 
    provideHttpClient(),  
    provideCharts(withDefaultRegisterables()),  // Agrega el proveedor de gráficos
    provideHttpClient(withInterceptors([tokenInterceptor])),   // Agrega el proveedor de animaciones
    provideToastr({
      timeOut: 1200,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),          // Agrega el proveedor de Toastr
  ]
})
  .catch((err) => console.error(err));
