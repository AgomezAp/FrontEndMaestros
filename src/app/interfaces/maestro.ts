export interface Maestro {
  Mid: number;
  nombre: string;
  apellido: string;
  correo: string;
  cedula: string;
  firma: string;
  descripcion: string;
  Uid: number;
  estado: string;
  region: string;
  marca: string;
  modelo: string;
}
export interface MaestroEstado {
  Mid: number;
  nombre: string;
  apellido: string;
  correo: string;
  cedula: string;
  firma: string;
  descripcion: string;
  Uid: number;
  estado: string;
  region: string;
  marca: string;
  modelo: string;
  editing?: boolean;
}
