import { TestBed } from '@angular/core/testing';
import { ToolMessengerService } from './tool-messenger.service';

// tslint:disable: no-magic-numbers deprecation

describe('ToolMessengerService', () => {
    let service: ToolMessengerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ToolMessengerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send the correct number on sendTool to anything subscribed to the subject with ReceiveTool', (done: DoneFn) => {
        service.receiveTool().subscribe((id: number) => {
            expect(id).toBe(5);
            done();
        });
        service.sendTool(5);
    });
});
