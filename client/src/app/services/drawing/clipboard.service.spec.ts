import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ResizeAttributes } from '@app/classes/resize-attributes';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ClipboardService } from './clipboard.service';

// tslint:disable: no-string-literal
// tslint:disable: no-magic-numbers
// tslint:disable: no-any

describe('ClipboardService', () => {
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let service: ClipboardService;
    let resizeAttributes: ResizeAttributes;

    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let clipboardCtxStub: CanvasRenderingContext2D;
    let baseCanvasStub: HTMLCanvasElement;
    let selectionCanvasStub: HTMLCanvasElement;
    let clipboardCanvasStub: HTMLCanvasElement;

    let saveSpy: jasmine.Spy<any>;
    // let copySelectionSpy: jasmine.Spy<any>;
    // let arcSpy: jasmine.Spy<any>;
    // let fillRectSpy: jasmine.Spy<any>;
    let clearRectSpy: jasmine.Spy<any>;
    // let scaleSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'saveClipboard']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });

        service = TestBed.inject(ClipboardService);

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

        // copySelectionSpy = spyOn<any>(service, 'copySelection');
        saveSpy = spyOn<any>(service['drawingService'].selectionCtx, 'save').and.callThrough();
        // fillRectSpy = spyOn<any>(service['drawingService'].selectionCtx, 'fillRect');
        // arcSpy = spyOn<any>(service['drawingService'].selectionCtx, 'arc');
        clearRectSpy = spyOn<any>(service['drawingService'].selectionCtx, 'clearRect');
        // scaleSpy = spyOn<any>(service['drawingService'].selectionCtx, 'scale');

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

    it('copySelection should call drawing service saveClipboard', () => {
        service['drawingService'].imageSelected = true;
        service.copySelection(resizeAttributes);
        expect(drawServiceSpy.saveClipboard).toHaveBeenCalled();

        service['drawingService'].imageSelected = true;
        resizeAttributes.width = -10;
        service.copySelection(resizeAttributes);
        expect(drawServiceSpy.saveClipboard).toHaveBeenCalled();

        service['drawingService'].imageSelected = true;
        resizeAttributes.height = -10;
        service.copySelection(resizeAttributes);
        expect(drawServiceSpy.saveClipboard).toHaveBeenCalled();
    });

    it('copySelection should not call drawing service saveClipboard if imageSelected is false', () => {
        service['drawingService'].imageSelected = false;
        service.copySelection(resizeAttributes);
        expect(drawServiceSpy.saveClipboard).not.toHaveBeenCalled();
    });

    it('pasteSelection should call selectionCtx save if  the cliboard is full', () => {
        service['copyResizeAttributes'] = {
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
        service['drawingService'].clipboardFull = true;
        service.pasteSelection(resizeAttributes);
        expect(saveSpy).toHaveBeenCalled();
    });

    it('pasteSelection should not call selectionCtx save if  the cliboard is empty', () => {
        service['copyResizeAttributes'] = {
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
        service['drawingService'].clipboardFull = false;
        service.pasteSelection(resizeAttributes);
        expect(saveSpy).not.toHaveBeenCalled();
    });

    it('cutSelection should call copySelection', () => {
        service.cutSelection(resizeAttributes);
        expect(service['drawingService'].clipboardFull).toBeTrue;
    });

    it('deleteSelection should call clearRect of selectionCtx', () => {
        service.deleteSelection(resizeAttributes);
        expect(clearRectSpy).toHaveBeenCalled;
    });
});
