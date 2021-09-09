import { Injectable } from '@angular/core';
import { ResizeAttributes } from '@app/classes/resize-attributes';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import * as magnetismConstants from './magnetism-constants';

@Injectable({
    providedIn: 'root',
})
export class MagnetismService extends Tool {
    anchor: number;
    isAnchored: boolean;
    lastResizeCorner: number;
    tempXOffset: number;
    lastTempXOffset: number;
    lastTempYOffset: number;
    tempYOffset: number;
    positions: Vec2[];

    constructor(protected drawingService: DrawingService, private gridService: GridService) {
        super(drawingService);
        this.anchor = 0;
        this.isAnchored = false;
        this.lastResizeCorner = -1;
        this.tempXOffset = 0;
        this.tempYOffset = 0;
        this.lastTempXOffset = 0;
        this.lastTempYOffset = 0;
        this.positions = [];
        for (let i = 0; i < 9; i++) {
            this.positions[i] = { x: 0, y: 0 };
        }
    }

    calculateNewPosition(): Vec2 {
        const anchorPoint: Vec2 = this.positions[this.anchor];
        const xModulo = anchorPoint.x % this.gridService.squareSideLenght;
        const yModulo = anchorPoint.y % this.gridService.squareSideLenght;
        let xOffset = 0;
        let yOffset = 0;

        if (this.tempXOffset >= this.gridService.squareSideLenght / 2 || this.tempXOffset <= -this.gridService.squareSideLenght / 2) {
            xOffset += this.tempXOffset;
            this.lastTempXOffset = this.tempXOffset;
            this.tempXOffset = 0;
        }
        if (this.tempYOffset >= this.gridService.squareSideLenght / 2 || this.tempYOffset <= -this.gridService.squareSideLenght / 2) {
            yOffset += this.tempYOffset;
            this.lastTempYOffset = this.tempYOffset;
            this.tempYOffset = 0;
        }
        if (xModulo % 2 !== 0) {
            if (xModulo >= this.gridService.squareSideLenght / 2) {
                xOffset += this.gridService.squareSideLenght - xModulo;
            } else {
                xOffset -= xModulo;
            }
        } else {
            if (this.lastTempXOffset > 0) {
                xOffset += this.gridService.squareSideLenght / 2;
                this.lastTempXOffset = 0;
            } else if (this.lastTempXOffset < 0) {
                xOffset -= this.gridService.squareSideLenght / 2;
                this.lastTempXOffset = 0;
            } else if (xModulo === this.gridService.squareSideLenght / 2) {
                xOffset += this.gridService.squareSideLenght - xModulo;
            } else {
                xOffset -= xModulo;
            }
        }
        if (yModulo % 2 !== 0) {
            if (yModulo >= this.gridService.squareSideLenght / 2) {
                yOffset += this.gridService.squareSideLenght - yModulo;
            } else {
                yOffset -= yModulo;
            }
        } else {
            if (this.lastTempYOffset > 0) {
                yOffset += this.gridService.squareSideLenght / 2;
                this.lastTempYOffset = 0;
            } else if (this.lastTempYOffset < 0) {
                yOffset -= this.gridService.squareSideLenght / 2;
                this.lastTempYOffset = 0;
            } else if (yModulo === this.gridService.squareSideLenght / 2) {
                yOffset += this.gridService.squareSideLenght - yModulo;
            } else {
                yOffset -= yModulo;
            }
        }

        return { x: xOffset, y: yOffset };
    }

    identifyTopLeftPosition(resizeAttributes: ResizeAttributes): void {
        switch (this.lastResizeCorner) {
            case magnetismConstants.TOP_LEFT:
                this.positions[magnetismConstants.TOP_LEFT] = { x: resizeAttributes.x, y: resizeAttributes.y };
                break;
            case magnetismConstants.TOP_MIDDLE:
                this.positions[magnetismConstants.TOP_LEFT] = { x: resizeAttributes.x - resizeAttributes.width / 2, y: resizeAttributes.y };
                break;
            case magnetismConstants.TOP_RIGHT:
                this.positions[magnetismConstants.TOP_LEFT] = { x: resizeAttributes.x - resizeAttributes.width, y: resizeAttributes.y };
                break;
            case magnetismConstants.MIDDLE_LEFT:
                this.positions[magnetismConstants.TOP_LEFT] = { x: resizeAttributes.x, y: resizeAttributes.y - resizeAttributes.height / 2 };
                break;
            case magnetismConstants.MIDDLE_RIGHT:
                this.positions[magnetismConstants.TOP_LEFT] = {
                    x: resizeAttributes.x - resizeAttributes.width,
                    y: resizeAttributes.y - resizeAttributes.height / 2,
                };
                break;
            case magnetismConstants.BOTTOM_LEFT:
                this.positions[magnetismConstants.TOP_LEFT] = { x: resizeAttributes.x, y: resizeAttributes.y - resizeAttributes.height };
                break;
            case magnetismConstants.BOTTOM_MIDDLE:
                this.positions[magnetismConstants.TOP_LEFT] = {
                    x: resizeAttributes.x - resizeAttributes.width / 2,
                    y: resizeAttributes.y - resizeAttributes.height,
                };
                break;
            case magnetismConstants.BOTTOM_RIGHT:
                this.positions[magnetismConstants.TOP_LEFT] = {
                    x: resizeAttributes.x - resizeAttributes.width,
                    y: resizeAttributes.y - resizeAttributes.height,
                };
                break;
        }
    }

    identifyResizeCorner(resizeAttributes: ResizeAttributes): void {
        if (resizeAttributes.width >= 0) {
            if (resizeAttributes.height >= 0) {
                this.lastResizeCorner = magnetismConstants.TOP_LEFT;
            } else {
                this.lastResizeCorner = magnetismConstants.BOTTOM_LEFT;
            }
        } else {
            if (resizeAttributes.height >= 0) {
                this.lastResizeCorner = magnetismConstants.TOP_RIGHT;
            } else {
                this.lastResizeCorner = magnetismConstants.BOTTOM_RIGHT;
            }
        }
    }

    identifyAllPositions(resizeAttributes: ResizeAttributes): void {
        this.positions[magnetismConstants.TOP_MIDDLE].x = this.positions[magnetismConstants.TOP_LEFT].x + Math.abs(resizeAttributes.width / 2);
        this.positions[magnetismConstants.TOP_MIDDLE].y = this.positions[magnetismConstants.TOP_LEFT].y;

        this.positions[magnetismConstants.TOP_RIGHT].x = this.positions[magnetismConstants.TOP_LEFT].x + Math.abs(resizeAttributes.width);
        this.positions[magnetismConstants.TOP_RIGHT].y = this.positions[magnetismConstants.TOP_LEFT].y;

        this.positions[magnetismConstants.MIDDLE_LEFT].x = this.positions[magnetismConstants.TOP_LEFT].x;
        this.positions[magnetismConstants.MIDDLE_LEFT].y = this.positions[magnetismConstants.TOP_LEFT].y + Math.abs(resizeAttributes.height / 2);

        this.positions[magnetismConstants.MIDDLE_RIGHT].x = this.positions[magnetismConstants.TOP_LEFT].x + Math.abs(resizeAttributes.width);
        this.positions[magnetismConstants.MIDDLE_RIGHT].y = this.positions[magnetismConstants.TOP_LEFT].y + Math.abs(resizeAttributes.height / 2);

        this.positions[magnetismConstants.BOTTOM_LEFT].x = this.positions[magnetismConstants.TOP_LEFT].x;
        this.positions[magnetismConstants.BOTTOM_LEFT].y = this.positions[magnetismConstants.TOP_LEFT].y + Math.abs(resizeAttributes.height);

        this.positions[magnetismConstants.BOTTOM_MIDDLE].x = this.positions[magnetismConstants.TOP_LEFT].x + Math.abs(resizeAttributes.width / 2);
        this.positions[magnetismConstants.BOTTOM_MIDDLE].y = this.positions[magnetismConstants.TOP_LEFT].y + Math.abs(resizeAttributes.height);

        this.positions[magnetismConstants.BOTTOM_RIGHT].x = this.positions[magnetismConstants.TOP_LEFT].x + Math.abs(resizeAttributes.width);
        this.positions[magnetismConstants.BOTTOM_RIGHT].y = this.positions[magnetismConstants.TOP_LEFT].y + Math.abs(resizeAttributes.height);

        this.positions[magnetismConstants.MIDDLE].x = this.positions[magnetismConstants.TOP_LEFT].x + Math.abs(resizeAttributes.width / 2);
        this.positions[magnetismConstants.MIDDLE].y = this.positions[magnetismConstants.TOP_LEFT].y + Math.abs(resizeAttributes.height / 2);
    }

    moveBox(resizeAttributes: ResizeAttributes, direction: number): ResizeAttributes {
        switch (direction) {
            case 0:
                if (resizeAttributes.x % this.gridService.squareSideLenght !== 0) {
                    resizeAttributes.x += this.gridService.squareSideLenght - (resizeAttributes.x % this.gridService.squareSideLenght);
                } else {
                    resizeAttributes.x += this.gridService.squareSideLenght;
                }
                break;
            case 1:
                if (resizeAttributes.x % this.gridService.squareSideLenght !== 0) {
                    resizeAttributes.x -= resizeAttributes.x % this.gridService.squareSideLenght;
                } else {
                    resizeAttributes.x -= this.gridService.squareSideLenght;
                }
                break;
            case 2:
                if (resizeAttributes.y % this.gridService.squareSideLenght !== 0) {
                    resizeAttributes.y += this.gridService.squareSideLenght - (resizeAttributes.y % this.gridService.squareSideLenght);
                } else {
                    resizeAttributes.y += this.gridService.squareSideLenght;
                }
                break;
            case 3:
                if (resizeAttributes.y % this.gridService.squareSideLenght !== 0) {
                    resizeAttributes.y -= resizeAttributes.y % this.gridService.squareSideLenght;
                } else {
                    resizeAttributes.y -= this.gridService.squareSideLenght;
                }
                break;
        }
        return resizeAttributes;
    }
}
