import * as HttpStatusCodes from './http-status-codes';
// Provient de l'exemple sur les serveurs vu en classe
export class HttpException extends Error {
    // Defaults the status to internal server error (default for status is 500)
    constructor(message: string, public status: number = HttpStatusCodes.INTERNAL_SERVER_ERROR) {
        // Calls the error Error constructor with the message
        super(message);

        // Sets the name of the error
        this.name = 'HttpException';
    }
}
