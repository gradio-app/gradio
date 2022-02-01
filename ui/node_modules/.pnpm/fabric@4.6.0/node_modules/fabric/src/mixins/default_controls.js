(function() {

  var controlsUtils = fabric.controlsUtils,
      scaleSkewStyleHandler = controlsUtils.scaleSkewCursorStyleHandler,
      scaleStyleHandler = controlsUtils.scaleCursorStyleHandler,
      scalingEqually = controlsUtils.scalingEqually,
      scalingYOrSkewingX = controlsUtils.scalingYOrSkewingX,
      scalingXOrSkewingY = controlsUtils.scalingXOrSkewingY,
      scaleOrSkewActionName = controlsUtils.scaleOrSkewActionName,
      objectControls = fabric.Object.prototype.controls;

  objectControls.ml = new fabric.Control({
    x: -0.5,
    y: 0,
    cursorStyleHandler: scaleSkewStyleHandler,
    actionHandler: scalingXOrSkewingY,
    getActionName: scaleOrSkewActionName,
  });

  objectControls.mr = new fabric.Control({
    x: 0.5,
    y: 0,
    cursorStyleHandler: scaleSkewStyleHandler,
    actionHandler: scalingXOrSkewingY,
    getActionName: scaleOrSkewActionName,
  });

  objectControls.mb = new fabric.Control({
    x: 0,
    y: 0.5,
    cursorStyleHandler: scaleSkewStyleHandler,
    actionHandler: scalingYOrSkewingX,
    getActionName: scaleOrSkewActionName,
  });

  objectControls.mt = new fabric.Control({
    x: 0,
    y: -0.5,
    cursorStyleHandler: scaleSkewStyleHandler,
    actionHandler: scalingYOrSkewingX,
    getActionName: scaleOrSkewActionName,
  });

  objectControls.tl = new fabric.Control({
    x: -0.5,
    y: -0.5,
    cursorStyleHandler: scaleStyleHandler,
    actionHandler: scalingEqually
  });

  objectControls.tr = new fabric.Control({
    x: 0.5,
    y: -0.5,
    cursorStyleHandler: scaleStyleHandler,
    actionHandler: scalingEqually
  });

  objectControls.bl = new fabric.Control({
    x: -0.5,
    y: 0.5,
    cursorStyleHandler: scaleStyleHandler,
    actionHandler: scalingEqually
  });

  objectControls.br = new fabric.Control({
    x: 0.5,
    y: 0.5,
    cursorStyleHandler: scaleStyleHandler,
    actionHandler: scalingEqually
  });

  objectControls.mtr = new fabric.Control({
    x: 0,
    y: -0.5,
    actionHandler: controlsUtils.rotationWithSnapping,
    cursorStyleHandler: controlsUtils.rotationStyleHandler,
    offsetY: -40,
    withConnection: true,
    actionName: 'rotate',
  });

  if (fabric.Textbox) {
    // this is breaking the prototype inheritance, no time / ideas to fix it.
    // is important to document that if you want to have all objects to have a
    // specific custom control, you have to add it to Object prototype and to Textbox
    // prototype. The controls are shared as references. So changes to control `tr`
    // can still apply to all objects if needed.
    var textBoxControls = fabric.Textbox.prototype.controls = { };

    textBoxControls.mtr = objectControls.mtr;
    textBoxControls.tr = objectControls.tr;
    textBoxControls.br = objectControls.br;
    textBoxControls.tl = objectControls.tl;
    textBoxControls.bl = objectControls.bl;
    textBoxControls.mt = objectControls.mt;
    textBoxControls.mb = objectControls.mb;

    textBoxControls.mr = new fabric.Control({
      x: 0.5,
      y: 0,
      actionHandler: controlsUtils.changeWidth,
      cursorStyleHandler: scaleSkewStyleHandler,
      actionName: 'resizing',
    });

    textBoxControls.ml = new fabric.Control({
      x: -0.5,
      y: 0,
      actionHandler: controlsUtils.changeWidth,
      cursorStyleHandler: scaleSkewStyleHandler,
      actionName: 'resizing',
    });
  }
})();
