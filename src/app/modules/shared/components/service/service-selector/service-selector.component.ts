import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { Service, ServiceData } from '../../../../../models/service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-service-selector',
  templateUrl: './service-selector.component.html',
  styleUrls: ['./service-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ServiceSelectorComponent),
      multi: true
    }
  ]
})
export class ServiceSelectorComponent implements ControlValueAccessor, OnInit {

  @Input() services: ServiceData[];
  @Input() userUUID: string;
  @Input() errors: any;
  @Input() touched: any;

  @Output() valueChanged: EventEmitter<Service> = new EventEmitter();

  @Input()
  _selectedService: ServiceData;
  currentService: any = null;
  get selectedService() {
    return this._selectedService;
  }

  set selectedService(selectedService: ServiceData) {
    this._selectedService = selectedService;
    this.propagateChange(this._selectedService);
  }

  public userServices: ServiceData[];
  public nonUserServices: ServiceData[];

  constructor(
  ) {
  }

  propagateChange = (_: any) => {
  };

  ngOnInit() {
    const userService = this.services
      .find(s => s.account.user_uuid === this.userUUID);

    this.userServices = this.services.filter(
      s => s.account.user_uuid === this.userUUID)
      .sort((a, b) => {
        const ta = a.account.account_name.toUpperCase();
        const tb = b.account.account_name.toUpperCase();
        return (ta < tb) ? -1 : (ta > tb) ? 1 : 0;
      });

    this.nonUserServices = this.services.filter(
      s => s.account.user_uuid !== this.userUUID)
      .sort((a, b) => {
        const ta = a.account.account_name.toUpperCase();
        const tb = b.account.account_name.toUpperCase();
        return (ta < tb) ? -1 : (ta > tb) ? 1 : 0;
      });

  }

  checkServiceOwned(service) {
    if (!service) return false;
    return service.account.user_uuid === this.userUUID;
  }

  clicked(service: Service) {
    this.currentService = service;
    this.valueChanged.emit(service);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(serviceData: ServiceData): void {
    this.selectedService = serviceData;
  }

}
