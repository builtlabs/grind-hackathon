import { createBlock, multipliers, stateCountdown } from './block-crash';

describe('Block crash tests', () => {
  describe('createBlock', () => {
    it("should return 'none' for an empty state", () => {
      const block = createBlock();
      expect(block).toEqual({
        number: 0,
        multiplier: 0n,
        result: 'none',
      });
    });

    it("should return 'ok' for the first block", () => {
      const state = { start: 0, end: multipliers.length, current: 0 };
      const block = createBlock(state);
      expect(block).toEqual({
        number: 0,
        multiplier: multipliers[0],
        result: 'ok',
      });
    });

    it("should return 'ok' for a valid block in the range", () => {
      const state = { start: 0, end: multipliers.length, current: 5 };
      const block = createBlock(state);
      expect(block).toEqual({
        number: 5,
        multiplier: multipliers[5],
        result: 'ok',
      });
    });

    it("should return 'crash' for the end block", () => {
      const state = { start: 0, end: multipliers.length - 1, current: multipliers.length - 1 };
      const block = createBlock(state);
      expect(block).toEqual({
        number: multipliers.length - 1,
        multiplier: multipliers[multipliers.length - 1],
        result: 'crash',
      });
    });

    it("should return 'ok' for the last block", () => {
      const state = { start: 0, end: 0, current: multipliers.length - 1 };
      const block = createBlock(state);
      expect(block).toEqual({
        number: multipliers.length - 1,
        multiplier: multipliers[multipliers.length - 1],
        result: 'ok',
      });
    });

    it("should return 'none' for a block outside the range", () => {
      const state = { start: 0, end: multipliers.length - 1, current: multipliers.length };
      const block = createBlock(state);
      expect(block).toEqual({
        number: multipliers.length,
        multiplier: 0n,
        result: 'none',
      });
    });
  });

  describe('stateCountdown', () => {
    it('should return starting countdown max', () => {
      const state = { start: 20, end: 0, current: 1 };
      const countdown = stateCountdown(state);
      expect(countdown).toEqual({
        type: 'starting',
        countdown: 19,
        target: 20,
      });
    });

    it('should return starting countdown state', () => {
      const state = { start: 20, end: 0, current: 10 };
      const countdown = stateCountdown(state);
      expect(countdown).toEqual({
        type: 'starting',
        countdown: 10,
        target: 20,
      });
    });

    it('should return starting countdown min', () => {
      const state = { start: 20, end: 0, current: 19 };
      const countdown = stateCountdown(state);
      expect(countdown).toEqual({
        type: 'starting',
        countdown: 1,
        target: 20,
      });
    });

    it('should return starting countdown max', () => {
      const state = { start: 5, end: 0, current: 5 };
      const fixedEnd = state.start + multipliers.length - 1;
      const countdown = stateCountdown(state);
      expect(countdown).toEqual({
        type: 'ending',
        countdown: 50,
        target: fixedEnd,
      });
    });

    it('should return ending countdown min', () => {
      const state = { start: 5, end: 0, current: 5 + multipliers.length - 2 };
      const fixedEnd = state.start + multipliers.length - 1;
      const countdown = stateCountdown(state);
      expect(countdown).toEqual({
        type: 'ending',
        countdown: 2,
        target: fixedEnd,
      });
    });

    it('should return ended state', () => {
      const state = { start: 5, end: 0, current: 5 + multipliers.length - 1 };
      const fixedEnd = state.start + multipliers.length - 1;
      const countdown = stateCountdown(state);
      expect(countdown).toEqual({
        type: 'ended',
        countdown: 0,
        target: fixedEnd,
      });
    });
  });
});
