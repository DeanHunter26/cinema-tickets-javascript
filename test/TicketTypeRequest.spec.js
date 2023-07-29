import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";

// Start the test suite for the Ticket Type Request Class
describe("TicketTypeRequest class", () => {
  // Describe the constructor test cases
  describe("Constructor", () => {
    // Test Case: should not allow extension of properties
    it("should not allow extension of properties", () => {
      const ticket = new TicketTypeRequest("CHILD", 6);
      expect(Object.isFrozen(ticket)).toEqual(true);
    });
  });
});
