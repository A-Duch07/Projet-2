import { SimpleChange, SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TOOLS } from '@app/classes/mock-tools';
import { ToolBarInformation } from '@app/classes/tool-bar-information';
import { AerosolAttributeComponent } from './aerosol-attribute/aerosol-attribute/aerosol-attribute.component';
import { AttributePanelComponent } from './attribute-panel.component';
import { BucketAttributeComponent } from './bucket-attribute/bucket-attribute.component';
import { ColorAttributeComponent } from './color-attribute/color-attribute.component';
import { EllipseAttributeComponent } from './ellipse-attribute/ellipse-attribute/ellipse-attribute.component';
import { EraserAttributeComponent } from './eraser-attribute/eraser-attribute.component';
import { LineAttributeComponent } from './line-attribute/line-attribute.component';
import { PencilAttributeComponent } from './pencil-attribute/pencil-attribute.component';
import { PipetteComponent } from './pipette-attribute/pipette/pipette.component';
import { PolygonAttributeComponent } from './polygon-attribute/polygon-attribute/polygon-attribute.component';
import { RectangleAttributeComponent } from './rectangle-attribute/rectangle-attribute/rectangle-attribute.component';
import { SelectionEllipseAttributeComponent } from './selection-ellipse-attribute/selection-ellipse-attribute.component';
import { SelectionRectangleAttributeComponent } from './selection-rectangle-attribute/selection-rectangle-attribute.component';

// tslint:disable: no-magic-numbers

describe('AttributePanelComponent', () => {
    let component: AttributePanelComponent;
    let fixture: ComponentFixture<AttributePanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [AttributePanelComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should call changeView', () => {
        const spy = spyOn(component, 'changeView');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it(' should not call changeView method on ngChanges of currentTool if it is the first change', () => {
        const changes: SimpleChanges = { currentTool: new SimpleChange(TOOLS[1], TOOLS[0], true) };
        const spy = spyOn(component, 'changeView');
        component.ngOnChanges(changes);
        expect(spy).not.toHaveBeenCalled();
    });

    it(' should call changeView method on ngChanges of currentTool if it is not the first change', () => {
        const changes: SimpleChanges = { currentTool: new SimpleChange(TOOLS[1], TOOLS[0], false) };
        const spy = spyOn(component, 'changeView');
        component.ngOnChanges(changes);
        expect(spy).toHaveBeenCalled();
    });

    it('should create ColorAttributeComponent', () => {
        component.loadColor();
        expect(ColorAttributeComponent).toBeTruthy();
    });

    it('should create pencil attribute component', () => {
        component.currentTool = TOOLS[0];
        component.changeView();
        expect(PencilAttributeComponent).toBeTruthy();
    });

    it('should create eraser attribute component', () => {
        component.currentTool = TOOLS[1];
        component.changeView();
        expect(EraserAttributeComponent).toBeTruthy();
    });
    it('should create line attribute component', () => {
        component.currentTool = TOOLS[2];
        component.changeView();
        expect(LineAttributeComponent).toBeTruthy();
    });
    it('should create rectangle attribute component', () => {
        component.currentTool = TOOLS[3];
        component.changeView();
        expect(RectangleAttributeComponent).toBeTruthy();
    });

    it('should create ellipse attribute component', () => {
        component.currentTool = TOOLS[4];
        component.changeView();
        expect(EllipseAttributeComponent).toBeTruthy();
    });

    it('should create selection ellipse attribute component', () => {
        component.currentTool = TOOLS[5];
        component.changeView();
        expect(SelectionEllipseAttributeComponent).toBeTruthy();
    });

    it('should create selection rectangle attribute component', () => {
        component.currentTool = TOOLS[6];
        component.changeView();
        expect(SelectionRectangleAttributeComponent).toBeTruthy();
    });

    it('should create polygon attribute component', () => {
        component.currentTool = TOOLS[7];
        component.changeView();
        expect(PolygonAttributeComponent).toBeTruthy();
    });

    it('should create aerosol attribute component', () => {
        component.currentTool = TOOLS[8];
        component.changeView();
        expect(AerosolAttributeComponent).toBeTruthy();
    });

    it('should create pipette attribute component', () => {
        component.currentTool = TOOLS[9];
        component.changeView();
        expect(PipetteComponent).toBeTruthy();
    });

    it('should create bucket attribute component', () => {
        component.currentTool = TOOLS[10];
        component.changeView();
        expect(BucketAttributeComponent).toBeTruthy();
    });

    it('should create pencil attribute component on default', () => {
        const base: ToolBarInformation = { id: 0, name: 'default', src: '', shortcut: '' };
        component.currentTool = base;
        component.changeView();
        expect(PencilAttributeComponent).toBeTruthy();
    });

    
});
