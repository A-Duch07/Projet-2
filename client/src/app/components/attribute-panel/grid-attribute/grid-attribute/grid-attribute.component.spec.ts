// tslint:disable: no-string-literal
// Justification : On a besoin de string literals pour tester et acceder a certains attributs privees de notre component/service
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { GridAttributeComponent } from './grid-attribute.component';

describe('GridAttributeComponent', () => {
    let component: GridAttributeComponent;
    let fixture: ComponentFixture<GridAttributeComponent>;
    let drawingStub: DrawingService;
    let gridStub: GridService;
    let canvasTestHelper: CanvasTestHelper;
    let gridCtxStub: CanvasRenderingContext2D;
    const TEST_VALUE1 = 15;
    const TEST_VALUE2 = 0.75;

    beforeEach(async(() => {
        drawingStub = new DrawingService();
        gridStub = new GridService(drawingStub);

        TestBed.configureTestingModule({
            declarations: [GridAttributeComponent],
            providers: [
                { provide: GridService, useValue: gridStub },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        gridCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        fixture = TestBed.createComponent(GridAttributeComponent);
        component = fixture.componentInstance;
        component['drawingService'].gridCtx = gridCtxStub;
        fixture.detectChanges();
    });

    it('onSizeChange of grid service should change on MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = TEST_VALUE1;
        const spy = spyOn(gridStub, 'onSizeChange').and.stub();
        component.sizeChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onSizeChange of grid service should not change on null MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(gridStub, 'onSizeChange').and.stub();
        component.sizeChange(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });

    it('onOpacityChange of grid service should change on MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = TEST_VALUE2;
        const spy = spyOn(gridStub, 'onOpacityChange').and.stub();
        component.opacityChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onOpacityChange of grid service should not change on null MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(gridStub, 'onOpacityChange').and.stub();
        component.opacityChange(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });

    it('drawGrid should call gridService drawLine', () => {
        const spy = spyOn(gridStub, 'drawLine').and.stub();
        component.drawGrid();
        expect(spy).toHaveBeenCalled();
    });

    it('cleanGrid should call clearCanvas', () => {
        const spy = spyOn(drawingStub, 'clearCanvas').and.stub();
        component.cleanGrid();
        expect(spy).toHaveBeenCalled();
    });
});
