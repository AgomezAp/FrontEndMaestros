import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PointGroup } from 'signature_pad';

import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
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
  @ViewChild('signaturePad') signaturePad!: any;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  
  constructor(private maestroService: MaestroService, private router: Router) {}
  
  ngAfterViewInit(): void {
    this.canvas = this.signaturePad.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.resizeCanvas();
    this.initCanvasEvents();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.resizeCanvas();
  }
  
  resizeCanvas(): void {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    this.canvas.width = this.canvas.offsetWidth * ratio;
    this.canvas.height = this.canvas.offsetHeight * ratio;
    this.ctx.scale(ratio, ratio);
    this.clearSignature(); // Clear the canvas to avoid drawing issues
  }

  initCanvasEvents(): void {
    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('touchstart', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('touchmove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
  }

  startDrawing(event: MouseEvent | TouchEvent): void {
    this.drawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(this.getX(event), this.getY(event));
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.drawing) return;
    this.ctx.lineTo(this.getX(event), this.getY(event));
    this.ctx.stroke();
  }

  stopDrawing(): void {
    this.drawing = false;
    this.ctx.closePath();
    this.maestro.firmaEntrega = this.canvas.toDataURL();
    this.isDrawn = true;
  }

  getX(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.offsetX;
    } else {
      const touch = event.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      return touch.clientX - rect.left;
    }
  }

  getY(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.offsetY;
    } else {
      const touch = event.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      return touch.clientY - rect.top;
    }
  }

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
  clearSignature(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.isDrawn = false;
  }

/*   clearSignature() {
    this.signaturePad.clear(); // Limpiar la firma
    this.history = []; // Limpiar el historial
    this.future = []; // Limpiar el futuro
  }
 */
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
