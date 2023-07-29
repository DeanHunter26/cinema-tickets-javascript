import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

export default class TicketService {
  // Private method to validate the account ID
  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId < 1) {
      throw new InvalidPurchaseException(
        "Invalid account ID. Account ID must be a positive integer."
      );
    }
  }

  // Private method to validate the ticket type requests
  #validateTicketTypeRequests(ticketTypeRequests) {
    if (ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException(
        "No tickets, provided. Please provide at least one ticket type request."
      );
    }

    // Ensure all items in ticketTypeRequests array are instances of TicketTypeRequest
    for (const request of ticketTypeRequests) {
      if (!(request instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException(
          "Invalid ticket type requests. All items in the ticketTypeRequsts array must be instances of TicketTypeRequest."
        );
      }
    }
  }

  // Private method to group and count the tickets based on their types
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

  // Private method to validate the maximum number of tickets (should not exceed 20)
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

  // Private method to validate there is at least one adult ticket for child or infant tickets
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

  // Private method to validate the number of adults is greater than or equal to the number of infants
  #validateAdultsVsInfants(ticketTypeCounts) {
    const adultCount = this.#getTicketTypeCount(ticketTypeCounts, "ADULT");
    const infantCount = this.#getTicketTypeCount(ticketTypeCounts, "INFANT");

    if (adultCount < infantCount) {
      throw new InvalidPurchaseException(
        "Number of adults must be greater than or equal to the number of infants."
      );
    }
  }

  // Private method to calculate the total cost of all the tickets based on their types
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

  // Private method to calculate the total number of seats to be reserved based on the tickets types
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

  /**
   *
   * @param {*} accountId
   * @param  {...any} ticketTypeRequests
   *
   * The main method to purchase tickets.
   * Performs validations on ticket type requests and accountID.
   * After successful validation, it calculates the total cost of tickets and
   * reserves the required number of seats.
   * It makes a payment using TicketPaymentService and seat reservation using
   * SeatReservationService.
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException

    // validate the account ID (throws InvalidPuchaseException)
    this.#validateAccountId(accountId);
    // vaidate the ticket type requests (throws InvalidPurchaseException)
    this.#validateTicketTypeRequests(ticketTypeRequests);

    // Group and count the tickets based on their types
    const ticketTypeCounts = this.#groupAndCountTickets(ticketTypeRequests);
    this.#validateMaxTickets(ticketTypeCounts);
    this.#validateAdultswithChildOrInfant(ticketTypeCounts);
    this.#validateAdultsVsInfants(ticketTypeCounts);

    // Calculate the total cost of all the tickets
    const totalTicketCost = this.#calculateTotalTicketCost(ticketTypeCounts);

    // Make a payment using the TicketPaymentService
    const ticketPaymentService = new TicketPaymentService();
    ticketPaymentService.makePayment(accountId, totalTicketCost);

    // Calculate the total number of seats to be reserved
    const totalReserveSeats = this.#calculateReserveSeats(ticketTypeCounts);

    // Reserve the seats using the SeatReservationService
    const seatReservationService = new SeatReservationService();
    seatReservationService.reserveSeat(accountId, totalReserveSeats);
  }
}
