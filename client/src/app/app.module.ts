import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LineAttributeComponent } from '@app/components/attribute-panel/line-attribute/line-attribute.component';
import { AppMaterialModule } from './app-material.module';
import { AppRoutingModule } from './app-routing.module';
import { AlertComponent } from './components/alert/alert.component';
import { AppComponent } from './components/app/app.component';
import { AerosolAttributeComponent } from './components/attribute-panel/aerosol-attribute/aerosol-attribute/aerosol-attribute.component';
import { AttributePanelComponent } from './components/attribute-panel/attribute-panel.component';
import { BucketAttributeComponent } from './components/attribute-panel/bucket-attribute/bucket-attribute.component';
import { ColorAttributeComponent } from './components/attribute-panel/color-attribute/color-attribute.component';
import { EllipseAttributeComponent } from './components/attribute-panel/ellipse-attribute/ellipse-attribute/ellipse-attribute.component';
import { EraserAttributeComponent } from './components/attribute-panel/eraser-attribute/eraser-attribute.component';
import { GridAttributeComponent } from './components/attribute-panel/grid-attribute/grid-attribute/grid-attribute.component';
import { PencilAttributeComponent } from './components/attribute-panel/pencil-attribute/pencil-attribute.component';
import { PipetteComponent } from './components/attribute-panel/pipette-attribute/pipette/pipette.component';
import { PolygonAttributeComponent } from './components/attribute-panel/polygon-attribute/polygon-attribute/polygon-attribute.component';
import { RectangleAttributeComponent } from './components/attribute-panel/rectangle-attribute/rectangle-attribute/rectangle-attribute.component';
import { SelectionEllipseAttributeComponent } from './components/attribute-panel/selection-ellipse-attribute/selection-ellipse-attribute.component';
import { SelectionLassoAttributeComponent } from './components/attribute-panel/selection-lasso-attribute/selection-lasso-attribute/selection-lasso-attribute.component';
import { SelectionRectangleAttributeComponent } from './components/attribute-panel/selection-rectangle-attribute/selection-rectangle-attribute.component';
import { TexteAttributeComponent } from './components/attribute-panel/texte-attribute/texte-attribute/texte-attribute.component';
import { CarousselComponent } from './components/caroussel/caroussel.component';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { ColorPickerModule } from './components/color-picker/color-picker.module';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { ExportComponent } from './components/export/export.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { ResizeDrawingComponent } from './components/resize-drawing/resize-drawing.component';
import { SaveDrawingServerComponent } from './components/save-drawing-server/save-drawing-server.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { EtampeAttributeComponent } from './components/attribute-panel/etampe-attribute/etampe-attribute/etampe-attribute.component';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        ResizeDrawingComponent,
        CarousselComponent,
        AttributePanelComponent,
        ColorAttributeComponent,
        PencilAttributeComponent,
        EraserAttributeComponent,
        ExportComponent,
        AlertComponent,
        LineAttributeComponent,
        RectangleAttributeComponent,
        EllipseAttributeComponent,
        SaveDrawingServerComponent,
        SelectionRectangleAttributeComponent,
        SelectionEllipseAttributeComponent,
        SelectionLassoAttributeComponent,
        PolygonAttributeComponent,
        AerosolAttributeComponent,
        PipetteComponent,
        BucketAttributeComponent,
        GridAttributeComponent,
        TexteAttributeComponent,
        EtampeAttributeComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        BrowserAnimationsModule,
        ColorPickerModule,
        AppMaterialModule,
        ReactiveFormsModule,
    ],
    providers: [],
    entryComponents: [ColorPickerComponent, AlertComponent, CarousselComponent],
    bootstrap: [AppComponent],
})
export class AppModule {}
