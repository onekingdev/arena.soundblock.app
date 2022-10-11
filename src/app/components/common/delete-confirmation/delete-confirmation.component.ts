import { Component } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'app-delete-confirmation',
  template: `
    <ion-card class="confirmDialogBody">
      <ion-card-header>
        <span> {{ title }} </span>
        <span><i class="fas fa-close" (click)="cancel()"></i></span>
      </ion-card-header>
      <ion-card-content class="cardContent centered">
        <ion-row class="container">
          <ion-col size="12" class="message">{{ message }}</ion-col>
        </ion-row>

        <ion-row class="horizontalCenterRow p10">
          <ion-col size="6">
            <button
              nbButton
              shape="semi-round"
              fullWidth
              status="primary"
              (click)="confirm()"
            >
              Confirm
            </button>
          </ion-col>
          <ion-col size="6">
            <button
              nbButton
              shape="semi-round"
              fullWidth
              status="info"
              (click)="cancel()"
            >
              <span class="gradientText">Cancel</span>
            </button>
          </ion-col>
        </ion-row>
      </ion-card-content>
    </ion-card>
  `,
  styleUrls: ['../../../components/settings/account/holder/holder.component.scss'],
})
export class DeleteConfirmationComponent {
  message: string;
  title = 'Delete Confirmation';

  constructor(protected dialogRef: NbDialogRef<DeleteConfirmationComponent>) { }

  cancel() {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close(true);
  }
}
