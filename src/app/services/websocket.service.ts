import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket | null = null;
  private connected$ = new BehaviorSubject<boolean>(false);
  
  // Subjects para diferentes tipos de eventos
  private dispositivoUpdated$ = new Subject<any>();
  private actaEntregaUpdated$ = new Subject<any>();
  private actaDevolucionUpdated$ = new Subject<any>();
  private inventarioUpdated$ = new Subject<any>();

  constructor() {
    this.connect();
  }

  /**
   * Conectar al servidor WebSocket
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('WebSocket ya conectado');
      return;
    }

    // Usar la URL base sin el /api
    const wsUrl = environment.apiUrl.replace('/api/', '').replace('/api', '');
    
    console.log('🔌 Conectando a WebSocket:', wsUrl);
    
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', this.socket?.id);
      this.connected$.next(true);
      
      // Unirse a las salas relevantes
      this.joinRoom('inventario');
      this.joinRoom('actas');
      this.joinRoom('devoluciones');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket desconectado:', reason);
      this.connected$.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error.message);
      this.connected$.next(false);
    });

    // Escuchar eventos del servidor
    this.setupEventListeners();
  }

  /**
   * Configurar listeners para eventos del servidor
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Eventos de dispositivos
    this.socket.on('dispositivo:created', (data) => {
      console.log('📦 Dispositivo creado:', data);
      this.dispositivoUpdated$.next({ action: 'created', data });
      this.inventarioUpdated$.next({ action: 'refresh' });
    });

    this.socket.on('dispositivo:updated', (data) => {
      console.log('📦 Dispositivo actualizado:', data);
      this.dispositivoUpdated$.next({ action: 'updated', data });
      this.inventarioUpdated$.next({ action: 'refresh' });
    });

    this.socket.on('dispositivo:deleted', (data) => {
      console.log('📦 Dispositivo eliminado:', data);
      this.dispositivoUpdated$.next({ action: 'deleted', data });
      this.inventarioUpdated$.next({ action: 'refresh' });
    });

    // Eventos de actas de entrega
    this.socket.on('acta:created', (data) => {
      console.log('📄 Acta creada:', data);
      this.actaEntregaUpdated$.next({ action: 'created', data });
      this.inventarioUpdated$.next({ action: 'refresh' });
    });

    this.socket.on('acta:signed', (data) => {
      console.log('✍️ Acta firmada:', data);
      this.actaEntregaUpdated$.next({ action: 'signed', data });
      this.inventarioUpdated$.next({ action: 'refresh' });
    });

    this.socket.on('acta:rejected', (data) => {
      console.log('❌ Acta rechazada:', data);
      this.actaEntregaUpdated$.next({ action: 'rejected', data });
      this.inventarioUpdated$.next({ action: 'refresh' });
    });

    // Eventos de actas de devolución
    this.socket.on('devolucion:created', (data) => {
      console.log('🔄 Devolución creada:', data);
      this.actaDevolucionUpdated$.next({ action: 'created', data });
      this.inventarioUpdated$.next({ action: 'refresh' });
    });

    this.socket.on('devolucion:signed', (data) => {
      console.log('✍️ Devolución firmada:', data);
      this.actaDevolucionUpdated$.next({ action: 'signed', data });
      this.inventarioUpdated$.next({ action: 'refresh' });
    });

    this.socket.on('devolucion:rejected', (data) => {
      console.log('❌ Devolución rechazada:', data);
      this.actaDevolucionUpdated$.next({ action: 'rejected', data });
      this.inventarioUpdated$.next({ action: 'refresh' });
    });

    // Evento genérico de actualización
    this.socket.on('refresh', (data) => {
      console.log('🔄 Refresh recibido:', data);
      this.inventarioUpdated$.next({ action: 'refresh', data });
    });
  }

  /**
   * Unirse a una sala
   */
  joinRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join', room);
    }
  }

  /**
   * Salir de una sala
   */
  leaveRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave', room);
    }
  }

  /**
   * Desconectar
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected$.next(false);
    }
  }

  // Observables para suscribirse a eventos
  
  get isConnected$(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  get onDispositivoUpdate$(): Observable<any> {
    return this.dispositivoUpdated$.asObservable();
  }

  get onActaEntregaUpdate$(): Observable<any> {
    return this.actaEntregaUpdated$.asObservable();
  }

  get onActaDevolucionUpdate$(): Observable<any> {
    return this.actaDevolucionUpdated$.asObservable();
  }

  get onInventarioUpdate$(): Observable<any> {
    return this.inventarioUpdated$.asObservable();
  }

  // Métodos específicos para tipos de eventos de dispositivos
  onDispositivoCreated(): Observable<any> {
    return new Observable(observer => {
      const sub = this.dispositivoUpdated$.subscribe(event => {
        if (event.action === 'created') {
          observer.next(event.data);
        }
      });
      return () => sub.unsubscribe();
    });
  }

  onDispositivoUpdated(): Observable<any> {
    return new Observable(observer => {
      const sub = this.dispositivoUpdated$.subscribe(event => {
        if (event.action === 'updated') {
          observer.next(event.data);
        }
      });
      return () => sub.unsubscribe();
    });
  }

  onDispositivoDeleted(): Observable<any> {
    return new Observable(observer => {
      const sub = this.dispositivoUpdated$.subscribe(event => {
        if (event.action === 'deleted') {
          observer.next(event.data);
        }
      });
      return () => sub.unsubscribe();
    });
  }

  // Métodos específicos para tipos de eventos de actas de entrega
  onActaCreated(): Observable<any> {
    return new Observable(observer => {
      const sub = this.actaEntregaUpdated$.subscribe(event => {
        if (event.action === 'created') {
          observer.next(event.data);
        }
      });
      return () => sub.unsubscribe();
    });
  }

  onActaSigned(): Observable<any> {
    return new Observable(observer => {
      const sub = this.actaEntregaUpdated$.subscribe(event => {
        if (event.action === 'signed') {
          observer.next(event.data);
        }
      });
      return () => sub.unsubscribe();
    });
  }

  onActaRejected(): Observable<any> {
    return new Observable(observer => {
      const sub = this.actaEntregaUpdated$.subscribe(event => {
        if (event.action === 'rejected') {
          observer.next(event.data);
        }
      });
      return () => sub.unsubscribe();
    });
  }

  // Métodos específicos para tipos de eventos de actas de devolución
  onDevolucionCreated(): Observable<any> {
    return new Observable(observer => {
      const sub = this.actaDevolucionUpdated$.subscribe(event => {
        if (event.action === 'created') {
          observer.next(event.data);
        }
      });
      return () => sub.unsubscribe();
    });
  }

  onDevolucionSigned(): Observable<any> {
    return new Observable(observer => {
      const sub = this.actaDevolucionUpdated$.subscribe(event => {
        if (event.action === 'signed') {
          observer.next(event.data);
        }
      });
      return () => sub.unsubscribe();
    });
  }

  onDevolucionRejected(): Observable<any> {
    return new Observable(observer => {
      const sub = this.actaDevolucionUpdated$.subscribe(event => {
        if (event.action === 'rejected') {
          observer.next(event.data);
        }
      });
      return () => sub.unsubscribe();
    });
  }
}
