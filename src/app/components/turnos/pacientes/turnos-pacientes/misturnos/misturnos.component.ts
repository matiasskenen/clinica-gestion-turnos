import { Component, OnDestroy } from '@angular/core';
import { TurnosService } from '../../../../../services/turnos/turnos.service';
import { DataService } from '../../../../../services/authUsers/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { FilterPipe } from '../../../../pipes/filtroDatos/filter.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-misturnos',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './misturnos.component.html',
  styleUrl: './misturnos.component.scss',
})
export class MisturnosComponent implements OnDestroy {
  private subs: Subscription = new Subscription();
  // Variables
  searchText: string = '';
  nombresEspecialistasArray: any[] = [];
  nombresFiltrados: any[] = []; // Inicialización como array vacío
  especialidadSeleccionada: string = '';
  especialista: any = {};
  turnosDisponibles: string[] = [];
  turnoSeleccionado: string = '';
  mensajeExito: boolean = false; // Para mostrar el mensaje de éxito
  usuarioActual : any;


  constructor(
    private turnos: TurnosService,
    private userService: DataService,
    private auth: Auth,
  ) {
    this.dataNombres();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getEstadoTurno(estado: string): string {
    switch (estado) {
      case 'aceptado':
        return 'Turno Confirmado';
      case 'pendiente':
        return 'Esperando Confirmación';
      case 'historiaClinica':
        return 'En Espera de Historia Clínica';
      case 'cancelado':
        return 'Turno Cancelado';
      case 'eliminado':
        return 'Turno Eliminado';
      case 'finalizar':
        return 'Registrando Historia CLinica';
      case 'FINALIZADO':
        return 'Turno Finalizado';
      default:
        return 'Estado Desconocido';
    }
  }

  ingresarEncuesta(atencion: string, demora: string, limpieza : string, usuario : string, doctor : string, turno: any)
  {
    console.log(doctor)
    this.turnos.ingresarEncuestaPaciente(atencion, demora, limpieza, usuario, doctor);
    this.ocultarFormularioEncuesta(turno);
    this.cambiarEstado("FINALIZADO", turno);
  }

  encuesta = false;

  ingresarCalificacion(comentario : string, usuario : string)
  {
    this.encuesta = true;
    this.turnos.ingresarComentarioPaciente(comentario, usuario)
  }

  
  ingresarMensajePaciente(comentario : string, usuario : string, horario : string, dia?: string)
  {
    this.encuesta = true;
    this.turnos.ingresarEstado("cancelado", usuario, horario, dia);
    this.turnos.ingresarMensajePaciente(comentario, usuario, horario, dia);
  }

  ocultarFormularioEncuesta(turno: any) {
    turno.mostrarFormularioEncuesta = false;
  }

  ocultarFormularioCalificar(turno: any) {
    turno.mostrarFormularioCalificar = false;
  }

  mostrarFormularioEncuesta(turno: any) {
    // Mostrar el formulario solo para el turno seleccionado
    this.nombresEspecialistasArray.forEach((t) => {
      t.mostrarFormularioEncuesta = false;
    });
    turno.mostrarFormularioEncuesta = true;
  }

  calificar = false;

  mostrarFormularioCalificar(turno: any) {

    this.calificar = true;
    // Mostrar el formulario solo para el turno seleccionado
    this.nombresEspecialistasArray.forEach((t) => {
      t.mostrarFormularioCalificar = false;
    });
    turno.mostrarFormularioCalificar = true;
  }

  // Función para obtener los turnos del usuario
  dataNombres() {
    // Obtener el usuario actual
    this.auth.onAuthStateChanged((user) => {
      this.usuarioActual = user?.email;

      if (!this.usuarioActual) return;

      // Llamada al servicio para obtener los turnos
      this.subs.add(
        this.turnos.getTurnos().subscribe({
          next: (data: any[]) => {
            // Filtrar los turnos donde el paciente es el usuario actual
            this.nombresEspecialistasArray = data
              .filter((turno: any) => turno.paciente === this.usuarioActual) // Filtra por el paciente
              .map((turno: any) => ({
                paciente: turno.paciente,
                especialista: turno.especialista,
                especialidad: turno.especialidad,
                horario: turno.horario,
                estado: turno.estado,
                mensaje: turno.mensaje,
                doctor : turno.emailEspecialsita,
                dia: turno.dia,
                comentarioPaciente : turno.comentarioPaciente
              }));

            // Actualizar los turnos filtrados para la visualización
            this.nombresFiltrados = [...this.nombresEspecialistasArray];
          },
          error: (err) => {
            console.error('Error al obtener los turnos:', err);
          },
        })
      );
    });
  }

  // Filtro para buscar por especialidad o especialista
  aplicarFiltro() {
    this.nombresFiltrados = this.nombresEspecialistasArray.filter(
      (turno) =>
        (this.especialidadSeleccionada
          ? turno.especialidad
              .toLowerCase()
              .includes(this.especialidadSeleccionada.toLowerCase())
          : true) &&
        (this.especialista
          ? turno.especialista
              .toLowerCase()
              .includes(this.especialista.toLowerCase())
          : true),
    );
  }

  cambiarEstado(estado : string, usuario : any)
  {
    this.turnos.ingresarEstado(estado, usuario.paciente, usuario.horario, usuario.dia);
  }

  mostrarFormularioCancelar(turno: any) {
    // Mostrar el formulario solo para el turno seleccionado
    this.nombresEspecialistasArray.forEach((t) => {
      t.mostrarFormularioCancelar = false;
    });
    turno.mostrarFormularioCancelar = true;
  }

}
