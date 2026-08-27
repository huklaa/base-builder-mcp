import assert from "node:assert/strict";
import test from "node:test";

import { getGuideParams } from "./params.js";

test("builds the guideLink description from the sidebar supplied at schema creation time", () => {
  const first = getGuideParams("FIRST_SIDEBAR");
  const second = getGuideParams("SECOND_SIDEBAR");

  assert.match(first.shape.guideLink.description ?? "", /FIRST_SIDEBAR/);
  assert.doesNotMatch(first.shape.guideLink.description ?? "", /SECOND_SIDEBAR/);
  assert.match(second.shape.guideLink.description ?? "", /SECOND_SIDEBAR/);
});
