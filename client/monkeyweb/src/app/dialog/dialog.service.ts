import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogTemplateComponent } from './dialog.component';
import { DialogAction } from '../types/component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  openDialog(title: string, content: string, action: DialogAction[], width: string) {
    this.dialog.open(DialogTemplateComponent, {
      width: width,
      data: {
        title: title,
        content: content,
        action: action
      }
    });
  }
}
