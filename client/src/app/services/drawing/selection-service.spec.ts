import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ResizeAttributes } from '@app/classes/resize-attributes';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/magnetism/magnetism.service';
// import { MagnetismService } from '@app/services/magnetism/magnetism.service';
import { ClipboardService } from './clipboard.service';
import * as resizeConstants from './resize-constants';
import { SelectionDrawService } from './selection-draw-service';
import { SelectionService } from './selection-service';

// tslint:disable: no-string-literal no-any no-magic-numbers max-file-line-count

describe('SelectionService', () => {
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let resizeDrawServiceSpy: jasmine.SpyObj<SelectionDrawService>;
    let clipboardServiceSpy: jasmine.SpyObj<ClipboardService>;
    let magnetismServiceSpy: jasmine.SpyObj<MagnetismService>;
    let service: SelectionService;
    let resizeAttributes: ResizeAttributes;
    let mouseEventLeft: MouseEvent;
    let mouseEventRight: MouseEvent;

    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let baseCanvasStub: HTMLCanvasElement;
    let selectionCanvasStub: HTMLCanvasElement;

    let checkCanvasLimitsSpy: jasmine.Spy<any>;
    let imageClickedSpy: jasmine.Spy<any>;
    let moveArrowsSpy: jasmine.Spy<any>;
    let isPointInPathSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        clipboardServiceSpy = jasmine.createSpyObj('ClipboardService', ['copySelection', 'pasteSelection', 'cutSelection', 'deleteSelection']);
        resizeDrawServiceSpy = jasmine.createSpyObj('ResizeDrawService', ['drawSelectionCanvas', 'drawSelection', 'drawBaseCanvas']);
        magnetismServiceSpy = jasmine.createSpyObj('MagnetismService', [
            'identifyResizeCorner',
            'identifyTopLeftPosition',
            'identifyAllPositions',
            'calculateNewPosition',
            'moveBox',
        ]);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: SelectionDrawService, useValue: resizeDrawServiceSpy },
                { provide: ClipboardService, useValue: clipboardServiceSpy },
                { provide: MagnetismService, useValue: magnetismServiceSpy },
            ],
        });

        service = TestBed.inject(SelectionService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        selectionCtxStub = canvasTestHelper.selectionCanvas.getContext('2d') as CanvasRenderingContext2D;

        baseCanvasStub = canvasTestHelper.canvas;
        selectionCanvasStub = canvasTestHelper.selectionCanvas;

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].selectionCtx = selectionCtxStub;
        service['drawingService'].canvas = baseCanvasStub;
        service['drawingService'].selectionCanvas = selectionCanvasStub;

        service['magnetismService'].positions = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];

        checkCanvasLimitsSpy = spyOn<any>(service, 'checkCanvasLimits').and.callThrough();
        imageClickedSpy = spyOn<any>(service, 'imageClicked').and.callThrough();
        moveArrowsSpy = spyOn<any>(service, 'moveArrows').and.callThrough();
        isPointInPathSpy = spyOn<any>(service['drawingService'].selectionCtx, 'isPointInPath').and.callThrough();

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
            selectionPositions: [{ x: 0, y: 0 }],
        } as ResizeAttributes;

        service['resizeAttributes'] = resizeAttributes;
        service['clipboardService']['copyResizeAttributes'] = resizeAttributes;
        mouseEventLeft = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;

        mouseEventRight = {
            offsetX: 25,
            offsetY: 25,
            buttons: 2,
        } as MouseEvent;
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('imageClicked should call isPointInPath function from selectionCtx', () => {
        const testVec = { x: 0, y: 0 } as Vec2;
        service.imageClicked(testVec);
        expect(isPointInPathSpy).toHaveBeenCalledTimes(1);
    });

    it('onMouseDown should change mouseDownCoord if the mouse event is a left click and should call cornerClicked with mouseDownCoord', () => {
        const cornerClickedSpy: jasmine.Spy<any> = spyOn<any>(service, 'cornerClicked');
        service.onMouseDown(mouseEventLeft);
        expect(service['mouseDownCoord']).toEqual({ x: 25, y: 25 });
        expect(cornerClickedSpy).toHaveBeenCalledTimes(1);
    });

    // tslint:disable-next-line: max-line-length
    it('onMouseDown not should change mouseDownCoord if the mouse event is a right click and should not call cornerClicked with mouseDownCoord', () => {
        const cornerClickedSpy: jasmine.Spy<any> = spyOn<any>(service, 'cornerClicked');
        service['mouseDownCoord'] = { x: 0, y: 0 };
        service.onMouseDown(mouseEventRight);
        expect(service['mouseDownCoord']).toEqual({ x: 0, y: 0 });
        expect(cornerClickedSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should set mouseDown to false', () => {
        service.onMouseUp(mouseEventLeft);
        expect(service['mouseDown']).toBeFalse();
    });

    it('cornerClicked should return -1 when the position does not correspond to any corner', () => {
        service['resizeAttributes'].width = 100;
        service['resizeAttributes'].height = 100;
        const result: number = service.cornerClicked({ x: 5, y: 5 });
        expect(result).toEqual(-1);
    });

    it('cornerClicked should return 0 on top left click', () => {
        service['resizeAttributes'].width = 100;
        service['resizeAttributes'].height = 100;
        const result: number = service.cornerClicked({ x: 0, y: 0 });
        expect(result).toEqual(0);
    });

    it('cornerClicked should return 1 on top middle click', () => {
        service['resizeAttributes'].width = 100;
        service['resizeAttributes'].height = 100;
        const result: number = service.cornerClicked({ x: 50, y: 0 });
        expect(result).toEqual(1);
    });

    it('cornerClicked should return 2 on top right click', () => {
        service['resizeAttributes'].width = 100;
        service['resizeAttributes'].height = 100;
        const result: number = service.cornerClicked({ x: 100, y: 0 });
        expect(result).toEqual(2);
    });

    it('cornerClicked should return 3 on left middle click', () => {
        service['resizeAttributes'].width = 100;
        service['resizeAttributes'].height = 100;
        const result: number = service.cornerClicked({ x: 0, y: 50 });
        expect(result).toEqual(3);
    });

    it('cornerClicked should return 4 on right middle click', () => {
        service['resizeAttributes'].width = 100;
        service['resizeAttributes'].height = 100;
        const result: number = service.cornerClicked({ x: 100, y: 50 });
        expect(result).toEqual(4);
    });

    it('cornerClicked should return 5 on bottom left click', () => {
        service['resizeAttributes'].width = 100;
        service['resizeAttributes'].height = 100;
        const result: number = service.cornerClicked({ x: 0, y: 100 });
        expect(result).toEqual(5);
    });

    it('cornerClicked should return 6 on bottom middle click', () => {
        service['resizeAttributes'].width = 100;
        service['resizeAttributes'].height = 100;
        const result: number = service.cornerClicked({ x: 50, y: 100 });
        expect(result).toEqual(6);
    });

    it('cornerClicked should return 7 on bottom right click', () => {
        service['resizeAttributes'].width = 100;
        service['resizeAttributes'].height = 100;
        const result: number = service.cornerClicked({ x: 100, y: 100 });
        expect(result).toEqual(7);
    });

    it('onMouseMove should call imageClicked if mouseDown is true', () => {
        service['mouseDownCoord'] = { x: 0, y: 0 };
        service['mouseDown'] = true;

        service.onMouseMove(mouseEventLeft);
        expect(imageClickedSpy).toHaveBeenCalled();
    });
    it('onMouseMove should call imageClicked if mouseDown is true', () => {
        service['mouseDownCoord'] = { x: 0, y: 0 };
        service['mouseDown'] = true;

        service.onMouseMove(mouseEventLeft);
        expect(imageClickedSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call checkSelectionFlipped and drawSelectionCanvas on mouseDown true and currentResize > -1', () => {
        const checkSelectionFlippedSpy: jasmine.Spy<any> = spyOn<any>(service, 'checkSelectionFlipped');
        service['mouseDownCoord'] = { x: 0, y: 0 };

        service['mouseDown'] = true;
        service.currentResize = 1;
        service.onMouseMove(mouseEventLeft);
        expect(checkSelectionFlippedSpy).toHaveBeenCalled();
        expect(service['selectionDrawService'].drawSelectionCanvas).toHaveBeenCalled();
    });

    it('onMouseMove should call imageClicked if mouseDown is false', () => {
        service['mouseDownCoord'] = { x: 0, y: 0 };
        service['mouseDown'] = false;

        service.onMouseMove(mouseEventLeft);
        expect(imageClickedSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should call checkCanvasLimits if mouseDown is true and imageClicked returns  true', () => {
        service['mouseDownCoord'] = { x: 10, y: 10 };
        service['mouseDown'] = true;

        selectionCtxStub.beginPath();
        selectionCtxStub.moveTo(0, 0);
        selectionCtxStub.lineTo(20, 0);
        selectionCtxStub.lineTo(20, 20);
        selectionCtxStub.lineTo(0, 20);
        selectionCtxStub.closePath();
        selectionCtxStub.stroke();

        service.onMouseMove(mouseEventLeft);
        expect(checkCanvasLimitsSpy).toHaveBeenCalled();
    });

    it(
        'onMouseMove should call identifyResizeCorner, identifyTopLeftPosition, identifyAllPositions' +
            ' and calculateNewPosition of magnetismService if mouseDown is true, imageClicked returns  true, checkCanvasLimits returns true and isAnchord is true',
        () => {
            service['mouseDownCoord'] = { x: 10, y: 10 };
            service['mouseDown'] = true;
            service['magnetismService'].isAnchored = true;

            selectionCtxStub.beginPath();
            selectionCtxStub.moveTo(0, 0);
            selectionCtxStub.lineTo(20, 0);
            selectionCtxStub.lineTo(20, 20);
            selectionCtxStub.lineTo(0, 20);
            selectionCtxStub.closePath();
            selectionCtxStub.stroke();

            magnetismServiceSpy.calculateNewPosition.and.returnValue({ x: 0, y: 0 });

            service.onMouseMove(mouseEventRight);
            expect(magnetismServiceSpy.identifyResizeCorner).toHaveBeenCalledWith(service['resizeAttributes']);
            expect(magnetismServiceSpy.identifyTopLeftPosition).toHaveBeenCalledWith(service['resizeAttributes']);
            expect(magnetismServiceSpy.identifyAllPositions).toHaveBeenCalledWith(service['resizeAttributes']);
            expect(magnetismServiceSpy.calculateNewPosition).toHaveBeenCalledTimes(1);
        },
    );

    it('onMouseMove should not call checkCanvasLimits if imageClicked returns false', () => {
        service['mouseDownCoord'] = { x: 4000, y: 4000 };
        service['mouseDown'] = true;

        selectionCtxStub.beginPath();
        selectionCtxStub.moveTo(0, 0);
        selectionCtxStub.lineTo(20, 0);
        selectionCtxStub.lineTo(20, 20);
        selectionCtxStub.lineTo(0, 20);
        selectionCtxStub.closePath();
        selectionCtxStub.stroke();

        service.onMouseMove(mouseEventLeft);
        expect(checkCanvasLimitsSpy).not.toHaveBeenCalled();

        selectionCtxStub.clearRect(0, 0, selectionCanvasStub.width, selectionCanvasStub.height);
    });

    it('onMouseMove should not call drawSelectionCanvas if checkCanvasLimits returns false', () => {
        service['mouseDownCoord'] = { x: 10, y: 10 };
        service['mouseDown'] = true;

        selectionCtxStub.beginPath();
        selectionCtxStub.moveTo(0, 0);
        selectionCtxStub.lineTo(20, 0);
        selectionCtxStub.lineTo(20, 20);
        selectionCtxStub.lineTo(0, 20);
        selectionCtxStub.closePath();
        selectionCtxStub.stroke();

        const mouseEvent1 = {
            offsetX: -25,
            offsetY: -25,
            buttons: 3,
        } as MouseEvent;
        resizeAttributes.x = 0;
        resizeAttributes.x = 0;

        service.onMouseMove(mouseEvent1);
        expect(service['selectionDrawService'].drawSelectionCanvas).not.toHaveBeenCalled();
    });

    it('onMouseMove should set resizeAttributes attributes to correct values on top left resize with shift', () => {
        service['mouseDown'] = true;
        service['currentResize'] = 0;
        service['shiftKeyPressed'] = true;

        const mousePosition: Vec2 = { x: 25, y: 25 };
        const height: number = service['resizeAttributes'].x + service['resizeAttributes'].height - mousePosition.x;
        const width: number = service['resizeAttributes'].x + service['resizeAttributes'].width - mousePosition.x;
        const y: number = service['resizeAttributes'].y - (service['resizeAttributes'].x - mousePosition.x);
        const x: number = mousePosition.x;
        const expected: ResizeAttributes = {
            x,
            y,
            startingX: 0,
            startingY: 0,
            width,
            height,
            startingWidth: 0,
            startingHeight: 0,
            selectionType: 1,
            flippedX: true,
            flippedY: true,
            selectionPositions: [{ x: 0, y: 0 }],
        } as ResizeAttributes;

        service.onMouseMove(mouseEventLeft);
        expect(service['resizeAttributes']).toEqual(expected);
    });

    it('onMouseMove should set resizeAttributes attributes to correct values on top left resize without shift', () => {
        service['mouseDown'] = true;
        service['currentResize'] = 0;
        service['shiftKeyPressed'] = false;

        const mousePosition: Vec2 = { x: 25, y: 25 };
        const height: number = service['resizeAttributes'].y + service['resizeAttributes'].height - mousePosition.y;
        const width: number = service['resizeAttributes'].x + service['resizeAttributes'].width - mousePosition.x;
        const y: number = mousePosition.y;
        const x: number = mousePosition.x;
        const expected: ResizeAttributes = {
            x,
            y,
            startingX: 0,
            startingY: 0,
            width,
            height,
            startingWidth: 0,
            startingHeight: 0,
            selectionType: 1,
            flippedX: true,
            flippedY: true,
            selectionPositions: [{ x: 0, y: 0 }],
        } as ResizeAttributes;

        service.onMouseMove(mouseEventLeft);
        expect(service['resizeAttributes']).toEqual(expected);
    });

    it('onMouseMove should set resizeAttributes attributes to correct values on top right resize with shift', () => {
        service['mouseDown'] = true;
        service['currentResize'] = 2;
        service['shiftKeyPressed'] = true;

        const mousePosition: Vec2 = { x: 25, y: 25 };
        const height: number = mousePosition.x - service['resizeAttributes'].x - service['resizeAttributes'].width;
        const width: number = mousePosition.x - service['resizeAttributes'].x;
        const y: number = -(mousePosition.x - service['resizeAttributes'].x - service['resizeAttributes'].width);
        const x = 0;
        const expected: ResizeAttributes = {
            x,
            y,
            startingX: 0,
            startingY: 0,
            width,
            height,
            startingWidth: 0,
            startingHeight: 0,
            selectionType: 1,
            flippedX: true,
            flippedY: true,
            selectionPositions: [{ x: 0, y: 0 }],
        } as ResizeAttributes;

        service.onMouseMove(mouseEventLeft);
        expect(service['resizeAttributes']).toEqual(expected);
    });

    it('onMouseMove should set resizeAttributes attributes to correct values on top right resize without shift', () => {
        service['mouseDown'] = true;
        service['currentResize'] = 2;
        service['shiftKeyPressed'] = false;
        service['resizeAttributes'].height = 0;
        service['resizeAttributes'].y = 0;

        const mousePosition: Vec2 = { x: 25, y: 25 };
        const height: number = service['resizeAttributes'].y + service['resizeAttributes'].height - mousePosition.y;
        const width: number = mousePosition.x - service['resizeAttributes'].x;
        const y: number = mousePosition.y;
        const x = 0;
        const expected: ResizeAttributes = {
            x,
            y,
            startingX: 0,
            startingY: 0,
            width,
            height,
            startingWidth: 0,
            startingHeight: 0,
            selectionType: 1,
            flippedX: true,
            flippedY: true,
            selectionPositions: [{ x: 0, y: 0 }],
        } as ResizeAttributes;

        service.onMouseMove(mouseEventLeft);
        expect(service['resizeAttributes']).toEqual(expected);
    });

    it('onMouseMove should set resizeAttributes attributes to correct values on bottom left resize with shift', () => {
        service['mouseDown'] = true;
        service['currentResize'] = 5;
        service['shiftKeyPressed'] = true;

        const mousePosition: Vec2 = { x: 25, y: 25 };
        const height: number = -(mousePosition.x - service['resizeAttributes'].x);
        const width: number = service['resizeAttributes'].x + service['resizeAttributes'].width - mousePosition.x;
        const y = 0;
        const x: number = mousePosition.x;
        const expected: ResizeAttributes = {
            x,
            y,
            startingX: 0,
            startingY: 0,
            width,
            height,
            startingWidth: 0,
            startingHeight: 0,
            selectionType: 1,
            flippedX: true,
            flippedY: true,
            selectionPositions: [{ x: 0, y: 0 }],
        } as ResizeAttributes;

        service.onMouseMove(mouseEventLeft);
        expect(service['resizeAttributes']).toEqual(expected);
    });

    it('onMouseMove should set resizeAttributes attributes to correct values on bottome left resize without shift', () => {
        service['mouseDown'] = true;
        service['currentResize'] = 5;
        service['shiftKeyPressed'] = false;
        service['resizeAttributes'].height = 0;
        service['resizeAttributes'].y = 0;

        const mousePosition: Vec2 = { x: 25, y: 25 };
        const height: number = mousePosition.y - service['resizeAttributes'].y;
        const width: number = service['resizeAttributes'].x + service['resizeAttributes'].width - mousePosition.x;
        const y = 0;
        const x: number = mousePosition.x;
        const expected: ResizeAttributes = {
            x,
            y,
            startingX: 0,
            startingY: 0,
            width,
            height,
            startingWidth: 0,
            startingHeight: 0,
            selectionType: 1,
            flippedX: true,
            flippedY: true,
            selectionPositions: [{ x: 0, y: 0 }],
        } as ResizeAttributes;

        service.onMouseMove(mouseEventLeft);
        expect(service['resizeAttributes']).toEqual(expected);
    });

    it('onMouseMove should set resizeAttributes attributes to correct values on bottom right resize with shift', () => {
        service['mouseDown'] = true;
        service['currentResize'] = 7;
        service['shiftKeyPressed'] = true;

        const mousePosition: Vec2 = { x: 25, y: 25 };
        const height: number = mousePosition.x - service['resizeAttributes'].x - service['resizeAttributes'].width;
        const width: number = mousePosition.x - service['resizeAttributes'].x;
        const y = 0;
        const x = 0;
        const expected: ResizeAttributes = {
            x,
            y,
            startingX: 0,
            startingY: 0,
            width,
            height,
            startingWidth: 0,
            startingHeight: 0,
            selectionType: 1,
            flippedX: true,
            flippedY: true,
            selectionPositions: [{ x: 0, y: 0 }],
        } as ResizeAttributes;

        service.onMouseMove(mouseEventLeft);
        expect(service['resizeAttributes']).toEqual(expected);
    });

    it('onMouseMove should set resizeAttributes attributes to correct values on bottom right resize without shift', () => {
        service['mouseDown'] = true;
        service['currentResize'] = 7;
        service['shiftKeyPressed'] = false;
        service['resizeAttributes'].height = 0;
        service['resizeAttributes'].y = 0;

        const mousePosition: Vec2 = { x: 25, y: 25 };
        const height: number = mousePosition.y - service['resizeAttributes'].y;
        const width: number = mousePosition.x - service['resizeAttributes'].x;
        const y = 0;
        const x = 0;
        const expected: ResizeAttributes = {
            x,
            y,
            startingX: 0,
            startingY: 0,
            width,
            height,
            startingWidth: 0,
            startingHeight: 0,
            selectionType: 1,
            flippedX: true,
            flippedY: true,
            selectionPositions: [{ x: 0, y: 0 }],
        } as ResizeAttributes;

        service.onMouseMove(mouseEventLeft);
        expect(service['resizeAttributes']).toEqual(expected);
    });

    it('onMouseMove should set resizeAttributes attributes to correct values on left middle resize', () => {
        service['mouseDown'] = true;
        service['currentResize'] = 3;
        service['shiftKeyPressed'] = false;
        service['resizeAttributes'].height = 0;
        service['resizeAttributes'].y = 0;

        const mousePosition: Vec2 = { x: 25, y: 25 };
        const height = 0;
        const width: number = service['resizeAttributes'].x + service['resizeAttributes'].width - mousePosition.x;
        const y = 0;
        const x = mousePosition.x;
        const expected: ResizeAttributes = {
            x,
            y,
            startingX: 0,
            startingY: 0,
            width,
            height,
            startingWidth: 0,
            startingHeight: 0,
            selectionType: 1,
            flippedX: true,
            flippedY: false,
            selectionPositions: [{ x: 0, y: 0 }],
        } as ResizeAttributes;

        service.onMouseMove(mouseEventLeft);
        expect(service['resizeAttributes']).toEqual(expected);
    });

    it('onMouseMove should set resizeAttributes attributes to correct values on right middle resize', () => {
        service['mouseDown'] = true;
        service['currentResize'] = 4;
        service['shiftKeyPressed'] = false;
        service['resizeAttributes'].height = 0;
        service['resizeAttributes'].y = 0;

        const mousePosition: Vec2 = { x: 25, y: 25 };
        const height = 0;
        const width: number = mousePosition.x - service['resizeAttributes'].x;
        const y = 0;
        const x = 0;
        const expected: ResizeAttributes = {
            x,
            y,
            startingX: 0,
            startingY: 0,
            width,
            height,
            startingWidth: 0,
            startingHeight: 0,
            selectionType: 1,
            flippedX: true,
            flippedY: false,
            selectionPositions: [{ x: 0, y: 0 }],
        } as ResizeAttributes;

        service.onMouseMove(mouseEventLeft);
        expect(service['resizeAttributes']).toEqual(expected);
    });

    it('onMouseMove should set resizeAttributes attributes to correct values on bottom middle resize', () => {
        service['mouseDown'] = true;
        service['currentResize'] = 6;
        service['shiftKeyPressed'] = false;
        service['resizeAttributes'].height = 0;
        service['resizeAttributes'].y = 0;

        const mousePosition: Vec2 = { x: 25, y: 25 };
        const height = mousePosition.y - service['resizeAttributes'].y;
        const width = 0;
        const y = 0;
        const x = 0;
        const expected: ResizeAttributes = {
            x,
            y,
            startingX: 0,
            startingY: 0,
            width,
            height,
            startingWidth: 0,
            startingHeight: 0,
            selectionType: 1,
            flippedX: false,
            flippedY: true,
            selectionPositions: [{ x: 0, y: 0 }],
        } as ResizeAttributes;

        service.onMouseMove(mouseEventLeft);
        expect(service['resizeAttributes']).toEqual(expected);
    });

    it('onKeyDown should call drawImage on baseCtx if the event.key is escape', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Escape',
        });
        service.onKeyDown(event);
        expect(service['selectionDrawService'].drawBaseCanvas).toHaveBeenCalled();
    });

    it('onKeyDown should call copySelection when control and C keys are pressed', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'c',
            ctrlKey: true,
        });
        service.onKeyDown(event);
    });

    it('onKeyDown should not call copySelection when control key is not pressed but C key is', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'c',
            ctrlKey: false,
        });
        service.onKeyDown(event);
        expect(clipboardServiceSpy.copySelection).not.toHaveBeenCalled();
    });

    it('onKeyDown should call pasteSelection and change resizeAttributes when control and V keys are pressed', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'v',
            ctrlKey: true,
        });
        clipboardServiceSpy.pasteSelection.and.returnValue(resizeAttributes);
        service.onKeyDown(event);
        expect(clipboardServiceSpy.pasteSelection).toHaveBeenCalledWith(service['resizeAttributes']);
        expect(service['resizeAttributes']).toEqual(resizeAttributes);
    });

    it('onKeyDown should not call pasteSelection and not change resizeAttributes when is not pressed but V key is', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'v',
            ctrlKey: false,
        });
        const previousResize: ResizeAttributes = service['resizeAttributes'];
        service.onKeyDown(event);
        expect(clipboardServiceSpy.pasteSelection).not.toHaveBeenCalled();
        expect(service['resizeAttributes']).toEqual(previousResize);
    });

    it('onKeyDown should call cutSelection when control and X keys are pressed', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'x',
            ctrlKey: true,
        });
        service.onKeyDown(event);
        expect(clipboardServiceSpy.cutSelection).toHaveBeenCalledWith(service['resizeAttributes']);
    });

    it('onKeyDown should not call cutSelection when is not pressed but X key is', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'x',
            ctrlKey: false,
        });
        service.onKeyDown(event);
        expect(clipboardServiceSpy.cutSelection).not.toHaveBeenCalled();
    });

    it('onKeyDown should call deleteSelection Delete key is pressed', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Delete',
        });
        service.onKeyDown(event);
        expect(clipboardServiceSpy.deleteSelection).toHaveBeenCalledWith(service['resizeAttributes']);
    });

    it('onKeyDown should call moveArrows if the event.key is an arrow', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
        });
        service.onKeyDown(event);
        expect(moveArrowsSpy).toHaveBeenCalled();
    });

    it('onKeyDown should set continuousWaiting to false if the event.key is an arrow and if continuousDrawing and continuousWaiting are true', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
        });
        service['continuousDrawing'] = true;
        service['continuousWaiting'] = true;
        service.onKeyDown(event);
        expect(service['continuousWaiting']).toBeFalse();
    });

    it('onKeyDown should not change continuousWaiting if the event.key is not an arrow', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'b',
        });
        service['continuousDrawing'] = true;
        service['continuousWaiting'] = true;
        service.onKeyDown(event);
        expect(service['continuousWaiting']).toBeTrue();
    });

    it('moveArrows ArrowLeft should not call drawCanvas if the movement is outside the bound', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
        });
        service['arrowLeftPressed'] = false;
        service['resizeAttributes'].x = -20;
        service['moveArrows'](event);
    });

    it('moveArrows ArrowLeft should not call drawCanvas if arrowLeftPressed is true', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
        });
        service['arrowLeftPressed'] = true;
        service['resizeAttributes'].x = 5;
        service['moveArrows'](event);
    });

    // HERE
    it('moveArrows ArrowLeft should call moveBox and drawSelectionCanvas if magnetism isAnchored', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
        });
        service['arrowLeftPressed'] = false;
        service['resizeAttributes'].x = 5;
        service['magnetismService'].isAnchored = true;
        service['moveArrows'](event);

        expect(magnetismServiceSpy.moveBox).toHaveBeenCalled();
        expect(resizeDrawServiceSpy.drawSelectionCanvas).toHaveBeenCalledWith(service['resizeAttributes']);
    });

    it('moveArrows ArrowUp should call moveBox and drawSelectionCanvas if magnetism isAnchored', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowUp',
        });
        service['arrowUpPressed'] = false;
        service['resizeAttributes'].y = 5;
        service['magnetismService'].isAnchored = true;
        service['moveArrows'](event);

        expect(magnetismServiceSpy.moveBox).toHaveBeenCalled();
        expect(resizeDrawServiceSpy.drawSelectionCanvas).toHaveBeenCalledWith(service['resizeAttributes']);
    });

    it('moveArrows ArrowRight should call moveBox and drawSelectionCanvas if magnetism isAnchored', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
        });
        service['arrowRightPressed'] = false;
        service['resizeAttributes'].x = 5;
        service['magnetismService'].isAnchored = true;
        service['moveArrows'](event);

        expect(magnetismServiceSpy.moveBox).toHaveBeenCalled();
        expect(resizeDrawServiceSpy.drawSelectionCanvas).toHaveBeenCalledWith(service['resizeAttributes']);
    });

    it('moveArrows ArrowDown should call moveBox and drawSelectionCanvas if magnetism isAnchored', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
        });
        service['arrowDownPressed'] = false;
        service['resizeAttributes'].y = 5;
        service['magnetismService'].isAnchored = true;
        service['moveArrows'](event);

        expect(magnetismServiceSpy.moveBox).toHaveBeenCalled();
        expect(resizeDrawServiceSpy.drawSelectionCanvas).toHaveBeenCalledWith(service['resizeAttributes']);
    });

    it('moveArrows ArrowLeft should call drawCanvas if arrowLeftPressed is false and the movement is in the bound', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
        });
        service['arrowLeftPressed'] = false;
        service['resizeAttributes'].x = 5;
        service['moveArrows'](event);
    });

    it('moveArrows ArrowUp should not call drawCanvas if the movement is outside the bound', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowUp',
        });
        service['arrowUpPressed'] = false;
        service['resizeAttributes'].y = -20;
        service['moveArrows'](event);
    });

    it('moveArrows ArrowUp should not call drawCanvas if arrowUpPressed is true', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowUp',
        });
        service['arrowUpPressed'] = true;
        service['resizeAttributes'].y = 5;
        service['moveArrows'](event);
    });

    it('moveArrows ArrowUp should call drawCanvas if arrowUpPressed is false and the movement is in the bound', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowUp',
        });
        service['arrowUpPressed'] = false;
        service['resizeAttributes'].y = 5;
        service['moveArrows'](event);
    });

    it('moveArrows ArrowRight should not call drawCanvas if the movement is outside the bound', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
        });
        service['arrowRightPressed'] = false;
        service['resizeAttributes'].x = selectionCanvasStub.width;
        service['moveArrows'](event);
    });

    it('moveArrows ArrowRight should not call drawCanvas if arrowRightPressed is true', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
        });
        service['arrowRightPressed'] = true;
        service['resizeAttributes'].x = 5;
        service['moveArrows'](event);
    });

    it('moveArrows ArrowRight should call drawCanvas if arrowRightPressed is false and the movement is in the bound', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
        });
        service['arrowRightPressed'] = false;
        service['resizeAttributes'].x = 5;
        service['moveArrows'](event);
    });

    it('moveArrows ArrowDown should not call drawCanvas if the movement is outside the bound', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
        });
        service['arrowDownPressed'] = false;
        service['resizeAttributes'].y = selectionCanvasStub.height;
        service['moveArrows'](event);
    });

    it('moveArrows ArrowDown should not call drawCanvas if arrowDownPressed is true', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
        });
        service['arrowDownPressed'] = true;
        service['resizeAttributes'].x = 5;
        service['moveArrows'](event);
    });

    it('moveArrows ArrowDown should call drawCanvas if arrowDownPressed is false and the movement is in the bound', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
        });
        service['arrowDownPressed'] = false;
        service['resizeAttributes'].x = 5;
        service['moveArrows'](event);
    });

    it('moveArrows should not call drawCanvas the key is not an arrow', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'h',
        });
        service['arrowDownPressed'] = false;
        service['resizeAttributes'].x = 5;
        service['moveArrows'](event);
    });

    it('drawContinuous should not call drawCanvas if no arrow keys are pressed', () => {
        service['arrowDownPressed'] = false;
        service['arrowRightPressed'] = false;
        service['arrowUpPressed'] = false;
        service['arrowLeftPressed'] = false;
        service['resizeAttributes'].x = 5;
        service['drawContinuous']();
        expect(service['selectionDrawService'].drawSelectionCanvas).not.toHaveBeenCalled();
    });

    it('drawContinuous should call drawCanvas if arrowKeys are pressed', () => {
        service['resizeAttributes'].x = 20;
        service['resizeAttributes'].y = 20;
        service['arrowDownPressed'] = true;
        service['arrowRightPressed'] = true;
        service['arrowUpPressed'] = true;
        service['arrowLeftPressed'] = true;
        service['resizeAttributes'].x = 5;
        service['drawContinuous']();
        expect(service['selectionDrawService'].drawSelectionCanvas).toHaveBeenCalled();
    });

    it('onKeyUp should set arrowLeftPressed to false if ArrowLeft is pressed up', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
        });
        service.onKeyUp(event);
        expect(service['arrowLeftPressed']).toBeFalse();
    });

    it('onKeyUp should set arrowRightPressed to false if ArrowRight is pressed up', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
        });
        service.onKeyUp(event);
        expect(service['arrowRightPressed']).toBeFalse();
    });

    it('onKeyUp should set arrowUpPressed to false if ArrowUp is pressed up', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowUp',
        });
        service.onKeyUp(event);
        expect(service['arrowUpPressed']).toBeFalse();
    });

    it('onKeyUp should set arrowDownPressed to false if ArrowDown is pressed up', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
        });
        service.onKeyUp(event);
        expect(service['arrowDownPressed']).toBeFalse();
    });

    it('onKeyUp should not change arrowPressed values if it is not arrowKey that is released ', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'm',
        });
        service.onKeyUp(event);
        service['arrowDownPressed'] = true;
        service['arrowUpPressed'] = true;
        service['arrowRightPressed'] = true;
        service['arrowLeftPressed'] = true;
        expect(service['arrowDownPressed']).toBeTrue();
        expect(service['arrowUpPressed']).toBeTrue();
        expect(service['arrowRightPressed']).toBeTrue();
        expect(service['arrowLeftPressed']).toBeTrue();
    });

    it('checkCanvasLimits should return boolean based on the offset', () => {
        const offset1 = { x: -4000, y: 0 } as Vec2;
        const returnValue1 = service['checkCanvasLimits'](offset1);
        expect(returnValue1).toBeFalse();
        const offset2 = { x: 4000, y: 0 } as Vec2;
        const returnValue2 = service['checkCanvasLimits'](offset2);
        expect(returnValue2).toBeFalse();
        const offset3 = { x: 0, y: -4000 } as Vec2;
        const returnValue3 = service['checkCanvasLimits'](offset3);
        expect(returnValue3).toBeFalse();
        const offset4 = { x: 0, y: 4000 } as Vec2;
        const returnValue4 = service['checkCanvasLimits'](offset4);
        expect(returnValue4).toBeFalse();
        const offset5 = { x: 50, y: 50 } as Vec2;
        const returnValue5 = service['checkCanvasLimits'](offset5);
        expect(returnValue5).toBeTrue();
    });

    it('newSelection should change resizeAttributes, drawingService.imageSelected and call drawSelectionCanvas', () => {
        const mouseDown: Vec2 = { x: 5, y: 5 };
        const offset: Vec2 = { x: 5, y: 5 };
        const type = 1;
        const lassoPoints: Vec2[] = [{ x: 5, y: 5 }];
        const expected: ResizeAttributes = {
            x: mouseDown.x,
            y: mouseDown.y,
            startingX: mouseDown.x,
            startingY: mouseDown.y,
            width: offset.x,
            height: offset.y,
            startingWidth: offset.x,
            startingHeight: offset.y,
            selectionType: type,
            flippedX: false,
            flippedY: false,
            selectionPositions: lassoPoints,
        };
        service.newSelection(mouseDown, offset, type, lassoPoints);
        expect(service['resizeAttributes']).toEqual(expected);
        expect(service['drawingService'].imageSelected).toBeTrue();
        expect(service['selectionDrawService'].drawSelectionCanvas).toHaveBeenCalled();
    });

    it('arrowTimeOut should set continuousDrawing to true and call drawSelectionCanvas', () => {
        const clock: jasmine.Clock = jasmine.clock();
        clock.install();
        service['arrowTimeout']();
        clock.tick(resizeConstants.arrowDelayTime);
        clock.uninstall();
        expect(service['continuousDrawing']).toBeTrue();
        expect(service['selectionDrawService'].drawSelectionCanvas).toHaveBeenCalled();
    });

    it('confirmSelection should call drawBaseCanvas and set imageSelected to false', () => {
        service.confirmSelection();
        expect(service['selectionDrawService'].drawBaseCanvas).toHaveBeenCalled();
        expect(service['drawingService'].imageSelected).toBeFalse();
    });

    it('checkSelectionFlipped should set resizeAttributes flippedX and flippedY to correct value on X/Y flip', () => {
        service['resizeAttributes'].width = 100;
        service['resizeAttributes'].height = 100;
        const previousFlippedX: boolean = service['resizeAttributes'].flippedX;
        const previousFlippedY: boolean = service['resizeAttributes'].flippedY;
        service['checkSelectionFlipped'](-1, -1);
        expect(service['resizeAttributes'].flippedX).toEqual(!previousFlippedX);
        expect(service['resizeAttributes'].flippedX).toEqual(!previousFlippedY);
    });

    it('checkSelectionFlipped should not set resizeAttributes flippedX and flippedY to correct value when X/Y is not flipped', () => {
        service['resizeAttributes'].width = 100;
        service['resizeAttributes'].height = 100;
        const previousFlippedX: boolean = service['resizeAttributes'].flippedX;
        const previousFlippedY: boolean = service['resizeAttributes'].flippedY;
        service['checkSelectionFlipped'](1, 1);
        expect(service['resizeAttributes'].flippedX).toEqual(previousFlippedX);
        expect(service['resizeAttributes'].flippedX).toEqual(previousFlippedY);
    });
});
