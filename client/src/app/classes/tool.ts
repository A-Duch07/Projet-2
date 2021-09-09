import { DrawingService } from '@app/services/drawing/drawing.service';
import { Vec2 } from './vec2';

// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty
export abstract class Tool {
    constructor(protected drawingService: DrawingService) {}
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;

    onSelect(): void {}

    onDeSelect(): void {}

    onMouseDown(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onKeyDown(event: KeyboardEvent): void {}

    onKeyUp(event: KeyboardEvent): void {}

    onMouseLeave(event: MouseEvent): void {}

    onMouseEnter(event: MouseEvent): void {}

    onDoubleClick(event: MouseEvent): void {}

    onWheel(event: WheelEvent): void {}

    onClick(event: MouseEvent): void {}

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }
}
