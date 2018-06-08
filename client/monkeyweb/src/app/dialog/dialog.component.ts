import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Dialog } from '../types/component';

@Component({
    selector: 'app-dialog-template',
    templateUrl: './dialogTemplate.html'
})
export class DialogTemplateComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: Dialog) { }
}
