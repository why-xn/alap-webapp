import { ChangeDetectorRef, Component, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { DataService } from './data.service';
import { UserService } from './user.service';
import {NgxWebstorageModule} from 'ngx-webstorage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'alap-frontend';
  ws: any = {};
  wsIsConnected: boolean = false;
  wsConSuccess: boolean = false;
  authToken = "";
  loggedIn = false;
  authorizationCode = ""
  user: any = {}
  users: any = []
  currentChatWindowMessages: any = []
  currentChat: any = null
  chatInput: string = ""

  userListLoaderInterval: any;

  dataService: DataService = inject(DataService);
  userService: UserService = inject(UserService);

  @ViewChild('chatMessageContainer', { read: ElementRef, static: true }) private chatMessageContainer: any;


  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParams => {
      const authCode = queryParams.get('code');
      if (authCode !== null && authCode.length > 0) {
        console.log(authCode)
        this.authorizationCode = authCode
        this.login()
      }
    });

    this.user = this.userService.get()
    if (this.user != null) {
      console.log(this.user)
      this.loggedIn = true
      this.authToken = this.user["accessToken"]
      this.initWebSocketConnection(this.authToken)
    } 
  }

  login() {
    this.dataService.post('/api/v1/auth/login', {
      'state': 'sdfsadfsdf',
      'authorizationCode': this.authorizationCode,
      'redirectUri': 'http://alap-webapp.34.170.77.158.nip.io'
    }).subscribe(
      {
        next: (res: any) => {
          console.log(res);
          this.loggedIn = true
          this.authToken = res["accessToken"]
          this.userService.save(res)
          window.location.href = '/'
        },
        error: (err) => {
          console.log(err);
          alert(err)
          this.logout()
        }
      }
    );
  }

  logout() {
    this.loggedIn = false
    this.user = null
    this.authToken = ""
    this.userService.clear()
    window.location.href = '/'
  }

  initWebSocketConnection(authToken: string) {
    console.log('init ws');

    this.ws = new WebSocket('ws://34.132.233.244:8080/ws?accessToken=' + authToken);

    this.ws.onopen = () => {
      console.log('Connected');
      this.wsConSuccess = true;
      this.wsIsConnected = true;
      this.loggedIn = true;

      this.userListLoaderInterval = setInterval(() => {
        this.loadUsers();
      }, 30000);

      this.loadUsers();
    }

    this.ws.onmessage = (msg: any) => {
      if (msg.data !== 'p') {

        const data = JSON.parse(msg.data)
        console.log('Server messsage:', data);
        console.log('Current Chat:', this.currentChat);
        if (data.chatWindow === this.currentChat.id) {
          this.currentChatWindowMessages.push(data)
        }
      }
    }

    this.ws.onclose = () => {
      console.log('Disconnected');
      this.wsIsConnected = false;
      window.clearInterval(this.userListLoaderInterval);
      if (this.wsConSuccess) {
        console.log('Reconnecting...')
        this.initWebSocketConnection(authToken);
      }
    };
  }

  openChat(toUser: any) {
    this.currentChat = {
      title: toUser.fullName
    }

    this.dataService.getSecured('/api/v1/chat-window?to=' + toUser.id, this.authToken).subscribe(
      {
        next: (res) => {
          console.log(res);
          this.currentChat = res
          this.currentChat["title"] = toUser.fullName
          this.currentChat["toUser"] = toUser
        },
        error: (err) => {
          console.log(err);
        }
      }
    );
    this.currentChatWindowMessages = []
  }

  sendMessage(msg: string) {
    const payload = {
      "to": this.currentChat.toUser.id,
      "chatWindow": this.currentChat.id,
      "msg": msg
    };

    const payloadStr = JSON.stringify(payload)

    this.ws.send(payloadStr);

    this.currentChatWindowMessages.push(payload);

    this.chatInput = '';

    this.scrollChatMessageContainerToBottom();
  }

  loadUsers() {
    this.dataService.getSecured('/api/v1/users', this.authToken).subscribe(
      {
        next: (res) => {
          console.log(res);
          this.users = res
        },
        error: (err) => {
          console.log(err);
          this.logout()
        }
      }
    );
  }

  scrollChatMessageContainerToBottom(): void {
    try {
      var that = this;
      setTimeout(() => {
        that.chatMessageContainer.nativeElement.scrollTop = that.chatMessageContainer.nativeElement.scrollHeight;
        that.cd.detectChanges();
      }, 200);
    } catch (err) {
      console.log(err);
    }
  }


}
