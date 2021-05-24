/* eslint no-console: 0 */
/* eslint-env node, mocha */

import History from "./index";

describe("History", () => {
  it("Loads Normally", () => {
    require("./index");
  });

  it("Undo limit is set", () => {
    const instance = new History();
    const instanceWithCustomUndoSteps = new History(15);
    expect(instance.getUndoLimit()).toEqual(10);
    expect(instanceWithCustomUndoSteps.getUndoLimit()).toEqual(15);
  });

  it("Informs if can undo", () => {
    const instance = new History();
    expect(instance.canUndo()).toBeFalsy();
    instance.keep("1");
    expect(instance.canUndo()).toBeTruthy();
    instance.keep("2");
    expect(instance.canUndo()).toBeTruthy();
  });

  it("Can undo/redo object", () => {
    const instance = new History(15, true);
    instance.keep("1");
    instance.keep("2");
    expect(instance.canUndo()).toBeTruthy();
    expect(instance.getCurrent()).toEqual("2");
    expect(instance.undo()).toEqual("1");
    expect(instance.undo()).toBeNull();
    expect(instance.getCurrent()).toBeNull();
    expect(instance.redo()).toEqual("1");
    expect(instance.getCurrent()).toEqual("1");
  });

  it("Multiple undo/redo of objects", () => {
    const instance = new History();
    instance.keep("1");
    instance.keep("2");
    instance.keep("3");
    instance.keep("4");
    instance.keep("5");
    expect(instance.canUndo()).toBeTruthy();
    expect(instance.undo()).toEqual("4");
    expect(instance.undo()).toEqual("3");
    expect(instance.undo()).toEqual("2");
    expect(instance.undo()).toEqual("1");
    expect(instance.undo()).toBeNull();
    expect(instance.redo()).toEqual("1");
    expect(instance.redo()).toEqual("2");
    expect(instance.redo()).toEqual("3");
    expect(instance.redo()).toEqual("4");
    expect(instance.redo()).toEqual("5");
    expect(instance.redo()).toBeNull();
  });

  it("Redo is reset after a keep of a new object", () => {
    const instance = new History();
    instance.keep("1");
    instance.keep("2");
    instance.keep("3");
    expect(instance.canUndo()).toBeTruthy();
    expect(instance.canRedo()).toBeFalsy();
    expect(instance.undo()).toEqual("2");
    expect(instance.canRedo()).toBeTruthy();
    instance.keep("4");
    expect(instance.canRedo()).toBeFalsy();
    expect(instance.redo()).toBeNull();
  });

  it("Can clear history", () => {
    const instance = new History();
    instance.keep("1");
    instance.keep("2");
    instance.keep("3");
    expect(instance.undo()).toEqual("2");
    expect(instance.redo()).toEqual("3");
    instance.clear();
    expect(instance.canUndo()).toBeFalsy();
    expect(instance.canRedo()).toBeFalsy();
    expect(instance.undo()).toBeNull();
    expect(instance.redo()).toBeNull();
    instance.undo();
    instance.redo();
  });
});
