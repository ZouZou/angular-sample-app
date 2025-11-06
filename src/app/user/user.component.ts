import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

interface UserInterface {
  name: string;
  age: string;
  id: number;
  isColored: boolean;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.sass'],
  standalone: false
})
export class UserComponent implements OnInit {

  @Input() user: UserInterface;
  @Output() userEvent = new EventEmitter<UserInterface>();
  isColored: boolean;

  constructor() { 
    this.user = {} as UserInterface;
    this.isColored = this.user.isColored ? true : false;
  }

  ngOnInit(): void {
    this.isColored = this.user.isColored ? true : false;
  }

  sendUserEvent(): void {
    this.userEvent.emit(this.user);
  }
}
