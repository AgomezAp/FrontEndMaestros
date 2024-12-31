import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Maestro } from '../../interfaces/maestro';
import { MaestroService } from '../../services/maestro.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-historico-maestros',
  imports: [NavbarComponent,CommonModule,FormsModule],
  templateUrl: './historico-maestros.component.html',
  styleUrl: './historico-maestros.component.css'
})
export class HistoricoMaestrosComponent implements OnInit {
  maestros: Maestro[] = [];
  loading: boolean = true;
  constructor(private maestroService: MaestroService,) {}

  ngOnInit(): void {
    this.obtenerHistoricoMaestros();
  }

  obtenerHistoricoMaestros(): void {
    this.maestroService.ObtenerHistoricoMaestros().subscribe(
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
}
