import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TOOLS } from '@app/classes/mock-tools';
import { ToolBarInformation } from '@app/classes/tool-bar-information';
import { CarousselComponent } from '@app/components/caroussel/caroussel.component';
import { ExportComponent } from '@app/components/export/export.component';
import * as mainPageConstants from '@app/components/main-page/main-page-constants';
import { SaveDrawingServerComponent } from '@app/components/save-drawing-server/save-drawing-server.component';
import { ToolMessengerService } from '@app/services/tool-messenger-service/tool-messenger.service';
import * as sidebarConstants from './sidebar-constants';

export const DEFAULT_SIZE = 10;

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    tools: ToolBarInformation[] = TOOLS;
    selectedTool: ToolBarInformation = this.tools[0];
    size: number = DEFAULT_SIZE;

    fileFormat: string;
    fileName: string;

    constructor(private toolMessengerService: ToolMessengerService, private dialog: MatDialog) {
        this.toolMessengerService.receiveTool().subscribe((id: number) => {
            this.selectedTool = this.tools[id];
        });
    }

    onSelect(tool: ToolBarInformation): void {
        if (tool.id !== sidebarConstants.SAVE_DRAWING_POSITION && tool.id !== sidebarConstants.EXPORT_DRAWING_POSITION) {
            this.selectedTool = tool;
            this.toolMessengerService.sendTool(this.selectedTool.id);
        } else if (tool.id === sidebarConstants.SAVE_DRAWING_POSITION) {
            this.dialog.open(SaveDrawingServerComponent);
        } else {
            this.openExport();
        }
    }

    openExport(): void {
        if (this.dialog.openDialogs.length === 0) {
            this.dialog.open(ExportComponent, {
                height: '700px',
                width: '700px',
            });
        }
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            this.openExport();
        } else if (event.ctrlKey && event.key === 'g') {
            event.preventDefault();
            if (this.dialog.openDialogs.length === 0) {
                this.dialog.open(CarousselComponent, { height: mainPageConstants.HEIGHT, width: mainPageConstants.WIDTH });
            }
        }
    }
}
