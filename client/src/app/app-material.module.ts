import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    declarations: [],
    imports: [
        MatSidenavModule,
        MatFormFieldModule,
        MatSelectModule,
        MatTooltipModule,
        MatDialogModule,
        MatSliderModule,
        MatButtonModule,
        MatInputModule,
        MatChipsModule,
        MatIconModule,
        MatMenuModule,
        MatInputModule,
    ],
    exports: [
        MatSidenavModule,
        MatFormFieldModule,
        MatSelectModule,
        MatTooltipModule,
        MatDialogModule,
        MatSliderModule,
        MatButtonModule,
        MatInputModule,
        MatChipsModule,
        MatIconModule,
        MatMenuModule,
        MatInputModule,
    ],
})
export class AppMaterialModule {}
