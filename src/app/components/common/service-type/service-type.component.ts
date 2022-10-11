import { Component, OnInit } from '@angular/core';
import { PlanTypes } from 'src/app/models/service';
import { ProfileService } from 'src/app/services/account/profile';
import { takeUntil, take } from 'rxjs/operators';
@Component({
  selector: 'service-type',
  templateUrl: './service-type.component.html',
  styleUrls: ['./service-type.component.scss'],
})
export class ServiceTypeComponent implements OnInit {
  planTypes: PlanTypes[];
  constructor(private profileService: ProfileService) { }

  ngOnInit() {
    this.getPlanTypes();
  }
  async getPlanTypes() {
    this.planTypes = [...await this.profileService.getPlanTypes().pipe(take(1)).toPromise()]; 
    this.planTypes.map(res=>{
        res.planBandwidth = this.transformUnit(res.planBandwidth);
        res.planDiskspace = this.transformUnit(res.planDiskspace);
    })
  }
  transformUnit(gb: number = 0): string {
    let units = ['GB', 'Terabyte','Petabyte'];
    if (isNaN(parseFloat(String(gb))) || !isFinite(gb)) {
      return '?';
    }

    let unit = 0;
    while (gb >= 1000) {
      gb /= 1000;
      unit++;
    }

    return gb +' '+ units[unit];
  }

}
