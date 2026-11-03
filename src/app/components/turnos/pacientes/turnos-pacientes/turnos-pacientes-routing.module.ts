import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetalleTurnoComponent } from './detalle-turno/detalle-turno.component';
import { MisturnosComponent } from './misturnos/misturnos.component';
import { SolicitarturnoComponent } from './solicitarturno/solicitarturno.component';

const routes: Routes = [
  
  {
    path: "detalleturnoPaciente",
    component: DetalleTurnoComponent
  },
  {
    path: "misturnos",
    component: MisturnosComponent
  },
  {
    path: "solicitarturno",
    component: SolicitarturnoComponent
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TurnosPacientesRoutingModule { }
