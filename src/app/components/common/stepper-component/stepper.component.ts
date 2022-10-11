import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { CdkStepper } from '@angular/cdk/stepper';
import { Directionality } from '@angular/cdk/bidi';

@Component({
  selector: 'app-stepper-component',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }]
})
export class StepperComponent extends CdkStepper implements OnInit {
  stepLabel = [];
  @Input() showStepper: boolean;
  constructor(dir: Directionality, changeDetectorRef: ChangeDetectorRef) {
    super(dir, changeDetectorRef);
   }

   onClick(index: number): void {
    this.selectedIndex = index;
  }

  ngOnInit() {}

}
