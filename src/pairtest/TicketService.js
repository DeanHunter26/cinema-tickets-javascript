import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

const ERROR_MESSAGES = {
  INVALID_ACCOUNT_ID: 'Invalid account ID. Account ID must be a positive integer.',
  NO_TICKETS_PROVIDED: 'No tickets, provided. Please provide at least one ticket type request.',
  INVALID_TICKET_TYPE_REQUESTS: 'Invalid ticket type requests. All items in the ticketTypeRequsts array must be instances of TicketTypeRequest.',
  TICKET_VALIDATION_FAILED: 'Ticket validation failed. One or more tickets are invalid.',
};

export default class TicketService {
  #validateAccountId(accountId) {
    if(!Number.isInteger(accountId) || accountId < 1) {
      throw new TypeError(ERROR_MESSAGES.INVALID_ACCOUNT_ID);
    }
  } 

  #validateTicketTypeRequests(ticketTypeRequests) {
    if(ticketTypeRequests.length === 0) {
      throw new RangeError(ERROR_MESSAGES.NO_TICKETS_PROVIDED);
    }

    for(const request of ticketTypeRequests) {
      if(!(request instanceof TicketTypeRequest)) {
        throw new TypeError(ERROR_MESSAGES.INVALID_TICKET_TYPE_REQUESTS);
      }
    }
  }

  #groupAndCountTickets(ticketTypeRequests) {
    const ticketCounts = new Map();

    for(const request of ticketTypeRequests) {
      const type = request.getTicketType();
      const noOfTickets = request.getNoOfTickets();

      ticketCounts.set(type, (ticketCounts.get(type) || 0) + noOfTickets);
    }

    return ticketCounts;
  }

  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    this.#validateAccountId(accountId);
    this.#validateTicketTypeRequests(ticketTypeRequests);

    const ticketCounts = this.#groupAndCountTickets(ticketTypeRequests);
   // this.#validateTickets();
  }
}
