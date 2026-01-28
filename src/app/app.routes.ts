import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { AgregarDispositivoComponent } from './components/agregar-dispositivo/agregar-dispositivo.component';
import { CrearActaComponent } from './components/crear-acta/crear-acta.component';
import { ActasComponent } from './components/actas/actas.component';
import { TrazabilidadComponent } from './components/trazabilidad/trazabilidad.component';
import { DetalleDispositivoComponent } from './components/detalle-dispositivo/detalle-dispositivo.component';
import { ActaDevolucionComponent } from './components/acta-devolucion/acta-devolucion.component';
import { FirmaExternaComponent } from './components/firma-externa/firma-externa.component';
// Componentes de Devolución (proceso separado)
import { CrearDevolucionComponent } from './components/crear-devolucion/crear-devolucion.component';
import { ActasDevolucionComponent } from './components/actas-devolucion/actas-devolucion.component';
import { FirmaDevolucionComponent } from './components/firma-devolucion/firma-devolucion.component';

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
    path: 'inventario',
    component: InventarioComponent,
  },
  {
    path: 'agregar-dispositivo',
    component: AgregarDispositivoComponent,
  },
  {
    path: 'crear-acta',
    component: CrearActaComponent,
  },
  {
    path: 'actas',
    component: ActasComponent,
  },
  {
    path: 'trazabilidad/:id',
    component: TrazabilidadComponent,
  },
  {
    path: 'dispositivo/:id',
    component: DetalleDispositivoComponent,
  },
  {
    path: 'acta-devolucion',
    component: ActaDevolucionComponent,
  },
  {
    path: 'firmar/:token',
    component: FirmaExternaComponent,
  },
  // Rutas de Devolución (proceso separado)
  {
    path: 'crear-devolucion',
    component: CrearDevolucionComponent,
  },
  {
    path: 'actas-devolucion',
    component: ActasDevolucionComponent,
  },
  {
    path: 'firmar-devolucion/:token',
    component: FirmaDevolucionComponent,
  },
  {
    path: '**',
    redirectTo: 'inventario'
  }
];
