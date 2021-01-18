import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-action-confirm',
  templateUrl: './action-confirm.component.html'
})
export class ActionConfirmComponent {

  @Input()
  // @ts-ignore(2564)
  public prompt: string;

  @Input()
  // @ts-ignore(2564)
  public displayClass: string;

  @Output()
  public confirmed = new EventEmitter();

  @Output()
  public canceled = new EventEmitter();

  public confirmMode = false;

  public confirm() {
    this.confirmMode = false;
    this.confirmed.emit();
  }

  public cancel() {
    this.confirmMode = false;
    this.canceled.emit();
  }
}
