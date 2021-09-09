import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BucketMessengerService {
    private subject: Subject<number[]> = new Subject<number[]>();

    sendBucketColor(color: number[]): void {
        this.subject.next(color);
    }

    receiveBucketColor(): Observable<number[]> {
        return this.subject.asObservable();
    }
}
