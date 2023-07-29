import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

export default class TicketService {
  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId < 1) {
      throw new InvalidPurchaseException(
        "Invalid account ID. Account ID must be a positive integer."
      );
    }
  }

  #validateTicketTypeRequests(ticketTypeRequests) {
    if (ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException(
        "No tickets, provided. Please provide at least one ticket type request."
      );
    }

    for (const request of ticketTypeRequests) {
      if (!(request instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException(
          "Invalid ticket type requests. All items in the ticketTypeRequsts array must be instances of TicketTypeRequest."
        );
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
      throw new InvalidPurchaseException("Number of tickets cannot exceed 20.");
    }
  }

  #validateAdultswithChildOrInfant(ticketTypeCounts) {
    const adultCount = this.#getTicketTypeCount(ticketTypeCounts, "ADULT");
    const childCount = this.#getTicketTypeCount(ticketTypeCounts, "CHILD");
    const infantCount = this.#getTicketTypeCount(ticketTypeCounts, "INFANT");

    if ((childCount > 0 || infantCount > 0) && adultCount === 0) {
      throw new InvalidPurchaseException(
        "There must be at least one adult for child or infant tickets."
      );
    }
  }

  #validateAdultsVsInfants(ticketTypeCounts) {
    const adultCount = this.#getTicketTypeCount(ticketTypeCounts, "ADULT");
    const infantCount = this.#getTicketTypeCount(ticketTypeCounts, "INFANT");

    if (adultCount < infantCount) {
      throw new InvalidPurchaseException(
        "Number of adults must be greater than or equal to the number of infants."
      );
    }
  }

  #getTicketTypeCount(ticketTypeCounts, ticketType) {
    return ticketTypeCounts.get(ticketType) || 0;
  }

  #calculateTotalTicketCost(ticketTypeCounts) {
    const ticketPrices = {
      adult: 20,
      child: 10,
      infant: 0,
    };
    const adultCount = this.#getTicketTypeCount(ticketTypeCounts, "ADULT");
    const childCount = this.#getTicketTypeCount(ticketTypeCounts, "CHILD");

    const totalPayment =
      adultCount * ticketPrices.adult + childCount * ticketPrices.child;

    if (totalPayment === 0) {
      throw new InvalidPurchaseException(
        "No tickets, provided. Please provide at least one ticket type request."
      );
    }

    return totalPayment;
  }

  #calculateReserveSeats(ticketTypeCounts) {
    const adultCount = this.#getTicketTypeCount(ticketTypeCounts, "ADULT");
    const childCount = this.#getTicketTypeCount(ticketTypeCounts, "CHILD");

    const totalReservedSeats = adultCount + childCount;

    if (totalReservedSeats === 0) {
      throw new InvalidPurchaseException(
        "No tickets, provided. Please provide at least one ticket type request."
      );
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
