import { Routes } from '@angular/router';

import {
  AgregarMaestroComponent,
} from './components/agregar-maestro/agregar-maestro.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {
  EntregaMaestroComponent,
} from './components/entrega-maestro/entrega-maestro.component';
import {
  HistoricoMaestrosComponent,
} from './components/historico-maestros/historico-maestros.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import {
  ResetPasswordComponent,
} from './components/reset-password/reset-password.component';
import {
  VerMaestrosActivosComponent,
} from './components/ver-maestros-activos/ver-maestros-activos.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'logIn',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: RegisterComponent,
  },
  {
    path: 'reestablecerContraseña',
    component: ResetPasswordComponent,
  },
  {
    path: 'dashBoard',
    component: DashboardComponent,
  },
  {
    path: 'agregarMaestro',
    component: AgregarMaestroComponent,
  },
  {
    path: 'ObtenerMaestrosActivos',
    component: VerMaestrosActivosComponent,
  },
  {
    path: 'ver-historico-maestros',
    component: HistoricoMaestrosComponent,
  },
  {
    path: 'entrega-maestro/:Mid',
    component: EntregaMaestroComponent
  }
];
