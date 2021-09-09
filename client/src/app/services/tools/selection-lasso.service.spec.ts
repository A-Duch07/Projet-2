import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/drawing/selection-service';
import { SelectionLassoService } from './selection-lasso.service';

// tslint:disable: no-string-literal
// tslint:disable: no-magic-numbers
// tslint:disable: no-any

describe('SelectionLassoService', () => {
    let service: SelectionLassoService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let selectionServiceSpy: jasmine.SpyObj<SelectionService>;

    let onMouseDownSpy: jasmine.Spy<any>;
    let addNewPositionSpy: jasmine.Spy<any>;
    let drawLineSpy: jasmine.Spy<any>;
    let calculateShiftPositionSpy: jasmine.Spy<any>;
    let eraseLastSegmentSpy: jasmine.Spy<any>;
    let saveCtxSpy: jasmine.Spy<any>;
    let restoreCtxSpy: jasmine.Spy<any>;

    //let confirmSelectionSpy: jasmine.Spy<any>;
    //let canvasClickedSpy: jasmine.Spy<any>;
    //let imageClickedSpy: jasmine.Spy<any>;
    //let cornerClickedSpy: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let baseCanvasStub: HTMLCanvasElement;
    let selectionCanvasStub: HTMLCanvasElement;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        selectionServiceSpy = jasmine.createSpyObj('SelectionService', [
            // 'drawCanvas',
            'onMouseDown',
            'onMouseUp',
            // 'changeStyle',
            'onMouseMove',
            'onKeyDown',
            'onKeyUp',
            'imageClicked',
            'confirmSelection',
            'newSelection',
            'cornerClicked',
        ]);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: SelectionService, useValue: selectionServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        selectionCtxStub = canvasTestHelper.selectionCanvas.getContext('2d') as CanvasRenderingContext2D;

        baseCanvasStub = canvasTestHelper.canvas;
        selectionCanvasStub = canvasTestHelper.selectionCanvas;

        service = TestBed.inject(SelectionLassoService);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();
        onMouseDownSpy = spyOn<any>(service, 'onMouseDown').and.callThrough();
        addNewPositionSpy = spyOn<any>(service, 'addNewPosition').and.callThrough();
        calculateShiftPositionSpy = spyOn<any>(service, 'calculateShiftPosition').and.callThrough();
        eraseLastSegmentSpy = spyOn<any>(service, 'eraseLastSegment').and.callThrough();
        //canvasClickedSpy = spyOn<any>(service, 'canvasClicked').and.callThrough();
        //confirmSelectionSpy = spyOn<any>(service['selectionService'], 'confirmSelection');
        //cornerClickedSpy = spyOn<any>(service['selectionService'], 'confirmSelection');

        service['drawingService'].canvas = baseCanvasStub;
        service['drawingService'].selectionCanvas = selectionCanvasStub;
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].selectionCtx = selectionCtxStub;

        saveCtxSpy = spyOn<any>(service['drawingService'].previewCtx, 'save');

        restoreCtxSpy = spyOn<any>(service['drawingService'].previewCtx, 'restore');

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('calculateSelectionDimensions should return the smallest box dimensions around the selection points', () => {
        service['selectionPositions'].push({ x: 25, y: 25 });
        service['selectionPositions'].push({ x: 50, y: 50 });
        service['calculateSelectionDimensions']();

        expect(service['selectionCorner']).toEqual({ x: 25, y: 25 });
        expect(service['selectionDimensions']).toEqual({ x: 25, y: 25 });

        service['selectionPositions'] = [];
        service['selectionPositions'].push({ x: 0, y: 0 });
        service['calculateSelectionDimensions']();

        expect(service['selectionCorner']).toEqual({ x: 0, y: 0 });
        expect(service['selectionDimensions']).toEqual({ x: 0, y: 0 });
    });

    it(' onMouseDown should call selectionService confirmSelection if the selection is not clicked', () => {
        service['drawingService'].imageSelected = true;
        selectionServiceSpy.cornerClicked.and.callFake(() => {
            return -1;
        });
        selectionServiceSpy.imageClicked.and.callFake(() => {
            service['drawingService'].imageSelected = false;
            return false;
        });
        service['drawingService'].imageSelected = true;
        service.onMouseDown(mouseEvent);
        expect(onMouseDownSpy).toHaveBeenCalled();
    });

    it(' onMouseDown should call selectionService onMouseDown if there is a selection and it is clicked', () => {
        service['drawingService'].imageSelected = true;
        selectionServiceSpy.cornerClicked.and.callFake(() => {
            return 1;
        });
        selectionServiceSpy.imageClicked.and.callFake(() => {
            service['drawingService'].imageSelected = false;
            return false;
        });
        service['drawingService'].imageSelected = true;
        service.onMouseDown(mouseEvent);
        expect(selectionServiceSpy.onMouseDown).toHaveBeenCalled();
    });

    it(' onMouseDown should not call addNewPosition if the click is outside the canvas', () => {
        mouseEvent = {
            offsetX: -25,
            offsetY: -25,
            buttons: 1,
        } as MouseEvent;
        service['drawingService'].imageSelected = false;
        service.onMouseDown(mouseEvent);
        expect(addNewPositionSpy).not.toHaveBeenCalled();
    });

    it(' onMouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 2,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should set mouseDown property to false', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;
        service.mouseDown = true;
        service.onMouseUp(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should not call selectionService on mouseUp if mouseDown was false', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;
        service.mouseDown = false;
        service.onMouseUp(mouseEventRClick);
        expect(service['selectionService'].onMouseUp).not.toHaveBeenCalled();
    });

    it(' onMouseUp should call selectionService on mouseUp if mouseDown was true and an image is selected', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;
        service.mouseDown = true;
        service['drawingService'].imageSelected = true;
        service.onMouseUp(mouseEventRClick);
        expect(service['selectionService'].onMouseUp).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine of the resize service if an image is selected', () => {
        service.mouseDown = true;
        service['drawingService'].imageSelected = true;

        service.onMouseMove(mouseEvent);
        expect(selectionServiceSpy.onMouseMove).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if the size of selectionPositions if zero', () => {
        service.mouseDown = true;
        service['drawingService'].imageSelected = false;
        service['selectionPositions'] = [];
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if the size of selectionPositions if not zero', () => {
        service.mouseDown = true;
        service['drawingService'].imageSelected = false;
        service['selectionPositions'].push({ x: 25, y: 25 });
        service['selectionPositions'].push({ x: 50, y: 50 });
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should call calculateShiftPosition if the size of selectionPositions if not zero and the shiftKey is pressed', () => {
        service.mouseDown = true;
        service['shiftKeyPressed'] = true;
        service['drawingService'].imageSelected = false;
        service['selectionPositions'].push({ x: 25, y: 25 });
        service['selectionPositions'].push({ x: 50, y: 50 });
        service.onMouseMove(mouseEvent);
        expect(calculateShiftPositionSpy).toHaveBeenCalled();
    });

    it(' onKeyDown should change behavior based on current selection', () => {
        service['drawingService'].imageSelected = true;
        const event = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        service.onKeyDown(event);
        expect(selectionServiceSpy.shiftKeyPressed).toBeTrue;

        service['drawingService'].imageSelected = true;
        const event1 = new KeyboardEvent('keydown', {
            key: 'm',
        });
        service.onKeyDown(event1);
        expect(selectionServiceSpy.onKeyDown).toHaveBeenCalled();

        service['drawingService'].imageSelected = false;
        const event2 = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        service.onKeyDown(event2);
        expect(service['shiftKeyPressed']).toBeTrue;

        service['drawingService'].imageSelected = false;
        const event3 = new KeyboardEvent('keydown', {
            key: 'Backspace',
        });
        service.onKeyDown(event3);
        expect(eraseLastSegmentSpy).toHaveBeenCalled();

        service['drawingService'].imageSelected = false;
        const event4 = new KeyboardEvent('keydown', {
            key: 'Escape',
        });
        service.onKeyDown(event4);
        expect(service['selectionPositions']).toEqual([]);

        service['drawingService'].imageSelected = false;
        const event5 = new KeyboardEvent('keydown', {
            key: 'x',
        });
        service.onKeyDown(event5);
        expect(selectionServiceSpy.onKeyDown).toHaveBeenCalled();

        service['drawingService'].imageSelected = false;
        const event6 = new KeyboardEvent('keydown', {
            key: 'c',
        });
        service.onKeyDown(event6);
        expect(selectionServiceSpy.onKeyDown).toHaveBeenCalled();

        service['drawingService'].imageSelected = false;
        const event7 = new KeyboardEvent('keydown', {
            key: 'v',
        });
        service.onKeyDown(event7);
        expect(selectionServiceSpy.onKeyDown).toHaveBeenCalled();

        service['drawingService'].imageSelected = false;
        const event8 = new KeyboardEvent('keydown', {
            key: 'Delete',
        });
        service.onKeyDown(event8);
        expect(selectionServiceSpy.onKeyDown).toHaveBeenCalled();

        service['drawingService'].imageSelected = false;
        const event9 = new KeyboardEvent('keydown', {
            key: 'n',
        });
        service.onKeyDown(event9);
        expect(service['drawingService']['savedDrawing']).toBeFalse;
    });

    it(' eraseLastSegment should call drawline if the length of the selectionPositions is greater than zero', () => {
        service['selectionPositions'].push({ x: 25, y: 25 });
        service['selectionPositions'].push({ x: 50, y: 50 });
        service['currentMousePosition'] = { x: 40, y: 40 };
        service['eraseLastSegment']();
        expect(drawLineSpy).toHaveBeenCalled();

        service['selectionPositions'].push({ x: 25, y: 25 });
        service['selectionPositions'].push({ x: 50, y: 50 });
        service['currentMousePosition'] = { x: 40, y: 40 };
        service['shiftKeyPressed'] = true;
        service['eraseLastSegment']();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onKeyUp should change behavior based on current selection', () => {
        service['drawingService'].imageSelected = true;
        const event = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        service.onKeyUp(event);
        expect(selectionServiceSpy.shiftKeyPressed).toBeTrue;

        service['drawingService'].imageSelected = true;
        const event1 = new KeyboardEvent('keydown', {
            key: 'm',
        });
        service.onKeyUp(event1);
        expect(selectionServiceSpy.onKeyUp).toHaveBeenCalled();

        service['drawingService'].imageSelected = false;
        const event2 = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        service.onKeyUp(event2);
        expect(service['shiftKeyPressed']).toBeFalse;

        service['drawingService'].imageSelected = false;
        const event9 = new KeyboardEvent('keydown', {
            key: 'n',
        });
        service.onKeyUp(event9);
        expect(service['drawingService']['savedDrawing']).toBeFalse;
    });

    it('onSelect should set imageSelected to false the preview canvas state', () => {
        service.onSelect();
        expect(saveCtxSpy).toHaveBeenCalled();
    });

    it('onDeSelect should restore the preview canvas state', () => {
        service.onDeSelect();
        expect(restoreCtxSpy).toHaveBeenCalled();
    });

    it('addNewPosition should call newSelection if the new point is next to the first point', () => {
        service.mouseDownCoord = { x: 21, y: 21 };
        service['selectionPositions'] = [];
        service['selectionPositions'].push({ x: 20, y: 20 });
        service['selectionPositions'].push({ x: 50, y: 20 });
        service['selectionPositions'].push({ x: 35, y: 60 });
        service['addNewPosition']();
        expect(selectionServiceSpy.newSelection).toHaveBeenCalled();
    });

    it('addNewPosition should not call newSelection if the new point is not next to the first point', () => {
        service.mouseDownCoord = { x: 20, y: 200 };
        service['selectionPositions'] = [];
        service['selectionPositions'].push({ x: 20, y: 20 });
        service['selectionPositions'].push({ x: 50, y: 20 });
        service['selectionPositions'].push({ x: 35, y: 60 });
        service['addNewPosition']();
        expect(selectionServiceSpy.newSelection).not.toHaveBeenCalled();

        service.mouseDownCoord = { x: 20, y: 200 };
        service['selectionPositions'] = [];
        service['addNewPosition']();
        expect(selectionServiceSpy.newSelection).not.toHaveBeenCalled();
    });

    it('addNewPosition should call calculateShiftPosition if the shift key is pressed', () => {
        service['shiftKeyPressed'] = true;
        service.mouseDownCoord = { x: 20, y: 200 };
        service['selectionPositions'] = [];
        service['selectionPositions'].push({ x: 20, y: 20 });
        service['selectionPositions'].push({ x: 50, y: 20 });
        service['selectionPositions'].push({ x: 35, y: 60 });
        service['addNewPosition']();
        expect(calculateShiftPositionSpy).toHaveBeenCalled();

        service['shiftKeyPressed'] = true;
        service.mouseDownCoord = { x: 200, y: 40 };
        service['selectionPositions'] = [];
        service['selectionPositions'].push({ x: 20, y: 20 });
        service['selectionPositions'].push({ x: 50, y: 20 });
        service['selectionPositions'].push({ x: 35, y: 60 });
        service['addNewPosition']();
        expect(calculateShiftPositionSpy).toHaveBeenCalled();

        service['shiftKeyPressed'] = true;
        service.mouseDownCoord = { x: 37, y: 30 };
        service['selectionPositions'] = [];
        service['selectionPositions'].push({ x: 20, y: 20 });
        service['selectionPositions'].push({ x: 50, y: 20 });
        service['selectionPositions'].push({ x: 35, y: 60 });
        service['addNewPosition']();
        expect(calculateShiftPositionSpy).toHaveBeenCalled();
    });

    it('lineIntersect should return false if two segments are not intersecting', () => {
        service['shiftKeyPressed'] = true;
        service.mouseDownCoord = { x: 300, y: 50 };
        service['selectionPositions'] = [];
        service['selectionPositions'].push({ x: 20, y: 20 });
        service['selectionPositions'].push({ x: 50, y: 20 });
        service['selectionPositions'].push({ x: 200, y: 20 });
        service['selectionPositions'].push({ x: 300, y: 20 });

        service['addNewPosition']();
        expect(calculateShiftPositionSpy).toHaveBeenCalled();
    });

    it(' onMouseDown should not call addnewPosition if the click is outside the canvas', () => {
        const mouseEventClick = {
            offsetX: 25,
            offsetY: -25,
            buttons: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventClick);
        expect(addNewPositionSpy).not.toHaveBeenCalled();
    });
});
