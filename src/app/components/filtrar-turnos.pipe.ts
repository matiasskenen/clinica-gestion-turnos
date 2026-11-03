import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrarTurnos'
})
export class FiltrarTurnosPipe implements PipeTransform {
  transform(turnos: string[], horaMinima: string): string[] {
    const [minHora, minMinuto] = horaMinima.split(':').map(Number);
    return turnos.filter(turno => {
      const [hora, minuto] = turno.split(':').map(Number);
      return hora > minHora || (hora === minHora && minuto >= minMinuto);
    });
  }
}
