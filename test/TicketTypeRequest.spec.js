import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";

describe('TicketTypeRequest class', () => {
    describe('Constructor', () => {
        it('should not allow extension of properties', () => {
            const ticket = new TicketTypeRequest('CHILD', 6);
            expect(Object.isFrozen(ticket)).toEqual(true);
        });
    });
});