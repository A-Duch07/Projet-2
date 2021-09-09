import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { AerosolService } from '@app/services/tools/aerosol.service';
import { EllipseService } from '@app/services/tools/ellipse.service';
import { EraserService } from '@app/services/tools/eraser.service';
import { LineService } from '@app/services/tools/line.service';
import { PencilService } from '@app/services/tools/pencil.service';
import { PipetteService } from '@app/services/tools/pipette.service';
import { RectangleService } from '@app/services/tools/rectangle.service';
import { TexteService } from '@app/services/tools/texte.service';
import { of } from 'rxjs';
import { DrawingComponent } from './drawing.component';

// tslint:disable: no-magic-numbers no-any

class ToolStub extends Tool {}

// TODO : Déplacer dans un fichier accessible à tous
const DEFAULT_WIDTH = 1000;
const DEFAULT_HEIGHT = 800;

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let pencilStub: ToolStub;
    let eraserStub: ToolStub;
    let rectangleStub: ToolStub;
    let lineStub: ToolStub;
    let ellipseStub: ToolStub;
    let aerosolStub: ToolStub;
    let pipetteStub: ToolStub;
    let texteStub: ToolStub;
    let drawingStub: DrawingService;
    let carouselServiceSpy: jasmine.Spy<any>;
    let service: DrawingService;
    let dialogSpy: jasmine.Spy<any>;
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of('true'), close: null });
    dialogRefSpyObj.componentInstance = { body: 'component' };

    // let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let resizeSpy: jasmine.Spy<any>;
    // let toolChangeSpy: jasmine.Spy<any>;
    // let alertSpy: jasmine.Spy<any>;

    let canvasTestHelper: CanvasTestHelper;

    beforeEach(async(() => {
        pencilStub = new ToolStub({} as DrawingService);
        lineStub = new ToolStub({} as DrawingService);
        eraserStub = new ToolStub({} as DrawingService);
        rectangleStub = new ToolStub({} as DrawingService);
        drawingStub = new DrawingService();
        ellipseStub = new ToolStub({} as DrawingService);
        aerosolStub = new ToolStub({} as DrawingService);
        pipetteStub = new ToolStub({} as DrawingService);
        texteStub = new ToolStub({} as DrawingService);

        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [DrawingComponent],
            providers: [
                { provide: PencilService, useValue: pencilStub },
                { provide: RectangleService, useValue: rectangleStub },
                { provide: DrawingService, useValue: drawingStub },
                { provide: EraserService, useValue: eraserStub },
                { provide: LineService, useValue: lineStub },
                { provide: EllipseService, useValue: ellipseStub },
                { provide: AerosolService, useValue: aerosolStub },
                { provide: PipetteService, useValue: pipetteStub },
                { provide: TexteService, useValue: texteStub },
            ],
        }).compileComponents();

        service = TestBed.inject(DrawingService);
        carouselServiceSpy = spyOn<any>(service, 'printCarouselImage').and.callThrough();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        resizeSpy = spyOn<any>(drawingStub, 'resizeExistingCanvas').and.callThrough();

        component.resizeSize = [DEFAULT_WIDTH, DEFAULT_HEIGHT];
        component.currentTool = pencilStub;

        fixture.detectChanges();
        dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have the resized WIDTH and HEIGHT', () => {
        const height = component.height;
        const width = component.width;
        expect(height).toEqual(DEFAULT_HEIGHT);
        expect(width).toEqual(DEFAULT_WIDTH);
    });

    it('should get stubTool (default tool is pencil)', () => {
        const currentTool = component.currentTool;
        expect(currentTool).toEqual(pencilStub);
    });

    it(" should call the tool's mouse move when receiving a mouse move event", () => {
        component.currentTool = pencilStub;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(pencilStub, 'onMouseMove').and.callThrough();
        component.onMouseMove(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse down when receiving a mouse down event", () => {
        component.currentTool = pencilStub;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(pencilStub, 'onMouseDown').and.callThrough();
        component.onMouseDown(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse up when receiving a mouse up event", () => {
        component.currentTool = pencilStub;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(pencilStub, 'onMouseUp').and.callThrough();
        component.onMouseUp(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it('should print the crouselDrawing if carouselOpened is true', () => {
        service.carouselOpened = true;
        service.savedDrawing = false;
        service.carouselDrawing = new Image();
        component.ngAfterViewInit();
        expect(carouselServiceSpy).toHaveBeenCalled();
        expect(service.carouselOpened).toEqual(false);
    });

    it('If user wants to overwrite a drawing coming from carousel then should open the alert dialog', () => {
        service.carouselOpened = true;
        service.savedDrawing = true;
        component.ngAfterViewInit();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('After dialog has been called, if the user wants to overwrite his drawing, fasle should be set to carouselOpened and printcarouselImage souldve been called', () => {
        service.carouselOpened = true;
        service.savedDrawing = true;
        service.carouselDrawing = new Image();
        component.ngAfterViewInit();
        expect(carouselServiceSpy).toHaveBeenCalled();
        expect(service.carouselOpened).toEqual(false);
    });

    it('should call selectTool and have the correct tool ID', () => {
        const fakeID = 3;
        component.onToolChange(fakeID);
        expect(component.currentTool).toEqual(component.tools[fakeID]);
    });

    it('#openAlert should open the dialog', () => {
        component.openAlert();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it(' resizeSize should call drawingService resizeExistingCanvas if a canvas already exists', () => {
        component.baseCanvas.nativeElement = canvasTestHelper.canvas;
        const resizeDimensions = [400, 400];
        component.resizeSize = resizeDimensions;
        expect(resizeSpy).toHaveBeenCalled();
    });

    it('onKeyDown should call openAlert() when the letter o and ctrlKey are pressed', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'o',
            ctrlKey: true,
        });
        const spy = spyOn(component, 'openAlert');
        component.onKeyDown(event);
        expect(spy).toHaveBeenCalled();
    });

    it('onKeyDown should not call openAlert() when the letter o is pressed and ctrlKey not pressed', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'o',
            ctrlKey: false,
        });
        const spy = spyOn(component, 'openAlert');
        component.onKeyDown(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it('onKeyDown should change the currentTool to the pencil if the key pressed is c', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'c',
        });
        component.onKeyDown(event);
        expect(component.currentTool).toEqual(pencilStub);
    });

    it('onKeyDown should change the currentTool to the eraser if the key pressed is e', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'e',
        });
        component.onKeyDown(event);
        expect(component.currentTool).toEqual(eraserStub);
    });

    it('onKeyDown should change the currentTool to the eraser if the key pressed is ', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'l',
        });
        component.onKeyDown(event);
        expect(component.currentTool).toEqual(lineStub);
    });

    it('onKeyDown should change the currentTool to the eraser if the key pressed is ', () => {
        const event = new KeyboardEvent('keydown', {
            key: '1',
        });
        component.onKeyDown(event);
        expect(component.currentTool).toEqual(rectangleStub);
    });

    it('onKeyDown should change the currentTool to the ellipse if the key pressed is 2 ', () => {
        const event = new KeyboardEvent('keydown', {
            key: '2',
        });
        component.onKeyDown(event);
        expect(component.currentTool).toEqual(ellipseStub);
    });

    it('onKeyDown should call the onKeyDown event of the current tool for any other input ', () => {
        const event = new KeyboardEvent('keydown', {
            key: '.',
        });
        component.currentTool = pencilStub;
        const onKeyDownSpy = spyOn(pencilStub, 'onKeyDown').and.callThrough();
        component.onKeyDown(event);
        expect(onKeyDownSpy).toHaveBeenCalled();
        expect(onKeyDownSpy).toHaveBeenCalledWith(event);
    });

    it('onKeyUp should call the onKeyDown event of the current tool for any other input ', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        component.currentTool = pencilStub;
        const onKeyUpSpy = spyOn(pencilStub, 'onKeyUp').and.callThrough();
        component.OnKeyUp(event);
        expect(onKeyUpSpy).toHaveBeenCalled();
        expect(onKeyUpSpy).toHaveBeenCalledWith(event);
    });

    it('onMoveMove should not call the current tool onMouseMove if resizing is true', () => {
        component.resizing = true;
        component.currentTool = pencilStub;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(pencilStub, 'onMouseMove').and.callThrough();
        component.onMouseMove(event);
        expect(mouseEventSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown should not call the current tool onMouseDown if resizing is true', () => {
        component.resizing = true;
        component.currentTool = pencilStub;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(pencilStub, 'onMouseDown').and.callThrough();
        component.onMouseDown(event);
        expect(mouseEventSpy).not.toHaveBeenCalled();
    });

    it(" should call the tool's mouse leave when receiving a mouse leave event", () => {
        component.currentTool = pencilStub;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(pencilStub, 'onMouseLeave').and.callThrough();
        component.onMouseLeave(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should not call the tool's mouse leave when receiving a mouse leave event if resizing is true", () => {
        component.resizing = true;
        component.currentTool = pencilStub;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(pencilStub, 'onMouseLeave').and.callThrough();
        component.onMouseLeave(event);
        expect(mouseEventSpy).not.toHaveBeenCalled();
    });

    it(" should call the tool's mouse enter when receiving a mouse enter event", () => {
        component.currentTool = pencilStub;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(pencilStub, 'onMouseEnter').and.callThrough();
        component.onMouseEnter(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse doubleClick when receiving a mouse doubleClick event", () => {
        component.currentTool = pencilStub;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(pencilStub, 'onDoubleClick').and.callThrough();
        component.onDoubleClick(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });
});
