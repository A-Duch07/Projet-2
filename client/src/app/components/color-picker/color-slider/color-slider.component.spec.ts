import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ColorSliderComponent } from './color-slider.component';

// tslint:disable: no-magic-numbers

describe('ColorSliderComponent', () => {
    let component: ColorSliderComponent;
    let fixture: ComponentFixture<ColorSliderComponent>;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let ctxStub: CanvasRenderingContext2D;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorSliderComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        ctxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call draw methode on ngAfterViewInit', () => {
        const spy = spyOn(component, 'draw');
        component.ngAfterViewInit();
        expect(spy).toHaveBeenCalled();
    });

    it(' onMouseDown should set selectedHeight to correct height', () => {
        const expectedResult = 25;
        component.onMouseDown(mouseEvent);
        // tslint:disable-next-line: no-string-literal
        expect(component['selectedHeight']).toEqual(expectedResult);
    });

    it(' onMouseDown should set mouseDown property to true', () => {
        component.onMouseDown(mouseEvent);
        // tslint:disable-next-line: no-string-literal
        expect(component['mouseDown']).toEqual(true);
    });

    it(' onMouseDown should call draw method', () => {
        const spy = spyOn(component, 'draw');
        component.onMouseDown(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('onMouseDown should call emitColor method', () => {
        const spy = spyOn(component, 'emitColor');
        component.onMouseDown(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('onMouseDown should call emitColor method with x = 25 and y = 25 as parameters', () => {
        const spy = spyOn(component, 'emitColor');
        component.onMouseDown(mouseEvent);
        // tslint:disable-next-line: no-magic-numbers
        expect(spy).toHaveBeenCalledWith(25, 25);
    });

    it(' onMouseMove should set selectedHeight to correct height when mouseDown is true', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = true;
        const expectedResult = 25;
        component.onMouseMove(mouseEvent);
        // tslint:disable-next-line: no-string-literal
        expect(component['selectedHeight']).toEqual(expectedResult);
    });

    it(' onMouseMove should call draw method when mouseDown is true', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = true;
        const spy = spyOn(component, 'draw');
        component.onMouseMove(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('onMouseMove should call emitColor method when mouseDown is true', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = true;
        const spy = spyOn(component, 'emitColor');
        component.onMouseMove(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('onMouseMove should call emitColor method with x = 25 and y = 25 as parameters when mouseDown is true', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = true;
        const spy = spyOn(component, 'emitColor');
        component.onMouseMove(mouseEvent);
        expect(spy).toHaveBeenCalledWith(25, 25);
    });

    it(' onMouseMove should not set selectedHeight to correct height when mouseDown is false', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = false;
        const expectedResult = 25;
        component.onMouseMove(mouseEvent);
        // tslint:disable-next-line: no-string-literal
        expect(component['selectedHeight']).not.toEqual(expectedResult);
    });

    it(' onMouseMove should not call draw method when mouseDown is false', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = false;
        const spy = spyOn(component, 'draw');
        component.onMouseMove(mouseEvent);
        expect(spy).toHaveBeenCalledTimes(0);
    });

    it('onMouseMove should not call emitColor method when mouseDown is false', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = false;
        const spy = spyOn(component, 'emitColor');
        component.onMouseMove(mouseEvent);
        expect(spy).toHaveBeenCalledTimes(0);
    });

    it(' onMouseUp should set mouseDown property to false', () => {
        component.onMouseUp(mouseEvent);
        // tslint:disable-next-line: no-string-literal
        expect(component['mouseDown']).toEqual(false);
    });

    it(' getColorAtPosition should return the currect color for positions', () => {
        // tslint:disable-next-line: no-string-literal
        component['ctx'] = ctxStub;
        ctxStub.fillRect(0, 0, 1, 1);
        const realReturn = component.getColorAtPosition(0, 0);
        expect(realReturn).toEqual('rgba(0,0,0,1)');
    });

    it(' emitColor should call emit for the color event', () => {
        const emit = spyOn(component.color, 'emit');
        // tslint:disable-next-line: no-string-literal
        component['ctx'] = ctxStub;
        ctxStub.fillRect(0, 0, 1, 1);
        component.emitColor(0, 0);

        expect(emit).toHaveBeenCalled();
        expect(emit).toHaveBeenCalledWith('rgba(0,0,0,1)');
    });
});
