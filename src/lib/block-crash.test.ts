import { createBlock, multipliers, stateCountdown } from './block-crash';

describe('Block crash tests', () => {
  describe('createBlock', () => {
    it("should return 'none' for an empty state", () => {
      const block = createBlock(0);
      expect(block).toEqual({
        number: 0,
        multiplier: 0n,
        result: 'none',
      });
    });

    it("should return 'ok' for the first block", () => {
      const state = { start: 0, end: multipliers.length };
      const block = createBlock(0, state);
      expect(block).toEqual({
        number: 0,
        multiplier: multipliers[0],
        result: 'ok',
      });
    });

    it("should return 'ok' for a valid block in the range", () => {
      const state = { start: 0, end: multipliers.length };
      const block = createBlock(5, state);
      expect(block).toEqual({
        number: 5,
        multiplier: multipliers[5],
        result: 'ok',
      });
    });

    it("should return 'crash' for the last block in the range", () => {
      const state = { start: 0, end: multipliers.length };
      const block = createBlock(multipliers.length, state);
      expect(block).toEqual({
        number: multipliers.length,
        multiplier: multipliers[multipliers.length],
        result: 'crash',
      });
    });

    it("should return 'none' for a block outside the range", () => {
      const state = { start: 0, end: multipliers.length };
      const block = createBlock(multipliers.length + 1, state);
      expect(block).toEqual({
        number: multipliers.length + 1,
        multiplier: 0n,
        result: 'none',
      });
    });
  });

  describe('stateCountdown', () => {
    it('should return starting countdown state', () => {
      const state = { start: 5, end: 0 };
      const countdown = stateCountdown(2, state);
      expect(countdown).toEqual({
        type: 'starting',
        countdown: 3,
        target: 5,
      });
    });

    it('should return ending countdown state', () => {
      const state = { start: 5, end: 0 };
      const fixedEnd = state.start + multipliers.length - 1;
      const countdown = stateCountdown(fixedEnd - 2, state);
      expect(countdown).toEqual({
        type: 'ending',
        countdown: 2,
        target: fixedEnd,
      });
    });

    it('should return ended state', () => {
      const state = { start: 5, end: 10 };
      const countdown = stateCountdown(10, state);
      expect(countdown).toEqual({
        type: 'ended',
        countdown: 0,
        target: 10,
      });
    });
  });
});
