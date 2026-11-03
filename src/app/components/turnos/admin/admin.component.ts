import { Component, OnDestroy } from '@angular/core';
import { TurnosService } from '../../../services/turnos/turnos.service';
import { DataService } from '../../../services/authUsers/data.service';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../pipes/filtroDatos/filter.pipe';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  animations:
  [
    trigger('routeAnimations', [
      transition('HomePage => LoginPage', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition('LoginPage => HomePage', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
    
  ]
})
export class AdminComponent implements OnDestroy {
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
    this.subs.add(
      this.turnos.getTurnos().subscribe({
        next: (turnos) => {
          const turnosFiltrados = turnos.map((turno: any) => ({
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
  }


cambiarEstado(estado: string, usuario: any) {
  this.turnos.ingresarEstado(estado, usuario.paciente, usuario.horario, usuario.dia);
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
  this.turnos.ingresarDiagnostico(turno.diagnostico, usuario, turno.horario, turno.dia, turno.comentarios);

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
}

guardarHistoriaClinica(turno: any, usuario: any) {
  console.log('Altura:', turno.altura);
  console.log('Peso:', turno.peso);
  console.log('Temperatura:', turno.temperatura);
  console.log('Presión Arterial:', turno.presion);

  console.log('Temperatura:', turno.NombredatodinamicoUno);
  console.log('Presión Arterial:', turno.datodinamicoUno);

  console.log('Temperatura:', turno.NombredatodinamicoDos);
  console.log('Presión Arterial:', turno.datodinamicoDos);

  //this.turnos.ingresarHistoriaClinica(this.doctorActual, turno.paciente, turno.altura, turno.peso, turno.temperatura, turno.presion, turno.temperatura, turno.NombredatodinamicoUno, turno.NombredatodinamicoDos, turno.datodinamicoDos, usuario)
  this.cambiarEstado('historiaClinica', turno); // 
  turno.mostrarFormularioHistoriaClinica = false;
  // Llamar al servicio para guardar la historia clínica en el backend
}

datodinamico1 = false;
datodinamico2 = false;

Agregardatodinamico1() {
  this.datodinamico1 = true;
}

Agregardatodinamico2() {
  this.datodinamico2 = true;
}

verdiagnostico(usuario: string) {}

verDiagnosticoTerminado(turno: any) {
  // Mostrar el formulario solo para el turno seleccionado
  this.nombresEspecialistasArray.forEach((t) => {
    t.mostrarFormularioDiagnostico = false;
  });
  turno.mostrarFormularioDiagnostico = true;
}

// Código de envío
toggleMensajeExito() {
  this.mensajeExito = !this.mensajeExito;
}

}
