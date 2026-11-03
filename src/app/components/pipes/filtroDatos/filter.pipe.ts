import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true, // Asegúrate de que sea standalone si lo usas en componentes standalone
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
      return items; // Si no hay elementos o texto de búsqueda, retorna los items sin cambios
    }

    searchText = searchText.toLowerCase(); // Convierte el texto de búsqueda a minúsculas

    return items.filter((item) => {
      // Recorre todas las claves de cada objeto 'item'
      return Object.keys(item).some((key) => {
        // Verifica si el valor de cada clave contiene el texto de búsqueda
        const value = item[key];
        // Si el valor es un string o un número, lo convierte a string y lo compara con el texto de búsqueda
        if (value !== null && value !== undefined) {
          return value.toString().toLowerCase().includes(searchText);
        }
        return false; // Si el valor es nulo o indefinido, no hace la comparación
      });
    });
  }
}