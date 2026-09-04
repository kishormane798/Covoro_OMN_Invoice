import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  clearConsecutiveFailSkipMarker,
  CONSECUTIVE_FAIL_SKIP_THRESHOLD,
  isConsecutiveFailSkipTripped,
  recordConsecutiveFailSkipFinalFailure,
  recordConsecutiveFailSkipPass,
} from "../utils/consecutiveFailSkip";

describe("consecutiveFailSkip", () => {
  beforeEach(() => {
    clearConsecutiveFailSkipMarker();
  });
  afterEach(() => {
    clearConsecutiveFailSkipMarker();
  });

  it("is not tripped when the marker is missing", () => {
    assert.equal(isConsecutiveFailSkipTripped(), false);
  });

  it("does not trip after 49 final failures", () => {
    for (let i = 0; i < CONSECUTIVE_FAIL_SKIP_THRESHOLD - 1; i++) {
      assert.equal(recordConsecutiveFailSkipFinalFailure(), false);
    }
    assert.equal(isConsecutiveFailSkipTripped(), false);
  });

  it("trips on the 50th final failure", () => {
    for (let i = 0; i < CONSECUTIVE_FAIL_SKIP_THRESHOLD - 1; i++) {
      recordConsecutiveFailSkipFinalFailure();
    }
    assert.equal(recordConsecutiveFailSkipFinalFailure(), true);
    assert.equal(isConsecutiveFailSkipTripped(), true);
  });

  it("resets the streak when a pass happens before the threshold", () => {
    for (let i = 0; i < CONSECUTIVE_FAIL_SKIP_THRESHOLD - 1; i++) {
      recordConsecutiveFailSkipFinalFailure();
    }
    recordConsecutiveFailSkipPass();
    assert.equal(recordConsecutiveFailSkipFinalFailure(), false);
    assert.equal(isConsecutiveFailSkipTripped(), false);
  });

  it("keeps the latch after a pass once already tripped", () => {
    for (let i = 0; i < CONSECUTIVE_FAIL_SKIP_THRESHOLD; i++) {
      recordConsecutiveFailSkipFinalFailure();
    }
    recordConsecutiveFailSkipPass();
    assert.equal(isConsecutiveFailSkipTripped(), true);
  });
});
