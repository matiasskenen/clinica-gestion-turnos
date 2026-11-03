import { Directive, ElementRef, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appScroll]',
  standalone: true
})
export class ScrollDirective {
  @Input() scrollToTop: boolean = false; 
  @Input() scrollBehavior: 'auto' | 'smooth' = 'smooth'; 

  constructor(private el: ElementRef) {}

  @HostListener('click') onClick() {
    window.scrollTo({
      top: 0, 
      behavior: 'smooth' 
    });
  }
}
