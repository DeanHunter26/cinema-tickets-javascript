import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";

const ERROR_MESSAGES = {
  INVALID_ACCOUNT_ID:
    "Invalid account ID. Account ID must be a positive integer.",
  NO_TICKETS_PROVIDED:
    "No tickets, provided. Please provide at least one ticket type request.",
  INVALID_TICKET_TYPE_REQUESTS:
    "Invalid ticket type requests. All items in the ticketTypeRequsts array must be instances of TicketTypeRequest.",
  TICKET_VALIDATION_FAILED:
    "Ticket validation failed. One or more tickets are invalid.",
  MAX_TICKETS_EXCEEDED: "Number of tickets cannot exceed 20.",
  ADULTS_LESS_THAN_INFANTS:
    "Number of adults must be greater than or equal to the number of infants.",
};

export default class TicketService {
  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId < 1) {
      throw new TypeError(ERROR_MESSAGES.INVALID_ACCOUNT_ID);
    }
  }

  #validateTicketTypeRequests(ticketTypeRequests) {
    if (ticketTypeRequests.length === 0) {
      throw new RangeError(ERROR_MESSAGES.NO_TICKETS_PROVIDED);
    }

    for (const request of ticketTypeRequests) {
      if (!(request instanceof TicketTypeRequest)) {
        throw new TypeError(ERROR_MESSAGES.INVALID_TICKET_TYPE_REQUESTS);
      }
    }
  }

  #groupAndCountTickets(ticketTypeRequests) {
    const ticketTypeCounts = new Map();

    for (const request of ticketTypeRequests) {
      const type = request.getTicketType();
      const noOfTickets = request.getNoOfTickets();

      ticketTypeCounts.set(
        type,
        (ticketTypeCounts.get(type) || 0) + noOfTickets
      );
    }

    return ticketTypeCounts;
  }

  #validateMaxTickets(ticketTypeCounts) {
    let totalTickets = 0;

    for (const count of ticketTypeCounts.values()) {
      totalTickets += count;
    }

    const maxTickets = 20;

    if (totalTickets > maxTickets) {
      throw new InvalidPurchaseException(ERROR_MESSAGES.MAX_TICKETS_EXCEEDED);
    }
  }

  #validateAdultsVsInfants(ticketTypeCounts) {
    const adultsCount = ticketTypeCounts.get("ADULT") || 0;
    const infantsCount = ticketTypeCounts.get("INFANT") || 0;

    if (adultsCount < infantsCount) {
      throw new InvalidPurchaseException(
        ERROR_MESSAGES.ADULTS_LESS_THAN_INFANTS
      );
    }
  }

  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    this.#validateAccountId(accountId);
    this.#validateTicketTypeRequests(ticketTypeRequests);

    const ticketTypeCounts = this.#groupAndCountTickets(ticketTypeRequests);
    this.#validateMaxTickets(ticketTypeCounts);
    this.#validateAdultsVsInfants(ticketTypeCounts);
  }
}
