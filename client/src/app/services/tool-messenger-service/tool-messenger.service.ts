import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ToolMessengerService {
    private subject: Subject<number> = new Subject<number>();

    sendTool(id: number): void {
        this.subject.next(id);
    }

    receiveTool(): Observable<number> {
        return this.subject.asObservable();
    }
}
