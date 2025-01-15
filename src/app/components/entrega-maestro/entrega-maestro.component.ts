import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PointGroup } from 'signature_pad';

import {
  AngularSignaturePadModule,
  NgSignaturePadOptions,
  SignaturePadComponent,
} from '@almothafar/angular-signature-pad';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MaestroService } from '../../services/maestro.service';
import {
  SpinnerComponent,
} from '../../shared/spinner/spinner/spinner.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-entrega-maestro',
  imports: [
    CommonModule,
    FormsModule,
    SpinnerComponent,
    NavbarComponent,
    FontAwesomeModule,
    AngularSignaturePadModule,
  ],
  templateUrl: './entrega-maestro.component.html',
  styleUrl: './entrega-maestro.component.css',
})
export class EntregaMaestroComponent {
  maestro: any = {
    nombre: '',
    NombreMaestro: '',
    correo: '',
    cedula: '',
    firma: '',
    descripcion: '',
    estado: 'activo',
    marca:'',
    modelo:'',
    imei:'',
    fecha: new Date(),
    Uid: localStorage.getItem('userId'),
  };


  isDrawn = false;
  private history: PointGroup[] = [];
  private future: PointGroup[] = [];
  @ViewChild('signature') signaturePad!: SignaturePadComponent;
  public signaturePadOptions: NgSignaturePadOptions = {
    minWidth: 1,
    canvasWidth: 500,
    canvasHeight: 300,
    penColor: 'black',
    backgroundColor: 'white',
    dotSize: 1,
    maxWidth: 1,
    velocityFilterWeight: 1,
  };
 constructor(private maestroService: MaestroService, private router: Router) {}

 drawComplete(event: MouseEvent | Touch) {
  console.log('Completed drawing', event);
  this.maestro.firma = this.signaturePad.toDataURL();
  this.isDrawn = true;
}

drawStart(event: MouseEvent | Touch) {
  console.log('Start drawing', event);
}
clearSignature() {
  this.signaturePad.clear(); // Limpiar la firma
  this.history = []; // Limpiar el historial
  this.future = []; // Limpiar el futuro
}

undo() {
  const data = this.signaturePad.toData();
  if (data.length) {
    const lastAction = data.pop();
    if (lastAction) {
      this.future.push(lastAction); // Mover la última acción al futuro
      this.signaturePad.fromData(data); // Restaurar el estado anterior
    }
  }
}

redo() {
  if (this.future.length) {
    const data = this.signaturePad.toData();
    const nextAction = this.future.pop();
    if (nextAction) {
      data.push(nextAction); // Mover la última acción del futuro al historial
      this.signaturePad.fromData(data); // Restaurar el estado
    }
  }
}



}
