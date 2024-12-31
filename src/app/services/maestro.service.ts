import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { Maestro } from '../interfaces/maestro';

@Injectable({
  providedIn: 'root'
})
export class MaestroService {
  private appUrl : string;
  private apiUrl : string;
  constructor(private http:HttpClient) { 
    this.appUrl= environment.apiUrl
    this.apiUrl = 'api/maestros'
  }
  getProduct():Observable<Maestro[]>{
    return this.http.get<Maestro[]>(`${this.appUrl}${this.apiUrl}/obtener-maestros`)
  }
  registrarMaestro(product:Maestro):Observable<Maestro>{
    return this.http.post<Maestro>(`${this.appUrl}${this.apiUrl}/registrar-maestro`, product)
  }

  actualizarMaestro( Mid:number, product: Maestro): Observable<Maestro> {
    return this.http.patch<Maestro>(`${this.appUrl}${this.apiUrl}/actualizar/${Mid}`, product);
  }

  BorrarMaestroId(Mid:number):Observable<Maestro>{
    return this.http.delete<Maestro>(`${this.appUrl}${this.apiUrl}/borrar-maestro/${Mid}`)
  }
  ObtenerHistoricoMaestros():Observable<Maestro[]>{
    return this.http.get<Maestro[]>(`${this.appUrl}${this.apiUrl}/obtenerRecordMaestros`)
  }
  ObtenerMaestrosActivos():Observable<Maestro[]>{  
    return this.http.get<Maestro[]>(`${this.appUrl}${this.apiUrl}/activos`)
  }
}
