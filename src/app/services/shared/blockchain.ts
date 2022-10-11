import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { catchError, map } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BlockchainViewerComponent } from 'src/app/components/common/blockchain-viewer/blockchain-viewer.component';

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  constructor(
    private http: HttpClient,
    private bsModalService: BsModalService
  ) {}

  getBlockchainInfo(ledgerId, request) {
    return this.http.get<any>(`soundblock/blockchain/record/${ledgerId}`,{params: request as any}).pipe(map(res => {
      return res.data;
    }));
  }

}
