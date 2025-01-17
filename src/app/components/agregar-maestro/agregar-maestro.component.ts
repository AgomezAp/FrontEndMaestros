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
  selector: 'app-agregar-maestro',
  imports: [
    CommonModule,
    FormsModule,
    SpinnerComponent,
    NavbarComponent,
    FontAwesomeModule,
    AngularSignaturePadModule,
  ],
  templateUrl: './agregar-maestro.component.html',
  styleUrl: './agregar-maestro.component.css',
})
export class AgregarMaestroComponent {
  maestro: any = {
    nombre: '',
    NombreMaestro: '',
    firmaEntrega: '',
    descripcionEntrega: '',
    estado: 'activo',
    marca:'',
    modelo:'',
    imei:'',
    fechaRecibe: new Date(),

    Uid: localStorage.getItem('userId'),
  };
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  isDrawn = false;
  private history: PointGroup[] = [];
  private future: PointGroup[] = [];
  @ViewChild('signature') signaturePad!: SignaturePadComponent;
  public signaturePadOptions: NgSignaturePadOptions = {
    minWidth: 1,
    canvasWidth: 600,
    canvasHeight: 400,
    penColor: 'black',
    backgroundColor: 'white',
    dotSize: 1,
    maxWidth: 1,
    velocityFilterWeight: 1,
  };
  constructor(private maestroService: MaestroService, private router: Router) {}

  drawComplete(event: MouseEvent | Touch) {
    console.log('Completed drawing', event);
    this.maestro.firmaEntrega = this.signaturePad.toDataURL();
    this.isDrawn = true;
  }

  drawStart(event: MouseEvent | Touch) {
    console.log('Start drawing', event);
  }
  onSubmit() {
    this.loading= true;
    if (
    /*   !this.maestro.nombre ||
      !this.maestro.apellido ||
      !this.maestro.NombreMaestro ||
      !this.maestro.correo ||
      !this.maestro.cedula ||
     */
      !this.maestro.firmaEntrega 
    /*   !this.maestro.descripcion */
    ) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }
    this.maestroService.registrarMaestro(this.maestro).subscribe(
      (response) => {
        this.successMessage = 'Maestro registrado con éxito';
        this.errorMessage = '';
        this.router.navigate(['/dashBoard']);
        this.loading= true;
        // Redirigir o limpiar el formulario si es necesario
      },
      (error) => {
        this.errorMessage =
          error.error.msg || 'Problemas al registrar el maestro';
        this.successMessage = '';
      }
    );
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
  
  navigateToDashboard(): void {
    this.router.navigate(['/dashBoard']);
  }
}
