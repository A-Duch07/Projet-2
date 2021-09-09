import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { EditorComponent } from './editor.component';

describe('EditorComponent', () => {
    let fixture: ComponentFixture<EditorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditorComponent, DrawingComponent, SidebarComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorComponent);
        fixture.detectChanges();
    });
});
