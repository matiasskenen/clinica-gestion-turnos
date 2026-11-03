import { Component } from '@angular/core';
import { TurnosService } from '../../services/turnos/turnos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-seccionusuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seccionusuarios.component.html',
  styleUrl: './seccionusuarios.component.scss'
})
export class SeccionusuariosComponent {

  constructor(private turnos: TurnosService, private usuarios : UsuariosService)
  {
    this.dataNombres();
    this.dataPacientes();
  }

  busqueda: string = '';
  especialidadesArray: string[] = [];
  nombresEspecialistasArray: any[] = [];
  especialidadesFiltradas: string[] = [];
  nombresFiltrados: any[] = [];
  pacientesFiltrados : any[] = []; 
  pacientesaaray: any[] = [];

  
  // Filtrar nombres de especialistas
  filtrarNombres() {
    const filtro = this.busqueda.toLowerCase();
    this.nombresFiltrados = this.nombresEspecialistasArray.filter((especialista: any) =>
      String(especialista.nombre).toLowerCase().includes(filtro) || 
      String(especialista.especialidad).toLowerCase().includes(filtro) // Convertimos a string antes de hacer toLowerCase()
    );
  }


  dataNombres() {
    this.turnos.getEspecialistas().subscribe((data: any[]) => {
      this.nombresEspecialistasArray = data.map((especialista: any) => ({
        nombre: especialista.nombre,
        verificado : especialista.verificado,
        email : especialista.email
      }));
      this.nombresFiltrados = [...this.nombresEspecialistasArray];

      console.log(this.nombresFiltrados)
    });
  }

  modificarVerificado(funcion : string, nombre : string)
  { 
    this.usuarios.modificarVerficiado(funcion, nombre)
  }


  dataPacientes() {
      // Llamada al servicio para obtener los turnos
      this.turnos.getPacientes().subscribe({
        next: (data: any[]) => {
          // Filtrar los turnos donde el paciente es el usuario actual
          this.pacientesaaray = data // Filtra por el paciente
            .map((turno: any) => ({
             nombre: turno.nombre,
             dni: turno.dni,
             apellido: turno.apellido,
             imagen: turno.imagen,
              edad: turno.edad,
              email: turno.email,
            }));

          // Actualizar los turnos filtrados para la visualización
          this.pacientesFiltrados = [...this.pacientesaaray];
        },
        error: (err) => {
          console.error('Error al obtener los turnos:', err);
        },
      });
  }

  historiaClinicaSeleccionada: any = null;
  mostrarHistoriaClinica(emailPaciente: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Inicializar historia clínica seleccionada
      this.historiaClinicaSeleccionada = [];
  
      // Llamar al servicio para obtener los turnos
      this.turnos.getTurno().subscribe({
        next: (data: any[]) => {
          // Filtrar las historias clínicas por paciente
          const historiasFiltradas = data.filter(
            (historia: any) => historia.paciente === emailPaciente
          );
  
          // Procesar y mapear las historias clínicas
          if (historiasFiltradas.length > 0) {
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
                      ].includes(key)
                  )
                  .map(([titulo, valor]) => ({ titulo, valor }));
  
                return {
                  estado: historia.estado,
                  dia: historia.dia,
                  altura: historia.altura,
                  peso: historia.peso,
                  presion: historia.presion,
                  temperatura: historia.temperatura,
                  fecha: historia.fecha,
                  emailEspecialsita: historia.emailEspecialsita,
                  especialidad : historia.especialidad,
                  observaciones: historia.observaciones || 'Sin observaciones',
                  datosDinamicos,
                };
              }
            );
            resolve(); // Resuelve la promesa al finalizar exitosamente
          } else {
            console.log(`No se encontraron historias clínicas para: ${emailPaciente}`);
            resolve(); // Resuelve aunque no haya datos
          }
        },
        error: (err) => {
          console.error('Error al obtener las historias clínicas:', err);
          reject(err); // Rechaza la promesa si hay un error
        },
      });
    });
  }
  
  async ddescargarHistoriaClinica(usuario: string) {
    try {
      // Llamar a mostrarHistoriaClinica y esperar su resolución
      await this.mostrarHistoriaClinica(usuario);
  
      // Validar que haya historias clínicas seleccionadas
      if (this.historiaClinicaSeleccionada.length === 0) {
        console.warn(`No hay historias clínicas para descargar de ${usuario}.`);
        return;
      }
  
      // Generar el PDF
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(0, 102, 204);
      doc.text('Historias Clínicas de ' + usuario, 20, 20);
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);
      let yPosition = 40;
  
      // Añadir historias clínicas al PDF
      this.historiaClinicaSeleccionada.forEach((historia: any) => {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Fecha: ${historia.dia}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Estado: ${historia.estado}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Doctor: ${historia.emailEspecialsita}`, 20, yPosition);
        yPosition += 10;
        doc.text(`especialidad: ${historia.especialidad}`, 20, yPosition);
        yPosition += 10;
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 5;
      });
  
      // Descargar el PDF
      doc.save(`historias_clinicas_${usuario}.pdf`);
    } catch (error) {
      console.error('Error al descargar las historias clínicas:', error);
    }
  }

  descargarExcel() {
    // Crear una nueva hoja de trabajo (worksheet) con los datos
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.pacientesaaray);
  
    // Crear un libro de trabajo (workbook) con la hoja de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');
  
    // Descargar el archivo Excel
    XLSX.writeFile(wb, 'pacientes.xlsx');
  }
  



}
