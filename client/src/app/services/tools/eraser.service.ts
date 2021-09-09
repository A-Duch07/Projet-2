import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import * as eraserConstants from './tools-constants/eraser-service-constants';

export enum MouseButton {
    Left = 1,
    Right = 2,
    Middle = 4,
    Back = 8,
    Forward = 16,
}

@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    private pathData: Vec2[];
    private initialCursorPosition: Vec2;
    private eraserCursorDiv: HTMLElement;

    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        super(drawingService);
        this.clearPath();
    }

    private createEraserCursor(): void {
        // Create html div
        this.eraserCursorDiv = document.createElement('div');
        this.drawingService.previewCanvas.insertAdjacentElement('afterend', this.eraserCursorDiv);

        // Changes styles
        this.drawingService.previewCanvas.style.cursor = 'none';
        this.drawingService.canvas.style.cursor = 'none';
        this.eraserCursorDiv.style.width = this.drawingService.baseCtx.lineWidth + 'px';
        this.eraserCursorDiv.style.height = this.eraserCursorDiv.style.width;
        this.eraserCursorDiv.style.border = '1px solid #000000';
        this.eraserCursorDiv.style.backgroundColor = 'white';
        this.eraserCursorDiv.style.position = 'absolute';
        this.eraserCursorDiv.style.cursor = 'none';
        this.initialCursorPosition = { x: this.eraserCursorDiv.getBoundingClientRect().x, y: this.eraserCursorDiv.getBoundingClientRect().y };
    }

    private deleteEraserCursor(): void {
        if (this.eraserCursorDiv) this.eraserCursorDiv.remove();
    }

    onSelect(): void {
        // Met la couleur a blanc pour l'outil d'efface;
        this.drawingService.baseCtx.lineWidth = 15;
        this.drawingService.previewCtx.lineWidth = this.drawingService.baseCtx.lineWidth;
        this.drawingService.baseCtx.strokeStyle = 'white';
        this.drawingService.previewCtx.strokeStyle = 'white';
        this.createEraserCursor();
    }

    onDeSelect(): void {
        this.deleteEraserCursor();
        this.drawingService.previewCanvas.style.cursor = 'crosshair';
        this.drawingService.canvas.style.cursor = 'crosshair';
    }

    onMouseDown(event: MouseEvent): void {
        // Vérifie que le bouton gauche de la souris est enfoncé et modifie mouseDown en fonction
        this.mouseDown = event.buttons === MouseButton.Left;

        if (this.mouseDown) {
            // Remettre à zero le vector pathData
            this.clearPath();
            this.undoRedoService.toolIsUsed = true;
            // Enregistre les coordonnées de l'appui du bouton de la souris
            this.mouseDownCoord = this.getPositionFromMouse(event);
            // Rajoute les coordonnées au vecteur du chemin
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            // Enregistre la dernière position de la souris et l'ajoute au chemin
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            // Dessine sur le canvas de base l'ensemble des points dans le chemin
            this.drawLine(this.drawingService.baseCtx, this.pathData);
            this.undoRedoService.toolIsUsed = false;
            this.undoRedoService.saveCurrentState(
                this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.baseCtx.canvas.height),
            );
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.eraserCursorDiv && this.initialCursorPosition) {
            const top: number = event.pageY - this.initialCursorPosition.y;
            const left: number = event.pageX - this.initialCursorPosition.x;
            this.eraserCursorDiv.style.left = left + 'px';
            this.eraserCursorDiv.style.top = top + 'px';
        }

        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.pathData);
        }
    }

    onMouseLeave(event: MouseEvent): void {
        this.onMouseUp(event);
        // this.deleteEraserCursor();
    }

    onMouseEnter(event: MouseEvent): void {
        // Lorsque la souris rentre dans le canvas, il faut faire sensiblement le meme comportement que la methode onMouseDown, soit de
        // dessiner lorsque la souris est appuye et slmt quand la souris est appuyer. Si elle ne l'est pas, alors il ne faut pas dessiner
        this.onMouseDown(event);
        // this.createEraserCursor();
    }

    onSizeChange(size: number): void {
        if (size >= eraserConstants.MIN_WIDTH && size <= eraserConstants.MAX_WIDTH) {
            this.drawingService.baseCtx.lineWidth = size;
            this.drawingService.previewCtx.lineWidth = size;
        }
    }

    private drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        ctx.lineCap = 'round';
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
