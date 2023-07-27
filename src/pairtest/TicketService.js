import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

export default class TicketService {

  #isValidAccountId(accountId) {
    if(!Number.isInteger(accountId)) {
      throw new TypeError('accountId must be an integer');
    }
    if(accountId < 1) {
      throw new RangeError('accountId must be greater than one');
    }
  } 



  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    this.#isValidAccountId(accountId);
  }
}
