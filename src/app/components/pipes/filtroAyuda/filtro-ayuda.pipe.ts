import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroAyuda',
  standalone: true
})
export class FiltroAyudaPipe implements PipeTransform {

  transform(items: any[], searchText: string, field: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(item =>
      item[field].toLowerCase().includes(searchText)
    );
  }

}
