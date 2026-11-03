import { Component } from '@angular/core';
import { TurnosService } from '../../../../services/turnos/turnos.service';
import { DataService } from '../../../../services/authUsers/data.service';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-paciente-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paciente-perfil.component.html',
  styleUrl: './paciente-perfil.component.scss',
  animations: [
    trigger('routeAnimations', [
      transition('HomePage => LoginPage', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms', style({ transform: 'translateY(0)' }))
      ]),
      transition('LoginPage => HomePage', [
        style({ transform: 'translateY(-100%)' }),
        animate('300ms', style({ transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class PacientePerfilComponent {
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
  historiaClinicaPersonalizada : any = null;

  constructor(
    private turnos: TurnosService,
    private userService: DataService,
    private auth: Auth,
  ) {
    this.init();
  }

  async init() {
    await this.dataNombres();
    this.mostrarHistoriaClinica();
  }

  async dataNombres() {
    return new Promise<void>((resolve, reject) => {
      this.auth.onAuthStateChanged((user) => {
        this.pacienteActual = user?.email;
        this.turnos.getPacientes().subscribe({
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
    console.log("user " + this.pacienteActual);
    this.turnos.getHistoriaClinica().subscribe({
      next: (data: any[]) => {
        const historiasFiltradas = data.filter(
          (historia: any) => historia.paciente === this.pacienteActual
        );
        if (historiasFiltradas.length > 0) {
          this.historiaClinicaSeleccionada = historiasFiltradas.map((historia: any) => {
            const datosDinamicos = Object.entries(historia)
              .filter(
                ([key]) =>
                  ![
                    'altura',
                    'peso',
                    'presion',
                    'temperatura',
                    'fecha',
                    'doctor',
                    'paciente',
                    'observaciones',
                    'dia',
                    'especialidad',
                    'especialista',
                    'comentario',
                    'emailEspecialsita',
                    'especialidad',
                    'comentarioPaciente',
                    'mensaje',
                    'estado',
                    'diagnostico',
                    'horario',
                  ].includes(key)
              )
              .map(([titulo, valor]) => ({ titulo, valor }));
            return {
              paciente : historia.paciente,
              altura: historia.altura,
              peso: historia.peso,
              presion: historia.presion,
              temperatura: historia.temperatura,
              fecha: historia.dia,
              emailEspecialsita: historia.emailEspecialsita,
              observaciones: historia.observaciones || 'Sin observaciones',
              datosDinamicos,
              especialidad: historia.especialidad,

            };
          });
        } else {
          console.log('No se encontraron historias clínicas para este paciente.');
          this.historiaClinicaSeleccionada = [];
        }
        console.log(this.historiaClinicaSeleccionada);
      },
      error: (err) => {
        console.error('Error al obtener las historias clínicas:', err);
      },
    });
  }


  selectedPaciente: string | null = null;
  
  especialidadElegidaUser: string = '';


  async mostrarHistoriaClinicaSimple(): Promise<void> {
    console.log("user " + this.pacienteActual);
    return new Promise((resolve, reject) => {
      this.turnos.getHistoriaClinica().subscribe({
        next: (data: any[]) => {
          const historiasFiltradas = data.filter(
            (historia: any) => historia.paciente === this.pacienteActual
          );
          if (historiasFiltradas.length > 0) {
            this.historiaClinicaPersonalizada = historiasFiltradas.map((historia: any) => {
              const datosDinamicos = Object.entries(historia)
                .filter(
                  ([key]) =>
                    ![
                      'altura',
                      'peso',
                      'presion',
                      'temperatura',
                      'fecha',
                      'doctor',
                      'paciente',
                      'observaciones',
                      'dia',
                      'especialidad',
                      'especialista',
                      'comentario',
                      'emailEspecialsita',
                      'comentarioPaciente',
                      'mensaje',
                      'estado',
                      'diagnostico',
                      'horario',
                    ].includes(key)
                )
                .map(([titulo, valor]) => ({ titulo, valor }));
              return {
                paciente: historia.paciente,
                altura: historia.altura,
                peso: historia.peso,
                presion: historia.presion,
                temperatura: historia.temperatura,
                fecha: historia.dia,
                emailEspecialsita: historia.emailEspecialsita,
                observaciones: historia.observaciones || 'Sin observaciones',
                datosDinamicos,
                especialidad: historia.especialidad,
              };
            });
          } else {
            console.log('No se encontraron historias clínicas para este paciente.');
            this.historiaClinicaPersonalizada = [];
          }
          resolve();
        },
        error: (err) => {
          console.error('Error al obtener las historias clínicas:', err);
          reject(err);
        },
      });
    });
  }
  
  async mostrarHistoriaClinicaPorespecialidad(): Promise<void> {
    console.log("user " + this.pacienteActual);
    console.log("especialidad seleccionada: " + this.especialidadElegidaUser);
  
    return new Promise((resolve, reject) => {
      this.turnos.getHistoriaClinica().subscribe({
        next: (data: any[]) => {
          const historiasFiltradas = data.filter(
            (historia: any) =>
              historia.paciente === this.pacienteActual &&
              historia.especialidad === this.especialidadElegidaUser
          );
  
          if (historiasFiltradas.length > 0) {
            this.historiaClinicaPersonalizada = historiasFiltradas.map((historia: any) => {
              const datosDinamicos = Object.entries(historia)
                .filter(
                  ([key]) =>
                    ![
                      'altura',
                      'peso',
                      'presion',
                      'temperatura',
                      'fecha',
                      'doctor',
                      'paciente',
                      'observaciones',
                      'dia',
                      'especialidad',
                      'especialista',
                      'comentario',
                      'emailEspecialsita',
                      'comentarioPaciente',
                      'mensaje',
                      'estado',
                      'diagnostico',
                      'horario',
                    ].includes(key)
                )
                .map(([titulo, valor]) => ({ titulo, valor }));
              return {
                paciente: historia.paciente,
                altura: historia.altura,
                peso: historia.peso,
                presion: historia.presion,
                temperatura: historia.temperatura,
                fecha: historia.dia,
                emailEspecialsita: historia.emailEspecialsita,
                observaciones: historia.observaciones || 'Sin observaciones',
                datosDinamicos,
                especialidad: historia.especialidad,
              };
            });
          } else {
            console.log('No se encontraron historias clínicas para este paciente y especialidad.');
            this.historiaClinicaPersonalizada = [];
          }
          resolve();
        },
        error: (err) => {
          console.error('Error al obtener las historias clínicas:', err);
          reject(err);
        },
      });
    });
  }
  
  async descargarHistoriaClinica() {
    try {
      if (this.especialidadElegidaUser != "" && this.especialidadElegidaUser != "Todas") {
        console.log("Eligió especialidad");
        await this.mostrarHistoriaClinicaPorespecialidad();
      } else{
        console.log("No eligió especialidad");
        await this.mostrarHistoriaClinicaSimple();
      }
  
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(0, 102, 204);
      doc.text('Historias Clínicas de ' + this.pacienteActual, 20, 20);
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);
  
      let yPosition = 40;
      this.historiaClinicaPersonalizada.forEach((historia: any) => {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Fecha: ${historia.fecha}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Especialidad: ${historia.especialidad}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Doctor: ${historia.emailEspecialsita}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Peso: ${historia.peso} kg`, 20, yPosition);
        yPosition += 10;
        doc.text(`Altura: ${historia.altura} cm`, 20, yPosition);
        yPosition += 10;
        doc.text(`Presión: ${historia.presion} mmHg`, 20, yPosition);
        yPosition += 10;
        doc.text(`Temperatura: ${historia.temperatura} °C`, 20, yPosition);
        yPosition += 10;
        doc.text(`Observaciones: ${historia.observaciones}`, 20, yPosition);
        yPosition += 20;
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 5;
      });
  
      doc.save('historias_clinicas_' + this.pacienteActual + '.pdf');
    } catch (error) {
      console.error("Error durante la descarga:", error);
    }
  }
  
  

  



}
