import TicketService from "../src/pairtest/TicketService";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";

describe("TicketService", () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
  });

  describe("purchaseTickets", () => {
    const typeRequest = new TicketTypeRequest("ADULT", 1);

    describe("validateAccountId", () => {
      const INVALID_ACCOUNT_ID_ERROR =
        "Invalid account ID. Account ID must be a positive integer.";

      it("should throw a type error when accountId is undefined", () => {
        expect(() =>
          ticketService.purchaseTickets(undefined, typeRequest)
        ).toThrow(INVALID_ACCOUNT_ID_ERROR);
      });

      it("should throw a type error when accountId is a string", () => {
        expect(() => ticketService.purchaseTickets("cle", typeRequest)).toThrow(
          INVALID_ACCOUNT_ID_ERROR
        );
      });

      it("should throw a type error when accountId is not an integer", () => {
        expect(() => ticketService.purchaseTickets(4.23, typeRequest)).toThrow(
          INVALID_ACCOUNT_ID_ERROR
        );
      });

      it("should throw a type error when accountId is less than one", () => {
        expect(() => ticketService.purchaseTickets(0, typeRequest)).toThrow(
          INVALID_ACCOUNT_ID_ERROR
        );
      });
    });

    describe("validateTicketTypeRequests", () => {
      const NO_TICKETS_PROVIDED_ERROR =
        "No tickets, provided. Please provide at least one ticket type request.";
      const INVALID_TICKET_TYPE_REQUESTS_ERROR =
        "Invalid ticket type requests. All items in the ticketTypeRequsts array must be instances of TicketTypeRequest.";

      it("should throw a range error when no tickets provided", () => {
        expect(() => ticketService.purchaseTickets(123)).toThrow(
          NO_TICKETS_PROVIDED_ERROR
        );
      });

      it("should throw a type error when not an array of TicketTypeRequest objects", () => {
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

    describe("validateMaxTickets", () => {
      const MAX_TICKETS_EXCEEDED = "Number of tickets cannot exceed 20.";

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

    describe("validateAdultswithChildOrInfant", () => {
      const INSUFFICIENT_ADULTS =
        "There must be at least one adult for child or infant tickets.";

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

    describe("validateAdultsVsInfants", () => {
      const ADULTS_LESS_THAN_INFANTS =
        "Number of adults must be greater than or equal to the number of infants.";

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
  });
});
