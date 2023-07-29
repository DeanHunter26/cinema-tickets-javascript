import TicketService from "../src/pairtest/TicketService";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";
import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService";
import SeatReservationService from "../src/thirdparty/seatbooking/SeatReservationService";

// Mock the external dependencies
jest.mock("../src/thirdparty/paymentgateway/TicketPaymentService");
jest.mock("../src/thirdparty/seatbooking/SeatReservationService");

// Start the test suite for the TicketService class
describe("TicketService", () => {
  let ticketService;

  // Before running any test, clear the mock states and initialise ticket service.
  beforeAll(() => {
    TicketPaymentService.mockClear();
    SeatReservationService.mockClear();
    ticketService = new TicketService();
  });

  // Describe the test cases for the purchaseTickets method
  describe("purchaseTickets", () => {
    // Create a TicketTypeRequest instance to be used in multiple test cases
    const typeRequest = new TicketTypeRequest("ADULT", 1);

    // Describe the test cases for validating the accountId parameter
    describe("validateAccountId", () => {
      // Error message for an invalid account ID
      const INVALID_ACCOUNT_ID_ERROR =
        "Invalid account ID. Account ID must be a positive integer.";

      // Test case: should throw an error when accountId is undefined
      it("should throw an error when accountId is undefined", () => {
        expect(() =>
          ticketService.purchaseTickets(undefined, typeRequest)
        ).toThrow(INVALID_ACCOUNT_ID_ERROR);
      });

      // Test case: should throw an error when accountId is a string
      it("should throw an error when accountId is a string", () => {
        expect(() => ticketService.purchaseTickets("cle", typeRequest)).toThrow(
          INVALID_ACCOUNT_ID_ERROR
        );
      });

      // Test case: should throw an error when accountId is not an integer
      it("should throw an error when accountId is not an integer", () => {
        expect(() => ticketService.purchaseTickets(4.23, typeRequest)).toThrow(
          INVALID_ACCOUNT_ID_ERROR
        );
      });

      // Test case: should throw an error when accountId is less than one
      it("should throw a error when accountId is less than one", () => {
        expect(() => ticketService.purchaseTickets(0, typeRequest)).toThrow(
          INVALID_ACCOUNT_ID_ERROR
        );
      });
    });

    // Describe the test cases for validating the ticket type requests parameter
    describe("validateTicketTypeRequests", () => {
      // Error messages for when no tickers provided or invalid ticket type
      const NO_TICKETS_PROVIDED_ERROR =
        "No tickets, provided. Please provide at least one ticket type request.";
      const INVALID_TICKET_TYPE_REQUESTS_ERROR =
        "Invalid ticket type requests. All items in the ticketTypeRequsts array must be instances of TicketTypeRequest.";

      // Test case: should throw an error when no tickets provided
      it("should throw an error when no tickets provided", () => {
        expect(() => ticketService.purchaseTickets(123)).toThrow(
          NO_TICKETS_PROVIDED_ERROR
        );
      });

      // Test case: should throw an error when not an array of TicketTypeRequest objects
      it("should throw an error when not an array of TicketTypeRequest objects", () => {
        expect(() =>
          ticketService.purchaseTickets(
            123,
            [],
            "ssks",
            123,
            new TicketTypeRequest("ADULT", 1)
          )
        ).toThrow(INVALID_TICKET_TYPE_REQUESTS_ERROR);
      });
    });

    // Describe the test cases for validating the max tickets method
    describe("validateMaxTickets", () => {
      // Error message for number of tickets exceeded
      const MAX_TICKETS_EXCEEDED = "Number of tickets cannot exceed 20.";

      // Test case: should throw an error when the total tickets are more than 20
      it("should throw an error when the total tickets are more than 20", () => {
        const ticketTypeRequests = [
          new TicketTypeRequest("ADULT", 12),
          new TicketTypeRequest("CHILD", 10),
          new TicketTypeRequest("INFANT", 1),
        ];

        expect(() =>
          ticketService.purchaseTickets(123, ...ticketTypeRequests)
        ).toThrow(MAX_TICKETS_EXCEEDED);
      });
    });

    // Describe the test cases for validating adults with child or infant method
    describe("validateAdultswithChildOrInfant", () => {
      // Error message for insufficient number of adult tickets
      const INSUFFICIENT_ADULTS =
        "There must be at least one adult for child or infant tickets.";

      // Test case: should throw an error when there is no adult ticket
      it("should throw an error when there is no adult but children or infants", () => {
        const ticketTypeRequests = [
          new TicketTypeRequest("CHILD", 9),
          new TicketTypeRequest("INFANT", 9),
        ];

        expect(() =>
          ticketService.purchaseTickets(123, ...ticketTypeRequests)
        ).toThrow(INSUFFICIENT_ADULTS);
      });
    });

    // Describe the test cases for validating the number of adults to infants method
    describe("validateAdultsVsInfants", () => {
      // Error message for the number of adult tickets being less than infants
      const ADULTS_LESS_THAN_INFANTS =
        "Number of adults must be greater than or equal to the number of infants.";

      // Test case: should throw an error when there is more infant tickets than adult tickets
      it("should throw an error when there is more infants than adults", () => {
        const ticketTypeRequests = [
          new TicketTypeRequest("ADULT", 8),
          new TicketTypeRequest("INFANT", 9),
        ];

        expect(() =>
          ticketService.purchaseTickets(123, ...ticketTypeRequests)
        ).toThrow(ADULTS_LESS_THAN_INFANTS);
      });
    });

    // Describe the test cases for calculate total ticket cost method
    describe("calculateTotalTicketCost", () => {
      // Error message for no tickets provided
      const NO_TICKETS_PROVIDED =
        "No tickets, provided. Please provide at least one ticket type request.";

      // Test case: should call make payment from ticket payment service with the correct account ID and total ticket cost
      // Verifies the total ticket cost
      it("should call makePayment from TicketPaymentService with correct accountId and total ticket cost", () => {
        const ticketTypeRequests = [
          new TicketTypeRequest("ADULT", 2),
          new TicketTypeRequest("CHILD", 3),
          new TicketTypeRequest("INFANT", 1),
        ];

        ticketService.purchaseTickets(123, ...ticketTypeRequests);

        const mockMakePayment =
          TicketPaymentService.mock.instances[0].makePayment;
        expect(mockMakePayment).toHaveBeenCalledTimes(1);
        expect(mockMakePayment).toHaveBeenCalledWith(123, 70);
      });

      // Test case: should throw an error when there are no tickets
      it("should throw an error when there are no tickets", () => {
        const ticketTypeRequests = [
          new TicketTypeRequest("ADULT", 0),
          new TicketTypeRequest("CHILD", 0),
          new TicketTypeRequest("INFANT", 0),
        ];

        expect(() =>
          ticketService.purchaseTickets(123, ...ticketTypeRequests)
        ).toThrow(NO_TICKETS_PROVIDED);
      });
    });

    // Describe the test cases for calculate reserve seats method
    describe("calculateReserveSeats", () => {
      // Error message for no tickets provided
      const NO_TICKETS_PROVIDED =
        "No tickets, provided. Please provide at least one ticket type request.";

      // Test case: should call reserve seat from seat reservation service with the correct account ID and total reserve seats
      // Verifies the total reserve seats
      it("should call reserveSeat from SeatReservationService with correct accountId and total reserve seats", () => {
        const ticketTypeRequests = [
          new TicketTypeRequest("ADULT", 2),
          new TicketTypeRequest("CHILD", 3),
          new TicketTypeRequest("INFANT", 1),
        ];

        ticketService.purchaseTickets(123, ...ticketTypeRequests);

        const mockReserveSeat =
          SeatReservationService.mock.instances[0].reserveSeat;
        expect(mockReserveSeat).toHaveBeenCalledTimes(1);
        expect(mockReserveSeat).toHaveBeenCalledWith(123, 5);
      });

      // Test case: should throw an error when there are no tickets
      it("should throw an error when there are no tickets", () => {
        const ticketTypeRequests = [
          new TicketTypeRequest("ADULT", 0),
          new TicketTypeRequest("CHILD", 0),
          new TicketTypeRequest("INFANT", 0),
        ];

        expect(() =>
          ticketService.purchaseTickets(123, ...ticketTypeRequests)
        ).toThrow(NO_TICKETS_PROVIDED);
      });
    });
  });
});
