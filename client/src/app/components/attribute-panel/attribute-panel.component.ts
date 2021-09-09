import { Component, ComponentFactoryResolver, Input, OnChanges, OnInit, SimpleChanges, ViewContainerRef } from '@angular/core';
import { TOOLS } from '@app/classes/mock-tools';
import { ToolBarInformation } from '@app/classes/tool-bar-information';
import { ColorAttributeComponent } from '@app/components/attribute-panel/color-attribute/color-attribute.component';
import { EraserAttributeComponent } from '@app/components/attribute-panel/eraser-attribute/eraser-attribute.component';
import { LineAttributeComponent } from '@app/components/attribute-panel/line-attribute/line-attribute.component';
import { PencilAttributeComponent } from '@app/components/attribute-panel/pencil-attribute/pencil-attribute.component';
import { AerosolAttributeComponent } from './aerosol-attribute/aerosol-attribute/aerosol-attribute.component';
import { BucketAttributeComponent } from './bucket-attribute/bucket-attribute.component';
import { EllipseAttributeComponent } from './ellipse-attribute/ellipse-attribute/ellipse-attribute.component';
import { GridAttributeComponent } from './grid-attribute/grid-attribute/grid-attribute.component';
import { PipetteComponent } from './pipette-attribute/pipette/pipette.component';
import { PolygonAttributeComponent } from './polygon-attribute/polygon-attribute/polygon-attribute.component';
import { RectangleAttributeComponent } from './rectangle-attribute/rectangle-attribute/rectangle-attribute.component';
import { SelectionEllipseAttributeComponent } from './selection-ellipse-attribute/selection-ellipse-attribute.component';
import { SelectionLassoAttributeComponent } from './selection-lasso-attribute/selection-lasso-attribute/selection-lasso-attribute.component';
import { SelectionRectangleAttributeComponent } from './selection-rectangle-attribute/selection-rectangle-attribute.component';
import { TexteAttributeComponent } from './texte-attribute/texte-attribute/texte-attribute.component';
import { EtampeAttributeComponent } from './etampe-attribute/etampe-attribute/etampe-attribute.component';

@Component({
    selector: 'app-attribute-panel',
    templateUrl: './attribute-panel.component.html',
    styleUrls: ['./attribute-panel.component.scss'],
})
export class AttributePanelComponent implements OnInit, OnChanges {
    @Input() currentTool: ToolBarInformation;

    constructor(private viewContainerRef: ViewContainerRef, private componentFactoryResolver: ComponentFactoryResolver) {
        this.currentTool = TOOLS[0];
    }

    ngOnInit(): void {
        this.changeView();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currentTool && !changes.currentTool.isFirstChange()) {
            this.changeView();
        }
    }

    loadColor(): void {
        const COLORCOMPONENT = this.componentFactoryResolver.resolveComponentFactory(ColorAttributeComponent);
        this.viewContainerRef.createComponent(COLORCOMPONENT);
    }

    changeView(): void {
        this.viewContainerRef.clear();
        const toolname = this.currentTool.name;
        switch (toolname) {
            case 'Crayon':
                this.loadColor();
                const PENCILCOMPONENT = this.componentFactoryResolver.resolveComponentFactory(PencilAttributeComponent);
                this.viewContainerRef.createComponent(PENCILCOMPONENT);
                break;
            case 'Efface':
                const ERASERCOMPONENT = this.componentFactoryResolver.resolveComponentFactory(EraserAttributeComponent);
                this.viewContainerRef.createComponent(ERASERCOMPONENT);
                break;
            case 'Rectangle':
                this.loadColor();
                const RECTANGLECOMPONENT = this.componentFactoryResolver.resolveComponentFactory(RectangleAttributeComponent);
                this.viewContainerRef.createComponent(RECTANGLECOMPONENT);
                break;
            case 'Ligne':
                this.loadColor();
                const LINECOMPONENT = this.componentFactoryResolver.resolveComponentFactory(LineAttributeComponent);
                this.viewContainerRef.createComponent(LINECOMPONENT);
                break;
            case 'Ellipse':
                this.loadColor();
                const ELLIPSECOMPONENT = this.componentFactoryResolver.resolveComponentFactory(EllipseAttributeComponent);
                this.viewContainerRef.createComponent(ELLIPSECOMPONENT);
                break;
            case 'SelectionRectangle':
                this.loadColor();
                const SELECTIONRECTANGLECOMPONENT = this.componentFactoryResolver.resolveComponentFactory(SelectionRectangleAttributeComponent);
                this.viewContainerRef.createComponent(SELECTIONRECTANGLECOMPONENT);
                break;
            case 'SelectionEllipse':
                this.loadColor();
                const SELECTIONELLIPSECOMPONENT = this.componentFactoryResolver.resolveComponentFactory(SelectionEllipseAttributeComponent);
                this.viewContainerRef.createComponent(SELECTIONELLIPSECOMPONENT);
                break;
            case 'SelectionLasso':
                this.loadColor();
                const SELECTIONLASSOCOMPONENT = this.componentFactoryResolver.resolveComponentFactory(SelectionLassoAttributeComponent);
                this.viewContainerRef.createComponent(SELECTIONLASSOCOMPONENT);
                break;
            case 'Polygone':
                this.loadColor();
                const SELECTIONPOLYGONCOMPONENT = this.componentFactoryResolver.resolveComponentFactory(PolygonAttributeComponent);
                this.viewContainerRef.createComponent(SELECTIONPOLYGONCOMPONENT);
                break;
            case 'Aerosol':
                this.loadColor();
                const AEROSOLCOMPONENT = this.componentFactoryResolver.resolveComponentFactory(AerosolAttributeComponent);
                this.viewContainerRef.createComponent(AEROSOLCOMPONENT);
                break;
            case 'Pipette':
                this.loadColor();
                const PIPETTECOMPONENT = this.componentFactoryResolver.resolveComponentFactory(PipetteComponent);
                this.viewContainerRef.createComponent(PIPETTECOMPONENT);
                break;
            case 'Sceau de peinture':
                this.loadColor();
                const BUCKETCOMPONENT = this.componentFactoryResolver.resolveComponentFactory(BucketAttributeComponent);
                this.viewContainerRef.createComponent(BUCKETCOMPONENT);
                break;
            case 'Grille':
                const GRIDCOMPONENT = this.componentFactoryResolver.resolveComponentFactory(GridAttributeComponent);
                this.viewContainerRef.createComponent(GRIDCOMPONENT);
                break;
            case 'Texte':
                this.loadColor();
                const TEXTECOMPONENT = this.componentFactoryResolver.resolveComponentFactory(TexteAttributeComponent);
                this.viewContainerRef.createComponent(TEXTECOMPONENT);
                break;
            case 'Etampe':
                const ETAMPECOMPONENT = this.componentFactoryResolver.resolveComponentFactory(EtampeAttributeComponent);
                this.viewContainerRef.createComponent(ETAMPECOMPONENT);
                break;
            default:
                const DEFAULTCOMPONENT = this.componentFactoryResolver.resolveComponentFactory(PencilAttributeComponent);
                this.viewContainerRef.createComponent(DEFAULTCOMPONENT);
                break;
        }
    }
}
