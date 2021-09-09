import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SidebarComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);

        fixture.detectChanges();
    });
});
