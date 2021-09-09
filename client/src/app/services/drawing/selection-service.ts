import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/mouse-button';
import { ResizeAttributes } from '@app/classes/resize-attributes';
import { Vec2 } from '@app/classes/vec2';
import { ClipboardService } from '@app/services/drawing/clipboard.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionDrawService } from '@app/services/drawing/selection-draw-service';
import { MagnetismService } from '@app/services/magnetism/magnetism.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import * as resizeConstants from './resize-constants';

@Injectable({
    providedIn: 'root',
})
export class SelectionService {
    private resizeAttributes: ResizeAttributes;

    private intervalContinuous: number;
    private continuousWaiting: boolean;
    private continuousDrawing: boolean;

    private arrowLeftPressed: boolean;
    private arrowUpPressed: boolean;
    private arrowRightPressed: boolean;
    private arrowDownPressed: boolean;

    shiftKeyPressed: boolean;

    currentResize: number;

    private mouseDown: boolean;
    private mouseDownCoord: Vec2;

    constructor(
        private drawingService: DrawingService,
        private selectionDrawService: SelectionDrawService,
        private clipboardService: ClipboardService,
        private undoRedoService: UndoRedoService,
        private magnetismService: MagnetismService,
    ) {
        this.continuousWaiting = true;
        this.continuousDrawing = false;
        this.currentResize = -1;
    }

    imageClicked(position: Vec2): boolean {
        return this.drawingService.selectionCtx.isPointInPath(position.x, position.y);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = { x: event.offsetX, y: event.offsetY };
            this.currentResize = this.cornerClicked(this.mouseDownCoord);
            if (this.currentResize !== -1) {
                this.magnetismService.lastResizeCorner = this.currentResize;
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.mouseDown = false;
    }

    cornerClicked(position: Vec2): number {
        let distanceCorner: Vec2;
        distanceCorner = { x: 0, y: 0 };
        distanceCorner.x = position.x - this.resizeAttributes.x;
        distanceCorner.y = position.y - this.resizeAttributes.y;
        if (distanceCorner.x * distanceCorner.x + distanceCorner.y * distanceCorner.y <= 25) {
            return 0;
        }
        // topMiddle
        distanceCorner.x = position.x - (this.resizeAttributes.x + this.resizeAttributes.width / 2);
        distanceCorner.y = position.y - this.resizeAttributes.y;
        if (distanceCorner.x * distanceCorner.x + distanceCorner.y * distanceCorner.y <= 25) {
            return 1;
        }
        // topRight
        distanceCorner.x = position.x - (this.resizeAttributes.x + this.resizeAttributes.width);
        distanceCorner.y = position.y - this.resizeAttributes.y;
        if (distanceCorner.x * distanceCorner.x + distanceCorner.y * distanceCorner.y <= 25) {
            return 2;
        }
        // leftMiddle
        distanceCorner.x = position.x - this.resizeAttributes.x;
        distanceCorner.y = position.y - (this.resizeAttributes.y + this.resizeAttributes.height / 2);
        if (distanceCorner.x * distanceCorner.x + distanceCorner.y * distanceCorner.y <= 25) {
            return 3;
        }
        // rightMiddle
        distanceCorner.x = position.x - (this.resizeAttributes.x + this.resizeAttributes.width);
        distanceCorner.y = position.y - (this.resizeAttributes.y + this.resizeAttributes.height / 2);
        if (distanceCorner.x * distanceCorner.x + distanceCorner.y * distanceCorner.y <= 25) {
            return 4;
        }
        // bottomLeft
        distanceCorner.x = position.x - this.resizeAttributes.x;
        distanceCorner.y = position.y - (this.resizeAttributes.y + this.resizeAttributes.height);
        if (distanceCorner.x * distanceCorner.x + distanceCorner.y * distanceCorner.y <= 25) {
            return 5;
        }
        // bottomMiddle
        distanceCorner.x = position.x - (this.resizeAttributes.x + this.resizeAttributes.width / 2);
        distanceCorner.y = position.y - (this.resizeAttributes.y + this.resizeAttributes.height);
        if (distanceCorner.x * distanceCorner.x + distanceCorner.y * distanceCorner.y <= 25) {
            return 6;
        }
        // bottomRight
        distanceCorner.x = position.x - (this.resizeAttributes.x + this.resizeAttributes.width);
        distanceCorner.y = position.y - (this.resizeAttributes.y + this.resizeAttributes.height);
        if (distanceCorner.x * distanceCorner.x + distanceCorner.y * distanceCorner.y <= 25) {
            return 7;
        }
        return -1;
    }

    // tslint:disable-next-line: cyclomatic-complexity
    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            if (this.currentResize > -1) {
                const mousePosition = { x: event.offsetX, y: event.offsetY };
                const heightBeforeResize = this.resizeAttributes.height;
                const widthBeforeResize = this.resizeAttributes.width;
                switch (this.currentResize) {
                    case 0:
                        if (this.shiftKeyPressed) {
                            this.resizeAttributes.height = this.resizeAttributes.x + this.resizeAttributes.height - mousePosition.x;
                            this.resizeAttributes.width = this.resizeAttributes.x + this.resizeAttributes.width - mousePosition.x;
                            this.resizeAttributes.y = this.resizeAttributes.y - (this.resizeAttributes.x - mousePosition.x);
                            this.resizeAttributes.x = mousePosition.x;
                        } else {
                            this.resizeAttributes.height = this.resizeAttributes.y + this.resizeAttributes.height - mousePosition.y;
                            this.resizeAttributes.width = this.resizeAttributes.x + this.resizeAttributes.width - mousePosition.x;
                            this.resizeAttributes.x = mousePosition.x;
                            this.resizeAttributes.y = mousePosition.y;
                        }
                        break;
                    case 1:
                        this.resizeAttributes.height = this.resizeAttributes.y + this.resizeAttributes.height - mousePosition.y;
                        this.resizeAttributes.y = mousePosition.y;
                        break;
                    case 2:
                        if (this.shiftKeyPressed) {
                            this.resizeAttributes.height += mousePosition.x - this.resizeAttributes.x - this.resizeAttributes.width;
                            this.resizeAttributes.y -= mousePosition.x - this.resizeAttributes.x - this.resizeAttributes.width;
                            this.resizeAttributes.width = mousePosition.x - this.resizeAttributes.x;
                        } else {
                            this.resizeAttributes.height = this.resizeAttributes.y + this.resizeAttributes.height - mousePosition.y;
                            this.resizeAttributes.width = mousePosition.x - this.resizeAttributes.x;
                            this.resizeAttributes.y = mousePosition.y;
                        }
                        break;
                    case 3:
                        this.resizeAttributes.width = this.resizeAttributes.x + this.resizeAttributes.width - mousePosition.x;
                        this.resizeAttributes.x = mousePosition.x;
                        break;
                    case 4:
                        this.resizeAttributes.width = mousePosition.x - this.resizeAttributes.x;
                        break;
                    case 5:
                        if (this.shiftKeyPressed) {
                            this.resizeAttributes.height -= mousePosition.x - this.resizeAttributes.x;
                            this.resizeAttributes.width = this.resizeAttributes.x + this.resizeAttributes.width - mousePosition.x;
                            this.resizeAttributes.x = mousePosition.x;
                        } else {
                            this.resizeAttributes.height = mousePosition.y - this.resizeAttributes.y;
                            this.resizeAttributes.width = this.resizeAttributes.x + this.resizeAttributes.width - mousePosition.x;
                            this.resizeAttributes.x = mousePosition.x;
                        }
                        break;
                    case 6:
                        // if(this.shiftKeyPressed)
                        this.resizeAttributes.height = mousePosition.y - this.resizeAttributes.y;
                        break;
                    case 7:
                        if (this.shiftKeyPressed) {
                            this.resizeAttributes.height += mousePosition.x - this.resizeAttributes.x - this.resizeAttributes.width;
                            this.resizeAttributes.width = mousePosition.x - this.resizeAttributes.x;
                        } else {
                            this.resizeAttributes.height = mousePosition.y - this.resizeAttributes.y;
                            this.resizeAttributes.width = mousePosition.x - this.resizeAttributes.x;
                        }

                        break;
                    default:
                        break;
                }
                this.checkSelectionFlipped(widthBeforeResize, heightBeforeResize);
                this.selectionDrawService.drawSelectionCanvas(this.resizeAttributes);
            } else if (this.imageClicked(this.mouseDownCoord)) {
                const offsetX = event.offsetX - this.mouseDownCoord.x;
                const offsetY = event.offsetY - this.mouseDownCoord.y;
                if (this.checkCanvasLimits({ x: offsetX, y: offsetY })) {
                    if (this.magnetismService.isAnchored) {
                        this.magnetismService.tempXOffset += offsetX;
                        this.magnetismService.tempYOffset += offsetY;
                        this.magnetismService.identifyResizeCorner(this.resizeAttributes);
                        this.magnetismService.identifyTopLeftPosition(this.resizeAttributes);
                        this.magnetismService.identifyAllPositions(this.resizeAttributes);
                        const offsets = this.magnetismService.calculateNewPosition();
                        this.resizeAttributes.x += offsets.x;
                        this.resizeAttributes.y += offsets.y;
                    } else {
                        this.resizeAttributes.x += offsetX;
                        this.resizeAttributes.y += offsetY;
                    }
                    this.mouseDownCoord = { x: event.offsetX, y: event.offsetY };
                    this.selectionDrawService.drawSelectionCanvas(this.resizeAttributes);
                }
            }
        }
    }

    private checkSelectionFlipped(widthBefore: number, heightBefore: number): void {
        if (Math.sign(widthBefore) !== Math.sign(this.resizeAttributes.width) && Math.sign(this.resizeAttributes.width) !== 0)
            this.resizeAttributes.flippedX = !this.resizeAttributes.flippedX;
        if (Math.sign(heightBefore) !== Math.sign(this.resizeAttributes.height) && Math.sign(this.resizeAttributes.height) !== 0)
            this.resizeAttributes.flippedY = !this.resizeAttributes.flippedY;
    }

    onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'Escape':
                this.selectionDrawService.drawBaseCanvas(this.resizeAttributes);
                this.drawingService.imageSelected = false;
                this.undoRedoService.saveCurrentState(
                    this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.baseCtx.canvas.height),
                );
                this.undoRedoService.toolIsUsed = false;
                this.drawingService.imageSelected = false;
                break;
            case 'c':
                if (event.ctrlKey) {
                    this.clipboardService.copySelection(this.resizeAttributes);
                    break;
                }
            case 'v':
                if (event.ctrlKey) {
                    const newResizeAttributes = this.clipboardService.pasteSelection(this.resizeAttributes);
                    this.resizeAttributes = {
                        x: newResizeAttributes.x,
                        y: newResizeAttributes.y,
                        startingX: newResizeAttributes.startingX,
                        startingY: newResizeAttributes.startingY,
                        width: newResizeAttributes.width,
                        height: newResizeAttributes.height,
                        startingWidth: newResizeAttributes.startingWidth,
                        startingHeight: newResizeAttributes.startingHeight,
                        selectionType: newResizeAttributes.selectionType,
                        flippedX: newResizeAttributes.flippedX,
                        flippedY: newResizeAttributes.flippedY,
                        selectionPositions: newResizeAttributes.selectionPositions,
                    };
                }
                break;
            case 'x':
                if (event.ctrlKey) {
                    this.clipboardService.cutSelection(this.resizeAttributes);
                    break;
                }
            case 'Delete':
                this.clipboardService.deleteSelection(this.resizeAttributes);
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'ArrowRight':
            case 'ArrowDown':
                this.moveArrows(event);
                if (this.continuousDrawing && this.continuousWaiting) {
                    this.continuousWaiting = false;
                    clearInterval(this.intervalContinuous);
                    this.intervalContinuous = window.setInterval(() => {
                        this.drawContinuous();
                    }, resizeConstants.arrowDrawTime);
                }
                break;
            default:
                break;
        }
    }

    confirmSelection(): void {
        this.selectionDrawService.drawBaseCanvas(this.resizeAttributes);
        clearInterval(this.intervalContinuous);
        this.drawingService.imageSelected = false;
    }

    // tslint:disable-next-line: cyclomatic-complexity
    private moveArrows(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowLeft':
                if (this.checkCanvasLimits({ x: -resizeConstants.arrowMove, y: 0 }) && !this.arrowLeftPressed) {
                    if (this.magnetismService.isAnchored) {
                        this.resizeAttributes = this.magnetismService.moveBox(this.resizeAttributes, 1);
                        this.selectionDrawService.drawSelectionCanvas(this.resizeAttributes);
                    } else {
                        this.resizeAttributes.x -= resizeConstants.arrowMove;
                        this.arrowLeftPressed = true;
                        this.arrowTimeout();
                    }
                }
                break;
            case 'ArrowUp':
                if (this.checkCanvasLimits({ x: 0, y: -resizeConstants.arrowMove }) && !this.arrowUpPressed) {
                    if (this.magnetismService.isAnchored) {
                        this.resizeAttributes = this.magnetismService.moveBox(this.resizeAttributes, 3);
                        this.selectionDrawService.drawSelectionCanvas(this.resizeAttributes);
                    } else {
                        this.resizeAttributes.y -= resizeConstants.arrowMove;
                        this.arrowUpPressed = true;
                        this.arrowTimeout();
                    }
                }
                break;
            case 'ArrowRight':
                if (this.checkCanvasLimits({ x: resizeConstants.arrowMove, y: 0 }) && !this.arrowRightPressed) {
                    if (this.magnetismService.isAnchored) {
                        this.resizeAttributes = this.magnetismService.moveBox(this.resizeAttributes, 0);
                        this.selectionDrawService.drawSelectionCanvas(this.resizeAttributes);
                    } else {
                        this.resizeAttributes.x += resizeConstants.arrowMove;
                        this.arrowRightPressed = true;
                        this.arrowTimeout();
                    }
                }
                break;
            case 'ArrowDown':
                if (this.checkCanvasLimits({ x: 0, y: resizeConstants.arrowMove }) && !this.arrowDownPressed) {
                    if (this.magnetismService.isAnchored) {
                        this.resizeAttributes = this.magnetismService.moveBox(this.resizeAttributes, 2);
                        this.selectionDrawService.drawSelectionCanvas(this.resizeAttributes);
                    } else {
                        this.resizeAttributes.y += resizeConstants.arrowMove;
                        this.arrowDownPressed = true;
                        this.arrowTimeout();
                    }
                }
                break;
            default:
                break;
        }
    }

    private arrowTimeout(): void {
        window.setTimeout(() => {
            this.continuousDrawing = true;
        }, resizeConstants.arrowDelayTime);
        this.selectionDrawService.drawSelectionCanvas(this.resizeAttributes);
    }

    private drawContinuous(): void {
        if (this.checkCanvasLimits({ x: -resizeConstants.arrowMove, y: 0 }) && this.arrowLeftPressed) {
            this.resizeAttributes.x -= resizeConstants.arrowMove;
        }
        if (this.checkCanvasLimits({ x: 0, y: -resizeConstants.arrowMove }) && this.arrowUpPressed) {
            this.resizeAttributes.y -= resizeConstants.arrowMove;
        }
        if (this.checkCanvasLimits({ x: resizeConstants.arrowMove, y: 0 }) && this.arrowRightPressed) {
            this.resizeAttributes.x += resizeConstants.arrowMove;
        }
        if (this.checkCanvasLimits({ x: 0, y: resizeConstants.arrowMove }) && this.arrowDownPressed) {
            this.resizeAttributes.y += resizeConstants.arrowMove;
        }
        if (!this.arrowLeftPressed && !this.arrowUpPressed && !this.arrowRightPressed && !this.arrowDownPressed) {
            this.continuousDrawing = false;
            this.continuousWaiting = true;
            clearInterval(this.intervalContinuous);
            return;
        }
        this.selectionDrawService.drawSelectionCanvas(this.resizeAttributes);
    }

    onKeyUp(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowLeft':
                this.arrowLeftPressed = false;
                break;
            case 'ArrowUp':
                this.arrowUpPressed = false;
                break;
            case 'ArrowRight':
                this.arrowRightPressed = false;
                break;
            case 'ArrowDown':
                this.arrowDownPressed = false;
                break;
            default:
                break;
        }
    }

    private checkCanvasLimits(offset: Vec2): boolean {
        if (this.resizeAttributes.x + offset.x < 0) return false;
        else if (this.resizeAttributes.x + this.resizeAttributes.width + offset.x > this.drawingService.selectionCanvas.width) return false;
        else if (this.resizeAttributes.y + offset.y < 0) return false;
        else if (this.resizeAttributes.y + this.resizeAttributes.height + offset.y > this.drawingService.selectionCanvas.height) return false;
        else return true;
    }

    newSelection(mouseDown: Vec2, offset: Vec2, type: number, lassoPoints: Vec2[]): void {
        this.resizeAttributes = {
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
        this.drawingService.imageSelected = true;
        this.selectionDrawService.drawSelectionCanvas(this.resizeAttributes);
    }
}
