import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-detalle-turno',
  standalone: true,
  imports: [],
  templateUrl: './detalle-turno.component.html',
  styleUrl: './detalle-turno.component.scss'
})
export class DetalleTurnoComponent {

  @Input() especialistaSeleccionado: any; // Recibe el especialista seleccionado desde el padre

  @Input() especialidadSeleccionado: any; // Recibe el especialista seleccionado desde el padre


  sad()
  {
    console.log(this.especialidadSeleccionado)
  }
}
