import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AddArtistRequest, EditArtistRequest } from 'src/app/models/service';
import { Artist } from 'src/app/models/project';
import { takeUntil } from 'rxjs/operators';
import { ArtistCropComponent } from '../artist-crop/artist-crop.component';

@Component({
  selector: 'app-add-artist',
  templateUrl: './add-artist.component.html',
  styleUrls: ['./add-artist.component.scss'],
})
export class AddArtistComponent implements OnInit {

  @Input() public artistAdded: boolean;
  @Input() public artistAdding: boolean;
  @Input() public artistAddedError: any;
  @Input() public artistName: string;
  @Input() public artist: Artist;
  flags: any;
  step = 1;
  imageError: string;
  filePath = "https://cloud.develop.account.arena.com/assets/static/avatar_v2.jpg"

  @Output() artistAddedConfirmed: EventEmitter<AddArtistRequest> = new EventEmitter<AddArtistRequest>();
  @Output() artistEditConfirmed: EventEmitter<EditArtistRequest> = new EventEmitter<EditArtistRequest>();

  reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  public form: FormGroup;

  constructor(
    public bsModalRef: BsModalRef,
    private bsModalService: BsModalService,
    ) {
  }

  ngOnInit(): void {
    this.flags = {
      apple: 'initial',
      spotify: 'initial',
      soundcloud: 'initial'
    } 
    this.form = new FormGroup({
      artist_name: new FormControl(this.artistName?this.artistName:'', Validators.required),
      url_spotify: new FormControl('',Validators.pattern(this.reg)),
      url_apple: new FormControl('', Validators.pattern(this.reg)),
      url_soundcloud: new FormControl('', Validators.pattern(this.reg)),
      avatar: new FormControl('')
    });
    if(this.artist) {
      this.form.patchValue({artist_name: this.artist.artist_name});
      this.form.patchValue({url_apple: this.artist.url_apple});
      this.form.patchValue({url_soundcloud: this.artist.url_soundcloud});
      this.form.patchValue({url_spotify: this.artist.url_spotify});
      if(this.artist.url_apple) {
        this.flags.apple = 'yes';
      }
      if(this.artist.url_soundcloud) {
        this.flags.soundcloud = 'yes';        
      }
      if(this.artist.url_spotify) {
        this.flags.spotify = 'yes'; 
      }
      if(this.artist.avatar_url.length) {
        this.filePath = this.artist.avatar_url;
      }
    }
  }

  confirm() {
    this.artistAddedError = '';
    if(this.flags.apple === 'initial' || this.flags.apple === 'initial' || this.flags.soundcloud === 'initial'){
      this.artistAddedError = 'Please Provide The Answers Above!';
    }
    else if(this.form.invalid) {
      this.artistAddedError = 'Please Provide Valid Information';
    }
    else {
      if(this.form.controls.url_apple.value && !this.form.controls.url_apple.value.includes('apple')) {
        this.artistAddedError = 'Invalid Apple Url';
        return;
      }
      if(this.form.controls.url_spotify.value && !this.form.controls.url_spotify.value.includes('spotify')) {
        this.artistAddedError = 'Invalid Spotify Url';
        return;
      }
      if(this.form.controls.url_soundcloud.value && !this.form.controls.url_soundcloud.value.includes('soundcloud')) {
        this.artistAddedError = 'Invalid Soundcloud Url';
        return;
      }
      if(this.artist) {
        this.artistEditConfirmed.emit(this.form.value);
      }
      else {
        this.artistAddedConfirmed.emit(this.form.value);
      }
      
    }

  }

  getSoundCloudInfo(url){
    const regexp = /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/;
    return url.match(regexp) && url.match(regexp)[2]
  }

  showCropModal() {
    const modalRef = this.bsModalService.show(ArtistCropComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        dest_dimensions: { newX: 1400, newY: 1400 }
      }
    });

    modalRef.content.imageCropped
      .pipe(takeUntil(modalRef.onHidden))
      .subscribe((data) => {
        modalRef.hide();
        this.form.patchValue({
          avatar: data
        });
    
        this.form.get('avatar').updateValueAndValidity()
        var reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onloadend = () => {
          this.filePath = reader.result as string;
        }
      })
  }

  imagePreview(e) {
    this.imageError = null;
    const files = (e.target as HTMLInputElement).files;
    if (files && files[0]) {

      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const img_height = rs.currentTarget['height'];
          const img_width = rs.currentTarget['width'];
          if (img_height < 1400 && img_width < 1400) {
            this.imageError =
              'Minimum dimentions allowed ' +
              1400 +
              'x' +
              1400 +
              '';
          }
          else if(img_height !== img_width) {
            this.imageError = 'Aspect ratio of 1:1 is required.'
          }
           else {
            this.form.patchValue({
              avatar: file
            });
        
            this.form.get('avatar').updateValueAndValidity()
            this.filePath = reader.result as string;
            }
          }
        };
      

      reader.readAsDataURL(files[0]);
    }  }

}
