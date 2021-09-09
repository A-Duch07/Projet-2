// tslint:disable: no-string-literal
// Justification : On a besoin de string literals pour tester et acceder a certains attributs privees de notre component/service
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from './pencil.service';

// tslint:disable:no-any
describe('PencilService', () => {
    let service: PencilService;
    let mouseEvent1: MouseEvent;
    let mouseEvent2: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawLineSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(PencilService);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent1 = { offsetX: 25, offsetY: 25, buttons: 1 } as MouseEvent;
        mouseEvent2 = { offsetX: 25, offsetY: 25, buttons: 2 } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent1);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        // Ajout mouseEventLClick aux tests, du au changement de la methode button a buttons
        service.onMouseDown(mouseEvent1);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 2,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should do nothing if wrong mouse button', () => {
        service.mouseDown = false;
        service.onMouseUp(mouseEvent2);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseMove should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.onMouseMove(mouseEvent1);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent1);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });
});
