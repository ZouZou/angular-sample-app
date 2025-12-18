import { Component, input, output, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  standalone: true,
  imports: [
    CommonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit {
  user = input<UserInterface>({} as UserInterface);
  userEvent = output<UserInterface>();
  isColored: boolean;

  constructor() {
    this.isColored = this.user().isColored ? true : false;
  }

  ngOnInit(): void {
    this.isColored = this.user().isColored ? true : false;
  }

  sendUserEvent(): void {
    this.userEvent.emit(this.user());
  }
}
