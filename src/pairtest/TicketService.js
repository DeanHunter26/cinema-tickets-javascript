import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

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
  INSUFFICIENT_ADULTS:
    "There must be at least one adult for child or infant tickets.",
};

const TICKET_PRICES = {
  ADULT: 20,
  CHILD: 10,
  INFANT: 0,
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

  #validateAdultswithChildOrInfant(ticketTypeCounts) {
    const adultCount = this.#getTicketTypeCount(ticketTypeCounts, "ADULT");
    const childCount = this.#getTicketTypeCount(ticketTypeCounts, "CHILD");
    const infantCount = this.#getTicketTypeCount(ticketTypeCounts, "INFANT");

    if ((childCount > 0 || infantCount > 0) && adultCount === 0) {
      throw new InvalidPurchaseException(ERROR_MESSAGES.INSUFFICIENT_ADULTS);
    }
  }

  #validateAdultsVsInfants(ticketTypeCounts) {
    const adultCount = this.#getTicketTypeCount(ticketTypeCounts, "ADULT");
    const infantCount = this.#getTicketTypeCount(ticketTypeCounts, "INFANT");

    if (adultCount < infantCount) {
      throw new InvalidPurchaseException(
        ERROR_MESSAGES.ADULTS_LESS_THAN_INFANTS
      );
    }
  }

  #getTicketTypeCount(ticketTypeCounts, ticketType) {
    return ticketTypeCounts.get(ticketType) || 0;
  }

  #calculateTotalTicketCost(ticketTypeCounts) {
    const adultCount = this.#getTicketTypeCount(ticketTypeCounts, "ADULT");
    const childCount = this.#getTicketTypeCount(ticketTypeCounts, "CHILD");

    const totalPayment =
      adultCount * TICKET_PRICES.ADULT + childCount * TICKET_PRICES.CHILD;

    if (totalPayment === 0) {
      throw new InvalidPurchaseException(ERROR_MESSAGES.NO_TICKETS_PROVIDED);
    }

    return totalPayment;
  }

  #calculateReserveSeats(ticketTypeCounts) {
    const adultCount = this.#getTicketTypeCount(ticketTypeCounts, "ADULT");
    const childCount = this.#getTicketTypeCount(ticketTypeCounts, "CHILD");

    const totalReservedSeats = adultCount + childCount;

    if (totalReservedSeats === 0) {
      throw new InvalidPurchaseException(ERROR_MESSAGES.NO_TICKETS_PROVIDED);
    }

    return totalReservedSeats;
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
    this.#validateAdultswithChildOrInfant(ticketTypeCounts);
    this.#validateAdultsVsInfants(ticketTypeCounts);

    const totalTicketCost = this.#calculateTotalTicketCost(ticketTypeCounts);

    const ticketPaymentService = new TicketPaymentService();
    ticketPaymentService.makePayment(accountId, totalTicketCost);

    const totalReserveSeats = this.#calculateReserveSeats(ticketTypeCounts);

    const seatReservationService = new SeatReservationService();
    seatReservationService.reserveSeat(accountId, totalReserveSeats);
  }
}
