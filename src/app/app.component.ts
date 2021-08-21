import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from './http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
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
  posts: any = [];
  postsAsync: any = this.httpService.getRequest("http://jsonplaceholder.typicode.com/posts");
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

  constructor(private httpService: HttpService, private router: Router, private fb: FormBuilder){
    // this.router.events.subscribe((e) => {
    //   console.log(e);
    // });
  }
  ngOnInit(): void {
    this.getPosts();
  }

  handleEvent(event: any) {
    // this.httpService.getRequest('http://jsonplaceholder.typicode.com/todos/1')
    // .subscribe((response: any) => this.jsonValue = response);
    console.log(event);
  }

  getPosts(): any {
    this.httpService.getRequest("http://jsonplaceholder.typicode.com/posts")
    .subscribe((response: any) => {
      this.posts = response;
    });  
  }

  goToRoute(route: string = '/customer'): void {
    this.router.navigateByUrl(route).then(() => {
      console.log(this.router.url);
    });
  }

  modifyFormControl(): void {
    this.testProp.setValue('Hello World');
  }  
}
