import { Component, OnInit } from '@angular/core';
import {TestService} from '../test.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Istatus} from '../../../models/istatus';
import {TokenStorageService} from '../../../service/tokenstorage.service';
import {IAccount} from '../../../models/iaccount';
import {AccountService} from '../../../service/account.service';
import {finalize} from 'rxjs/operators';
import {AngularFireStorage} from '@angular/fire/storage';

@Component({
  selector: 'app-edit-status',
  templateUrl: './edit-status.component.html',
  styleUrls: ['./edit-status.component.css']
})
export class EditStatusComponent implements OnInit {
  editFormStatus : FormGroup;
  status: Istatus;
  account: IAccount;
  selectedImage:any = null;
  isUploadImage = false;


  constructor(
    private testService: TestService,
    private fb : FormBuilder,
    private route : ActivatedRoute,
    private router : Router,
    private tokenStorageService : TokenStorageService,
    private accountService: AccountService,
    private storage: AngularFireStorage,
  ) { }
  path_id = +this.route.snapshot.paramMap.get('id');
  ngOnInit(): void {
    this.getAccount();
    this.getStatus(this.path_id);
    this.editFormStatus = this.fb.group({
      content: [''],
      images: [{
        url: ['']
      }]
    })
  }
  getAccount() {
    this.accountService.getAccount(this.tokenStorageService.getAccount()).subscribe((resp: IAccount) => {
      this.account = resp;
    })
  }
  getStatus(id: number){
    this.testService.getStatus(id).subscribe((res: Istatus) => {
      this.status = res;
      if(this.status.images == ''){
        this.status.images= [{
          url: ['']
        }]
      }
      else {
        this.isUploadImage = true;
      }
      this.editFormStatus.patchValue(this.status);
    })
  }
  saveStatus(){
    let content = this.editFormStatus.value.content;
    this.status.content = content;
  }

  updateImageStatus() {
    if(this.selectedImage !==null){
      const filePath = `avatar/${this.selectedImage.name.split('.').slice(0,-1).join('.')}_${new Date().getTime()}`;
      const fileRef = this.storage.ref(filePath);
      this.storage.upload(filePath,this.selectedImage).snapshotChanges().pipe(
        finalize(
          ()=> fileRef.getDownloadURL().subscribe(url=>{
            this.status.images.map(
              image => image.url =  url
            )
            this.testService.editStatus(this.status).subscribe(() => {
              this.router.navigate(['account/' + this.tokenStorageService.getAccount()])
            })
          })
        )
      ).subscribe();
    }
  }

  loadImgFile(even:any) {
    if(even.target.files && even.target.files[0]){
      const reader = new FileReader();
      reader.onload = (e:any) => {
        this.status.images.map(
          image => image.url =  e.target.result
        )
      }
      reader.readAsDataURL(even.target.files[0]);
      this.selectedImage = even.target.files[0];
      this.isUploadImage = true;
    }else {
      this.selectedImage = null;
    }

  }


}
