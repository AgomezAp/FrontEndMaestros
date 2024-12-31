import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { MaestroService } from '../../services/maestro.service';
import { UserService } from '../../services/user.service';
import {
  SpinnerComponent,
} from '../../shared/spinner/spinner/spinner.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent,CommonModule,FormsModule,SpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  maestros: any[] = [];
  userId: string = localStorage.getItem('userId') || '0';
  loading: boolean = true;

  constructor(private userService: UserService,private router: Router,private toastr: ToastrService,private maestroService: MaestroService) {}

  ngOnInit(): void {
    this.obtenerMaestros();
  }

  obtenerMaestros(): void {
    this.userService.obtenerMaestrosPorIdUsuario(this.userId).subscribe(
      (data:any) => {
        console.log('Respuesta del servicio:', data);
        if (data && Array.isArray(data.maestros)) {
          this.maestros = data.maestros;
        } else {
          console.error('La respuesta no contiene un array de maestros', data);
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error al obtener los maestros', error);
        this.loading = false;
      }
    );
  }
  navigateToAddMaestro(): void {
    this.router.navigate(['/agregarMaestro']);
  }

  navigateToEditMaestro(Mid: number): void {
    localStorage.setItem('maestroId', Mid.toString());
    this.router.navigate(['/edit-maestro', Mid]);
  }

  deleteMaestro(Mid: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción es irreparable',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.maestroService.BorrarMaestroId(Mid).subscribe({
          next: () => {
            this.toastr.success('Maestro eliminado con éxito', 'Éxito');
            this.obtenerMaestros(); // Actualizar la lista de maestros
            this.loading = false;
          },
          error: (err) => {
            this.toastr.error('Error al eliminar el maestro', 'Error');
            this.loading = false;
          }
        });
      }
    });
  }
}
