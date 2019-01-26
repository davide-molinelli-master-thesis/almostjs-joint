// Copyright (c) 2016, the ALMOsT project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by the MIT license that can be found in the LICENSE file.
/*jslint node: true */
"use strict";

var $ = require('jquery'),
    joint = require('joint');

function PanReactor(options) {
    if (!(this instanceof PanReactor)) { return new PanReactor(options); }
    options = options || {};

    if (!options.paper || typeof options.paper !== 'object' || !(options.paper instanceof joint.dia.Paper)) { throw new Error('paper option is mandatory'); }
    if (typeof options.x !== 'number') { throw new Error('x option is mandatory and has to be a number'); }
    if (typeof options.y !== 'number') { throw new Error('y option is mandatory and has to be a number'); }
    if (!options.el) { throw new Error('el option is mandatory'); }
    if ($(options.el).length === 0) { throw new Error('invalid el option'); }

    var el = $($(options.el)[0]),
        paper = options.paper,
        startLocal = {x: options.x, y: options.y},
        mouseout,
        self = this;

    function mousemove(e) {
        var left = el.offset().left,
            top = el.offset().top,
            width = el.width(),
            height = el.height(),
            topLeft = joint.g.point(left, top),
            bottomRight = joint.g.point(left + width, top + height),
            minLocal = paper.clientToLocalPoint(topLeft),
            maxLocal = paper.clientToLocalPoint(bottomRight),
            scale = joint.g.point(width / (maxLocal.x - minLocal.x), height / (maxLocal.y - minLocal.y)),
            offsetClient = joint.g.point(startLocal.x * scale.x + left, startLocal.y * scale.y + top),
            origin = joint.g.point(e.clientX - offsetClient.x, e.clientY - offsetClient.y);

        paper.setOrigin(origin.x, origin.y);
    }

    function terminate() {
        el.off('mouseup', terminate);
        el.off('mouseout', mouseout);
        el.off('mousemove touchmove', mousemove);
        el.removeClass('almost-joint-manipulating');
    }

    mouseout = function (e) {
        if (e.target === el.get(0)) {
            terminate();
        }
    };

    if(!options.simulation) {
      el.on('mouseup', terminate);
      el.on('mouseout', mouseout);
      el.on('mousemove touchmove', mousemove);
      el.addClass('almost-joint-manipulating');
    }

    self.moveBoardVoiceAssistant = function (times,delta) {
        mouseMoveSimulation(delta,times);
    }

    async function mouseMoveSimulation (delta,times) {
        var eventSimulation = {
          clientX: Math.floor(window.innerWidth/2),
          clientY: Math.floor(window.innerHeight/2)
        };
        for (var i = 0; i < times; i++) {
            mousemove(eventSimulation);
            eventSimulation.clientX += delta.x;
            eventSimulation.clientY += delta.y;
            await delay(1);
        }
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve,ms));
    }
}

exports.PanReactor = PanReactor;
