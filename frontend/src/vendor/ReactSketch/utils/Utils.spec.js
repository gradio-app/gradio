/* global expect,describe,it */
/* eslint no-console: 0 */
/* eslint-env node, mocha */

import { uuid4 } from "../index";

describe("Utils", () => {
  it("Loads Normally", () => {
    require("../index");
  });

  it("Generates random uuid", () => {
    expect(uuid4()).toBeDefined();
  });
});
