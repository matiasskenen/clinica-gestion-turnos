import { Component } from '@angular/core';
import { TurnosService } from '../../../services/turnos/turnos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DetalleTurnoComponent } from './turnos-pacientes/detalle-turno/detalle-turno.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.scss'
})
export class PacientesComponent {

  constructor(private turnos: TurnosService, private router : Router) {
    this.dataEspecialidades();
    this.dataNombres();

  }


  navigateTo(route: string) {
    switch (route) {
      case 'misturnos':
        this.router.navigate(['/turnos/misturnos']);
        break;
      case 'solicitarturno':
        this.router.navigate(['/turnos/solicitarturno']);
        break;
    }
  }


  especialistaSeleccionado: any;
  especialidadSeleccionado: any;

  seleccionarEspecialista(especialista: any) {
    this.especialistaSeleccionado = especialista.nombre;
    this.especialidadSeleccionado = especialista.especialidad;
  }

  // Variables de búsqueda
  busqueda: string = '';
  especialidadesArray: string[] = [];
  nombresEspecialistasArray: any[] = [];
  especialidadesFiltradas: string[] = [];
  nombresFiltrados: any[] = [];

  // Función para filtrar tanto las especialidades como los nombres de especialistas
  filtrar() {
    this.filtrarEspecialidades();
    this.filtrarNombres();
  }

  filtrarEspecialidades() {
    const filtro = this.busqueda.toLowerCase();
    this.especialidadesFiltradas = this.especialidadesArray.filter((especialidad: string) =>
      String(especialidad).toLowerCase().includes(filtro)  // Convertimos a string antes de hacer toLowerCase()
    );
    console.log(this.especialidadesArray)
    console.log(this.especialidadesFiltradas)
  }
  
  // Filtrar nombres de especialistas
  filtrarNombres() {
    const filtro = this.busqueda.toLowerCase();
    this.nombresFiltrados = this.nombresEspecialistasArray.filter((especialista: any) =>
      String(especialista.nombre).toLowerCase().includes(filtro) || 
      String(especialista.especialidad).toLowerCase().includes(filtro) // Convertimos a string antes de hacer toLowerCase()
    );
  }

  // Cargar especialistas y especialidades
  dataEspecialidades() {
    this.turnos.getEspecialistas().subscribe((data: any[]) => {
      this.especialidadesArray = data.map((especialista: any) => especialista.especialista);
      this.especialidadesFiltradas = [...this.especialidadesArray];
    });
    console.log(this.especialidadesArray)
    console.log(this.especialidadesFiltradas)
  }

  dataNombres() {
    this.turnos.getEspecialistas().subscribe((data: any[]) => {
      this.nombresEspecialistasArray = data.map((especialista: any) => ({
        nombre: especialista.nombre,
        especialidad: especialista.especialista
      }));
      this.nombresFiltrados = [...this.nombresEspecialistasArray];
    });
  }
}
