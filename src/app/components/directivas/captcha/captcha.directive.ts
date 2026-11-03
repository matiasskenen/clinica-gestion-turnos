import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCaptcha]',
  standalone: true
})
export class CaptchaDirective {
  @Input() disabledCaptcha: boolean = false;
  @Output() captchaValidated: EventEmitter<boolean> = new EventEmitter<boolean>();

  private generatedCode: string = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    if (!this.disabledCaptcha) {
      this.createCaptcha();
    }
  }

  createCaptcha() {
    this.generatedCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.renderer.setProperty(this.el.nativeElement, 'placeholder', `Enter: ${this.generatedCode}`);
  }

  @HostListener('input', ['$event'])
  validateCaptcha(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    if (inputValue === this.generatedCode) {
      this.captchaValidated.emit(true);
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid green');
    } else {
      this.captchaValidated.emit(false);
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid red');
    }
  }
}
