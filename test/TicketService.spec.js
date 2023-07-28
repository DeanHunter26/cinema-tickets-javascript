import TicketService from "../src/pairtest/TicketService";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";

describe('TicketService', () => {
    let ticketService;

    beforeEach(() => {
        ticketService = new TicketService();
    });

    describe('purchaseTickets', () => {
        const typeRequest = new TicketTypeRequest('ADULT', 1);

        describe('isValidAccountId', () => {
            const INVALID_ACCOUNT_ID_ERROR = 'Invalid account ID. Account ID must be a positive integer.';

            it('should throw a type error when accountId is undefined', () => {
              expect(() => ticketService.purchaseTickets(undefined, typeRequest)).toThrow(INVALID_ACCOUNT_ID_ERROR);
            });
        
            it('should throw a type error when accountId is a string', () => {
              expect(() => ticketService.purchaseTickets('cle', typeRequest)).toThrow(INVALID_ACCOUNT_ID_ERROR);
            });
        
            it('should throw a type error when accountId is not an integer', () => {
              expect(() => ticketService.purchaseTickets(4.23, typeRequest)).toThrow(INVALID_ACCOUNT_ID_ERROR);
            });
        
            it('should throw a type error when accountId is less than one', () => {
              expect(() => ticketService.purchaseTickets(0, typeRequest)).toThrow(INVALID_ACCOUNT_ID_ERROR);
            });
        });

        describe('isTicketTypeRequests', () => {
          const NO_TICKETS_PROVIDED_ERROR = 'No tickets, provided. Please provide at least one ticket type request.';
          const INVALID_TICKET_TYPE_REQUESTS_ERROR = 'Invalid ticket type requests. All items in the ticketTypeRequsts array must be instances of TicketTypeRequest.';
    
          it('should throw a range error when no tickets provided', () => {
            expect(() => ticketService.purchaseTickets(123)).toThrow(NO_TICKETS_PROVIDED_ERROR);
          });
    
          it('should throw a type error when not an array of TicketTypeRequest objects', () => {
            expect(() => ticketService.purchaseTickets(123, [], 'ssks', 123, new TicketTypeRequest('ADULT', 1))).toThrow(INVALID_TICKET_TYPE_REQUESTS_ERROR);
          });
        });
    });
});