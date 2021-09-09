import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/components/drawing/drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import * as resizeDrawingConstants from './resize-drawing-constants';
import { ResizeDrawingComponent } from './resize-drawing.component';

// tslint:disable: no-string-literal
// tslint:disable: no-magic-numbers
// tslint:disable: no-any

describe('ResizeDrawingComponent', () => {
    let component: ResizeDrawingComponent;
    let fixture: ComponentFixture<ResizeDrawingComponent>;
    let drawingStub: DrawingService;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(async(() => {
        drawingStub = new DrawingService();

        TestBed.configureTestingModule({
            declarations: [ResizeDrawingComponent],
            providers: [{ provide: DrawingService, useValue: drawingStub }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ResizeDrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // tslint:disable-next-line: no-string-literal
        component['drawingService'].canvas = canvasTestHelper.canvas;
        component['drawingService'].baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should set height and width to half of the working space if we are not loading a save canvas', () => {
        // tslint:disable-next-line: no-string-literal
        component['drawingService'].savedDrawing = false;
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 2000 });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 2000 });
        const canvasWidth = (window.innerWidth - resizeDrawingConstants.SIDEBAR_SIZE) / 2;
        const canvasHeight = window.innerHeight / 2;
        component.ngOnInit();
        expect(component.width).toEqual(canvasWidth);
        expect(component.height).toEqual(canvasHeight);
        // const canvasHeight = (window.innerHeight - resizeDrawingConstants);
    });

    it('ngOnInit should set height and width to the height and width of the saved canvas in drawing service if there is a saved canvas', () => {
        // tslint:disable-next-line: no-string-literal
        component['drawingService'].savedDrawing = true;

        component.ngOnInit();
        // tslint:disable-next-line: no-string-literal
        expect(component.width).toEqual(component['drawingService'].canvas.width);

        component.ngOnInit();
        // tslint:disable-next-line: no-string-literal
        expect(component.height).toEqual(component['drawingService'].canvas.height);
        // const canvasHeight = (window.innerHeight - resizeDrawingConstants);
    });

    it(' edgeClick should set resizing to true', () => {
        const event = {} as MouseEvent;
        const resizeFunction = component.bottomRightResize;
        component.edgeClick(event, resizeFunction);
        expect(component.resizing).toEqual(true);
    });

    it(' edgeRelease should set resizing to false', () => {
        const event = {} as MouseEvent;
        component.resizing = true;
        component.edgeRelease(event);
        expect(component.resizing).toBeFalsy();
    });

    it(' edgeRelease should update the canvasDimensions with the new width and height', () => {
        const event = {} as MouseEvent;
        component.edgeRelease(event);
        expect(component.canvasDimensions).toEqual([component.width, component.height]);
    });

    it('edgeRelease should not update the canvasDimensions if resizing is false', () => {
        const event = {} as MouseEvent;
        component.resizing = false;
        component.canvasDimensions = [];
        component.width = resizeDrawingConstants.DEFAULT_WIDTH;
        component.height = resizeDrawingConstants.DEFAULT_HEIGHT;
        component.edgeRelease(event);
        expect(component.canvasDimensions).toEqual([]);
    });

    it(' bottom right resize should update both the width and the height with the offset values', () => {
        component.width = 0;
        component.height = 0;
        const mouseMoveDistance = 50;
        component.bottomRightResize(mouseMoveDistance, mouseMoveDistance);
        expect(component.width).toEqual(mouseMoveDistance);
        expect(component.height).toEqual(mouseMoveDistance);
    });

    it(' bottom middle resize should only update the height with the offset values', () => {
        component.width = 0;
        component.height = 0;
        const mouseMoveDistance = 50;
        component.bottomMiddleResize(mouseMoveDistance, mouseMoveDistance);
        expect(component.width).toEqual(0);
        expect(component.height).toEqual(mouseMoveDistance);
    });

    it(' right middle resize should only update the width with the offset values', () => {
        component.width = 0;
        component.height = 0;
        const mouseMoveDistance = 50;
        component.rightMiddleResize(mouseMoveDistance, mouseMoveDistance);
        expect(component.width).toEqual(mouseMoveDistance);
        expect(component.height).toEqual(0);
    });

    it(' edgeMove offsetX should be zero if the width gets below MIN_WIDTH, the width should not change', () => {
        const mouseMoveDistance = 50;
        const event = new MouseEvent('mousemove', {
            clientX: DEFAULT_WIDTH - mouseMoveDistance,
            clientY: DEFAULT_HEIGHT - mouseMoveDistance,
        });
        // tslint:disable-next-line: no-string-literal
        component['clickX'] = DEFAULT_WIDTH;
        // tslint:disable-next-line: no-string-literal
        component['clickY'] = DEFAULT_HEIGHT;
        component.width = resizeDrawingConstants.MIN_WIDTH;
        component.height = resizeDrawingConstants.MIN_HEIGHT;
        component.resizeStrategy = component.bottomRightResize;
        component.resizing = true;
        component.edgeMove(event);
        expect(component.width).toEqual(resizeDrawingConstants.MIN_WIDTH);
    });

    it(' edgeMove offsetY should be zero if the heigth gets below MIN_HEIGHT, the height should not change', () => {
        const mouseMoveDistance = 50;
        const event = new MouseEvent('mousemove', {
            clientX: DEFAULT_WIDTH - mouseMoveDistance,
            clientY: DEFAULT_HEIGHT - mouseMoveDistance,
        });
        // tslint:disable-next-line: no-string-literal
        component['clickX'] = DEFAULT_WIDTH;
        // tslint:disable-next-line: no-string-literal
        component['clickY'] = DEFAULT_HEIGHT;
        component.width = resizeDrawingConstants.MIN_WIDTH;
        component.height = resizeDrawingConstants.MIN_HEIGHT;
        component.resizeStrategy = component.bottomRightResize;
        component.resizing = true;
        component.edgeMove(event);
        expect(component.height).toEqual(resizeDrawingConstants.MIN_HEIGHT);
    });

    it(' edgeMove offsetX should be zero if the heigth gets higher than the max width, the width should not change', () => {
        const mouseMoveDistance = 50;
        const event = new MouseEvent('mousemove', {
            clientX: DEFAULT_WIDTH + mouseMoveDistance,
            clientY: DEFAULT_HEIGHT + mouseMoveDistance,
        });
        // tslint:disable-next-line: no-string-literal
        component['clickX'] = DEFAULT_WIDTH;
        // tslint:disable-next-line: no-string-literal
        component['clickY'] = DEFAULT_HEIGHT;
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 200 });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 200 });
        component.width = resizeDrawingConstants.MIN_WIDTH;
        component.height = resizeDrawingConstants.MIN_HEIGHT;
        component.resizeStrategy = component.bottomRightResize;
        component.resizing = true;
        component.edgeMove(event);
        expect(component.height).toEqual(resizeDrawingConstants.MIN_WIDTH);
    });

    it(' edgeMove offsetY should be zero if the heigth gets higher than the max height, the height should not change', () => {
        const mouseMoveDistance = 50;
        const event = new MouseEvent('mousemove', {
            clientX: DEFAULT_WIDTH + mouseMoveDistance,
            clientY: DEFAULT_HEIGHT + mouseMoveDistance,
        });
        // tslint:disable-next-line: no-string-literal
        component['clickX'] = DEFAULT_WIDTH;
        // tslint:disable-next-line: no-string-literal
        component['clickY'] = DEFAULT_HEIGHT;
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 200 });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 200 });
        component.width = resizeDrawingConstants.MIN_WIDTH;
        component.height = resizeDrawingConstants.MIN_HEIGHT;
        component.resizeStrategy = component.bottomRightResize;
        component.resizing = true;
        component.edgeMove(event);
        expect(component.height).toEqual(resizeDrawingConstants.MIN_HEIGHT);
    });

    it(' edgeMove offsetX should change the width if the limit is not hit', () => {
        const mouseMoveDistance = 50;
        const event = new MouseEvent('mousemove', {
            clientX: DEFAULT_WIDTH - mouseMoveDistance,
            clientY: DEFAULT_HEIGHT - mouseMoveDistance,
        });
        // tslint:disable-next-line: no-string-literal
        component['clickX'] = DEFAULT_WIDTH;
        // tslint:disable-next-line: no-string-literal
        component['clickY'] = DEFAULT_HEIGHT;
        component.width = DEFAULT_WIDTH;
        component.height = DEFAULT_HEIGHT;
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 2000 });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 2000 });
        component.resizeStrategy = component.bottomRightResize;
        component.resizing = true;
        component.edgeMove(event);
        expect(component.width).toEqual(DEFAULT_WIDTH - mouseMoveDistance);
    });

    it('  edgeMove offsetY should change the height if the limit is not hit', () => {
        const mouseMoveDistance = 50;
        const event = new MouseEvent('mousemove', {
            clientX: DEFAULT_WIDTH - mouseMoveDistance,
            clientY: DEFAULT_HEIGHT - mouseMoveDistance,
        });
        // tslint:disable-next-line: no-string-literal
        component['clickX'] = DEFAULT_WIDTH;
        // tslint:disable-next-line: no-string-literal
        component['clickY'] = DEFAULT_HEIGHT;
        component.width = DEFAULT_WIDTH;
        component.height = DEFAULT_HEIGHT;
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 2000 });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 2000 });
        component.resizeStrategy = component.bottomRightResize;
        component.resizing = true;
        component.edgeMove(event);
        expect(component.height).toEqual(DEFAULT_HEIGHT - mouseMoveDistance);
    });

    it(' edgeMove should not change the width or the height if resizing is false', () => {
        const mouseMoveDistance = 50;
        const event = new MouseEvent('mousemove', {
            clientX: DEFAULT_WIDTH - mouseMoveDistance,
            clientY: DEFAULT_HEIGHT - mouseMoveDistance,
        });
        component.resizing = false;
        component.width = resizeDrawingConstants.MIN_WIDTH;
        component.height = resizeDrawingConstants.MIN_HEIGHT;
        component.edgeMove(event);
        expect(component.width).toEqual(resizeDrawingConstants.MIN_WIDTH);
        expect(component.height).toEqual(resizeDrawingConstants.MIN_HEIGHT);
    });
});
