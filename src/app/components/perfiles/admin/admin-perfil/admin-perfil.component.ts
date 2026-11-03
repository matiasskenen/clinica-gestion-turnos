import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TurnosService } from '../../../../services/turnos/turnos.service';
import { DataService } from '../../../../services/authUsers/data.service';
import { Auth } from '@angular/fire/auth';
import { jsPDF } from 'jspdf';
import { CaptchaService } from '../../../services/captcha.service';
import { Subscription } from 'rxjs';
import { CaptchaDirective } from '../../../directivas/captcha/captcha.directive';

@Component({
  selector: 'app-admin-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, CaptchaDirective],
  templateUrl: './admin-perfil.component.html',
  styleUrl: './admin-perfil.component.scss'
})
export class AdminPerfilComponent{
  
  diagnosticoArray: any[] = [];
  nombresEspecialistasArray: any[] = [];
  nombresFiltrados: any[] = [];
  especialidadSeleccionada: string = '';
  especialista: any = {};
  turnosDisponibles: string[] = [];
  turnoSeleccionado: string = '';
  mensajeExito: boolean = false;
  pacienteFiltrado = "";
  pacienteActual: any;
  historiaClinicaSeleccionada: any = null;
  
  captchaValid: boolean = false;
  disableCaptcha: boolean = false; // Controla si el captcha está habilitado
  private captchaSubscription: Subscription;

  constructor(
    private turnos: TurnosService,
    private userService: DataService,
    private auth: Auth,
    private captchaService: CaptchaService
  ) {
    this.captchaSubscription = this.captchaService.captchaEnabled$.subscribe(enabled => {
      this.disableCaptcha = !enabled;  // Si está habilitado, disableCaptcha será false
    });
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    // Desuscribirse para evitar fugas de memoria
    if (this.captchaSubscription) {
      this.captchaSubscription.unsubscribe();
    }
  }

  async init() {
    await this.dataNombres();
    this.mostrarHistoriaClinica();
  }

  toggleCaptcha() {
    this.captchaValid = false; // Resetear estado de CAPTCHA cuando se cambia el estado
    this.disableCaptcha = !this.disableCaptcha; // Cambiar estado de CAPTCHA
    this.captchaService.setCaptchaEnabled(!this.disableCaptcha); // Informar al servicio
  }

  handleCaptchaValidation(isValid: boolean) {
    this.captchaValid = isValid; // Actualiza la validez del CAPTCHA
  }

  async dataNombres() {
    return new Promise<void>((resolve, reject) => {
      this.auth.onAuthStateChanged((user) => {
        this.pacienteActual = user?.email;
        this.turnos.getadmin().subscribe({
          next: (data: any[]) => {
            this.nombresEspecialistasArray = data
              .map((turno: any) => ({
                nombre: turno.nombre,
                dni: turno.dni,
                apellido: turno.apellido,
                imagen: turno.imagen,
                edad: turno.edad,
                email: turno.email,
                doctoremail: turno.emailEspecialsita
              }));
            this.nombresFiltrados = [...this.nombresEspecialistasArray];
            resolve();
          },
          error: (err) => {
            console.error('Error al obtener los turnos:', err);
            reject(err);
          },
        });
      });
    });
  }

  mostrarHistoriaClinica() {
    console.log("Cargando todas las historias clínicas...");
    this.turnos.getUsers().subscribe({
      next: (data: any[]) => {
        if (data.length > 0) {
          this.historiaClinicaSeleccionada = data.map((historia: any) => {
            const datosDinamicos = Object.entries(historia)
              .filter(([key]) => !['apellido', 'clave', 'dni', 'edad', 'email', 'nombre', 'obrasocial'].includes(key))
              .map(([titulo, valor]) => ({ titulo, valor }));
            return {
              apellido: historia.apellido,
              clave: historia.clave,
              dni: historia.dni,
              edad: historia.edad,
              email: historia.email,
              nombre: historia.nombre,
              obrasocial: historia.obrasocial,
              datosDinamicos, // Incluir datos dinámicos si es necesario
            };
          });
        } else {
          console.log('No se encontraron historias clínicas.');
          this.historiaClinicaSeleccionada = [];
        }
        console.log(this.historiaClinicaSeleccionada);
      },
      error: (err) => {
        console.error('Error al obtener las historias clínicas:', err);
      },
    });
  }
  

  ddescargarHistoriaClinica() {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text('Usuarios Registrados', 20, 20);
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    let yPosition = 40;
    this.historiaClinicaSeleccionada.forEach((historia: any) => {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Apellido: ${historia.apellido}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Nombre: ${historia.nombre}`, 20, yPosition);
      yPosition += 10;
      doc.text(`DNI: ${historia.dni}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Edad: ${historia.edad}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Obra Social: ${historia.obrasocial}`, 20, yPosition);
      yPosition += 15;
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;
    });
    doc.save('usuarios_' + (this.pacienteActual || 'admin') + '.pdf');
  }
}