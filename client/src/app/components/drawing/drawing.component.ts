import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AlertComponent } from '@app/components/alert/alert.component';
import { SaveDrawingServerComponent } from '@app/components/save-drawing-server/save-drawing-server.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { MagnetismService } from '@app/services/magnetism/magnetism.service';
import { ToolMessengerService } from '@app/services/tool-messenger-service/tool-messenger.service';
import { AerosolService } from '@app/services/tools/aerosol.service';
import { BucketService } from '@app/services/tools/bucket.service';
import { EllipseService } from '@app/services/tools/ellipse.service';
import { EraserService } from '@app/services/tools/eraser.service';
import { EtampeService } from '@app/services/tools/etampe.service';
import { LineService } from '@app/services/tools/line.service';
import { PencilService } from '@app/services/tools/pencil.service';
import { PipetteService } from '@app/services/tools/pipette.service';
import { PolygonService } from '@app/services/tools/polygon.service';
import { RectangleService } from '@app/services/tools/rectangle.service';
import { SelectionEllipseService } from '@app/services/tools/selection-ellipse.service';
import { SelectionLassoService } from '@app/services/tools/selection-lasso.service';
import { SelectionRectangleService } from '@app/services/tools/selection-rectangle.service';
import { TexteService } from '@app/services/tools/texte.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import * as drawingConstants from './drawing-constants';

export const DEFAULT_WIDTH = 1000;
export const DEFAULT_HEIGHT = 800;

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    // On utilise ce canvas pour dessiner sans affecter le dessin final
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('selectionCanvas', { static: false }) selectionCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) gridCanvas: ElementRef<HTMLCanvasElement>;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private selectionCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    private canvasSize: Vec2;
    readonly testHeight: number = 800;
    readonly testWidth: number = 800;

    @Input() resizing: boolean;

    @Input() set resizeSize(dimensions: number[]) {
        if (this.baseCanvas) {
            this.drawingService.resizeExistingCanvas(dimensions);
        } else {
            this.canvasSize = { x: dimensions[0], y: dimensions[1] };
        }
    }

    tools: Tool[];
    currentTool: Tool;

    constructor(
        private drawingService: DrawingService,
        private toolMessengerService: ToolMessengerService,
        private undoRedoService: UndoRedoService,
        pencilService: PencilService,
        eraserService: EraserService,
        ellipseService: EllipseService,
        rectangleService: RectangleService,
        lineService: LineService,
        polygonService: PolygonService,
        selectionRectangleService: SelectionRectangleService,
        selectionEllipseService: SelectionEllipseService,
        texteService: TexteService,
        selectionLassoService: SelectionLassoService,
        aerosolService: AerosolService,
        pipetteService: PipetteService,
        bucketService: BucketService,
        private magnetismService: MagnetismService,
        private gridService: GridService,
        etampeService: EtampeService,
        public dialog: MatDialog,
    ) {
        this.toolMessengerService.receiveTool().subscribe((id: number) => this.onToolChange(id));
        this.tools = [
            pencilService, //0
            eraserService, //1
            lineService, //2
            rectangleService, //3
            ellipseService, //4
            selectionRectangleService, //5
            selectionEllipseService, //6
            selectionLassoService, //7
            polygonService, //8
            aerosolService, //9
            pipetteService, //10
            bucketService, //11
            gridService, //12
            texteService, //13
            etampeService, //14
        ];
        this.currentTool = this.tools[0];
    }

    // Fun
    onToolChange(id: number): void {
        this.currentTool.onDeSelect();
        this.currentTool = this.tools[id];
        this.currentTool.onSelect();
    }

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.selectionCtx = this.selectionCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.selectionCtx = this.selectionCtx;
        this.drawingService.gridCtx = this.gridCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;
        this.drawingService.selectionCanvas = this.selectionCanvas.nativeElement;
        this.drawingService.clipboardCanvas = document.createElement('canvas');
        this.drawingService.clipboardCtx = this.drawingService.clipboardCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.printCorrectDrawing();
        if (this.drawingService.carouselOpened) {
            if (!this.drawingService.firstDrawing) {
                const dialogRef = this.dialog.open(AlertComponent);
                dialogRef.afterClosed().subscribe((result: string) => {
                    if (result === 'true') {
                        this.drawingService.printCarouselImage();
                        this.drawingService.carouselOpened = false;
                        this.drawingService.saveDrawing();
                        this.drawingService.convertB64ToImage();
                    }
                });
            } else {
                this.drawingService.printCarouselImage();
                this.drawingService.carouselOpened = false;
                this.drawingService.saveDrawing();
                this.drawingService.convertB64ToImage();
            }
        }

        this.undoRedoService.saveCurrentState(
            this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height),
        );
    }

    openAlert(): void {
        if (this.dialog.openDialogs.length === 0) {
            const dialogRef = this.dialog.open(AlertComponent);
            // tslint:disable-next-line: deprecation
            dialogRef.afterClosed().subscribe((result: string) => {
                if (result === 'true') {
                    this.drawingService.createNewDrawing();
                }
            });
        }
    }

    // @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (!this.resizing) {
            this.currentTool.onMouseMove(event);
        }
    }

    // @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if (!this.resizing) {
            this.currentTool.onMouseDown(event);
        }
    }

    // @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.currentTool.onMouseUp(event);
        this.drawingService.saveDrawing();
        this.drawingService.convertB64ToImage();
    }

    // @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent): void {
        if (!this.resizing) {
            this.currentTool.onMouseLeave(event);
        }
    }

    // @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        this.currentTool.onMouseEnter(event);
    }

    @HostListener('dblclick', ['$event'])
    onDoubleClick(event: MouseEvent): void {
        this.currentTool.onDoubleClick(event);
    }

    @HostListener('wheel', ['$event'])
    onWheel(event: WheelEvent): void {
        this.currentTool.onWheel(event);
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        this.currentTool.onClick(event);
    }

    // tslint:disable-next-line: cyclomatic-complexity
    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'o':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.openAlert();
                }
                break;
            case 'z':
                if (event.ctrlKey) {
                    this.undoRedoService.undo();
                }
                break;
            case 'Z':
                if (event.ctrlKey && event.shiftKey) {
                    this.undoRedoService.redo();
                }
                break;
            case 'c':
                if (event.ctrlKey) {
                    this.currentTool.onKeyDown(event);
                    break;
                } else {
                    this.onToolChange(0);
                    this.toolMessengerService.sendTool(0);
                    break;
                }
            case 'v':
                if (event.ctrlKey) {
                    this.currentTool.onKeyDown(event);
                    break;
                } else {
                    this.onToolChange(drawingConstants.TOOL_NUMBER_7);
                    this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_7);
                    break;
                }
            case 'e':
                this.onToolChange(drawingConstants.TOOL_NUMBER_1);
                this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_1);
                break;
            case 'l':
                this.onToolChange(drawingConstants.TOOL_NUMBER_2);
                this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_2);
                break;
            case '1':
                this.onToolChange(drawingConstants.TOOL_NUMBER_3);
                this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_3);
                break;
            case '2':
                this.onToolChange(drawingConstants.TOOL_NUMBER_4);
                this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_4);
                break;
            case '3':
                this.onToolChange(drawingConstants.TOOL_NUMBER_8);
                this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_8);
                break;
            case 'r':
                this.onToolChange(drawingConstants.TOOL_NUMBER_5);
                this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_5);
                break;
            case 's':
                if (event.ctrlKey) {
                    if (this.dialog.openDialogs.length === 0) {
                        event.preventDefault();
                        this.dialog.open(SaveDrawingServerComponent);
                    }
                }
                this.onToolChange(drawingConstants.TOOL_NUMBER_6);
                this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_6);
                break;
            case 'a':
                if (event.ctrlKey) {
                    this.currentTool.onKeyDown(event);
                } else {
                    this.onToolChange(drawingConstants.TOOL_NUMBER_9);
                    this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_9);
                }
                break;
            case 'g':
                this.onToolChange(drawingConstants.TOOL_NUMBER_12);
                this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_12);
                break;
            case 'i':
                this.onToolChange(drawingConstants.TOOL_NUMBER_10);
                this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_10);
                break;
            case 'b':
                this.onToolChange(drawingConstants.TOOL_NUMBER_11);
                this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_11);
                break;
            case 't':
                this.onToolChange(drawingConstants.TOOL_NUMBER_13);
                this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_13);
                break;
            case 'd':
                this.onToolChange(drawingConstants.TOOL_NUMBER_14);
                this.toolMessengerService.sendTool(drawingConstants.TOOL_NUMBER_14);
                break;
            case '-':
                this.gridService.reduceSize();
                break;
            case '+':
                this.gridService.increaseSize();
                break;
            case '=':
                this.gridService.increaseSize();
                break;
            case 'm':
                this.magnetismService.isAnchored = !this.magnetismService.isAnchored;
                break;
            default:
                this.currentTool.onKeyDown(event);
        }
    }

    @HostListener('window:keyup', ['$event'])
    OnKeyUp(event: KeyboardEvent): void {
        this.currentTool.onKeyUp(event);
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    get widthSelection(): number {
        return window.innerWidth - drawingConstants.SIDEBAR_SIZE - drawingConstants.SCROLL_SIZE;
    }

    get heightSelection(): number {
        return window.innerHeight - drawingConstants.SCROLL_SIZE;
    }
}
