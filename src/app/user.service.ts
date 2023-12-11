import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userIdentity: any;
  private key: string = 'alap-auth-user';
  
  constructor(private $localStorage: LocalStorageService) {}

  get() {
    const user = this.$localStorage.retrieve(this.key);
    return user;
  }

  save(user: any) {
    this.$localStorage.store(this.key, user);
    this.authenticate(user);
  }

  clear() {
    this.$localStorage.clear(this.key);
    this.authenticate(null);
  }

  authenticate(identity: any) {
    this.userIdentity = identity;
  }
}
