import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { LoggerService } from './shared/services/logger.service';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  standalone: false
})
export class AppComponent implements OnInit{
  title = 'Hello World How are you?';
  jsonValue = {
    a : 'hello',
    b : 'world'
  };
  newDate = new Date();
  userObject = {
    name: 'John',
    age: '32',
    id: 0,
    isColored: true
  };
  showUser: boolean = true;
  posts: Post[] = [];
  postsAsync: Observable<Post[]> = this.httpService.getRequest<Post[]>("http://jsonplaceholder.typicode.com/posts");
  testProp = new FormControl('');
  profileForm = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    lastName: new FormControl('')
  });
  get firstName() { return this.profileForm.get('firstName'); }
  profileBuilder = this.fb.group({
    firstName: [''],
    lastName: ['']
  });

  constructor(
    private httpService: HttpService,
    private router: Router,
    private fb: FormBuilder,
    private logger: LoggerService
  ) {
    // this.router.events.subscribe((e) => {
    //   this.logger.debug('Router event', e);
    // });
  }
  ngOnInit(): void {
    this.getPosts();
  }

  handleEvent(event: Event): void {
    // this.httpService.getRequest('http://jsonplaceholder.typicode.com/todos/1')
    // .subscribe((response: any) => this.jsonValue = response);
    this.logger.debug('Event handled', event);
  }

  getPosts(): void {
    this.httpService.getRequest<Post[]>("http://jsonplaceholder.typicode.com/posts")
    .subscribe((response: Post[]) => {
      this.posts = response;
    });
  }

  goToRoute(route: string = '/customer'): void {
    this.router.navigateByUrl(route).then(() => {
      this.logger.debug('Navigated to route', this.router.url);
    });
  }

  modifyFormControl(): void {
    this.testProp.setValue('Hello World');
  }  
}
