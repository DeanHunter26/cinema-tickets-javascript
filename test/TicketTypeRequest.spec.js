import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";

describe('TicketTypeRequest class', () => {
    describe('Immutable object when' , () => {
        it('No extension of properties', () => {
            const Ticket = new TicketTypeRequest('CHILD', 6);
            expect(Object.isFrozen(Ticket)).toEqual(true);
        });
    });
});