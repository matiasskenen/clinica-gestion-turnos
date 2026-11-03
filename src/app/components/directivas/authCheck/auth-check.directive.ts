import { Directive, ElementRef, Renderer2 } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Directive({
  selector: '[appAuthCheck]',
  standalone: true
})
export class AuthCheckDirective {
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private auth: Auth
  ) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'block');
      } else {
        //oculta el elemento
        this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none');
      }
    });
  }
}
