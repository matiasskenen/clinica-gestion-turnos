import { Component } from '@angular/core';
import { TurnosService } from '../../services/turnos/turnos.service';
import { DataService } from '../../services/authUsers/data.service';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-pacientes-atendidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes-atendidos.component.html',
  styleUrl: './pacientes-atendidos.component.scss',
  animations: [
    trigger('routeAnimations', [
      transition('HomePage => LoginPage', [
        style({ opacity: 0, transform: 'translateY(50%)' }),
        animate('300ms', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition('LoginPage => HomePage', [
        style({ opacity: 0, transform: 'translateY(-50%)' }),
        animate('300ms', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class PacientesAtendidosComponent {

   // Variables
   diagnosticoArray: any[] = [];
   nombresEspecialistasArray: any[] = [];
   nombresFiltrados: any[] = []; // Inicialización como array vacío
   especialidadSeleccionada: string = '';
   especialista: any = {};
   turnosDisponibles: string[] = [];
   turnoSeleccionado: string = '';
   mensajeExito: boolean = false; // Para mostrar el mensaje de éxito
   pacienteFiltrado = "";
   doctorActual: any;
 
   constructor(
     private turnos: TurnosService,
     private userService: DataService,
     private auth: Auth,
   ) {
     this.dataNombres();
   }
 
   // Función para obtener los turnos del usuario
   dataNombres() {
     this.auth.onAuthStateChanged((user) => {
       this.doctorActual = user?.email;
 
       // Llamada al servicio para obtener los turnos
       this.turnos.getPacientes().subscribe({
         next: (data: any[]) => {
           // Filtrar los turnos donde el paciente es el usuario actual
           this.nombresEspecialistasArray = data // Filtra por el paciente
             .map((turno: any) => ({
              nombre: turno.nombre,
              dni: turno.dni,
              apellido: turno.apellido,
              imagen: turno.imagen,
               edad: turno.edad,
               email: turno.email,
               doctoremail : turno.emailEspecialsita
             }));
 
           // Actualizar los turnos filtrados para la visualización
           this.nombresFiltrados = [...this.nombresEspecialistasArray];
         },
         error: (err) => {
           console.error('Error al obtener los turnos:', err);
         },
       });
     });
   }

   historiaClinicaSeleccionada: any = null; 


   mostrarHistoriaClinica(emailPaciente: string) {
    // Encontrar al paciente actual en base al email
    const paciente = this.nombresEspecialistasArray.find(
      (p) => p.email === emailPaciente
    );
  
    if (!paciente) return;
  
    // Inicializar el array de fechas si no existe
    paciente.fechadiasArray = [];
  
    this.turnos.getTurno().subscribe({
      next: (data: any[]) => {
        // Filtrar las historias clínicas de este paciente
        const historiasFiltradas = data.filter(
          (historia: any) => historia.paciente === emailPaciente
        );
  
        // Procesar las fechas de las historias clínicas
        if (historiasFiltradas.length > 0) {
          historiasFiltradas.forEach((historia: any) => {
            if (paciente.fechadiasArray.length < 3) {
              paciente.fechadiasArray.push(historia.dia);
            }
          });
  
          // Mapear las historias clínicas para datos adicionales
          this.historiaClinicaSeleccionada = historiasFiltradas.map(
            (historia: any) => {
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
                      'especialista',
                      'diagnostico',
                      'horario',
                      'comentario',
                      'emailEspecialsita',
                      'especialidad',
                      'dia',
                      'estado',
                      'mensaje',
                      'comentarioPaciente',
                      'nombrePaciente'
                    ].includes(key)
                )
                .map(([titulo, valor]) => ({ titulo, valor }));
  
              return {
                dia: historia.dia,
                altura: historia.altura,
                peso: historia.peso,
                presion: historia.presion,
                temperatura: historia.temperatura,
                fecha: historia.fecha,
                doctor: historia.especialista,
                observaciones: historia.observaciones || 'Sin observaciones',
                datosDinamicos,
              };
            }
          );
        } else {
          console.log(
            `No se encontraron historias clínicas para el paciente: ${emailPaciente}`
          );
          this.historiaClinicaSeleccionada = [];
        }
  
        console.log(`Fechas de ${paciente.nombre}:`, paciente.fechadiasArray);
      },
      error: (err) => {
        console.error('Error al obtener las historias clínicas:', err);
      },
    });
  }
  
  
  
  
  ocultarHistoriaClinica(turno: any) {
    turno.historiaClinicaSeleccionada = false;
  }

}
