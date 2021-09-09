import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ResizeAttributes } from '@app/classes/resize-attributes';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionDrawService } from './selection-draw-service';

// tslint:disable: no-string-literal
// tslint:disable: no-magic-numbers
// tslint:disable: no-any

describe('ResizeDrawService', () => {
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let service: SelectionDrawService;
    let resizeAttributes: ResizeAttributes;

    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let clipboardCtxStub: CanvasRenderingContext2D;
    let baseCanvasStub: HTMLCanvasElement;
    let selectionCanvasStub: HTMLCanvasElement;
    let clipboardCanvasStub: HTMLCanvasElement;

    let drawSelectionSpy: jasmine.Spy<any>;
    let ellipseSpy: jasmine.Spy<any>;
    let arcSpy: jasmine.Spy<any>;
    let fillRectSpy: jasmine.Spy<any>;
    let clearRectSpy: jasmine.Spy<any>;
    let scaleSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });

        service = TestBed.inject(SelectionDrawService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        selectionCtxStub = canvasTestHelper.selectionCanvas.getContext('2d') as CanvasRenderingContext2D;
        clipboardCtxStub = canvasTestHelper.cliboardCanvas.getContext('2d') as CanvasRenderingContext2D;

        baseCanvasStub = canvasTestHelper.canvas;
        selectionCanvasStub = canvasTestHelper.selectionCanvas;
        clipboardCanvasStub = canvasTestHelper.cliboardCanvas;

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].selectionCtx = selectionCtxStub;
        service['drawingService'].clipboardCtx = clipboardCtxStub;
        service['drawingService'].canvas = baseCanvasStub;
        service['drawingService'].selectionCanvas = selectionCanvasStub;
        service['drawingService'].clipboardCanvas = clipboardCanvasStub;

        drawSelectionSpy = spyOn<any>(service, 'drawSelection').and.callThrough();
        ellipseSpy = spyOn<any>(service['drawingService'].selectionCtx, 'ellipse');
        fillRectSpy = spyOn<any>(service['drawingService'].selectionCtx, 'fillRect');
        arcSpy = spyOn<any>(service['drawingService'].selectionCtx, 'arc');
        clearRectSpy = spyOn<any>(service['drawingService'].selectionCtx, 'clearRect');
        scaleSpy = spyOn<any>(service['drawingService'].selectionCtx, 'scale');

        // drawEllipseSpy = spyOn<any>(service, 'drawEllipse');
        // drawRectangleSpy = spyOn<any>(service, 'drawRectangle');

        resizeAttributes = {
            x: 0,
            y: 0,
            startingX: 0,
            startingY: 0,
            width: 0,
            height: 0,
            startingWidth: 0,
            startingHeight: 0,
            selectionType: 1,
            flippedX: false,
            flippedY: false,
            selectionPositions: [
                { x: 1, y: 1 },
                { x: 40, y: 1 },
                { x: 20, y: 20 },
            ],
        } as ResizeAttributes;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('drawSelectionCanvas should call drawSelection', () => {
        service['drawingService'].clipboardReady = true;
        service.drawSelectionCanvas(resizeAttributes);
        expect(drawSelectionSpy).toHaveBeenCalled();

        service['drawingService'].clipboardReady = false;
        service.drawSelectionCanvas(resizeAttributes);
        expect(drawSelectionSpy).toHaveBeenCalled();
    });

    it('drawSelectionCanvas should call ellipse function of selectionCtx if selectionType is 2', () => {
        service['drawingService'].clipboardReady = true;
        resizeAttributes.selectionType = 2;
        service.drawSelectionCanvas(resizeAttributes);
        expect(ellipseSpy).toHaveBeenCalled();

        service['drawingService'].clipboardReady = false;
        resizeAttributes.selectionType = 2;
        service.drawSelectionCanvas(resizeAttributes);
        expect(ellipseSpy).toHaveBeenCalled();
    });

    it('drawSelectionCanvas should call drawSelection function of selectionCtx if selectionType is 3', () => {
        service['drawingService'].clipboardReady = true;
        resizeAttributes.selectionType = 3;
        service.drawSelectionCanvas(resizeAttributes);
        expect(drawSelectionSpy).toHaveBeenCalled();

        service['drawingService'].clipboardReady = false;
        resizeAttributes.selectionType = 3;
        service.drawSelectionCanvas(resizeAttributes);
        expect(drawSelectionSpy).toHaveBeenCalled();
    });

    it('drawControl should call arc function of selectionCtx', () => {
        service['drawControl'](resizeAttributes.x, resizeAttributes.y);
        expect(arcSpy).toHaveBeenCalled();
    });

    it('drawEllipse should call ellipse function of selectionCtx', () => {
        service['drawEllipse'](selectionCtxStub, resizeAttributes);
        expect(ellipseSpy).toHaveBeenCalled();
    });

    it('drawRectangle should call fillRect function of selectionCtx', () => {
        service['drawRectangle'](selectionCtxStub, resizeAttributes);
        expect(fillRectSpy).toHaveBeenCalled();
    });

    it('drawBaseCanvas should call clearRect function of selectionCtx', () => {
        service['drawBaseCanvas'](resizeAttributes);
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it('drawSelectionCanvas should call selectionCtx scale with the right values for the rectangle selection', () => {
        resizeAttributes.flippedX = true;
        resizeAttributes.flippedY = true;
        service.drawSelectionCanvas(resizeAttributes);
        expect(scaleSpy).toHaveBeenCalledWith(-1, -1);

        resizeAttributes.flippedX = true;
        resizeAttributes.flippedY = false;
        service.drawSelectionCanvas(resizeAttributes);
        expect(scaleSpy).toHaveBeenCalledWith(-1, 1);

        resizeAttributes.flippedX = false;
        resizeAttributes.flippedY = true;
        service.drawSelectionCanvas(resizeAttributes);
        expect(scaleSpy).toHaveBeenCalledWith(1, -1);
    });

    it('drawSelectionCanvas should call selectionCtx scale with the right values for the ellipse selection', () => {
        resizeAttributes.selectionType = 2;
        resizeAttributes.flippedX = true;
        resizeAttributes.flippedY = true;
        service.drawSelectionCanvas(resizeAttributes);
        expect(scaleSpy).toHaveBeenCalledWith(-1, -1);

        resizeAttributes.selectionType = 2;
        resizeAttributes.flippedX = true;
        resizeAttributes.flippedY = false;
        service.drawSelectionCanvas(resizeAttributes);
        expect(scaleSpy).toHaveBeenCalledWith(-1, 1);

        resizeAttributes.selectionType = 2;
        resizeAttributes.flippedX = false;
        resizeAttributes.flippedY = true;
        service.drawSelectionCanvas(resizeAttributes);
        expect(scaleSpy).toHaveBeenCalledWith(1, -1);
    });

    it('drawSelectionCanvas should call selectionCtx scale with the right values for the lasso selection', () => {
        resizeAttributes.selectionType = 3;
        resizeAttributes.flippedX = true;
        resizeAttributes.flippedY = true;
        service.drawSelectionCanvas(resizeAttributes);
        expect(scaleSpy).toHaveBeenCalledWith(-1, -1);

        resizeAttributes.selectionType = 3;
        resizeAttributes.flippedX = true;
        resizeAttributes.flippedY = false;
        service.drawSelectionCanvas(resizeAttributes);
        expect(scaleSpy).toHaveBeenCalledWith(-1, 1);

        resizeAttributes.selectionType = 3;
        resizeAttributes.flippedX = false;
        resizeAttributes.flippedY = true;
        service.drawSelectionCanvas(resizeAttributes);
        expect(scaleSpy).toHaveBeenCalledWith(1, -1);
    });
});
