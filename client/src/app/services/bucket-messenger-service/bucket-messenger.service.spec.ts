import { TestBed } from '@angular/core/testing';
import { BucketMessengerService } from './bucket-messenger.service';

// tslint:disable: no-magic-numbers deprecation

describe('BucketMessengerService', () => {
    let service: BucketMessengerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BucketMessengerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send the correct color on sendBucketColor to anything subscribed to the subject with receiveBucketColor', (done: DoneFn) => {
        service.receiveBucketColor().subscribe((color: number[]) => {
            expect(color).toEqual([5, 6, 7, 8]);
            done();
        });
        service.sendBucketColor([5, 6, 7, 8]);
    });
});
