(function() {
  var _join = Array.prototype.join,
      commandLengths = {
        m: 2,
        l: 2,
        h: 1,
        v: 1,
        c: 6,
        s: 4,
        q: 4,
        t: 2,
        a: 7
      },
      repeatedCommands = {
        m: 'l',
        M: 'L'
      };
  function segmentToBezier(th2, th3, cosTh, sinTh, rx, ry, cx1, cy1, mT, fromX, fromY) {
    var costh2 = fabric.util.cos(th2),
        sinth2 = fabric.util.sin(th2),
        costh3 = fabric.util.cos(th3),
        sinth3 = fabric.util.sin(th3),
        toX = cosTh * rx * costh3 - sinTh * ry * sinth3 + cx1,
        toY = sinTh * rx * costh3 + cosTh * ry * sinth3 + cy1,
        cp1X = fromX + mT * ( -cosTh * rx * sinth2 - sinTh * ry * costh2),
        cp1Y = fromY + mT * ( -sinTh * rx * sinth2 + cosTh * ry * costh2),
        cp2X = toX + mT * ( cosTh * rx * sinth3 + sinTh * ry * costh3),
        cp2Y = toY + mT * ( sinTh * rx * sinth3 - cosTh * ry * costh3);

    return ['C',
      cp1X, cp1Y,
      cp2X, cp2Y,
      toX, toY
    ];
  }

  /* Adapted from http://dxr.mozilla.org/mozilla-central/source/content/svg/content/src/nsSVGPathDataParser.cpp
   * by Andrea Bogazzi code is under MPL. if you don't have a copy of the license you can take it here
   * http://mozilla.org/MPL/2.0/
   */
  function arcToSegments(toX, toY, rx, ry, large, sweep, rotateX) {
    var PI = Math.PI, th = rotateX * PI / 180,
        sinTh = fabric.util.sin(th),
        cosTh = fabric.util.cos(th),
        fromX = 0, fromY = 0;

    rx = Math.abs(rx);
    ry = Math.abs(ry);

    var px = -cosTh * toX * 0.5 - sinTh * toY * 0.5,
        py = -cosTh * toY * 0.5 + sinTh * toX * 0.5,
        rx2 = rx * rx, ry2 = ry * ry, py2 = py * py, px2 = px * px,
        pl = rx2 * ry2 - rx2 * py2 - ry2 * px2,
        root = 0;

    if (pl < 0) {
      var s = Math.sqrt(1 - pl / (rx2 * ry2));
      rx *= s;
      ry *= s;
    }
    else {
      root = (large === sweep ? -1.0 : 1.0) *
              Math.sqrt( pl / (rx2 * py2 + ry2 * px2));
    }

    var cx = root * rx * py / ry,
        cy = -root * ry * px / rx,
        cx1 = cosTh * cx - sinTh * cy + toX * 0.5,
        cy1 = sinTh * cx + cosTh * cy + toY * 0.5,
        mTheta = calcVectorAngle(1, 0, (px - cx) / rx, (py - cy) / ry),
        dtheta = calcVectorAngle((px - cx) / rx, (py - cy) / ry, (-px - cx) / rx, (-py - cy) / ry);

    if (sweep === 0 && dtheta > 0) {
      dtheta -= 2 * PI;
    }
    else if (sweep === 1 && dtheta < 0) {
      dtheta += 2 * PI;
    }

    // Convert into cubic bezier segments <= 90deg
    var segments = Math.ceil(Math.abs(dtheta / PI * 2)),
        result = [], mDelta = dtheta / segments,
        mT = 8 / 3 * Math.sin(mDelta / 4) * Math.sin(mDelta / 4) / Math.sin(mDelta / 2),
        th3 = mTheta + mDelta;

    for (var i = 0; i < segments; i++) {
      result[i] = segmentToBezier(mTheta, th3, cosTh, sinTh, rx, ry, cx1, cy1, mT, fromX, fromY);
      fromX = result[i][5];
      fromY = result[i][6];
      mTheta = th3;
      th3 += mDelta;
    }
    return result;
  }

  /*
   * Private
   */
  function calcVectorAngle(ux, uy, vx, vy) {
    var ta = Math.atan2(uy, ux),
        tb = Math.atan2(vy, vx);
    if (tb >= ta) {
      return tb - ta;
    }
    else {
      return 2 * Math.PI - (ta - tb);
    }
  }

  /**
   * Calculate bounding box of a beziercurve
   * @param {Number} x0 starting point
   * @param {Number} y0
   * @param {Number} x1 first control point
   * @param {Number} y1
   * @param {Number} x2 secondo control point
   * @param {Number} y2
   * @param {Number} x3 end of bezier
   * @param {Number} y3
   */
  // taken from http://jsbin.com/ivomiq/56/edit  no credits available for that.
  // TODO: can we normalize this with the starting points set at 0 and then translated the bbox?
  function getBoundsOfCurve(x0, y0, x1, y1, x2, y2, x3, y3) {
    var argsString;
    if (fabric.cachesBoundsOfCurve) {
      argsString = _join.call(arguments);
      if (fabric.boundsOfCurveCache[argsString]) {
        return fabric.boundsOfCurveCache[argsString];
      }
    }

    var sqrt = Math.sqrt,
        min = Math.min, max = Math.max,
        abs = Math.abs, tvalues = [],
        bounds = [[], []],
        a, b, c, t, t1, t2, b2ac, sqrtb2ac;

    b = 6 * x0 - 12 * x1 + 6 * x2;
    a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
    c = 3 * x1 - 3 * x0;

    for (var i = 0; i < 2; ++i) {
      if (i > 0) {
        b = 6 * y0 - 12 * y1 + 6 * y2;
        a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
        c = 3 * y1 - 3 * y0;
      }

      if (abs(a) < 1e-12) {
        if (abs(b) < 1e-12) {
          continue;
        }
        t = -c / b;
        if (0 < t && t < 1) {
          tvalues.push(t);
        }
        continue;
      }
      b2ac = b * b - 4 * c * a;
      if (b2ac < 0) {
        continue;
      }
      sqrtb2ac = sqrt(b2ac);
      t1 = (-b + sqrtb2ac) / (2 * a);
      if (0 < t1 && t1 < 1) {
        tvalues.push(t1);
      }
      t2 = (-b - sqrtb2ac) / (2 * a);
      if (0 < t2 && t2 < 1) {
        tvalues.push(t2);
      }
    }

    var x, y, j = tvalues.length, jlen = j, mt;
    while (j--) {
      t = tvalues[j];
      mt = 1 - t;
      x = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
      bounds[0][j] = x;

      y = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
      bounds[1][j] = y;
    }

    bounds[0][jlen] = x0;
    bounds[1][jlen] = y0;
    bounds[0][jlen + 1] = x3;
    bounds[1][jlen + 1] = y3;
    var result = [
      {
        x: min.apply(null, bounds[0]),
        y: min.apply(null, bounds[1])
      },
      {
        x: max.apply(null, bounds[0]),
        y: max.apply(null, bounds[1])
      }
    ];
    if (fabric.cachesBoundsOfCurve) {
      fabric.boundsOfCurveCache[argsString] = result;
    }
    return result;
  }

  /**
   * Converts arc to a bunch of bezier curves
   * @param {Number} fx starting point x
   * @param {Number} fy starting point y
   * @param {Array} coords Arc command
   */
  function fromArcToBeziers(fx, fy, coords) {
    var rx = coords[1],
        ry = coords[2],
        rot = coords[3],
        large = coords[4],
        sweep = coords[5],
        tx = coords[6],
        ty = coords[7],
        segsNorm = arcToSegments(tx - fx, ty - fy, rx, ry, large, sweep, rot);

    for (var i = 0, len = segsNorm.length; i < len; i++) {
      segsNorm[i][1] += fx;
      segsNorm[i][2] += fy;
      segsNorm[i][3] += fx;
      segsNorm[i][4] += fy;
      segsNorm[i][5] += fx;
      segsNorm[i][6] += fy;
    }
    return segsNorm;
  };

  /**
   * This function take a parsed SVG path and make it simpler for fabricJS logic.
   * simplification consist of: only UPPERCASE absolute commands ( relative converted to absolute )
   * S converted in C, T converted in Q, A converted in C.
   * @param {Array} path the array of commands of a parsed svg path for fabric.Path
   * @return {Array} the simplified array of commands of a parsed svg path for fabric.Path
   */
  function makePathSimpler(path) {
    // x and y represent the last point of the path. the previous command point.
    // we add them to each relative command to make it an absolute comment.
    // we also swap the v V h H with L, because are easier to transform.
    var x = 0, y = 0, len = path.length,
        // x1 and y1 represent the last point of the subpath. the subpath is started with
        // m or M command. When a z or Z command is drawn, x and y need to be resetted to
        // the last x1 and y1.
        x1 = 0, y1 = 0, current, i, converted,
        // previous will host the letter of the previous command, to handle S and T.
        // controlX and controlY will host the previous reflected control point
        destinationPath = [], previous, controlX, controlY;
    for (i = 0; i < len; ++i) {
      converted = false;
      current = path[i].slice(0);
      switch (current[0]) { // first letter
        case 'l': // lineto, relative
          current[0] = 'L';
          current[1] += x;
          current[2] += y;
          // falls through
        case 'L':
          x = current[1];
          y = current[2];
          break;
        case 'h': // horizontal lineto, relative
          current[1] += x;
          // falls through
        case 'H':
          current[0] = 'L';
          current[2] = y;
          x = current[1];
          break;
        case 'v': // vertical lineto, relative
          current[1] += y;
          // falls through
        case 'V':
          current[0] = 'L';
          y = current[1];
          current[1] = x;
          current[2] = y;
          break;
        case 'm': // moveTo, relative
          current[0] = 'M';
          current[1] += x;
          current[2] += y;
          // falls through
        case 'M':
          x = current[1];
          y = current[2];
          x1 = current[1];
          y1 = current[2];
          break;
        case 'c': // bezierCurveTo, relative
          current[0] = 'C';
          current[1] += x;
          current[2] += y;
          current[3] += x;
          current[4] += y;
          current[5] += x;
          current[6] += y;
          // falls through
        case 'C':
          controlX = current[3];
          controlY = current[4];
          x = current[5];
          y = current[6];
          break;
        case 's': // shorthand cubic bezierCurveTo, relative
          current[0] = 'S';
          current[1] += x;
          current[2] += y;
          current[3] += x;
          current[4] += y;
          // falls through
        case 'S':
          // would be sScC but since we are swapping sSc for C, we check just that.
          if (previous === 'C') {
            // calculate reflection of previous control points
            controlX = 2 * x - controlX;
            controlY = 2 * y - controlY;
          }
          else {
            // If there is no previous command or if the previous command was not a C, c, S, or s,
            // the control point is coincident with the current point
            controlX = x;
            controlY = y;
          }
          x = current[3];
          y = current[4];
          current[0] = 'C';
          current[5] = current[3];
          current[6] = current[4];
          current[3] = current[1];
          current[4] = current[2];
          current[1] = controlX;
          current[2] = controlY;
          // current[3] and current[4] are NOW the second control point.
          // we keep it for the next reflection.
          controlX = current[3];
          controlY = current[4];
          break;
        case 'q': // quadraticCurveTo, relative
          current[0] = 'Q';
          current[1] += x;
          current[2] += y;
          current[3] += x;
          current[4] += y;
          // falls through
        case 'Q':
          controlX = current[1];
          controlY = current[2];
          x = current[3];
          y = current[4];
          break;
        case 't': // shorthand quadraticCurveTo, relative
          current[0] = 'T';
          current[1] += x;
          current[2] += y;
          // falls through
        case 'T':
          if (previous === 'Q') {
            // calculate reflection of previous control point
            controlX = 2 * x - controlX;
            controlY = 2 * y - controlY;
          }
          else {
            // If there is no previous command or if the previous command was not a Q, q, T or t,
            // assume the control point is coincident with the current point
            controlX = x;
            controlY = y;
          }
          current[0] = 'Q';
          x = current[1];
          y = current[2];
          current[1] = controlX;
          current[2] = controlY;
          current[3] = x;
          current[4] = y;
          break;
        case 'a':
          current[0] = 'A';
          current[6] += x;
          current[7] += y;
          // falls through
        case 'A':
          converted = true;
          destinationPath = destinationPath.concat(fromArcToBeziers(x, y, current));
          x = current[6];
          y = current[7];
          break;
        case 'z':
        case 'Z':
          x = x1;
          y = y1;
          break;
        default:
      }
      if (!converted) {
        destinationPath.push(current);
      }
      previous = current[0];
    }
    return destinationPath;
  };

  /**
   * Calc length from point x1,y1 to x2,y2
   * @param {Number} x1 starting point x
   * @param {Number} y1 starting point y
   * @param {Number} x2 starting point x
   * @param {Number} y2 starting point y
   * @return {Number} length of segment
   */
  function calcLineLength(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }

  // functions for the Cubic beizer
  // taken from: https://github.com/konvajs/konva/blob/7.0.5/src/shapes/Path.ts#L350
  function CB1(t) {
    return t * t * t;
  }
  function CB2(t) {
    return 3 * t * t * (1 - t);
  }
  function CB3(t) {
    return 3 * t * (1 - t) * (1 - t);
  }
  function CB4(t) {
    return (1 - t) * (1 - t) * (1 - t);
  }

  function getPointOnCubicBezierIterator(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
    return function(pct) {
      var c1 = CB1(pct), c2 = CB2(pct), c3 = CB3(pct), c4 = CB4(pct);
      return {
        x: p4x * c1 + p3x * c2 + p2x * c3 + p1x * c4,
        y: p4y * c1 + p3y * c2 + p2y * c3 + p1y * c4
      };
    };
  }

  function getTangentCubicIterator(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
    return function (pct) {
      var invT = 1 - pct,
          tangentX = (3 * invT * invT * (p2x - p1x)) + (6 * invT * pct * (p3x - p2x)) +
          (3 * pct * pct * (p4x - p3x)),
          tangentY = (3 * invT * invT * (p2y - p1y)) + (6 * invT * pct * (p3y - p2y)) +
          (3 * pct * pct * (p4y - p3y));
      return Math.atan2(tangentY, tangentX);
    };
  }

  function QB1(t) {
    return t * t;
  }

  function QB2(t) {
    return 2 * t * (1 - t);
  }

  function QB3(t) {
    return (1 - t) * (1 - t);
  }

  function getPointOnQuadraticBezierIterator(p1x, p1y, p2x, p2y, p3x, p3y) {
    return function(pct) {
      var c1 = QB1(pct), c2 = QB2(pct), c3 = QB3(pct);
      return {
        x: p3x * c1 + p2x * c2 + p1x * c3,
        y: p3y * c1 + p2y * c2 + p1y * c3
      };
    };
  }

  function getTangentQuadraticIterator(p1x, p1y, p2x, p2y, p3x, p3y) {
    return function (pct) {
      var invT = 1 - pct,
          tangentX = (2 * invT * (p2x - p1x)) + (2 * pct * (p3x - p2x)),
          tangentY = (2 * invT * (p2y - p1y)) + (2 * pct * (p3y - p2y));
      return Math.atan2(tangentY, tangentX);
    };
  }


  // this will run over a path segment ( a cubic or quadratic segment) and approximate it
  // with 100 segemnts. This will good enough to calculate the length of the curve
  function pathIterator(iterator, x1, y1) {
    var tempP = { x: x1, y: y1 }, p, tmpLen = 0, perc;
    for (perc = 1; perc <= 100; perc += 1) {
      p = iterator(perc / 100);
      tmpLen += calcLineLength(tempP.x, tempP.y, p.x, p.y);
      tempP = p;
    }
    return tmpLen;
  }

  /**
   * Given a pathInfo, and a distance in pixels, find the percentage from 0 to 1
   * that correspond to that pixels run over the path.
   * The percentage will be then used to find the correct point on the canvas for the path.
   * @param {Array} segInfo fabricJS collection of information on a parsed path
   * @param {Number} distance from starting point, in pixels.
   * @return {Object} info object with x and y ( the point on canvas ) and angle, the tangent on that point;
   */
  function findPercentageForDistance(segInfo, distance) {
    var perc = 0, tmpLen = 0, iterator = segInfo.iterator, tempP = { x: segInfo.x, y: segInfo.y },
        p, nextLen, nextStep = 0.01, angleFinder = segInfo.angleFinder, lastPerc;
    // nextStep > 0.0001 covers 0.00015625 that 1/64th of 1/100
    // the path
    while (tmpLen < distance && perc <= 1 && nextStep > 0.0001) {
      p = iterator(perc);
      lastPerc = perc;
      nextLen = calcLineLength(tempP.x, tempP.y, p.x, p.y);
      // compare tmpLen each cycle with distance, decide next perc to test.
      if ((nextLen + tmpLen) > distance) {
        // we discard this step and we make smaller steps.
        nextStep /= 2;
        perc -= nextStep;
      }
      else {
        tempP = p;
        perc += nextStep;
        tmpLen += nextLen;
      }
    }
    p.angle = angleFinder(lastPerc);
    return p;
  }

  /**
   * Run over a parsed and simplifed path and extrac some informations.
   * informations are length of each command and starting point
   * @param {Array} path fabricJS parsed path commands
   * @return {Array} path commands informations
   */
  function getPathSegmentsInfo(path) {
    var totalLength = 0, len = path.length, current,
        //x2 and y2 are the coords of segment start
        //x1 and y1 are the coords of the current point
        x1 = 0, y1 = 0, x2 = 0, y2 = 0, info = [], iterator, tempInfo, angleFinder;
    for (var i = 0; i < len; i++) {
      current = path[i];
      tempInfo = {
        x: x1,
        y: y1,
        command: current[0],
      };
      switch (current[0]) { //first letter
        case 'M':
          tempInfo.length = 0;
          x2 = x1 = current[1];
          y2 = y1 = current[2];
          break;
        case 'L':
          tempInfo.length = calcLineLength(x1, y1, current[1], current[2]);
          x1 = current[1];
          y1 = current[2];
          break;
        case 'C':
          iterator = getPointOnCubicBezierIterator(
            x1,
            y1,
            current[1],
            current[2],
            current[3],
            current[4],
            current[5],
            current[6]
          );
          angleFinder = getTangentCubicIterator(
            x1,
            y1,
            current[1],
            current[2],
            current[3],
            current[4],
            current[5],
            current[6]
          );
          tempInfo.iterator = iterator;
          tempInfo.angleFinder = angleFinder;
          tempInfo.length = pathIterator(iterator, x1, y1);
          x1 = current[5];
          y1 = current[6];
          break;
        case 'Q':
          iterator = getPointOnQuadraticBezierIterator(
            x1,
            y1,
            current[1],
            current[2],
            current[3],
            current[4]
          );
          angleFinder = getTangentQuadraticIterator(
            x1,
            y1,
            current[1],
            current[2],
            current[3],
            current[4]
          );
          tempInfo.iterator = iterator;
          tempInfo.angleFinder = angleFinder;
          tempInfo.length = pathIterator(iterator, x1, y1);
          x1 = current[3];
          y1 = current[4];
          break;
        case 'Z':
        case 'z':
          // we add those in order to ease calculations later
          tempInfo.destX = x2;
          tempInfo.destY = y2;
          tempInfo.length = calcLineLength(x1, y1, x2, y2);
          x1 = x2;
          y1 = y2;
          break;
      }
      totalLength += tempInfo.length;
      info.push(tempInfo);
    }
    info.push({ length: totalLength, x: x1, y: y1 });
    return info;
  }

  function getPointOnPath(path, distance, infos) {
    if (!infos) {
      infos = getPathSegmentsInfo(path);
    }
    var i = 0;
    while ((distance - infos[i].length > 0) && i < (infos.length - 2)) {
      distance -= infos[i].length;
      i++;
    }
    // var distance = infos[infos.length - 1] * perc;
    var segInfo = infos[i], segPercent = distance / segInfo.length,
        command = segInfo.command, segment = path[i], info;

    switch (command) {
      case 'M':
        return { x: segInfo.x, y: segInfo.y, angle: 0 };
      case 'Z':
      case 'z':
        info = new fabric.Point(segInfo.x, segInfo.y).lerp(
          new fabric.Point(segInfo.destX, segInfo.destY),
          segPercent
        );
        info.angle = Math.atan2(segInfo.destY - segInfo.y, segInfo.destX - segInfo.x);
        return info;
      case 'L':
        info = new fabric.Point(segInfo.x, segInfo.y).lerp(
          new fabric.Point(segment[1], segment[2]),
          segPercent
        );
        info.angle = Math.atan2(segment[2] - segInfo.y, segment[1] - segInfo.x);
        return info;
      case 'C':
        return findPercentageForDistance(segInfo, distance);
      case 'Q':
        return findPercentageForDistance(segInfo, distance);
    }
  }

  /**
   *
   * @param {string} pathString
   * @return {(string|number)[][]} An array of SVG path commands
   * @example <caption>Usage</caption>
   * parsePath('M 3 4 Q 3 5 2 1 4 0 Q 9 12 2 1 4 0') === [
   *   ['M', 3, 4],
   *   ['Q', 3, 5, 2, 1, 4, 0],
   *   ['Q', 9, 12, 2, 1, 4, 0],
   * ];
   *
   */
  function parsePath(pathString) {
    var result = [],
        coords = [],
        currentPath,
        parsed,
        re = fabric.rePathCommand,
        rNumber = '[-+]?(?:\\d*\\.\\d+|\\d+\\.?)(?:[eE][-+]?\\d+)?\\s*',
        rNumberCommaWsp = '(' + rNumber + ')' + fabric.commaWsp,
        rFlagCommaWsp = '([01])' + fabric.commaWsp + '?',
        rArcSeq = rNumberCommaWsp + '?' + rNumberCommaWsp + '?' + rNumberCommaWsp + rFlagCommaWsp + rFlagCommaWsp +
          rNumberCommaWsp + '?(' + rNumber + ')',
        regArcArgumentSequence = new RegExp(rArcSeq, 'g'),
        match,
        coordsStr,
        // one of commands (m,M,l,L,q,Q,c,C,etc.) followed by non-command characters (i.e. command values)
        path;
    if (!pathString || !pathString.match) {
      return result;
    }
    path = pathString.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi);

    for (var i = 0, coordsParsed, len = path.length; i < len; i++) {
      currentPath = path[i];

      coordsStr = currentPath.slice(1).trim();
      coords.length = 0;

      var command = currentPath.charAt(0);
      coordsParsed = [command];

      if (command.toLowerCase() === 'a') {
        // arcs have special flags that apparently don't require spaces so handle special
        for (var args; (args = regArcArgumentSequence.exec(coordsStr));) {
          for (var j = 1; j < args.length; j++) {
            coords.push(args[j]);
          }
        }
      }
      else {
        while ((match = re.exec(coordsStr))) {
          coords.push(match[0]);
        }
      }

      for (var j = 0, jlen = coords.length; j < jlen; j++) {
        parsed = parseFloat(coords[j]);
        if (!isNaN(parsed)) {
          coordsParsed.push(parsed);
        }
      }

      var commandLength = commandLengths[command.toLowerCase()],
          repeatedCommand = repeatedCommands[command] || command;

      if (coordsParsed.length - 1 > commandLength) {
        for (var k = 1, klen = coordsParsed.length; k < klen; k += commandLength) {
          result.push([command].concat(coordsParsed.slice(k, k + commandLength)));
          command = repeatedCommand;
        }
      }
      else {
        result.push(coordsParsed);
      }
    }

    return result;
  };

  /**
   *
   * Converts points to a smooth SVG path
   * @param {{ x: number,y: number }[]} points Array of points
   * @param {number} [correction] Apply a correction to the path (usually we use `width / 1000`). If value is undefined 0 is used as the correction value.
   * @return {(string|number)[][]} An array of SVG path commands
   */
  function getSmoothPathFromPoints(points, correction) {
    var path = [], i,
        p1 = new fabric.Point(points[0].x, points[0].y),
        p2 = new fabric.Point(points[1].x, points[1].y),
        len = points.length, multSignX = 1, multSignY = 0, manyPoints = len > 2;
    correction = correction || 0;

    if (manyPoints) {
      multSignX = points[2].x < p2.x ? -1 : points[2].x === p2.x ? 0 : 1;
      multSignY = points[2].y < p2.y ? -1 : points[2].y === p2.y ? 0 : 1;
    }
    path.push(['M', p1.x - multSignX * correction, p1.y - multSignY * correction]);
    for (i = 1; i < len; i++) {
      if (!p1.eq(p2)) {
        var midPoint = p1.midPointFrom(p2);
        // p1 is our bezier control point
        // midpoint is our endpoint
        // start point is p(i-1) value.
        path.push(['Q', p1.x, p1.y, midPoint.x, midPoint.y]);
      }
      p1 = points[i];
      if ((i + 1) < points.length) {
        p2 = points[i + 1];
      }
    }
    if (manyPoints) {
      multSignX = p1.x > points[i - 2].x ? 1 : p1.x === points[i - 2].x ? 0 : -1;
      multSignY = p1.y > points[i - 2].y ? 1 : p1.y === points[i - 2].y ? 0 : -1;
    }
    path.push(['L', p1.x + multSignX * correction, p1.y + multSignY * correction]);
    return path;
  }
  /**
   * Transform a path by transforming each segment.
   * it has to be a simplified path or it won't work.
   * WARNING: this depends from pathOffset for correct operation
   * @param {Array} path fabricJS parsed and simplified path commands
   * @param {Array} transform matrix that represent the transformation
   * @param {Object} [pathOffset] the fabric.Path pathOffset
   * @param {Number} pathOffset.x
   * @param {Number} pathOffset.y
   * @returns {Array} the transformed path
   */
  function transformPath(path, transform, pathOffset) {
    if (pathOffset) {
      transform = fabric.util.multiplyTransformMatrices(
        transform,
        [1, 0, 0, 1, -pathOffset.x, -pathOffset.y]
      );
    }
    return path.map(function(pathSegment) {
      var newSegment = pathSegment.slice(0), point = {};
      for (var i = 1; i < pathSegment.length - 1; i += 2) {
        point.x = pathSegment[i];
        point.y = pathSegment[i + 1];
        point = fabric.util.transformPoint(point, transform);
        newSegment[i] = point.x;
        newSegment[i + 1] = point.y;
      }
      return newSegment;
    });
  }

  /**
   * Calculate bounding box of a elliptic-arc
   * @deprecated
   * @param {Number} fx start point of arc
   * @param {Number} fy
   * @param {Number} rx horizontal radius
   * @param {Number} ry vertical radius
   * @param {Number} rot angle of horizontal axis
   * @param {Number} large 1 or 0, whatever the arc is the big or the small on the 2 points
   * @param {Number} sweep 1 or 0, 1 clockwise or counterclockwise direction
   * @param {Number} tx end point of arc
   * @param {Number} ty
   */
  function getBoundsOfArc(fx, fy, rx, ry, rot, large, sweep, tx, ty) {

    var fromX = 0, fromY = 0, bound, bounds = [],
        segs = arcToSegments(tx - fx, ty - fy, rx, ry, large, sweep, rot);

    for (var i = 0, len = segs.length; i < len; i++) {
      bound = getBoundsOfCurve(fromX, fromY, segs[i][1], segs[i][2], segs[i][3], segs[i][4], segs[i][5], segs[i][6]);
      bounds.push({ x: bound[0].x + fx, y: bound[0].y + fy });
      bounds.push({ x: bound[1].x + fx, y: bound[1].y + fy });
      fromX = segs[i][5];
      fromY = segs[i][6];
    }
    return bounds;
  };

  /**
   * Draws arc
   * @deprecated
   * @param {CanvasRenderingContext2D} ctx
   * @param {Number} fx
   * @param {Number} fy
   * @param {Array} coords coords of the arc, without the front 'A/a'
   */
  function drawArc(ctx, fx, fy, coords) {
    coords = coords.slice(0).unshift('X'); // command A or a does not matter
    var beziers = fromArcToBeziers(fx, fy, coords);
    beziers.forEach(function(bezier) {
      ctx.bezierCurveTo.apply(ctx, bezier.slice(1));
    });
  };

  /**
   * Join path commands to go back to svg format
   * @param {Array} pathData fabricJS parsed path commands
   * @return {String} joined path 'M 0 0 L 20 30'
   */
  fabric.util.joinPath = function(pathData) {
    return pathData.map(function (segment) { return segment.join(' '); }).join(' ');
  };
  fabric.util.parsePath = parsePath;
  fabric.util.makePathSimpler = makePathSimpler;
  fabric.util.getSmoothPathFromPoints = getSmoothPathFromPoints;
  fabric.util.getPathSegmentsInfo = getPathSegmentsInfo;
  fabric.util.getBoundsOfCurve = getBoundsOfCurve;
  fabric.util.getPointOnPath = getPointOnPath;
  fabric.util.transformPath = transformPath;
  /**
   * Typo of `fromArcToBeziers` kept for not breaking the api once corrected.
   * Will be removed in fabric 5.0
   * @deprecated
   */
  fabric.util.fromArcToBeizers = fromArcToBeziers;
  // kept because we do not want to make breaking changes.
  // but useless and deprecated.
  fabric.util.getBoundsOfArc = getBoundsOfArc;
  fabric.util.drawArc = drawArc;
})();
