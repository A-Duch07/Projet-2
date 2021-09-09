import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { of } from 'rxjs';
import { MainPageComponent } from './main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    // tslint:disable-next-line: no-any
    let drawServiceSpy: jasmine.Spy<any>;
    let service: DrawingService;
    // tslint:disable-next-line: no-any
    let dialogSpy: jasmine.Spy<any>;
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
    dialogRefSpyObj.componentInstance = { body: 'component' };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [MainPageComponent],
            providers: [MainPageComponent],
        }).compileComponents();

        service = TestBed.inject(DrawingService);
        // tslint:disable-next-line: no-any
        drawServiceSpy = spyOn<any>(service, 'convertB64ToImage').and.callThrough();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'LOG2990'", () => {
        expect(component.title).toEqual('LOG2990');
    });
    it('#openDialog should open the dialog', () => {
        component.openDialog();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('#newDrawing() should assigned to correct values in drawingService', () => {
        component.newDrawing();
        expect(service.savedDrawing).toEqual(false);
        expect(service.newDrawing).toEqual(true);
    });

    it('#ngOnInit() should check if theres a savedDrawing and convert it into the Drawing Service', () => {
        service.myStorage.setItem('customDrawing', 'hello');
        component.ngOnInit();
        expect(service.continueDrawing).toEqual(true);
        expect(drawServiceSpy).toHaveBeenCalled();
    });
});
