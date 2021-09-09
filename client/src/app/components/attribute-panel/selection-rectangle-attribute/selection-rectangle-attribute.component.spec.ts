import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSelectChange } from '@angular/material/select';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/drawing/selection-service';
import { SelectionRectangleService } from '@app/services/tools/selection-rectangle.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { SelectionRectangleAttributeComponent } from './selection-rectangle-attribute.component';

describe('SelectionRectangleAttributeComponent', () => {
    let component: SelectionRectangleAttributeComponent;
    let fixture: ComponentFixture<SelectionRectangleAttributeComponent>;
    let drawingStub: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let undoRedoStub: UndoRedoService;
    let selectionEllipseSpy: jasmine.SpyObj<SelectionRectangleService>;
    let selectionSpy: jasmine.SpyObj<SelectionService>;

    beforeEach(async(() => {
        selectionSpy = jasmine.createSpyObj('SelectionService', ['onKeyDown']);
        drawingStub = new DrawingService();

        undoRedoStub = new UndoRedoService(drawingStub);
        selectionEllipseSpy = jasmine.createSpyObj('SelectionEllipseService', ['onKeyDown']);

        TestBed.configureTestingModule({
            declarations: [SelectionRectangleAttributeComponent],
            providers: [
                { provide: SelectionRectangleService, useValue: selectionEllipseSpy },
                { provide: SelectionService, useValue: selectionSpy },
                { provide: UndoRedoService, useValue: undoRedoStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingStub.baseCtx = baseCtxStub;
        drawingStub.previewCtx = previewCtxStub;
        fixture = TestBed.createComponent(SelectionRectangleAttributeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('copy should call selectionService onKeyDown with v', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'c',
            ctrlKey: true,
        });
        component.copy();
        expect(selectionSpy.onKeyDown).toHaveBeenCalledWith(event);
    });

    it('paste should call selectionService onKeyDown with v', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'v',
            ctrlKey: true,
        });
        component.paste();
        expect(selectionSpy.onKeyDown).toHaveBeenCalledWith(event);
    });

    it('cut should call selectionService onKeyDown with cut', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'x',
            ctrlKey: true,
        });
        component.delete();
        expect(selectionSpy.onKeyDown).toHaveBeenCalledWith(event);
    });

    it('delete should call selectionService onKeyDown with Delete', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Delete',
            ctrlKey: true,
        });
        component.cut();
        expect(selectionSpy.onKeyDown).toHaveBeenCalledWith(event);
    });

    it('undo should call undoRedoservice.undo()', () => {
        const spy = spyOn(undoRedoStub, 'undo').and.callThrough();
        component.undo();
        expect(spy).toHaveBeenCalled();
    });

    it('redo should call undoRedoservice.redo()', () => {
        const spy = spyOn(undoRedoStub, 'redo').and.callThrough();
        component.redo();
        expect(spy).toHaveBeenCalled();
    });

    it(' selectCanvas should call onKeyDown function of SelectionEllipseService', () => {
        component.selectCanvas();
        expect(selectionEllipseSpy.onKeyDown).toHaveBeenCalled();
    });

    it('onCornerChange should change this.anchor and magnetismService.anchor to event.value', () => {
        const event: MatSelectChange = { value: 0 } as MatSelectChange;
        component.onCornerChange(event);
        // tslint:disable-next-line: no-string-literal
        expect(component['magnetismService'].anchor).toBe(0);
        expect(component.anchor).toBe(0);
    });

    it('onCornerChange should not change this.anchor and magnetismService.anchor to event.value if value is null', () => {
        const event: MatSelectChange = { value: null } as MatSelectChange;
        // tslint:disable-next-line: no-string-literal
        component['magnetismService'].anchor = 1;
        component.anchor = 1;
        component.onCornerChange(event);
        // tslint:disable-next-line: no-string-literal
        expect(component['magnetismService'].anchor).toBe(1);
        expect(component.anchor).toBe(1);
    });

    it('onMagnetismChange should change this.toggle to its opposite and magnetismService.isAnchored to the true on this.toggle is false', () => {
        component.toggle = false;
        component.onMagnetismChange();
        // tslint:disable-next-line: no-string-literal
        expect(component['magnetismService'].isAnchored).toBeTrue();
        expect(component.toggle).toBeTrue();
    });

    it('onMagnetismChange should change this.toggle to its opposite and magnetismService.isAnchored to the true on this.toggle is true', () => {
        component.toggle = true;
        component.onMagnetismChange();
        // tslint:disable-next-line: no-string-literal
        expect(component['magnetismService'].isAnchored).toBeFalse();
        expect(component.toggle).toBeFalse();
    });
});
