import { Vec2 } from '@app/classes/vec2';
export interface ResizeAttributes {
    x: number;
    y: number;
    startingX: number;
    startingY: number;
    width: number;
    height: number;
    startingWidth: number;
    startingHeight: number;
    selectionType: number;
    flippedX: boolean;
    flippedY: boolean;
    selectionPositions: Vec2[];
}
