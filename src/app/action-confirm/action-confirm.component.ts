import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-action-confirm',
  templateUrl: './action-confirm.component.html'
})
export class ActionConfirmComponent {

  @Input()
  public prompt: string;

  @Input()
  public displayClass: string;

  @Output()
  public confirmed = new EventEmitter();

  @Output()
  public canceled = new EventEmitter();

  public confirmMode = false;

  constructor() { }

  public confirm() {
    this.confirmMode = false;
    this.confirmed.emit();
  }

  public cancel() {
    this.confirmMode = false;
    this.canceled.emit();
  }
}
