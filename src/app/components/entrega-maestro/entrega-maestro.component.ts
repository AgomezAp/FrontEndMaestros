import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';

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
export class EntregaMaestroComponent implements OnInit {
  maestro: any = {
    nombre: '',
    NombreMaestro: '',
    maestroRecibe: '',
    firmaRecibe: '',
    descripcionRecibe: '',
    estado: 'Entregado',
    marca:'',
    modelo:'',
    imei:'',
    fechaEntrega: new Date(),
    Uid: localStorage.getItem('userId'),
  };
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  Mid!: number;

  isDrawn = false;
  private history: PointGroup[] = [];
  private future: PointGroup[] = [];
  @ViewChild('signature') signaturePad!: SignaturePadComponent;
  public signaturePadOptions: NgSignaturePadOptions = {
    minWidth: 1,
    canvasWidth: 800,
    canvasHeight: 500,
    penColor: 'black',
    backgroundColor: 'white',
    dotSize: 1,
    maxWidth: 1,
    velocityFilterWeight: 1,
  };
constructor(private maestroService: MaestroService, private router: Router, private route: ActivatedRoute) {}
 ngOnInit(): void {
  this.Mid = parseInt(this.route.snapshot.paramMap.get('Mid')!, 10);
}
 onSubmit() {
  this.loading= true;
  if (
    !this.maestro.firmaRecibe
   /*  !this.maestro.descripcionRecibe||
    !this.maestro.maestroRecibe  */
  ) {
    this.errorMessage = 'Todos los campos son obligatorios';
    return;
  }
  this.maestroService.BorrarMaestroId(this.Mid,this.maestro).subscribe(
    (response) => {
      this.successMessage = 'Entrega del maestro hecha con éxito';
      this.errorMessage = '';
      this.router.navigate(['/dashBoard']);
      this.loading= true;
      // Redirigir o limpiar el formulario si es necesario
    },
    (error) => {
      this.errorMessage =
        error.error.msg || 'Problemas al hacer la entrega del maestro';
      this.successMessage = '';
    }
  );
}
 drawComplete(event: MouseEvent | Touch) {
  console.log('Completed drawing', event);
  this.maestro.firmaRecibe = this.signaturePad.toDataURL();
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

navigateToDashboard(): void {
  this.router.navigate(['/dashBoard']);
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
