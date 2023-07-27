import TicketService from "../src/pairtest/TicketService";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";

describe('TicketService class', () => {
    describe('purchaseTickets', () => {
        describe('isValidAccountId', () => {
            it('should throw a type error when accountId is undefined', () => {
                const ticketService = new TicketService();
                const ticketTypeRequest = new TicketTypeRequest('ADULT', 1);
                const errorDescription = 'accountId must be an integer';
                expect(() => {ticketService.purchaseTickets(undefined, ticketTypeRequest)}).toThrow(errorDescription);
            });
            it('should throw a type error when accountId is a string', () => {
                const ticketService = new TicketService();
                const ticketTypeRequest = new TicketTypeRequest('ADULT', 1);
                const errorDescription = 'accountId must be an integer';
                expect(() => {ticketService.purchaseTickets('cle', ticketTypeRequest)}).toThrow(errorDescription);
            });
            it('should throw a type error when accountId is not an integer', () => {
                const ticketService = new TicketService();
                const ticketTypeRequest = new TicketTypeRequest('ADULT', 1);
                const errorDescription = 'accountId must be an integer';
                expect(() => {ticketService.purchaseTickets(4.23, ticketTypeRequest)}).toThrow(errorDescription);
            });
            it('should throw a range error when accountId is less than one', () => {
                const ticketService = new TicketService();
                const ticketTypeRequest = new TicketTypeRequest('ADULT', 1);
                const errorDescription = 'accountId must be greater than one';
                expect(() => {ticketService.purchaseTickets(0, ticketTypeRequest)}).toThrow(errorDescription);
            });
        });
    });
});