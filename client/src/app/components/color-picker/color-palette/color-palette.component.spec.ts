import { SimpleChange, SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { ColorPaletteComponent } from './color-palette.component';

describe('ColorPaletteComponent', () => {
    let component: ColorPaletteComponent;
    let fixture: ComponentFixture<ColorPaletteComponent>;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let ctxStub: CanvasRenderingContext2D;
    // tslint:disable-next-line: no-any
    let drawSpy: jasmine.Spy<any>;
    // tslint:disable-next-line: no-any
    let emitColorSpy: jasmine.Spy<any>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPaletteComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPaletteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        drawSpy = spyOn(component, 'draw');
        emitColorSpy = spyOn(component, 'emitColor');
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

    it('should call draw method on ngAfterViewInit', () => {
        component.ngAfterViewInit();
        expect(drawSpy).toHaveBeenCalled();
    });

    it(' should not call draw or emitColor methods on ngChanges if hue has not been changed', () => {
        component.ngOnChanges({});
        expect(drawSpy).toHaveBeenCalledTimes(0);
        expect(emitColorSpy).toHaveBeenCalledTimes(0);
    });

    it(' should call not call draw method on ngChanges of hue if it is the first change', () => {
        const changes: SimpleChanges = { hue: new SimpleChange('', 'rgba(0,0,0,1)', true) };
        component.ngOnChanges(changes);
        expect(drawSpy).toHaveBeenCalledTimes(0);
        expect(emitColorSpy).toHaveBeenCalledTimes(0);
    });

    it(' should call draw method on ngChanges of hue if it is not the first change, but not emitColor', () => {
        const changes: SimpleChanges = { hue: new SimpleChange('', 'rgba(0,0,0,1)', false) };
        component.ngOnChanges(changes);
        expect(drawSpy).toHaveBeenCalled();
        expect(emitColorSpy).toHaveBeenCalledTimes(0);
    });

    it(' should call draw and emitColor methods on ngChanges of hue if it is not the first change and selectedPosition is set', () => {
        const changes: SimpleChanges = { hue: new SimpleChange('', 'rgba(0,0,0,1)', false) };
        component.selectedPosition = { x: 25, y: 25 };
        component.ngOnChanges(changes);
        expect(drawSpy).toHaveBeenCalled();
        expect(emitColorSpy).toHaveBeenCalled();
    });

    it(' onMouseDown should set selectedPosition to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        component.onMouseDown(mouseEvent);
        expect(component.selectedPosition).toEqual(expectedResult);
    });

    it(' onMouseDown should set mouseDown property to true', () => {
        component.onMouseDown(mouseEvent);
        // tslint:disable-next-line: no-string-literal
        expect(component['mouseDown']).toEqual(true);
    });

    it(' onMouseDown should call draw method', () => {
        component.onMouseDown(mouseEvent);
        expect(drawSpy).toHaveBeenCalled();
    });

    it('onMouseDown should call emitColor method', () => {
        component.onMouseDown(mouseEvent);
        expect(emitColorSpy).toHaveBeenCalled();
    });

    it('onMouseDown should call emitColor method with x = 25 and y = 25 as parameters', () => {
        component.onMouseDown(mouseEvent);
        // tslint:disable-next-line: no-magic-numbers
        expect(emitColorSpy).toHaveBeenCalledWith(25, 25);
    });

    it(' onMouseMove should set selectedPosition to correct position when mouseDown is true', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = true;
        const expectedResult: Vec2 = { x: 25, y: 25 };
        component.onMouseMove(mouseEvent);
        expect(component.selectedPosition).toEqual(expectedResult);
    });

    it(' onMouseMove should call draw method when mouseDown is true', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = true;
        component.onMouseMove(mouseEvent);
        expect(drawSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call emitColor method when mouseDown is true', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = true;
        component.onMouseMove(mouseEvent);
        expect(emitColorSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call emitColor method with x = 25 and y = 25 as parameters when mouseDown is true', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = true;
        component.onMouseMove(mouseEvent);
        // tslint:disable-next-line: no-magic-numbers
        expect(emitColorSpy).toHaveBeenCalledWith(25, 25);
    });

    it(' onMouseMove should not set selectedPosition to correct position when mouseDown is false', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = false;
        const expectedResult: Vec2 = { x: 25, y: 25 };
        component.onMouseMove(mouseEvent);
        expect(component.selectedPosition).not.toEqual(expectedResult);
    });

    it(' onMouseMove should not call draw method when mouseDown is false', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = false;
        component.onMouseMove(mouseEvent);
        expect(drawSpy).toHaveBeenCalledTimes(0);
    });

    it('onMouseMove should not call emitColor method when mouseDown is false', () => {
        // tslint:disable-next-line: no-string-literal
        component['mouseDown'] = false;
        component.onMouseMove(mouseEvent);
        expect(emitColorSpy).toHaveBeenCalledTimes(0);
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
});
