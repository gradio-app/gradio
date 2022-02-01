# Changelog

## [4.6.0]

- feat(fabric.util): added fabric.util.transformPath to add transformations to path points [#7300](https://github.com/fabricjs/fabric.js/pull/7300)
- feat(fabric.util): added fabric.util.joinPath, the opposite of fabric.util.parsePath [#7300](https://github.com/fabricjs/fabric.js/pull/7300)
- fix(fabric.util): use integers iterators [#7233](https://github.com/fabricjs/fabric.js/pull/7233)
- feat(fabric.Text) add path rendering to text on path [#7328](https://github.com/fabricjs/fabric.js/pull/7328)
- feat(fabric.iText): Add optional hiddenTextareaContainer to contain hiddenTextarea [#7314](https://github.com/fabricjs/fabric.js/pull/7314)
- fix(fabric.Text) added pathStartOffset and pathSide to props lists for object export [#7318](https://github.com/fabricjs/fabric.js/pull/7318)
- feat(animate): add imperative abort option for animations [#7275](https://github.com/fabricjs/fabric.js/pull/7275)
- fix(Fabric.text): account for fontSize in textpath cache dimensions ( to avoid clipping ) [#7298](https://github.com/fabricjs/fabric.js/pull/7298)
- feat(Observable.once): Add once event handler [#7317](https://github.com/fabricjs/fabric.js/pull/7317)
- feat(fabric.Object): Improve drawing of controls in group. [#7119](https://github.com/fabricjs/fabric.js/pull/7119)
- fix(EraserBrush): intersectsWithObject edge cases [#7290](https://github.com/fabricjs/fabric.js/pull/7290)
- fix(EraserBrush): dump canvas bg/overlay color support [#7289](https://github.com/fabricjs/fabric.js/pull/7289)
- feat(fabric.Text) added pathSide property to text on path [#7259](https://github.com/fabricjs/fabric.js/pull/7259)
- fix(EraserBrush) force fill value [#7269](https://github.com/fabricjs/fabric.js/pull/7269)
- fix(fabric.StaticCanvas) properly remove objects on canvas.clear [#6937](https://github.com/fabricjs/fabric.js/pull/6937)
- feat(fabric.EraserBrush): improved erasing:end event [#7258](https://github.com/fabricjs/fabric.js/pull/7258)
- fix(shapes): fabric.Object._fromObject never should return [#7201](https://github.com/fabricjs/fabric.js/pull/7201)
- feat(fabric.filters) Added vibrance filter (for increasing saturation of muted colors) [#7189](https://github.com/fabricjs/fabric.js/pull/7189)
- fix(fabric.StaticCanvas): restore canvas size when disposing [#7181](https://github.com/fabricjs/fabric.js/pull/7181)
- feat(fabric.util): added `convertPointsToSVGPath` that will convert from a list of points to a smooth curve. [#7140](https://github.com/fabricjs/fabric.js/pull/7140)
- fix(fabric.Object): fix cache invalidation issue when objects are rotating [#7183](https://github.com/fabricjs/fabric.js/pull/7183)
- fix(fabric.Canvas): rectangle selection works with changing viewport [#7088](https://github.com/fabricjs/fabric.js/pull/7088)
- feat(fabric.Text): textPath now support textAlign [#7156](https://github.com/fabricjs/fabric.js/pull/7156)
- fix(fabric.EraserBrush): test eraser intersection with objects taking into account canvas viewport transform [#7147](https://github.com/fabricjs/fabric.js/pull/7147)
- fix(fabric.Object): support `excludeFromExport` set on `clipPath` [#7148](https://github.com/fabricjs/fabric.js/pull/7148).
- fix(fabric.Group): support `excludeFromExport` set on objects [#7148](https://github.com/fabricjs/fabric.js/pull/7148).
- fix(fabric.StaticCanvas): support `excludeFromExport` set on `backgroundColor`, `overlayColor`, `clipPath` [#7148](https://github.com/fabricjs/fabric.js/pull/7148).
- fix(fabric.EraserBrush): support object resizing (needed for eraser) [#7100](https://github.com/fabricjs/fabric.js/pull/7100).
- fix(fabric.EraserBrush): support canvas resizing (overlay/background drawables) [#7100](https://github.com/fabricjs/fabric.js/pull/7100).
- fix(fabric.EraserBrush): propagate `clipPath` of group to erased objects when necessary so it is correct when ungrouping/removing from group [#7100](https://github.com/fabricjs/fabric.js/pull/7100).
- fix(fabric.EraserBrush): introduce `erasable = deep` option for `fabric.Group` [#7100](https://github.com/fabricjs/fabric.js/pull/7100).
- feat(fabric.Collection): the `contains` method now accepts a second boolean parameter `deep`, checking all descendants, `collection.contains(obj, true)` [#7139](https://github.com/fabricjs/fabric.js/pull/7139).
- fix(fabric.StaticCanvas): disposing canvas now restores canvas size and style to original state.

## [4.5.1]

- fix(fabric.Text): fixes decoration rendering when there is a single rendering for full text line [#7104](https://github.com/fabricjs/fabric.js/pull/7104)
- fix(fabric.Text): spell error which made the gradientTransform not working [#7059](https://github.com/fabricjs/fabric.js/pull/7059)
- fix(fabric.util): unwanted mutation in fabric.util.rotatePoint [#7117](https://github.com/fabricjs/fabric.js/pull/7117)
- fix(svg parser): Ensure that applyViewboxTransform returns an object and not undefined/null [#7030](https://github.com/fabricjs/fabric.js/pull/7030)
- fix(fabric.Text): support firefox with ctx.textAlign for RTL text [#7126](https://github.com/fabricjs/fabric.js/pull/7126)

## [4.5.0]

- fix(fabric.PencilBrush) decimate deleting end of a freedrawing line [#6966](https://github.com/fabricjs/fabric.js/pull/6966)
- feat(fabric.Text): Adding support for RTL languages by adding `direction` property [#7046](https://github.com/fabricjs/fabric.js/pull/7046)
- feat(fabric) Add an eraser brush as optional module [#6994](https://github.com/fabricjs/fabric.js/pull/6994)
- fix v4: 'scaling' event triggered before object position is adjusted [#6650](https://github.com/fabricjs/fabric.js/pull/6650)
- Fix(fabric.Object): CircleControls transparentCorners styling [#7015](https://github.com/fabricjs/fabric.js/pull/7015)
- Fix(svg_import): svg parsing in case it uses empty use tag or use with image href [#7044](https://github.com/fabricjs/fabric.js/pull/7044)
- fix(fabric.Shadow): `offsetX`, `offsetY` and `blur` supports float [#7019](https://github.com/fabricjs/fabric.js/pull/7019)

## [4.4.0]

- fix(fabric.Object) wrong variable name `cornerStrokeColor ` [#6981](https://github.com/fabricjs/fabric.js/pull/6981)
- fix(fabric.Text): underline color with text style ( regression from text on a path) [#6974](https://github.com/fabricjs/fabric.js/pull/6974)
- fix(fabric.Image): Cache CropX and CropY cache properties [#6924](https://github.com/fabricjs/fabric.js/pull/6924)
- fix(fabric.Canvas): Add target to each selection event [#6858](https://github.com/fabricjs/fabric.js/pull/6858)
- fix(fabric.Image): fix wrong scaling value for the y axis in renderFill [#6778](https://github.com/fabricjs/fabric.js/pull/6778)
- fix(fabric.Canvas): set isMoving on real movement only  [#6856](https://github.com/fabricjs/fabric.js/pull/6856)
- fix(fabric.Group) make addWithUpdate compatible with nested groups [#6774](https://github.com/fabricjs/fabric.js/pull/6774)
- fix(Fabric.Text): Add path to text export and import [#6844](https://github.com/fabricjs/fabric.js/pull/6844)
- fix(fabric.Canvas) Remove controls check in the pixel accuracy target [#6798](https://github.com/fabricjs/fabric.js/pull/6798)
- feat(fabric.Canvas): Added activeOn 'up/down' property [#6807](https://github.com/fabricjs/fabric.js/pull/6807)
- feat(fabric.BaseBrush): limitedToCanvasSize property to brush [#6719](https://github.com/fabricjs/fabric.js/pull/6719)

## [4.3.1]

- fix(fabric.Control) implement targetHasOneFlip using shorthand [#6823](https://github.com/fabricjs/fabric.js/pull/6823)
- fix(fabric.Text) fix typo in cacheProperties preventing cache clear to work [#6775](https://github.com/fabricjs/fabric.js/pull/6775)
- fix(fabric.Canvas): Update backgroundImage and overlayImage coordinates on zoom change [#6777](https://github.com/fabricjs/fabric.js/pull/6777)
- fix(fabric.Object): add strokeuniform to object toObject output. [#6772](https://github.com/fabricjs/fabric.js/pull/6772)
- fix(fabric.Text): Improve path's angle detection for text on a path [#6755](https://github.com/fabricjs/fabric.js/pull/6755)

## [4.3.0]

- fix(fabric.Textbox): Do not let splitbygrapheme split text previously unwrapped [#6621](https://github.com/fabricjs/fabric.js/pull/6621)
- feat(fabric.controlsUtils) Move drag to actions to control handlers [#6617](https://github.com/fabricjs/fabric.js/pull/6617)
- feat(fabric.Control): Add custom control size per control. [#6562](https://github.com/fabricjs/fabric.js/pull/6562)
- fix(svg_export): svg export in path with gradient and added tests [#6654](https://github.com/fabricjs/fabric.js/pull/6654)
- fix(fabric.Text): improve compatibility with transformed gradients [#6669](https://github.com/fabricjs/fabric.js/pull/6669)
- feat(fabric.Text): Add ability to put text on paths BETA [#6543](https://github.com/fabricjs/fabric.js/pull/6543)
- fix(fabric.Canvas): rotation handle should take origin into account [#6686](https://github.com/fabricjs/fabric.js/pull/6686)
- fix(fabric.Text): Text on path, fix non linear distance of chars over path  [#6671](https://github.com/fabricjs/fabric.js/pull/6671)

## [4.2.0]

- fix(fabric.utils): ISSUE-6566 Fix SVGs for special Arc lines [#6571](https://github.com/fabricjs/fabric.js/pull/6571)
- fix(fabric.Canvas): Fix mouse up target when different from action start [#6591](https://github.com/fabricjs/fabric.js/pull/6591)
- added: feat(fabric.controlsUtils): Fire resizing event for textbox width [#6545](https://github.com/fabricjs/fabric.js/pull/6545)

## [4.1.0]
- feat(Brushes): add beforePathCreated event [#6492](https://github.com/fabricjs/fabric.js/pull/6492);
- feat(fabric.Path): Change the way path is parsed and drawn. simplify path at parsing time [#6504](https://github.com/fabricjs/fabric.js/pull/6504);
- feat(fabric.Path): Simplify S and T command in C and Q. [#6507](https://github.com/fabricjs/fabric.js/pull/6507);
- fix(fabric.Textbox): ISSUE-6518 Textbox and centering scaling [#6524](https://github.com/fabricjs/fabric.js/pull/6524);
- fix(fabric.Text): Ensure the shortcut text render the passed argument and not the entire line [#6526](https://github.com/fabricjs/fabric.js/pull/6526);
- feat(fabric.util): Add a function to work with path measurements [#6525](https://github.com/fabricjs/fabric.js/pull/6525);
- fix(fabric.Image): rendering pixel outside canvas size [#6326](https://github.com/fabricjs/fabric.js/pull/6326);
- fix(fabric.controlsUtils): stabilize scaleObject function [#6540](https://github.com/fabricjs/fabric.js/pull/6540);
- fix(fabric.Object): when in groups or active groups, fix the ability to shift deselect [#6541](https://github.com/fabricjs/fabric.js/pull/6541);

## [4.0.0]
- fixed the gesture module to not break with 4.0 [#6491](https://github.com/fabricjs/fabric.js/pull/6491);
- fix(fabric.IText): copy style in non full mode when typing text [#6454](https://github.com/fabricjs/fabric.js/pull/6454);
- feat(fabric.Controls) expose the extra utils for control handling.
Breaking: rename fabric.controlHandlers and fabric.controlRenderers to fabric.controlsUtils.

## [4.0.0-rc.1]
- fix(fabric.Canvas): ISSUE-6314 rerender in case of drag selection that select a single oobject. [#6421](https://github.com/fabricjs/fabric.js/pull/6421);
- feat(text): allow correct cursor/selection position if text is edited inside a group. [#6256](https://github.com/fabricjs/fabric.js/pull/6256);
- feat(fabric.Control): remove position option in favor of x and y [#6415](https://github.com/fabricjs/fabric.js/pull/6415);
- fix(fabric.Object) ISSUE-6340 infinite recursion on groups [#6416](https://github.com/fabricjs/fabric.js/pull/6416);
- fix(fabric.Object): geometry mixin fix partiallyOnscreen [#6402](https://github.com/fabricjs/fabric.js/pull/6402);
- fix(fabric.Image): ISSUE-6397 modify crossOrigin behaviour for setSrc [#6414](https://github.com/fabricjs/fabric.js/pull/6414);
- Breaking: fabric.Image.setCrossOrigin is gone. Having the property on the fabric.Image is misleading and brings to errors. crossOrigin is for loading/reloading only, and is mandatory to specify it each load.
- Breaking: fabric.Control constructor does not accept anymore a position object, but 2 properties, x and y.

## [4.0.0-beta.12]
- fix(fabric.IText): respect value of `cursorColor` [#6300](https://github.com/fabricjs/fabric.js/pull/6300);
- fix(fabric.Textbox): Improve splitByGrapheme and charSpacing [#6298](https://github.com/fabricjs/fabric.js/pull/6298);
- feat(controls): Reintroduce flip by scaling and lockScalingFlip [#6313](https://github.com/fabricjs/fabric.js/pull/6313);

## [4.0.0-beta.11]
- fix(itext): improved style handling for new lines [#6268](https://github.com/fabricjs/fabric.js/pull/6268)
- fix(controls): Fix flip and controls and skewY and controls. [#6278](https://github.com/fabricjs/fabric.js/pull/6278)
- fix(controls): Current position with handlers is wrong if using skew [#6267](https://github.com/fabricjs/fabric.js/pull/6267)
- breaking: setCoords has only one argument now `skipCorners` boolean. setCoords will always update aCoords, lineCoords. If skipCorners is not specified, it will alos update oCoords();
- feat(fabric.Image): Image.imageSmoothing for fabric.Image objects [#6280](https://github.com/fabricjs/fabric.js/pull/6280)
- fix(fabric.StaticCanvas): export to dataUrl and canvasElement will respect imageSmoothingEnabled [#6280](https://github.com/fabricjs/fabric.js/pull/6280)
- fix(fabric.Image): toSVG export with missing element won't crash [#6280](https://github.com/fabricjs/fabric.js/pull/6280)
- added: added fabric.util.setImageSmoothing(ctx, value);
- added svg import/export for image image-rendering attribute
- fix(svg_import): Fix some parsing logic for nested SVGs. [#6284](https://github.com/fabricjs/fabric.js/pull/6284)
- fix(fabric.Image): do not crash if image has no element [#6285](https://github.com/fabricjs/fabric.js/pull/6285)

BREAKING:
- removed 2 utils member that was not used anywhere: fabric.util.getScript, fabric.util.getElementStyle
- remove private member _setImageSmoothing in the canvas: use fabric.util.setImageSmoothing(ctx, value);


## [4.0.0-beta.10]
- fix(controls): fix missing target in canvas event options [#6251](https://github.com/fabricjs/fabric.js/pull/6251)
- fix(controls): correct position for offsets [#6250](https://github.com/fabricjs/fabric.js/pull/6250)
- feat(utils): Added more error flag passing throughout functions [#6238](https://github.com/fabricjs/fabric.js/pull/6238)

## [4.0.0-beta.9]
- fix(controls) show offsetX/offsetY correctly. [#6236](https://github.com/fabricjs/fabric.js/pull/6236)
- fix(controls) ISSUE-6201 Restore per object setting of controls visibility [#6226](https://github.com/fabricjs/fabric.js/pull/6226)
- fix(svg_parser): ISSUE-6220 Allow to parse font declaration that start with a number [#6222](https://github.com/fabricjs/fabric.js/pull/6222)

## [4.0.0-beta.8]
- fix(IText) Stop composition events on mousedown to enable cursor position on android keyboards [#6224](https://github.com/fabricjs/fabric.js/pull/6224)
- fix(controls): Handle textbox width change properly [#6219](https://github.com/fabricjs/fabric.js/pull/6219)
- fix(controls): correctly handling the uniform scaling option [#6218](https://github.com/fabricjs/fabric.js/pull/6218)
- fix(fabric.Object): fix activeSelection toDataURL canvas restore [#6216](https://github.com/fabricjs/fabric.js/pull/6216)
- fix(svg_parsers): Add support for empty <style/> tags [#6169](https://github.com/fabricjs/fabric.js/pull/6169)
- fix(SVG_export, text): Check font faces markup for objects within groups [#6195](https://github.com/fabricjs/fabric.js/pull/6195)
- feat(animation): Extend fabric.util.animate animating colors and other properties[#6191](https://github.com/fabricjs/fabric.js/pull/6191)
- fix(svg_export): remove extra space from svg export [#6209](https://github.com/fabricjs/fabric.js/pull/6209)
- fix(svg_import): ISSUE-6170 do not try to create missing clippath [#6210](https://github.com/fabricjs/fabric.js/pull/6210)
- fix(fabric.Object) Adding existence check for this.canvas on object stacking mixins [#6207](https://github.com/fabricjs/fabric.js/pull/6207)

## [4.0.0-beta.7]

feat(controls): Added controls mouseUpHandler and mouseDownHandler [#6158](https://github.com/fabricjs/fabric.js/pull/6158)
Removal of deprecated methods / patterns. [#6111](https://github.com/fabricjs/fabric.js/pull/6111)
- removed Object.setShadow, and BaseBrush.setShadow. change `rect.setShadow(options)` to `rect.set('shadow', new fabric.Shadow(options))`
- removed Object.transformMatrix.
- removed `object:selected` event. use `selection:created`. In the callback you will still find  `target` in the options, but also you will find `selected` with all the objects selected during that single event.
- removed Gradient.forObject. No alternative available.
- removed Object and canvas `clipTo`. Use Object.clipPath;
- removed Canvas.loadFromDatalessJSON, it was just an alias for `loadFromJSON`
- removed `observe`, `stopObserving`, `trigger` from observable. Keep using `on`, `off`, `fire`.
- removed the Object.set ability to take a function as a value. Was rather strange to use.
- removed Object.setGradient. Change `rect.setGradient(options)` with `rect.set('fill', new fabric.Gradient(otherOptions))`. The options format is slightly different, but keeping 2 formats does not really make sense.
- removed Object.setPatternFill. Change `rect.setPatternFill(options)` to `rect.set('fill', new fabric.Pattern(options))`;
- removed Object.setColor. Change `rect.setColor(color)` to `rect.set('fill', color)`
- removed fabric.util.customTransformMatrix. Use the replacement fabric.util.composeMatrix

## [4.0.0-beta.6]

fix(fabric.IText): exitEditing won't error on missing hiddenTextarea. [#6138](https://github.com/fabricjs/fabric.js/pull/6138)

## [4.0.0-beta.5]

fix(fabric.Object): getObjectScaling takes in account rotation of objects inside groups. [#6118](https://github.com/fabricjs/fabric.js/pull/6118)

## [4.0.0-beta.4]

fix(fabric.Group): will draw shadow will call parent method. [#6116](https://github.com/fabricjs/fabric.js/pull/6116)

## [4.0.0-beta.3]

fix(controls): control offset rendering code had extras `beginPath` that would clear all but not the last of them [#6114](https://github.com/fabricjs/fabric.js/pull/6114)

## [4.0.0-beta.2]

fix(controls): Control.getVisibility will always receive the fabric.Object argument.

## [4.0.0-beta.1]

breaking: All your old control code override will not work
breaking: `uniScaleTransform` has been renamed in `uniformScaling`, meaning changed and  the default  value swapped. The behaviour is unchanged, but now the description and the name match.
breaking: Object.lockUniScaling is removed. Alternatives to get the same identical functionality with less code are being evaluated.
breaking: Canvas.onBeforeScaleRotate is removed, developers need to migrate to the event `before:transform’

## [3.6.2]
- fix fabric.Object.toDataURL blurriness on images with odd pixel number [#6131](https://github.com/fabricjs/fabric.js/pull/6131)

## [3.6.1]
- fix(gradient, text): ISSUE-6014 ISSUE-6077 support percentage gradient in text [#6090](https://github.com/fabricjs/fabric.js/pull/6090)
- fix(filters): ISSUE-6072 convolution filter is off by one [#6088](https://github.com/fabricjs/fabric.js/pull/6088)
- fix(transform): Fix a bug in the skewing logic [#6082](https://github.com/fabricjs/fabric.js/pull/6088)

## [3.6.0]
- fix: ISSUE-5512 better Clippath transform parsing in SVG [#5983](https://github.com/fabricjs/fabric.js/pull/5983)
- fix: ISSUE-5984 Avoid enter editing in non selectable object [#5989](https://github.com/fabricjs/fabric.js/pull/5989)
- Tweak to object._setLineDash to avoid cycles when nothing in array [#6000](https://github.com/fabricjs/fabric.js/pull/6000)
- fix: ISSUE-5867 Fix the extra new line selection with empty line [#6011](https://github.com/fabricjs/fabric.js/pull/6011)
- Improvement: Use SVG Namespace for SVG Elements [#5957](https://github.com/fabricjs/fabric.js/pull/5957)
- Improvement: ISSUE-4115 - triggers in/out events for sub targets [#6013](https://github.com/fabricjs/fabric.js/pull/6013)
- Improvement: Upper canvas retina scaling [#5938](https://github.com/fabricjs/fabric.js/pull/5938)

## [3.5.1]
- Fix for textbox non defined in scaleObject [#5896](https://github.com/fabricjs/fabric.js/pull/5896)
- Fix canvas pattern as background and exports [#5973](https://github.com/fabricjs/fabric.js/pull/5973)
- Fix for type error if style is null when checking if is empty [#5971](https://github.com/fabricjs/fabric.js/pull/5971)
- Fix for load from datalessJSON for svg groups with sourcePath [#5970](https://github.com/fabricjs/fabric.js/pull/5970)

## [3.5.0]
- Deprecation: deprecated 3 method of the api that will disappear in fabric 4: setPatternFill, setColor, setShadow.
- Fix: remove line dash modification for strokeUniform [#5953](https://github.com/fabricjs/fabric.js/pull/5953)
- Improvement: ISSUE-5955 parse svg clip-path recursively [#5960](https://github.com/fabricjs/fabric.js/pull/5960)
- Fix: object.toCanvasElement of objects in groups [#5962](https://github.com/fabricjs/fabric.js/pull/5962)
- change pencil brush finalize to be in line with other brushes [#5866](https://github.com/fabricjs/fabric.js/pull/5866)

## [3.4.0]
- Support fill-opacity on gradient parsing from SVG. [#5812](https://github.com/fabricjs/fabric.js/pull/5812)
- Rewrite gradient parsing from SVG to work with more transformation and combinations of attributes. [#5836](https://github.com/fabricjs/fabric.js/pull/5836)
- Added Gradient.gradientUnits property to support percent based gradients on shapes.[#5836](https://github.com/fabricjs/fabric.js/pull/5836)
- Changed animation logic so that onComplete gets always called with the final values of the animation.[#5813](https://github.com/fabricjs/fabric.js/pull/5813)

## [3.3.0]
- Differently support multi mouse events, fix multi touch on various browser [#5785](https://github.com/fabricjs/fabric.js/pull/5785)
- Word boundary search update on grapheme clusters [#5788](https://github.com/fabricjs/fabric.js/pull/5788)
- Enable deps free version [#5786](https://github.com/fabricjs/fabric.js/pull/5786)
- Remove variables named as reserved words [#5782](https://github.com/fabricjs/fabric.js/pull/5782)

## [3.2.0]
- Fix: Better handling of upperCanvas in toCanvasElement. [#5736](https://github.com/fabricjs/fabric.js/pull/5736)
- Add: Pass raw event information to brushes [#5687](https://github.com/fabricjs/fabric.js/pull/5687)
- Deprecation: officially deprecated Object.transformMatrix [#5747](https://github.com/fabricjs/fabric.js/pull/5747)
- Fix: Fix group.toSVG regression. [#5755](https://github.com/fabricjs/fabric.js/pull/5755)
- Fix: PencilBrush regression on simple points. [#5771](https://github.com/fabricjs/fabric.js/pull/5771)

## [3.1.0]
- Fix: unbreak IE10. [#5678](https://github.com/fabricjs/fabric.js/pull/5678)
- Improvement: Support scientific notation with uppercase E. [#5731](https://github.com/fabricjs/fabric.js/pull/5731)
- Add: PencilBrush brush now support `decimate` property to remove dots that are too near to each other. [#5718](https://github.com/fabricjs/fabric.js/pull/5718)

## [3.0.0]
- Breaking: removed support for node 4 and 6. [#5356](https://github.com/fabricjs/fabric.js/pull/5356)
- Breaking: changed objectCaching meaning to disable caching only if possible. [#5566](https://github.com/fabricjs/fabric.js/pull/5566)
- Breaking: private method `_setLineStyle` can set only empty object now [#5588](https://github.com/fabricjs/fabric.js/pull/5588)
- Breaking: private method `_getLineStyle` can only return boolean now [#5588](https://github.com/fabricjs/fabric.js/pull/5588)
- Fix: splitByGrapheme can now handle cursor properly [#5588](https://github.com/fabricjs/fabric.js/pull/5588)
- Add: Added hasStroke and hasFill, helper methods for decisions on caching and for devs, change image shouldCache method [#5567](https://github.com/fabricjs/fabric.js/pull/5567)
- Fix: Canvas toObject won't throw error now if there is a clipPath [#5556](https://github.com/fabricjs/fabric.js/pull/5556)
- Add: added `nonScaling` property to shadow class [#5558](https://github.com/fabricjs/fabric.js/pull/5558)
- Fix: fixed import of Rect from SVG when has 0 dimensions. [#5582](https://github.com/fabricjs/fabric.js/pull/5582)
- Fix: Shadow offset in dataurl export with retina [#5593](https://github.com/fabricjs/fabric.js/pull/5593)
- Fix: Text can be used as clipPath in SVG export (output is not correct yet) [#5591](https://github.com/fabricjs/fabric.js/pull/5591)
- Add: Fabric.disableStyleCopyPasting to disable style transfers on copy-paste of itext [#5590](https://github.com/fabricjs/fabric.js/pull/5590)
- Fix: avoid adding quotes to fontFamily containing a coma [#5624](https://github.com/fabricjs/fabric.js/pull/5624)
- Fix: strokeUniform and cache dimensions [#5626](https://github.com/fabricjs/fabric.js/pull/5626)
- Fix: Do not call onSelect on objects that won't be part of the selection [#5632](https://github.com/fabricjs/fabric.js/pull/5632)
- Fix: fixed handling of empty lines in splitByGrapheme [#5645](https://github.com/fabricjs/fabric.js/pull/5645)
- Fix: Textbox selectable property not restored after exitEditing [#5655](https://github.com/fabricjs/fabric.js/pull/5655)
- Fix: 'before:selection:cleared' event gets target in the option passed [#5658](https://github.com/fabricjs/fabric.js/pull/5658)
- Added: enablePointerEvents options to Canvas activates pointer events [#5589](https://github.com/fabricjs/fabric.js/pull/5589)
- Fix: Polygon/Polyline/Path respect points position when initializing [#5668](https://github.com/fabricjs/fabric.js/pull/5668)
- Fix: Do not load undefine objects in group/canvas array when restoring from JSON or SVG. [#5684](https://github.com/fabricjs/fabric.js/pull/5684)
- Improvement: support for canvas background or overlay as gradient [#5684](https://github.com/fabricjs/fabric.js/pull/5684)
- Fix: properly restore clipPath when restoring from JSON [#5641](https://github.com/fabricjs/fabric.js/pull/5641)
- Fix: respect chainable attribute in observable mixin [#5606](https://github.com/fabricjs/fabric.js/pull/5606)

## [2.7.0]
- Add: strokeUniform property, avoid stroke scaling with paths [#5473](https://github.com/fabricjs/fabric.js/pull/5473)
- Fix: fix bug in image setSrc [#5502](https://github.com/fabricjs/fabric.js/pull/5502)
- Add: strokeUniform import/export svg [#5527](https://github.com/fabricjs/fabric.js/pull/5527)
- Fix: GraphemeSplit and toSvg for circle [#5544](https://github.com/fabricjs/fabric.js/pull/5544)
- Improvement: support running in a XML document [#5530](https://github.com/fabricjs/fabric.js/pull/5530)

## [2.6.0]
- Fix: avoid ie11 to throw on weird draw images [#5428](https://github.com/fabricjs/fabric.js/pull/5428)
- Fix: a rare case of invisible clipPath [#5477](https://github.com/fabricjs/fabric.js/pull/5477)
- Fix: testability of code under node when webgl is involved [#5478](https://github.com/fabricjs/fabric.js/pull/5478)
- Add: Grapeheme text wrapping for Textbox (Textbox.splitByGrapheme) [#5479](https://github.com/fabricjs/fabric.js/pull/5479)
- Add: fabric.Object.toCanvasElement [#5481](https://github.com/fabricjs/fabric.js/pull/5481)

## [2.5.0]
- Fix: textbox transform report newScaleX and newScaleY values [#5464](https://github.com/fabricjs/fabric.js/pull/5464)
- Fix: export of svg and gradient with transforms [#5456](https://github.com/fabricjs/fabric.js/pull/5456)
- Fix: detection of controls in perPixelTargetFind + cache [#5455](https://github.com/fabricjs/fabric.js/pull/5455)
- Add: added canvas.toCanvasElement method [#5452](https://github.com/fabricjs/fabric.js/pull/5452)

## [2.4.6]
- Fix: unbreak the svg export broken in 2.4.5 [#5438](https://github.com/fabricjs/fabric.js/pull/5438)

## [2.4.5]
- Fix: svg import/export for canvas+clipPath and letterspacing. [#5424](https://github.com/fabricjs/fabric.js/pull/5424)
- Fix: avoid stroke dash from group selection to leak on upper canvas [#5392](https://github.com/fabricjs/fabric.js/pull/5392)

## [2.4.4]
- Fix: add clipPath to stateful cache check. [#5384](https://github.com/fabricjs/fabric.js/pull/5384)
- Fix: restore draggability of small objects [#5379](https://github.com/fabricjs/fabric.js/pull/5379)
- Improvement: Added strokeDashOffset to objects and from SVG import. [#5398](https://github.com/fabricjs/fabric.js/pull/5398)
- Fix: do not mark objects as invisible if strokeWidth is > 0 [#5382](https://github.com/fabricjs/fabric.js/pull/5382)
- Improvement: Better gradients parsing with xlink:href [#5357](https://github.com/fabricjs/fabric.js/pull/5357)

## [2.4.3]
- Fix: Shift click and onSelect function [#5348](https://github.com/fabricjs/fabric.js/pull/5348)
- Fix: Load from Json from images with filters and resize filters [#5346](https://github.com/fabricjs/fabric.js/pull/5346)
- Fix: Remove special case of 1x1 rect [#5345](https://github.com/fabricjs/fabric.js/pull/5345)
- Fix: Group with clipPath restore [#5344](https://github.com/fabricjs/fabric.js/pull/5344)
- Fix: Fix shift + click interaction with unselectable objects [#5324](https://github.com/fabricjs/fabric.js/pull/5324)

## [2.4.2]
- Fix: Better toSVG support to enable clipPath [#5284](https://github.com/fabricjs/fabric.js/pull/5284)
- Fix: Per pixel target find and groups and sub targets [#5287](https://github.com/fabricjs/fabric.js/pull/5287)
- Fix: Object clone as Image and shadow clipping [#5308](https://github.com/fabricjs/fabric.js/pull/5308)
- Fix: IE11 loading SVG [#5307](https://github.com/fabricjs/fabric.js/pull/5307)

## [2.4.1]
- Fix: Avoid enterEditing if another object is the activeObject [#5261](https://github.com/fabricjs/fabric.js/pull/5261)
- Fix: clipPath enliving for Image fromObject [#5279](https://github.com/fabricjs/fabric.js/pull/5279)
- Fix: toDataURL and canvas clipPath [#5278](https://github.com/fabricjs/fabric.js/pull/5278)
- Fix: early return if no xml is available [#5263](https://github.com/fabricjs/fabric.js/pull/5263)
- Fix: clipPath svg parsing in nodejs [#5262](https://github.com/fabricjs/fabric.js/pull/5262)
- Fix: Avoid running selection logic on mouse up [#5259](https://github.com/fabricjs/fabric.js/pull/5259)
- Fix: fix font size parsing on SVG [#5258](https://github.com/fabricjs/fabric.js/pull/5258)
- Fix: Avoid extra renders on mouseUp/Down [#5256](https://github.com/fabricjs/fabric.js/pull/5256)

## [2.4.0]
- Add: Add clipPath support to canvas and svg import/export. Low compatibility yet.

## [2.3.6]
- Fix: Make image.class aware of naturalWidth and naturalHeight. [#5178](https://github.com/fabricjs/fabric.js/pull/5178)
- Fix: Make 2 finger events works again [#5177](https://github.com/fabricjs/fabric.js/pull/5177)
- Fix: Make Groups respect origin and correct position ( fix spray/circle brushes ) [#5176](https://github.com/fabricjs/fabric.js/pull/5176)

## [2.3.5]
 - Change: make canvas.getObjects() always return a shallow copy of the array [#5162](https://github.com/fabricjs/fabric.js/pull/5162)
 - Fix: Improve fabric.Pattern.toSVG to look correct on offsets and no-repeat [#5164](https://github.com/fabricjs/fabric.js/pull/5164)
 - Fix: Do not enter edit in Itext if the mouseUp is relative to a group selector [#5153](https://github.com/fabricjs/fabric.js/pull/5153)
 - Improvement: Do not require xlink namespace in front of href attribut for svgs ( is a SVG2 new spec, unsupported ) [#5156](https://github.com/fabricjs/fabric.js/pull/5156)
 - Fix: fix resizeFilter having the wrong cached texture, also improved interaction between filters [#5165](https://github.com/fabricjs/fabric.js/pull/5165)

## [2.3.4]
 - Fix: ToSVG was ignoring excludeFromExport for backgroundImage and OverlayImage. [#5075](https://github.com/fabricjs/fabric.js/pull/5075)
 - Fix: ToSVG for circle with start and end angles. [#5085](https://github.com/fabricjs/fabric.js/pull/5085)
 - Fix: Added callback for setPatternFill. [#5101](https://github.com/fabricjs/fabric.js/pull/5101)
 - Fix: Resize filter taking in account multiple scale sources. [#5117](https://github.com/fabricjs/fabric.js/pull/5117)
 - Fix: Blend image filter clean after refilter. [#5121](https://github.com/fabricjs/fabric.js/pull/5121)
 - Fix: Object.toDataURL should not be influenced by zoom. [#5139](https://github.com/fabricjs/fabric.js/pull/5139)
 - Improvement: requestRenderAllBound add to Canvas instance. [#5138](https://github.com/fabricjs/fabric.js/pull/5138)
 - Improvement: Make path bounding cache optional and also reacheable/cleanable [#5140](https://github.com/fabricjs/fabric.js/pull/5140)
 - Improvement: Make the logic of isNeutralState filters work before filtering start. [#5129](https://github.com/fabricjs/fabric.js/pull/5129)
 - Improvement: Added some code to clean up some memory when canvas is disposed in nodejs. [#5142](https://github.com/fabricjs/fabric.js/pull/5142)
 - Fix: Make numeric origins work with group creation. [#5143](https://github.com/fabricjs/fabric.js/pull/5143)

## [2.3.3]
 - Fix: Fixed font generic names for text, measurement of zero width related characters and also trailing of cursor when zooming. [#5048](https://github.com/fabricjs/fabric.js/pull/5048)

## [2.3.2]
 - Fix: justify + charspacing + textDecoration Add and improve more events for transformations and mouse interaction. [#5007](https://github.com/fabricjs/fabric.js/pull/5007) [#5009](https://github.com/fabricjs/fabric.js/pull/5009)
 - Fix: Enter edit on object selected programmatically. [#5010](https://github.com/fabricjs/fabric.js/pull/5010)
 - Fix: Canvas.dispose was not removing all events properly. [#5020](https://github.com/fabricjs/fabric.js/pull/5020)
 - Fix: Make rgba and hsla regex work case insensitive. [#5017](https://github.com/fabricjs/fabric.js/pull/5017)
 - Fix: Make group transitioning from not cached to cached work. [#5021](https://github.com/fabricjs/fabric.js/pull/5021)

## [2.3.1]
 - Improve nested svg import and text positioning, spikes. [#4984](https://github.com/kangax/fabric.js/pull/4984)

## [2.3.0]
 - Add and improve more events for transformations and mouse interaction [#4979](https://github.com/kangax/fabric.js/pull/4979)
 - Improvement: whenever possible use cache for target transparency sampling [#4955](https://github.com/kangax/fabric.js/pull/4955)

## [2.2.4]
 - Fix getPointer on touch devices [#4866](https://github.com/kangax/fabric.js/pull/4866)
 - Fix issues with selectionDashArray bleeding into free drawing [#4894](https://github.com/kangax/fabric.js/pull/4894)
 - Fix blur filter for nodejs [#4905](https://github.com/kangax/fabric.js/pull/4905)
 - Fix Register mousemove as non passive to help touch devices [#4933](https://github.com/kangax/fabric.js/pull/4933)
 - Fix modified shadow tosvg for safari compatibility [#4934](https://github.com/kangax/fabric.js/pull/4934)
 - Fix shader to avoid premultiplied alpha pixel getting dirty in blend filter [#4936](https://github.com/kangax/fabric.js/pull/4936)
 - Add isPartiallyOnScreen method [#4856](https://github.com/kangax/fabric.js/pull/4856)
 - Fix isEqual failing on array/null or objects/null/string compare [#4949](https://github.com/kangax/fabric.js/pull/4949)
 - Fix pencilBrush with alpha and with rerendering canvas [#4938](https://github.com/kangax/fabric.js/pull/4938)

## [2.2.3]
 - improvement: Allow to parse quoted url string. url('#myid') [#4881](https://github.com/kangax/fabric.js/pull/4881)
 - improvement: text fromSVG import char-spacing attribute [#3718](https://github.com/kangax/fabric.js/pull/3718)
 - fix: text toSVG export with multiple spaces in safari [#4880](https://github.com/kangax/fabric.js/pull/4880)
 - fix: setSrc reset width and height on images [#4877](https://github.com/kangax/fabric.js/pull/4877)
 - improvements: Removed forced origin swap when rotating [#4878](https://github.com/kangax/fabric.js/pull/4878)
 - fix: Make the background of canvas cover all SVG in toSVG export [#4852](https://github.com/kangax/fabric.js/pull/4852)
 - fix: Added startAngle to cacheProperties for fabric.Circle [#4875](https://github.com/kangax/fabric.js/pull/4875)
 - fix: Rerender all the content of upperCanvas if canvas gets resized [#4850](https://github.com/kangax/fabric.js/pull/4850)
 - fix: Remove references to context when disposing [#4846](https://github.com/kangax/fabric.js/pull/4846)
 - improvements: Added single quoting to font names in toSVG [#4840](https://github.com/kangax/fabric.js/pull/4840)
 - improvements: Added reserved space to wrapLine functionality [#4841](https://github.com/kangax/fabric.js/pull/4841)

## [2.2.2]
  - Fixed: Applying filters to an image will invalidate its cache [#4828](https://github.com/kangax/fabric.js/pull/4828)
  - Fixed: Attempt at fix font families that requires quoting [#4831](https://github.com/kangax/fabric.js/pull/4831)
  - Improvement: check upperCanvas client size for textarea position [#4827](https://github.com/kangax/fabric.js/pull/4827)
  - Fixed: Attempt to fix multiple touchends [#4804](https://github.com/kangax/fabric.js/pull/4804)
  - Fixed: Wrapping of textbox with charspacing [#4803](https://github.com/kangax/fabric.js/pull/4803)
  - Fixed: bad calculation of empty line in text (regression from 2.2.0) [#4802](https://github.com/kangax/fabric.js/pull/4802)

## [2.2.1]
  - Reworked how amd and commonJS are together in the same file.

## [2.2.0]
  - Fixed: super/sub script svg export [#4780](https://github.com/kangax/fabric.js/pull/4780)
  - Added: Text superScript and subScript support [#4765](https://github.com/kangax/fabric.js/pull/4765)
  - Fixed: negative kerning support (Pacifico font) [#4772](https://github.com/kangax/fabric.js/pull/4772)
  - Fixed: removing text on mousedown should be safe now [#4774](https://github.com/kangax/fabric.js/pull/4774)
  - Improved: pass to inner functions the parameter calculate coords in isOnscreen [#4763](https://github.com/kangax/fabric.js/pull/4763)

## [2.1.0]
  - Added: Added: Drag and drop event binding [#4421](https://github.com/kangax/fabric.js/pull/4421)
  - Fixed: isEmptyStyle implementation for TextBox [#4762](https://github.com/kangax/fabric.js/pull/4762)

## [2.0.3]
  - Fix: now sub target check can work with subclasses of fabric.Group [#4753](https://github.com/kangax/fabric.js/pull/4753)
  - Improvement: PencilBrush is now compexity 1 instead of complexity N during draw [#4743](https://github.com/kangax/fabric.js/pull/4743)
  - Fix the cleanStyle was not checking for the right property to exist [#4751](https://github.com/kangax/fabric.js/pull/4751)
  - Fix onBeforeScaleRotate with canvas zoom [#4748](https://github.com/kangax/fabric.js/pull/4748)

## [2.0.2]
  - fixed image toSVG support for crop [#4738](https://github.com/kangax/fabric.js/pull/4738)
  - changed math for better rounded results [#4734](https://github.com/kangax/fabric.js/pull/4734)

## [2.0.1]
  - fixed filter for blend image in WEBGL [#4706](https://github.com/kangax/fabric.js/pull/4706)
  - fixed interactions between canvas toDataURL and multiplier + retina [#4705](https://github.com/kangax/fabric.js/pull/4705)
  - fixed bug with originX and originY not invalidating the transform [#4703](https://github.com/kangax/fabric.js/pull/4703)
  - fixed unwanted mutation on object enliving in fabric.Image [#4699](https://github.com/kangax/fabric.js/pull/4699)
## [2.0.0]
  - final
    - fix dataurl and svg export on retina and rounding [#4674](https://github.com/kangax/fabric.js/pull/4674)
    - avoid error if iText is removed on mousedown [#4650](https://github.com/kangax/fabric.js/pull/4650)
    - fix calcOffset when text enter editing [#4649](https://github.com/kangax/fabric.js/pull/4649)
    - Gradient fix parsing floats [#4637](https://github.com/kangax/fabric.js/pull/4637)
    - Add CrossOrigin managment to fabric.Pattern [#4618](https://github.com/kangax/fabric.js/pull/4618)
    - Add patternTransform toObject saving [#4626](https://github.com/kangax/fabric.js/pull/4626)
    - normalize brushes render [#4613](https://github.com/kangax/fabric.js/pull/4613)
    - avoid charspacing shortcut [#4594](https://github.com/kangax/fabric.js/pull/4594)
    - Fix color toHexa() [#4579](https://github.com/kangax/fabric.js/pull/4579)
 - rc3 and rc4
    - more fixes to transformMatrix memoization
    - Canvas.selectionFullyContained allows you to select objects just when full grabbed by the selections. [#4508](https://github.com/kangax/fabric.js/pull/4508)
    - Remove some ouput of blank spaces from svg in order to avoid extra colored areas [#4524](https://github.com/kangax/fabric.js/pull/4524)
    - Reinserted a performance shortcut for when there is no style at all [#4519](https://github.com/kangax/fabric.js/pull/4519)
    - Manage canvas resize during a freedrawing brush without wiping the brush [#4527](https://github.com/kangax/fabric.js/pull/4527)
    - Removed an extra closePath that was creating wrong visual on IntelIntegrated cards [#4549](https://github.com/kangax/fabric.js/pull/4549)
    - Added a method to insert and remove text from command line [#4541](https://github.com/kangax/fabric.js/pull/4541)
    - Some fixes around text styles management
    - nodejs support changes: removed specific node code in order to use standard fabricjs code in nodejs.
    - added fabric.util.getNodeCanvas that passed a JSDOM element allows you to get the node-canvas instance behind it and do what you need.
 - rc2
    - Fixed a transform matrix memoize missing width/height [#4491](https://github.com/kangax/fabric.js/pull/4491)
    - Fix pattern drawing a point [#4492](https://github.com/kangax/fabric.js/pull/4492)
    - Fixed Text.removeChars [#4495](https://github.com/kangax/fabric.js/pull/4495)
    - Added back 2 node-canvas methods [#4497](https://github.com/kangax/fabric.js/pull/4497)
    - Fix a typo not restoring hoverCursor correctly.
 - rc1
    - Remove node specific code [#4470](https://github.com/kangax/fabric.js/pull/4470)
    - Improved Canvas.dispose code to leak less memory [#4471](https://github.com/kangax/fabric.js/pull/4471)
    - Remove extra padding of cache when upper limited [#4467](https://github.com/kangax/fabric.js/pull/4467)
    - Solved 2 perfomances problems with textbox [#4466](https://github.com/kangax/fabric.js/pull/4466) [#4465](https://github.com/kangax/fabric.js/pull/4465)
    - Added justify-left justify-right and justify-center [#4437](https://github.com/kangax/fabric.js/pull/4437)
    - Fix Group fromObject and subTargetCheck [#4454](https://github.com/kangax/fabric.js/pull/4454)
    - Fix regression on IMG from SVG [#4450](https://github.com/kangax/fabric.js/pull/4450)
    - Remove cache dimensions together with canvas [#4453](https://github.com/kangax/fabric.js/pull/4453)
    - Fixed some fuzzyness cases for cache [#4452](https://github.com/kangax/fabric.js/pull/4452)
    - Fixed resize filter for webgl [#4426](https://github.com/kangax/fabric.js/pull/4426)
    - Stop searching target during a mouse move with a transform [#4442](https://github.com/kangax/fabric.js/pull/4442)
    - safeguard shaders for non supported precisions [#4433](https://github.com/kangax/fabric.js/pull/4433)
    - fix insert and remove style for edge cases [#4420](https://github.com/kangax/fabric.js/pull/4420)
    - Fix object.move when in active selection [#4394](https://github.com/kangax/fabric.js/pull/4394)
    - Memoize calcTransformMatrix function [#4418](https://github.com/kangax/fabric.js/pull/4418)
    - Make _set flag object as dirty just when a real change happen[#4415](https://github.com/kangax/fabric.js/pull/4415)
    - Add browserShadowBlurConstant to adjust shadowBlur value [#4413](https://github.com/kangax/fabric.js/pull/4413)
    - Fix set element not clearing the cacheTexture. [#4410](https://github.com/kangax/fabric.js/pull/4410)
    - Multi selection key can be configured with an array of keys. [#4363](https://github.com/kangax/fabric.js/pull/4363)
    - fix fast type in text loosing some style. [#4339](https://github.com/kangax/fabric.js/pull/4339)
    - fixed division by zero with lockscaling flip.
    - added paintFirst ( paint-order with svg support ) [#4303](https://github.com/kangax/fabric.js/pull/4303)
  - beta7
    - added a build flag for not attaching fabric to window [#4199](https://github.com/kangax/fabric.js/pull/4199)
    - removed .active property from objects [#4200](https://github.com/kangax/fabric.js/pull/4200)
    - Normalize Api for getSelectionStyles, setSelectionStyles [#4202](https://github.com/kangax/fabric.js/pull/4202)
    - Fix shader for convolute filter [#4207](https://github.com/kangax/fabric.js/pull/4207)
    - Better mouse support for lockscaling flip [#4225](https://github.com/kangax/fabric.js/pull/4225)
    - Fix toDataUrl getting a blank canvas [#4229](https://github.com/kangax/fabric.js/pull/4229)
    - Ouput version to json Objects [#4251](https://github.com/kangax/fabric.js/pull/4251)
    - Use backstoreOnly for toDataUrl resize [#4254](https://github.com/kangax/fabric.js/pull/4254)
    - Fix safari svg whitespace [#4294](https://github.com/kangax/fabric.js/pull/4294)
    - Fix Gradient export for paths [#4274](https://github.com/kangax/fabric.js/pull/4274)
    - Move mouseout/over in mousemove events [#4283](https://github.com/kangax/fabric.js/pull/4283)
    - Fix detection of click at the end of line [#4295](https://github.com/kangax/fabric.js/pull/4295)
    - added new event selection:updated [#4311](https://github.com/kangax/fabric.js/pull/4311)
    - Fixed free drawing path displacement [#4311](https://github.com/kangax/fabric.js/pull/4311)
    - Fixed scale equally and flipping not happening [#4313](https://github.com/kangax/fabric.js/pull/4313)
    - Select by drag makes the object fires 'selected' [#4314](https://github.com/kangax/fabric.js/pull/4314)
  - beta6
    - incompat: New filter system with WEBGL.
    - incompat: New Text/IText/Textbox code. Multibyte compatible, more accurate.
    - incompat: RequestAnimationFrame is used for the automatic render calls.
    - incompat: Named setter/getter are optional now.
    - incompat: Removed PathGroup class
    - incompat: Paths cannot be restored anymore from strings [#3713](https://github.com/kangax/fabric.js/pull/3713)
    - incompat: bumped node version to 4+ and jsdom to 9. [#3717](https://github.com/kangax/fabric.js/pull/3717)
    - incompat: removed the es5 / JSON shim support [#3722](https://github.com/kangax/fabric.js/pull/3722)
    - fix/incompat: IText setSelectionStyles does not change anymore style if no selection is present [#3765](https://github.com/kangax/fabric.js/pull/3765)
    - skipOffscreen default to true
    - Text.setSelectionStyle does not change anything if there is no selection [#3765](https://github.com/kangax/fabric.js/pull/3765)
    - Switch to canvas-prebuilt as dependency. Added parameter to choose the canvas package [#3757](https://github.com/kangax/fabric.js/pull/3757)
    - improvement: renderControls can now be called on its own. Added parameter styleOverride to allow for overriding current properties [#3887](https://github.com/kangax/fabric.js/pull/3887)
    - removed hasMoved and saveCoords from Group class [#3910](https://github.com/kangax/fabric.js/pull/3910)
    - forced all fromObject and fromElement to be async, normalized api. [#3996](https://github.com/kangax/fabric.js/pull/3996)
    - improvement: added support for request animation frame in mouse events [#3997](https://github.com/kangax/fabric.js/pull/3997)
    - added dblclick support for all objects [#3998](https://github.com/kangax/fabric.js/pull/3997)
    - textbox scale as a normal object [#4052](https://github.com/kangax/fabric.js/pull/4052)
    - Removed image meetOrSlice, alignX, alignY, introduced cropX, cropY [#4055](https://github.com/kangax/fabric.js/pull/4055)
    - Added Text.cleanStyle, Text.removeStyle [#4060](https://github.com/kangax/fabric.js/pull/4060)
    - change: lockRotation will not hide the mtr control anymore. introduced notAllowedCursor for canvas. [#4064](https://github.com/kangax/fabric.js/pull/4064)
    - improvement: added 2 percentage values to fabric.util.animate. [#4068](https://github.com/kangax/fabric.js/pull/4068)
    - change: pathOffset does not get exported anymore in path.toObject, toDatalessObject export sourcePath instead of modifying path. [#4108](https://github.com/kangax/fabric.js/pull/4108)

## [1.7.19]

- Fixed the flip of images with scale equally [#4313](https://github.com/kangax/fabric.js/pull/4313)
- Improved touch detection [#4302](https://github.com/kangax/fabric.js/pull/4302)


## [1.7.18]

- Fixed doubling of subtargets for preserveObjectStacking = true [#4297](https://github.com/kangax/fabric.js/pull/4297)
- Added a dirty set to objects in group destroy.

## [1.7.17]

- Change: swapped style white-space:nowrap with attribute wrap="off" since the style rule was creating problems in browsers like ie11 and safari. [#4119](https://github.com/kangax/fabric.js/pull/4119)
- Fix: Remove an object from activeGroup if removed from canvas [#4120](https://github.com/kangax/fabric.js/pull/4120)
- Fix: avoid bringFroward, sendBackwards to swap objects in active selections [#4119](https://github.com/kangax/fabric.js/pull/4119)
- Fix: avoid disposing canvas on mouse event to throw error [#4119](https://github.com/kangax/fabric.js/pull/4119)
- Fix: make svg respect white spaces [#4119](https://github.com/kangax/fabric.js/pull/4119)
- Fix: avoid exporting bgImage and overlayImage if excludeFromExport = true [#4119](https://github.com/kangax/fabric.js/pull/4119)
- Fix: Avoid group fromObject mutating original data [#4111](https://github.com/kangax/fabric.js/pull/4111)

## [1.7.16]

- improvement: added 2 percentage values to fabric.util.animate. [#4068](https://github.com/kangax/fabric.js/pull/4068)
- Improvement: avoid multiplying identity matrices in calcTransformMatrix function
- Fix: activeGroup did not destroy correctly if a toObject was happening
- Improvement: Pass the event to object:modified when available. [#4061](https://github.com/kangax/fabric.js/pull/4061)


## [1.7.15]

- Improvement: Made iText keymap public. [#4053](https://github.com/kangax/fabric.js/pull/4053)
- Improvement: Fix a bug in updateCacheCanvas that was returning always true [#4051](https://github.com/kangax/fabric.js/pull/4051)

## [1.7.14]

- Improvement: Avoid cache canvas to resize each mouse move step. [#4037](https://github.com/kangax/fabric.js/pull/4037)
- Improvement: Make cache canvas limited in size. [#4035](https://github.com/kangax/fabric.js/pull/4035)
- Fix: Make groups and statefull cache work. [#4032](https://github.com/kangax/fabric.js/pull/4032)
- Add: Marked the hiddentextarea from itext so that custom projects can recognize it. [#4022](https://github.com/kangax/fabric.js/pull/4022)

## [1.7.13]

- Fix: Try to minimize delay in loadFroJson [#4007](https://github.com/kangax/fabric.js/pull/4007)
- Fix: allow fabric.Color to parse rgba(x,y,z,.a) without leading 0 [#4006](https://github.com/kangax/fabric.js/pull/4006)
- Allow path to execute Object.initialize, make extensions easier [#4005](https://github.com/kangax/fabric.js/pull/4005)
- Fix: properly set options from path fromDatalessObjects [#3995](https://github.com/kangax/fabric.js/pull/3995)
- Check for slice before action.slice. Avoid conflicts with heavy customized code. [#3992](https://github.com/kangax/fabric.js/pull/3992)


## [1.7.12]

- Fix: removed possible memleaks from window resize event. [#3984](https://github.com/kangax/fabric.js/pull/3984)
- Fix: restored default cursor to noTarget only. unselectable objects get the standard hovercursor. [#3953](https://github.com/kangax/fabric.js/pull/3953)
- Cache fixes: fix uncached pathGroup, removed cache creation at initialize time [#3982](https://github.com/kangax/fabric.js/pull/3982)
- Improvement: nextTarget to mouseOut and prevTarget to mouseOver [#3900](https://github.com/kangax/fabric.js/pull/3900)
- Improvement: add isClick boolean to left mouse up [#3898](https://github.com/kangax/fabric.js/pull/3898)
- Fix: can start selection on top of non selectable object [#3892](https://github.com/kangax/fabric.js/pull/3892)
- Improvement: better management of right/middle click [#3888](https://github.com/kangax/fabric.js/pull/3888)
- Fix: subTargetCheck on activeObject/activeGroup was firing too many events [#3909](https://github.com/kangax/fabric.js/pull/3909)
- Fix: After addWithUpdate or removeWithUpdate object coords must be updated. [#3911](https://github.com/kangax/fabric.js/pull/3911)


## [1.7.11]

- Hotfix: restore path-groups ability to render [#3877](https://github.com/kangax/fabric.js/pull/3877)

## [1.7.10]

- Fix: correct svg export for radial gradients [#3807](https://github.com/kangax/fabric.js/pull/3807)
- Fix: Update fireout events to export the event object [#3853](https://github.com/kangax/fabric.js/pull/3853)
- Fix: Improve callSuper to avoid infinite loops (not all of them) [#3844](https://github.com/kangax/fabric.js/pull/3844)
- Fix: avoid selectionBackgroundColor leak on toDataUrl [#3862](https://github.com/kangax/fabric.js/pull/3862)
- Fix: toDatelessObject for Group [#3863](https://github.com/kangax/fabric.js/pull/3863)
- Improvement: better caching logic for groups [#3864](https://github.com/kangax/fabric.js/pull/3864)
- Fix: correct svg gradient export for radial in polygons [#3866](https://github.com/kangax/fabric.js/pull/3866)
- Fix: First draw could be empty for some objects [#3870](https://github.com/kangax/fabric.js/pull/3870)
- Fix: Always send event data to object:selected [#3871](https://github.com/kangax/fabric.js/pull/3871)
- Improvement: reduce angle calculation error [#3872](https://github.com/kangax/fabric.js/pull/3872)

## [1.7.9]

- Fix: Avoid textarea wrapping from chrome v57+ [#3804](https://github.com/kangax/fabric.js/pull/3804)
- Fix: double click needed to move cursor when enterEditing is called programmatically [#3804](https://github.com/kangax/fabric.js/pull/3804)
- Fix: Style regression when inputing new style objects [#3804](https://github.com/kangax/fabric.js/pull/3804)
- Add: try to support crossOrigin for svg image tags [#3804](https://github.com/kangax/fabric.js/pull/3804)

## [1.7.8]

- Fix: Fix dirty flag propagation [#3782](https://github.com/kangax/fabric.js/pull/3782)
- Fix: Path parsing error in bounding boxes of curves [#3774](https://github.com/kangax/fabric.js/pull/3774)
- Add: Middle click mouse management on canvas [#3764](https://github.com/kangax/fabric.js/pull/3764)
- Add: Add parameter to detect and skip offscreen drawing [#3758](https://github.com/kangax/fabric.js/pull/3758)
- Fix: textarea loosing focus after a drag and exit from canvas [#3759](https://github.com/kangax/fabric.js/pull/3759)

## [1.7.7]

- Fix for opacity parsing in svg with nested opacities [#3747](https://github.com/kangax/fabric.js/pull/3747)
- Fix text initialization and boundingrect [#3745](https://github.com/kangax/fabric.js/pull/3745)
- Fix line bounding box [#3742](https://github.com/kangax/fabric.js/pull/3742)
- Improvement: do not pollute style object while typing if not necessary [#3743](https://github.com/kangax/fabric.js/pull/3743)
- fix for broken prototype chain when restoring a dataless object on fill an stroke [#3735](https://github.com/kangax/fabric.js/pull/3735)
- fix for deselected event not fired on mouse actions [#3716](https://github.com/kangax/fabric.js/pull/3716)
- fix for blurriness introduced on 1.7.3 [#3721](https://github.com/kangax/fabric.js/pull/3721)

## [1.7.6]

- Fix: make the cacheCanvas created on the fly if not available [#3705](https://github.com/kangax/fabric.js/pull/3705)

## [1.7.5]

- Improvement: draw textbackgroundColor in one single pass when possible @stefanhayden [#3698](https://github.com/kangax/fabric.js/pull/3698)
- Improvement: fire selection changed event just if text is editing [#3702](https://github.com/kangax/fabric.js/pull/3702)
- Improvement: Add object property 'needsItsOwnCache' [#3703](https://github.com/kangax/fabric.js/pull/3703)
- Improvement: Skip unnecessary transform if they can be detected with a single if [#3704](https://github.com/kangax/fabric.js/pull/3704)

## [1.7.4]

- Fix: Moved all the touch event to passive false so that they behave as before chrome changes [#3690](https://github.com/kangax/fabric.js/pull/3690)
- Fix: force top and left in the object representation of a path to avoid reparsing on restore [#3691](https://github.com/kangax/fabric.js/pull/3691)
- Add: Enable `deselected` event for activeObject switch. Ensure deactivateAll call exitEditing [#3689](https://github.com/kangax/fabric.js/pull/3689)
- Fix: Perform subtargetCheck also if the group is an active object and on activeGroup [#3688](https://github.com/kangax/fabric.js/pull/3688)
- Fix: Made cursor operation more precise at high canvas zoom level [#3671](https://github.com/kangax/fabric.js/pull/3671)
- Add: Made getBoundingRect available to return both absolute or standard bounding rect [#3614](https://github.com/kangax/fabric.js/pull/3614)
- Add: Introduced calcViewportBoundaries() function for fabric.StaticCanvas [#3614](https://github.com/kangax/fabric.js/pull/3614)
- Add: Introduced isOnScreen() function for fabric.Object [#3614](https://github.com/kangax/fabric.js/pull/3614)
- Subclassed Polygon from polyline [#3614](https://github.com/kangax/fabric.js/pull/3614)
- Fix: Removed reference to hovered target when target gets removed [#3657](https://github.com/kangax/fabric.js/pull/3657)
- Fix: Removed hover cursor for non selectable objects [#3643](https://github.com/kangax/fabric.js/pull/3643)
- Fix: Switch to passive event for touch move [#3643](https://github.com/kangax/fabric.js/pull/3643)
- Fix: Restart rendering of cursor after entering some text [#3643](https://github.com/kangax/fabric.js/pull/3643)
- Add: fabric.Color support toHexa() method now [#3615](https://github.com/kangax/fabric.js/pull/3615)

## [1.7.3]

- Improvement: mousewheel event is handled with target and fired also from objects.  [#3612](https://github.com/kangax/fabric.js/pull/3612)
- Improvement: Pattern loads for canvas background and overlay, corrected svg pattern export [#3601](https://github.com/kangax/fabric.js/pull/3601)
- Fix: Wait for pattern loading before calling callback [#3598](https://github.com/kangax/fabric.js/pull/3598)
- Fix: add 2 extra pixels to cache canvases to avoid aliasing cut [#3596](https://github.com/kangax/fabric.js/pull/3596)
- Fix: Rerender when deselect an itext editing object [#3594](https://github.com/kangax/fabric.js/pull/3594)
- Fix: save new state of dimensionProperties at every cache clear [#3595](https://github.com/kangax/fabric.js/pull/3595)
- Improvement: Better error management in loadFromJSON [#3586](https://github.com/kangax/fabric.js/pull/3586)
- Improvement: do not reload backgroundImage as an image if is different type [#3550](https://github.com/kangax/fabric.js/pull/3550)
- Improvement: if a children element is set dirty, set the parent dirty as well. [#3564](https://github.com/kangax/fabric.js/pull/3564)

## [1.7.2]

- Fix: Textbox do not use stylemap for line wrapping [#3546](https://github.com/kangax/fabric.js/pull/3546)
- Fix: Fix for firing object:modified in macOS sierra [#3539](https://github.com/kangax/fabric.js/pull/3539)
- Fix: Itext with object caching was not refreshing selection correctly. [#3538](https://github.com/kangax/fabric.js/pull/3538)
- Fix: stateful now works again with activeGroup and dinamyc swap between stateful false/true. [#3537](https://github.com/kangax/fabric.js/pull/3537)
- Fix: includeDefaultValues was not applied to child objects of groups and path-groups. [#3497](https://github.com/kangax/fabric.js/pull/3497)
- Fix: Itext style is cloned on paste action now, allow copy of styles to be independent. [#3502](https://github.com/kangax/fabric.js/pull/3502)
- Fix: Add subclasses properties to cacheProperties. [#3490](https://github.com/kangax/fabric.js/pull/3490)
- Add: Shift and Alt key used for transformations are now dynamic. [#3479](https://github.com/kangax/fabric.js/pull/3479)
- Fix: fix to polygon and cache. Added cacheProperties for all classes [#3490](https://github.com/kangax/fabric.js/pull/3490)

## [1.7.1]

- Add: Gradients/Patterns support customAttributes in toObject method [#3477](https://github.com/kangax/fabric.js/pull/3477)
- Fix: IText/Textbox not blurring keyboard on ios 10 [#3476](https://github.com/kangax/fabric.js/pull/3476)
- Fix: Shadow on freedrawing and zoomed canvas [#3475](https://github.com/kangax/fabric.js/pull/3475)
- Fix: Fix for group returning negative scales [#3474](https://github.com/kangax/fabric.js/pull/3474)
- Fix: hotfix for textbox [#3441](https://github.com/kangax/fabric.js/pull/3441)[#3473](https://github.com/kangax/fabric.js/pull/3473)

## [1.7.0]

- Add: Object Caching [#3417](https://github.com/kangax/fabric.js/pull/3417)
- Improvement: group internal objects have coords not affected by canvas zoom [#3420](https://github.com/kangax/fabric.js/pull/3420)
- Fix: itext cursor trails on initDimension [#3436](https://github.com/kangax/fabric.js/pull/3436)
- Fix: null check on .setActive [#3435](https://github.com/kangax/fabric.js/pull/3435)
- Fix: function error in clone deep. [#3434](https://github.com/kangax/fabric.js/pull/3434)

## [1.6.7]

- Add: Snap rotation added to objects. two parameter introduced, snapAngle and snapTreshold. [#3383](https://github.com/kangax/fabric.js/pull/3383)
- Fix: Pass target to right click event. [#3381](https://github.com/kangax/fabric.js/pull/3381)
- Fix: Correct rendering of bg color for styled text and correct clearing of itext area. [#3388](https://github.com/kangax/fabric.js/pull/3388)
- Add: Fire mouse:over on the canvas when we enter the canvas from outside the element. [#3388](https://github.com/kangax/fabric.js/pull/3389)
- Fix: Fix calculation of words width with spaces and justify. [#3408](https://github.com/kangax/fabric.js/pull/3408)
- Fix: Do not export defaults properties for bg and overlay if requested. [#3415](https://github.com/kangax/fabric.js/pull/3415)
- Fix: Change export toObect to always delete default properties if requested. [#3416](https://github.com/kangax/fabric.js/pull/3416)

## [1.6.6]

- Add: Contrast and Saturate filters [#3341](https://github.com/kangax/fabric.js/pull/3341)
- Fix: Correct registering and removal of events to handle iText objects. [#3349](https://github.com/kangax/fabric.js/pull/3349)
- Fix: Corrected 2 regression of 1.6.5 (dataurl export and itext clicks)
- Fix: Corrected path boundaries calculation for Arcs ( a and A ) [#3347](https://github.com/kangax/fabric.js/pull/3347)

## [1.6.5]

- Fix: charspacing, do not get subzero with charwidth.
- Improvement: add callback support to all object cloning. [#3212](https://github.com/kangax/fabric.js/pull/3212)
- Improvement: add backgroundColor to all class [#3248](https://github.com/kangax/fabric.js/pull/3248)
- Fix: add custom properties to backgroundImage and overlayImage [#3250](https://github.com/kangax/fabric.js/pull/3250)
- Fix: Object intersection is calculated on boundingBox and boundingRect, intersection is fired if objects are overlapping [#3252](https://github.com/kangax/fabric.js/pull/3252)
- Change: Restored previous selection behaviour, added key to selection active object under overlaid target [#3254](https://github.com/kangax/fabric.js/pull/3254)
- Improvement: hasStateChanged let you find state changes of complex properties. [#3262](https://github.com/kangax/fabric.js/pull/3262)
- Fix: IText/Textbox shift click selection backward. [#3270](https://github.com/kangax/fabric.js/pull/3270)
- Revert: font family quoting was a bad idea. node-canvas stills use it. [#3276](https://github.com/kangax/fabric.js/pull/3276)
- Fix: fire mouse:over event for activeObject and activeGroup when using findTarget shourtcuts [#3285](https://github.com/kangax/fabric.js/pull/3285)
- Fix: clear method clear all properties of canvas [#3305](https://github.com/kangax/fabric.js/pull/3305)
- Fix: text area position method takes in account canvas offset [#3306](https://github.com/kangax/fabric.js/pull/3306)
- Improvement: Added event on right click and possibility to hide the context menu with a flag [3308](https://github.com/kangax/fabric.js/pull/3308)
- Fix: remove canvas reference from object when object gets removed from canvas [#3307](https://github.com/kangax/fabric.js/pull/3307)
- Improvement: use native stroke dash if available [#3309](https://github.com/kangax/fabric.js/pull/3309)
- Fix: Export correct src when exporting to svg [#3310](https://github.com/kangax/fabric.js/pull/3310)
- Fix: Stop text to go on zero dimensions [#3312](https://github.com/kangax/fabric.js/pull/3312)
- Fix: Error in dataURL with multiplier was outputting very big canvas with retina [#3314](https://github.com/kangax/fabric.js/pull/3314)
- Fix: Error in style map was not respecting style if textbox started with space [#3315](https://github.com/kangax/fabric.js/pull/3315)

## [1.6.4]

- Improvement: Ignore svg: namespace during svg import. [#3081](https://github.com/kangax/fabric.js/pull/3081)
- Improvement: Better fix for lineHeight of iText/Text [#3094](https://github.com/kangax/fabric.js/pull/3094)
- Improvement: Support for gradient with 'Infinity' coordinates [#3082](https://github.com/kangax/fabric.js/pull/3082)
- Improvement: Generally "improved" logic of targeting [#3111](https://github.com/kangax/fabric.js/pull/3111)
- Fix: Selection of active group with transparency and preserveObjectStacking true or false [#3109](https://github.com/kangax/fabric.js/pull/3109)
- Fix: pattern brush now create the same pattern seen while drawing [#3112](https://github.com/kangax/fabric.js/pull/3112)
- Fix: Allow css merge during svg import [#3114](https://github.com/kangax/fabric.js/pull/3114)
- Improvement: added numeric origins handling fomr 0 to 1. [#3121](https://github.com/kangax/fabric.js/pull/3121)
- Fix: Fix a defect with shadow of objects in a scaled group. [#3134](https://github.com/kangax/fabric.js/pull/3134)
- Improvement: Do not fire unecessary selection:changed events. [#3119](https://github.com/kangax/fabric.js/pull/3119)
- Fix: Attached hiddenTextarea to body fixes IE, thanks to @plainview. [#3137](https://github.com/kangax/fabric.js/pull/3137)
- Fix: Shift unselect activegroup on transformed canvas. [#3144](https://github.com/kangax/fabric.js/pull/3144)
- Added: ColorMatrix filter [#3139](https://github.com/kangax/fabric.js/pull/3139)
- Fix: Fix condition in wich restoring from Object could cause object overwriting [#3146](https://github.com/kangax/fabric.js/pull/3146)
- Change: cloneAsImage for Object and toDataUrl for object are not retina enabled by default. Added option to enable. [#3147](https://github.com/kangax/fabric.js/pull/3147)
- Improvement: Added textSpacing support for text/itext/textbox [#3097](https://github.com/kangax/fabric.js/pull/3097)
- Fix: Quote font family when setting the context fontstyle [#3191](https://github.com/kangax/fabric.js/pull/3191)
- Fix: use getSrc during image export, make subclassing easier, return eventually the .src property if nothing else is available [#3189](https://github.com/kangax/fabric.js/pull/3189)
- Fix: Inverted the meaning of border scale factor [#3154](https://github.com/kangax/fabric.js/pull/3154)
- Improvement: Added support for RGBA in HEX notation. [#3202](https://github.com/kangax/fabric.js/pull/3202)
- Improvement: Added object deselected event. [#3195](https://github.com/kangax/fabric.js/pull/3195)
- Fix: loadFromJson callback now gets fired after filter are applied [#3210](https://github.com/kangax/fabric.js/pull/3210)

## [1.6.3]

- Improvement: Use reviver callback for background and overlay image when doing svg export. [#2975](https://github.com/kangax/fabric.js/pull/2975)
- Improvement: Added object property excludeFromExport to avoid exporting the object to JSON or to SVG. [#2976](https://github.com/kangax/fabric.js/pull/2976)
- Improvement: Correct the calculation of text boundingbox. Improves svg import [#2992](https://github.com/kangax/fabric.js/pull/2992)
- Added: Export id property to SVG [#2993](https://github.com/kangax/fabric.js/pull/2993)
- Improvement: Call the callback on loadSvgFromURL on failed xml load with null agument [#2994](https://github.com/kangax/fabric.js/pull/2994)
- Improvement: Clear only the Itext area on contextTop during cursor animation [#2996](https://github.com/kangax/fabric.js/pull/2996)
- Added: Char widths cache has been moved to fabric level and not iText level. Added fabric.util.clearFabricCharWidthsCache(fontName) [#2995](https://github.com/kangax/fabric.js/pull/2995)
- Fix: do not set background or overlay image if the url load fails. [#3003](https://github.com/kangax/fabric.js/pull/3003)
- Fix: iText mousemove event removal, clear the correct area for Itext, stopped redrawing selection if not necessary [#3016](https://github.com/kangax/fabric.js/pull/3016)
- Fix: background image and overlay image scale and move with canvas viewportTransform, parameter available [#3019](https://github.com/kangax/fabric.js/pull/3019)
- Added: support sub targeting in groups in events [#2997](https://github.com/kangax/fabric.js/pull/2997)
- Fix: Select transparent object on mouse up because of _maybeGroupObject [#2997](https://github.com/kangax/fabric.js/pull/2997)
- Fix: Remove reference to lastRenderedObject on canvas.remove [#3023](https://github.com/kangax/fabric.js/pull/3023)
- Fix: Wait for all objects to be loaded before deleting the properties and setting options. [#3029](https://github.com/kangax/fabric.js/pull/3029)
- Fix: Object Padding is unaffected by object transform. [#3057](https://github.com/kangax/fabric.js/pull/3057)
- Fix: Restore lastRenderedObject usage. Introduced Canvas.lastRenderedKey to retrieve the lastRendered object from down the stack [#3057](https://github.com/kangax/fabric.js/pull/3057)
- Fix: _calcTextareaPosition correctly calculate the position considering the viewportTransform. [#3057](https://github.com/kangax/fabric.js/pull/3057)
- Fix: Fixed selectionBacgroundColor with viewport transform. [#3057](https://github.com/kangax/fabric.js/pull/3057)
- Improvement: Correctly render the cursor with viewport scaling, improved the cursor centering. [#3057](https://github.com/kangax/fabric.js/pull/3057)
- Fix: Use canvas zoom and pan when using is target transparent. [#2980](https://github.com/kangax/fabric.js/pull/2980)

## [1.6.2]

- Fix: restore canvas properties on loadFromJSON with includeProperties. [#2921](https://github.com/kangax/fabric.js/pull/2921)
- Fix: Allow hoverCursor on non selectable objects, moveCursor does not appear if the object is not moveable.
Added object.moveCursor to specify a cursor for moving per object. [#2924](https://github.com/kangax/fabric.js/pull/2924)
- Fix: Add missing stroke.live translation, allow gradientTransform for dashed line. [#2926](https://github.com/kangax/fabric.js/pull/2926)
- Improvement: Allow customization of keys that iteract with mouse action ( multiselect key, free transform key, alternative action key, centered transform key ) [#2925](https://github.com/kangax/fabric.js/pull/2925)
- Added: Make iText fires object:modified on text change on exit editing [#2927](https://github.com/kangax/fabric.js/pull/2927)
- Added: [control customization part 1] cornerDashArray, borderDashArray. Now borderScaleFactor influences both border and controls, changed default corner size to 13 [#2932](https://github.com/kangax/fabric.js/pull/2932)
- Fix: createSVGFontFacesMarkup was failing to retrieve fonts in style [#2935](https://github.com/kangax/fabric.js/pull/2935)
- Fix: shadow not scaled with dataUrl to multiplier [#2940](https://github.com/kangax/fabric.js/pull/2940)
- Added: [control customization part 2] cornerStrokeColor. Now is possible to specify separate stroke and fill color for the controls [#2933](https://github.com/kangax/fabric.js/pull/2933)
- Fix: Itext width calculation with caching false was returning nan. [#2943](https://github.com/kangax/fabric.js/pull/2943)
- Added: [control customization part 3] Rounded corners. It is possible to specify cornerStyle for the object. 'rect' or 'circle' [#2942](https://github.com/kangax/fabric.js/pull/2942)
- Added: [control customization part 4] Selection background. It is possible to specify selectionBackgroundColor for the object. [#2950](https://github.com/kangax/fabric.js/pull/2950)
- Fix: Behaviour of image with filters with resize effects and Object to/from json [#2954](https://github.com/kangax/fabric.js/pull/2954)
- Fix: Svg export should not output color notation in rgba format [#2955](https://github.com/kangax/fabric.js/pull/2955)
- Fix: minScaleLimit rounding bug [#2964](https://github.com/kangax/fabric.js/pull/2964)
- Fix: Itext spacing in justify mode bug [#2971](https://github.com/kangax/fabric.js/pull/2971)
- Fix: Object.toDataUrl export when some window.devicepixelRatio is present (retina or browser zoom) [#2972](https://github.com/kangax/fabric.js/pull/2972)


## [1.6.1]

- Fix: image with broken element throwing error on toObject() [#2878](https://github.com/kangax/fabric.js/pull/2878)
- Fix: Warning on trying to set proprietary browser version of ctxImageSmoothingEnabled [#2880](https://github.com/kangax/fabric.js/pull/2880)
- Fix: Fixed Svg import regression on color and drawing polylines [#2887](https://github.com/kangax/fabric.js/pull/2887)
- Fix: Fixed animation ease that starts and stop at same value [#2888](https://github.com/kangax/fabric.js/pull/2888)
- Fix: Allow a not stateful canvas to fire object:modified at end of transform. [#2890](https://github.com/kangax/fabric.js/pull/2890)
- Fix: Made event handler removal safer. Removing firing events will not cause errors. [#2883](https://github.com/kangax/fabric.js/pull/2883)
- Fix: Proper handling of perPixelTargetFind and multi selections [#2894](https://github.com/kangax/fabric.js/pull/2894)
- Fix: Do not clear contextTop on drawingMode, to allow drawing over animations [#2895](https://github.com/kangax/fabric.js/pull/2895)
- Change the dependencies to optional. Allow npm to continue installing if nodecanvas installation fail.[#2901](https://github.com/kangax/fabric.js/pull/2901)
- Fix: Check again the target on mouseup [#2902](https://github.com/kangax/fabric.js/pull/2902)
- Fix: On perPixelTargetFind detect corners only if target is active [#2903](https://github.com/kangax/fabric.js/pull/2903)
- Improvement: Add canvas mouseout event listener [#2907](https://github.com/kangax/fabric.js/pull/2907)
- Improvement: Make small object draggable easier [#2907](https://github.com/kangax/fabric.js/pull/2907)
- Improvement: Use sendToBack, bringToFront, bringForward, sendBackwards for multiple selections [#2908](https://github.com/kangax/fabric.js/pull/2908)

## [1.6.0]

- Fix rendering of activeGroup objects while preserveObjectStacking is active. [ regression from [#2083](https://github.com/kangax/fabric.js/pull/2083) ]
- Fix `fabric.Path` initialize with user options [#2117](https://github.com/kangax/fabric.js/pull/2117)
- Fix sorting of objects in activeGroup during rendering [#2130](https://github.com/kangax/fabric.js/pull/2130).
- Make sure that 'object.canvas' property is always set if the object is directly or indirectly on canvas [#2141](https://github.com/kangax/fabric.js/pull/2141)
- Fix _getTopLeftCoords function that was returning TopCenter [#2127](https://github.com/kangax/fabric.js/pull/2127)
- Fix events not being fired after resize with pinch zoom [#510](https://github.com/kangax/fabric.js/pull/510)
- Fix mouse:over, mouse:out events not receiving event object [#2146](https://github.com/kangax/fabric.js/pull/2146)
- Don't include elements from `<metadata>` during SVG parsing [#2160](https://github.com/kangax/fabric.js/pull/2160)
- Fix some iText new glitches and old bugs about style deleting and inserting, faster function for get2dCursorLocation [#2153](https://github.com/kangax/fabric.js/pull/2153)
- Change bounding box calculation, made strokewidth always considered in dimensions. Switched group stroke default to 0 strokewidth. [#2155](https://github.com/kangax/fabric.js/pull/2155)
- Fix scaling function for object with strokewidth [#2178](https://github.com/kangax/fabric.js/pull/2178)
- Fix image fromObject restoring resizeFilter [#2164](https://github.com/kangax/fabric.js/pull/2164)
- Fix double application of filter upon image init [#2164](https://github.com/kangax/fabric.js/pull/2164)
- Fix image.filter.Resize toObject and fromObject [#2164](https://github.com/kangax/fabric.js/pull/2164)
- Fix strokeWidth calculation during resize operations [#2178](https://github.com/kangax/fabric.js/pull/2178)
- Fix iText selection on upperCanvas to support transformMatrix [#2173](https://github.com/kangax/fabric.js/pull/2173)
- Removed unnecessary calls to removeShadow and restoreGlobalCompositeOperation  [#2175](https://github.com/kangax/fabric.js/pull/2175)
- Fix the offset for pattern and gradients filling and stroking in text [#2183](https://github.com/kangax/fabric.js/pull/2183)
- Fix loading of stroke gradients from Object [#2182](https://github.com/kangax/fabric.js/pull/2182)
- Fix segmentation fault on node.js when image doesn't exist [#2193](https://github.com/kangax/fabric.js/pull/2193)
- Fix iText border selection when changing fontWeight [#2201](https://github.com/kangax/fabric.js/pull/2201)
- Fix calculation of object dimensions for geometry functions translation and scaling. [#2206](https://github.com/kangax/fabric.js/pull/2206)
- Fix iText cursor position on click at end of line [#2217](https://github.com/kangax/fabric.js/pull/2217)
- Fix error on parsing style string with trailing spaces [#2256](https://github.com/kangax/fabric.js/pull/2256)
- Fix delegated properties leaking on objects in a group when restoring from json [#2101](https://github.com/kangax/fabric.js/pull/2101)
- Fix cursor click position in rotated i-Text when origins different from TOPLEFT. [#2269](https://github.com/kangax/fabric.js/pull/2269)
- Fix mouse position when the canvas is in a complex style scrolling situation [#2128](https://github.com/kangax/fabric.js/pull/2128)
- Fix parser regex for not parsing svg tags attribute [#2311](https://github.com/kangax/fabric.js/pull/2311)
- Add id attribute to standard attribute parsing from SVG elements [#2317](https://github.com/kangax/fabric.js/pull/2317)
- Fix text decoration opacity [#2310](https://github.com/kangax/fabric.js/pull/2310)
- Add simple color animation utility in /src/util/animate_color.js [#2328](https://github.com/kangax/fabric.js/pull/2328)
- Fix itext paste function to check for source of copied text and strip carriage returns (\r)[#2336](https://github.com/kangax/fabric.js/pull/2336)
- Fix pattern class serialize the source using toDataURL if available [#2335](https://github.com/kangax/fabric.js/pull/2335)
- Fix imageSmoothingEnabled warning on chrome and reinit the property after setDimensions [#2337](https://github.com/kangax/fabric.js/pull/2337)
- Add ability to parse path elements with no path specified. [#2344](https://github.com/kangax/fabric.js/pull/2344)
- Fix shiftClick with activeGroup in case of normal and scaled groups [#2342](https://github.com/kangax/fabric.js/pull/2342)
- Add support for colors in shadow svg export [#2349](https://github.com/kangax/fabric.js/pull/2349)
- Add support for inner viewBoxes in svg parsing [#2345](https://github.com/kangax/fabric.js/pull/2345)
- Fix BoundingBox calculation for pathGroups that have inner transformMatrix [#2348](https://github.com/kangax/fabric.js/pull/2348)
- Fix export toObject to include transformMatrix property [#2350](https://github.com/kangax/fabric.js/pull/2350)
- Fix textbox class to supporto toSVG() and newest style fixes [#2347]
(https://github.com/kangax/fabric.js/pull/2347)
- Fix regression on text ( textDecoration and textlinebackground ) [#2354](https://github.com/kangax/fabric.js/pull/2354)
- Add support for multi keys chars using onInput event [#2352](https://github.com/kangax/fabric.js/pull/2352)
- Fix iText and textbox entering in edit mode if clicked on a corner [#2393](https://github.com/kangax/fabric.js/pull/2393)
- Fix iText styles error when in justify align [#2370](https://github.com/kangax/fabric.js/pull/2370)
- Add support for shadow export in svg for groups, pathgroups and images. [#2364]
- Add rendering shadows for groups [#2364](https://github.com/kangax/fabric.js/pull/2364)
- Add support for parsing nested SVGs  x and y attributes [#2399](https://github.com/kangax/fabric.js/pull/2399)
- Add support for gradientTransform in setGradient(fill or stroke) [#2401](https://github.com/kangax/fabric.js/pull/2401)
- Fix Error in svg parsed that was stopping on gradient color-stop missing stop attribute [#2414](https://github.com/kangax/fabric.js/pull/2414)
- toObject method return copied arrays for array like properties [#2407](https://github.com/kangax/fabric.js/pull/2407)
- Fix Set stop value of colorstop to 0 if stop attribute not present [#2414](https://github.com/kangax/fabric.js/pull/2414)
- Fix correct value of e.button for mouse left click if e.which not supported[#2453](https://github.com/kangax/fabric.js/pull/2453)
- Add check for host property in getScrollTopLeft[#2462](https://github.com/kangax/fabric.js/pull/2462)
- Fix check for object.selectable in findTarget[#2466](https://github.com/kangax/fabric.js/pull/2466)
- Fix After rendering a gesture set originX/Y to its original value[#2479](https://github.com/kangax/fabric.js/pull/2479)
- Add support for skewing objects using shift and m-controls in interactive mode, and using object.skewX/Y [#2482](https://github.com/kangax/fabric.js/pull/2482)
- Fix gradientTransform not exported in gradient toObject [#2486](https://github.com/kangax/fabric.js/pull/2486)
- Fix object.toDataUrl with multiplier [#2487](https://github.com/kangax/fabric.js/pull/2487)
BACK INCOMPATIBILITY: removed 'allOnTop' parameter from fabric.StaticCanvas.renderAll.
- Fix mask filter, mask image is now streched on all image [#2543](https://github.com/kangax/fabric.js/pull/2543)
- Fix text onInput event to behave correctly if some text is selected [#2501](https://github.com/kangax/fabric.js/pull/2502)
- Fix object with selectable = false could be selected with shift click [#2503](https://github.com/kangax/fabric.js/pull/2503)
- Fix for mask filter when bigger or smaller image is used [#2534](https://github.com/kangax/fabric.js/pull/2534)
- Improvement: simplified renderAll logic [#2545](https://github.com/kangax/fabric.js/pull/2545)
- Improvement: Manage group transformation with skew rotate and scale [#2549](https://github.com/kangax/fabric.js/pull/2549)
- Fix: Add shadow affectStroke to shadow to Object method [#2568](https://github.com/kangax/fabric.js/pull/2568)
- Fix: Made multitouch pinch resize works with skewed object [#2625](https://github.com/kangax/fabric.js/pull/2625)
- Improvement: Added retina screen support [#2623](https://github.com/kangax/fabric.js/pull/2623)
- Change: Set default Image strokeWidth to 0 to improve image rendering [#2624](https://github.com/kangax/fabric.js/pull/2624)
- Fix: multitouch zoom gesture speed back to normal speed [#2625](https://github.com/kangax/fabric.js/pull/2625)
- Fix: fix controls rendering with retina scaling and controls above overlay [#2632](https://github.com/kangax/fabric.js/pull/2632)
- Improvements: resize SVG using viewport/viewbox. [#2642](https://github.com/kangax/fabric.js/pull/2642)
- Improvements: Svg import now supports rotate around point [#2645](https://github.com/kangax/fabric.js/pull/2645)
- Change: Opacity is no more a delegated property for group [#2656](https://github.com/kangax/fabric.js/pull/2656)
- Fix: Itext now check for editable property before initializing cursor [#2657](https://github.com/kangax/fabric.js/pull/2657)
- Fix: Better SVG export support for shadows of rotated objects [#2671](https://github.com/kangax/fabric.js/pull/2671)
- Fix: Avoid polygon polyline to change constructor point array [#2627](https://github.com/kangax/fabric.js/pull/2627)
- SVG import: support fill/stroke opacity when no fill/stroke attribute is present [#2703](https://github.com/kangax/fabric.js/pull/2703)
- Fix: remove white filter set opacity to 0 instead of 1 [#2714](https://github.com/kangax/fabric.js/pull/2714)
- Cleaning: removing unused fabric.Canvas.activeInstance [#2708](https://github.com/kangax/fabric.js/pull/2708)
- Change: remove flipping of text string when flipping object [#2719](https://github.com/kangax/fabric.js/pull/2719)
- Fix: Correct shift click on generic transformerd active groups [#2720](https://github.com/kangax/fabric.js/pull/2720)
- SVG import: parse svg with no spaces between transforms [#2738](https://github.com/kangax/fabric.js/pull/2738)
- Fix: Fallback to styleElement.text for IE9 [#2754](https://github.com/kangax/fabric.js/pull/2754)
- Fix: data url for node [#2777](https://github.com/kangax/fabric.js/pull/2777)
- Improvement: Extended font face to all text class during svg export [#2797](https://github.com/kangax/fabric.js/pull/2797)
- Fix: retina scaling dataurl and shadows. [#2806](https://github.com/kangax/fabric.js/pull/2806)
- Improvement: Better look to iText decoration shadows. [#2808](https://github.com/kangax/fabric.js/pull/2808)
- Improvement: New text shadow export to SVG. [#2827](https://github.com/kangax/fabric.js/pull/2827)
- fix: location of optimized 1x1 rects. [#2817](https://github.com/kangax/fabric.js/pull/2817)
- fix: TextBox handling of consecutive spaces. [#2852](https://github.com/kangax/fabric.js/pull/2852)
- fix: Respect shadow in svg export of flipped objects. [#2854](https://github.com/kangax/fabric.js/pull/2854)
- fix: Check presence of style for textBox in svg export. [#2853](https://github.com/kangax/fabric.js/pull/2853)
- Improvement: Added node compatibility for v4 and v5. [#2872](https://github.com/kangax/fabric.js/pull/2872)
- Fix: Canvas dispose remove the extra created elements. [#2875](https://github.com/kangax/fabric.js/pull/2875)
- IText improvements to cut-copy-paste, edit, mobile jumps and style. [#2868](https://github.com/kangax/fabric.js/pull/2868)

## [1.5.0]

**Edge**
- Added image preserve aspect ratio attributes and functionality (fabric.Image.alignY, fabric.Image.alignY, fabric.Image.meetOrSlic )
- Added ImageResizeFilters , option to resize dynamically or statically the images using a set of resize filter alghoritms.
- [BACK_INCOMPAT] `fabric.Collection#remove` doesn't return removed object -> returns `this` (chainable)

- Add "mouse:over" and "mouse:out" canvas events (and corresponding "mouseover", "mouseout" object events)
- Add support for passing options to `fabric.createCanvasForNode`

- Various iText fixes and performance improvements
- Fix `overlayImage` / `overlayColor` during selection mode
- Fix double callback in loadFromJSON when there's no objects
- Fix paths parsing when number has negative exponent
- Fix background offset in iText
- Fix style object deletion in iText
- Fix typo in `_initCanvasHandlers`
- Fix `transformMatrix` not affecting fabric.Text
- Fix `setAngle` for different originX/originY (!= 'center')
- Change default/init noise/brightness value for `fabric.Image.filters.Noise` and `fabric.Image.filters.Brightness` from 100 to 0
- Add `fabric.Canvas#imageSmoothingEnabled`
- Add `copy/paste` support for iText (uses clipboardData)

## [1.4.0]

- [BACK_INCOMPAT] JSON and Cufon are no longer included in default build

- [BACK_INCOMPAT] Change default objects' originX/originY to left/top

- [BACK_INCOMPAT] `fabric.StaticCanvas#backgroundImage` and `fabric.StaticCanvas#overlayImage` are `fabric.Image` instances. `fabric.StaticCanvas#backgroundImageOpacity`, `fabric.StaticCanvas#backgroundImageStretch`, `fabric.StaticCanvas#overlayImageLeft` and `fabric.StaticCanvas#overlayImageTop` were removed.

- [BACK_INCOMPAT] `fabric.Text#backgroundColor` is now `fabric.Object#backgroundColor`

- [BACK_INCOMPAT] Remove `fabric.Object#toGrayscale` and `fabric.Object#overlayFill` since they're too specific

- [BACK_INCOMPAT] Remove `fabric.StaticCanvas.toGrayscale` since we already have that logic in `fabric.Image.filters.Grayscale`.

- [BACK_INCOMPAT] Split `centerTransform` into the properties `centeredScaling` and `centeredRotation`. Object rotation now happens around originX/originY point UNLESS `centeredRotation=true`. Object scaling now happens non-centered UNLESS `centeredScaling=true`.

## [1.3.0]

- [BACK_INCOMPAT] Remove selectable, hasControls, hasBorders, hasRotatingPoint, transparentCorners, perPixelTargetFind from default object/json representation of objects.

- [BACK_INCOMPAT] Object rotation now happens around originX/originY point UNLESS `centerTransform=true`.

- [BACK_INCOMPAT] fabric.Text#textShadow has been removed - new fabric.Text.shadow property (type of fabric.Shadow).

- [BACK_INCOMPAT] fabric.BaseBrush shadow properties are combined into one property => fabric.BaseBrush.shadow (shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY no longer exist).

- [BACK_INCOMPAT] `fabric.Path.fromObject` is now async. `fabric.Canvas#loadFromDatalessJSON` is deprecated.

## [1.2.0]

- [BACK_INCOMPAT] Make `fabric.Object#toDataURL` synchronous.

- [BACK_INCOMPAT] `fabric.Text#strokeStyle` -> `fabric.Text#stroke`, for consistency with other objects.

- [BACK_INCOMPAT] `fabric.Object.setActive(…)` -> `fabric.Object.set('active', …)`.
                `fabric.Object.isActive` is gone (use `fabric.Object.active` instead)

- [BACK_INCOMPAT] `fabric.Group#objects` -> `fabric.Group._objects`.

## [1.1.0]

- [BACK_INCOMPAT] `fabric.Text#setFontsize` becomes `fabric.Object#setFontSize`.

- [BACK_INCOMPAT] `fabric.Canvas.toDataURL` now accepts options object instead linear arguments.
                `fabric.Canvas.toDataURLWithMultiplier` is deprecated;
                use `fabric.Canvas.toDataURL({ multiplier: … })` instead

## [1.0.0]
