import { Component, OnDestroy } from '@angular/core';
import { TurnosService } from '../../../services/turnos/turnos.service';
import { DataService } from '../../../services/authUsers/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { FilterPipe } from '../../pipes/filtroDatos/filter.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-especialistas',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './especialistas.component.html',
  styleUrl: './especialistas.component.scss',
})
export class EspecialistasComponent implements OnDestroy {
  private subs: Subscription = new Subscription();
  // Variables
  searchText: string = '';
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

  emailPaciente = "";

  constructor(
    private turnos: TurnosService,
    private userService: DataService,
    private auth: Auth,
  ) {
    this.dataFiltros();
  }

  // Función para obtener los turnos del usuario
  dataNombres() {
    this.auth.onAuthStateChanged((user) => {
      let usuarioActual = user?.email;
      this.doctorActual = user?.email;

      // Llamada al servicio para obtener los turnos
      this.turnos.getTurnos().subscribe({
        next: (data: any[]) => {
          // Filtrar los turnos donde el paciente es el usuario actual
          this.nombresEspecialistasArray = data
            .filter((turno: any) => turno.emailEspecialsita === usuarioActual) // Filtra por el paciente
            .map((turno: any) => ({
              paciente: turno.paciente,
              especialista: turno.especialista,
              especialidad: turno.especialidad,
              horario: turno.horario,
              estado: turno.estado,
              mensaje: turno.mensaje,

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

  historiaclinicaaray: any[] = [];
  historiaEncontrada = false;

  datahistoria() {
    this.auth.onAuthStateChanged((user) => {
      const usuarioActual = user?.email;

      if (!usuarioActual) {
        console.error('No se encontró un usuario autenticado.');
        return;
      }

      this.doctorActual = usuarioActual;
      console.log("entre");

      // Llamar solo al servicio de historia clínica
      this.turnos.getHistoriaClinica().subscribe({
        next: (historiaClinica) => {
          console.log('Datos recibidos:', historiaClinica);

          // Filtrar y mapear las historias clínicas
          const historiaFiltrada = historiaClinica
            .filter((historia: any) => historia.emailEspecialsita === usuarioActual)
            .map((historia: any) => ({
              altura: historia.altura || '',
              peso: historia.peso || '',
              presion: historia.presion || '',
              temperatura: historia.temperatura || '',
            }));

          console.log("Historias clínicas filtradas:", historiaFiltrada);
          this.historiaclinicaaray = historiaFiltrada;
        },
        error: (err) => {
          console.error('Error al obtener los datos de historia clínica:', err);
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  dataFiltros() {
    this.auth.onAuthStateChanged((user) => {
      const usuarioActual = user?.email;
  
      if (!usuarioActual) {
        return;
      }
  
      this.doctorActual = usuarioActual;
  
      this.subs.add(
        this.turnos.getTurnos().subscribe({
          next: (turnos) => {
            const turnosFiltrados = turnos
              .filter((turno: any) => turno.emailEspecialsita === usuarioActual)
              .map((turno: any) => ({
                paciente: turno.paciente,
                especialista: turno.especialista,
                especialidad: turno.especialidad,
                horario: turno.horario,
                estado: turno.estado,
                mensaje: turno.mensaje,
                diagnostico: turno.diagnostico || '',
                emaildoctor: turno.emailEspecialsita,
                comentario: turno.comentario || '',
                dia: turno.dia,
                altura: turno.altura || '',
                peso: turno.peso || '',
                presion: turno.presion || '',
                temperatura: turno.temperatura || '',
                comentarioPaciente: turno.comentarioPaciente || '',
                nombrePaciente: turno.nombrePaciente || ''
              }));
  
            this.nombresEspecialistasArray = turnosFiltrados;
            this.nombresFiltrados = [...this.nombresEspecialistasArray];
          },
          error: (err) => {
            console.error('Error al obtener los datos de turnos:', err);
          },
        })
      );
    });
  }
  

  cambiarEstado(estado: string, usuario: any) {
    this.turnos.ingresarEstado(estado, usuario.paciente, usuario.horario, usuario.dia);

    if(estado == "finalizar")
    {
      this.turnos.sendLogTurnoFinalizado(usuario.especialista)
    }
  }

  cambiarMensaje(mensaje: string, usuario: any) {
    this.turnos.ingresarMensaje(mensaje, usuario.paciente, usuario.horario, usuario.dia);
  }

  mostrarFormularioDiagnostico(turno: any) {
    // Mostrar el formulario solo para el turno seleccionado
    this.nombresEspecialistasArray.forEach((t) => {
      t.mostrarFormularioDiagnostico = false;
    });
    turno.mostrarFormularioDiagnostico = true;
  }

  ocultarFormularioDiagnostico(turno: any) {
    turno.mostrarFormularioDiagnostico = false;
  }

  guardarDiagnostico(turno: any, usuario: any) {
    this.turnos.ingresarDiagnostico(turno.diagnostico, usuario, turno.horario, turno.dia, turno.comentario);

    // Aquí puedes realizar el llamado al servicio para guardar los datos en el backend
    this.cambiarEstado('diagnosticado', turno); // Cambiar estado del turno
    turno.mostrarFormularioDiagnostico = false;
  }

  mostrarFormularioHistoriaClinica(turno: any) {
    // Mostrar el formulario solo para el turno seleccionado
    this.nombresEspecialistasArray.forEach((t) => {
      t.mostrarFormularioHistoriaClinica = false;
    });
    turno.mostrarFormularioHistoriaClinica = true;
  }

  ocultarHistoriaClinica(turno: any) {
    turno.mostrarFormularioHistoriaClinica = false;
    this.datodinamico1 = false;
    this.datodinamico2 = false;
    this.datodinamico3 = false;
  }


  guardarHistoriaClinica(turno: any, usuario: any) {
    this.turnos.ingresarHistoriaClinica(turno.altura, turno.peso, turno.temperatura, turno.presion, 
      
      this.nombreDinamicoUno,
      this.datoDinamicoUno,  
      this.NombreDinamicoDos, 
      this.datoDinamicoDos,
      this.NombreDinamicoTres, 
      this.datoDinamicoTres, 
      this.NombreDinamicoCuatro, 
      this.datoDinamicoCuatro, 
      this.NombreDinamicoCinco, 
      this.datoDinamicoCinco, 
      this.NombreDinamicoSeis, 
      this.datoDinamicoSeis,

      usuario, turno.horario)
    this.cambiarEstado('historiaClinica', turno); // 
    turno.mostrarFormularioHistoriaClinica = false;
    // Llamar al servicio para guardar la historia clínica en el backend
  }

  datodinamico1: boolean = false;
  datodinamico2: boolean = false;
  datodinamico3: boolean = false;

  nombreDinamicoUno: string = '';
  datoDinamicoUno: string = '';
  
  NombreDinamicoDos: string = '';
  datoDinamicoDos: string = '';
  
  NombreDinamicoTres: string = '';
  datoDinamicoTres: string = '';

  NombreDinamicoCuatro: string = '';
  datoDinamicoCuatro: string = '';

  NombreDinamicoCinco: string = '';
  datoDinamicoCinco: string = '';

  NombreDinamicoSeis: string = '';
  datoDinamicoSeis: string = '';
  

  // Funciones para agregar datos dinámicos
  Agregardatodinamico1() {
    this.datodinamico1 = true;
  }

  Agregardatodinamico2() {
    this.datodinamico2 = true;
  }

  Agregardatodinamico3() {
    this.datodinamico3 = true;
  }



  verdiagnostico(usuario: string) {}

  verDiagnosticoTerminado(turno: any) {
    // Mostrar el formulario solo para el turno seleccionado
    this.nombresEspecialistasArray.forEach((t) => {
      t.mostrarFormularioDiagnostico = false;
    });
    turno.mostrarFormularioDiagnostico = true;
  }

  ocultarverComentarioPaciente(turno: any) {
    turno.verComentarioPaciente = false;
  }

  verComentarioPaciente(turno: any) {
    // Mostrar el formulario solo para el turno seleccionado
    this.nombresEspecialistasArray.forEach((t) => {
      t.verComentarioPaciente = false;
    });
    turno.verComentarioPaciente = true;
  }

  // Código de envío
  toggleMensajeExito() {
    this.mensajeExito = !this.mensajeExito;
  }

}
