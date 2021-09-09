import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ResizeAttributes } from '@app/classes/resize-attributes';
import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpysave: jasmine.Spy<any>;
    let drawServiceSpyNew: jasmine.Spy<any>;
    let resizeAttributes: ResizeAttributes;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.canvas = canvasTestHelper.canvas;
        service.previewCanvas = canvasTestHelper.canvas;
        service.clipboardCanvas = canvasTestHelper.cliboardCanvas;
        service.baseCtx = service.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = service.previewCanvas.getContext('2d') as CanvasRenderingContext2D;

        let store: any = {};
        const mockLocalStorage = {
            getItem: (key: string): string => {
                return key in store ? store[key] : null;
            },
            setItem: (key: string, value: string) => {
                store[key] = '${value}';
            },
            removeItem: (key: string) => {
                delete store[key];
            },
            clear: () => {
                store = {};
            },
        };

        spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
        spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
        spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
        spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);

        drawServiceSpysave = spyOn<any>(service, 'saveDrawing').and.callThrough();
        drawServiceSpyNew = spyOn<any>(service, 'createNewDrawing').and.callThrough();
        service.clipboardCtx = service.clipboardCanvas.getContext('2d') as CanvasRenderingContext2D;

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

    it('should clear the whole canvas', () => {
        service.clearCanvas(service.baseCtx);
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });

    it('#savedImage should set savedDrawing to true', () => {
        service.saveDrawing();
        expect(service.continueDrawing).toEqual(true);
        expect(service.savedDrawing).toEqual(true);
        expect(service.newDrawing).toEqual(false);
    });

    it('#printCorrectDrawing() should print the correct drawing', () => {
        service.newDrawing = true;
        service.printCorrectDrawing();
        expect(drawServiceSpysave).toHaveBeenCalled();
        expect(drawServiceSpyNew).toHaveBeenCalled();
        service.newDrawing = false;
        service.myStorage.setItem('customDrawing', '');
        service.printCorrectDrawing();
        expect(drawServiceSpysave).toHaveBeenCalled();
        expect(service.firstDrawing).toEqual(false);
        expect(service.continueDrawing).toEqual(true);
    });

    it('#saveClipboard() should set savedDrawing for all flipped conditions', () => {
        service.saveClipboard(resizeAttributes);
        expect(service.clipboardFull).toBeTrue;

        resizeAttributes.flippedX = true;
        resizeAttributes.flippedY = true;
        service.saveClipboard(resizeAttributes);
        expect(service.clipboardFull).toBeTrue;

        resizeAttributes.flippedX = true;
        resizeAttributes.flippedY = false;
        service.saveClipboard(resizeAttributes);
        expect(service.clipboardFull).toBeTrue;

        resizeAttributes.flippedX = false;
        resizeAttributes.flippedY = true;
        service.saveClipboard(resizeAttributes);
        expect(service.clipboardFull).toBeTrue;
    });

    it('#deleteClipboard() should set clipboardFull to false', () => {
        service.deleteClipboard();
        expect(service.clipboardFull).toEqual(false);
    });
});
