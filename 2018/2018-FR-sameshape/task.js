function initTask(subTask) {
    var state = {};
    var level;
    var answer = null;
    var bank = ["diamond", "circle", "triangle", "hexagon", "star", "square"];
    var paperWidth = 760;
    var paperHeight = null; // calculated
    var data = {
	easy: {
            start: ["diamond", "circle", "hexagon"],
            rules: [
				{
                    oldPattern: ["diamond","circle"],
                    newPattern: ["triangle", "hexagon"]
				},
				{
                    oldPattern: ["hexagon","hexagon"],
                    newPattern: ["triangle", "triangle"]
				},
				{
					oldPattern: ["circle","hexagon"],
					newPattern: ["triangle", "triangle"]
				}
            ],
            target: ["triangle", "triangle", "triangle"]
	},
	medium: {
            start: ["hexagon", "diamond", "circle", "hexagon", "hexagon"],
            rules: [
			{
				oldPattern: ["star","diamond"],
				newPattern: ["triangle", "triangle"]
			},
			{
				oldPattern: ["circle","hexagon"],
				newPattern: ["triangle", "triangle"]
			},
			{
				oldPattern: ["hexagon","hexagon"],
				newPattern: ["hexagon", "triangle"]
			},
			{
				oldPattern: ["hexagon"],
				newPattern: ["star"]
			}
            ],
            target: ["triangle", "triangle", "triangle", "triangle", "triangle"]
	},
	hard: {
            start: ["triangle", "hexagon", "circle", "diamond", "star", "square"],
            rules: [
			{
				oldPattern: ["hexagon", "circle", "diamond"],
				newPattern: ["hexagon", "circle", "hexagon"]
			},
			{
				oldPattern: ["circle","diamond", "star"],
				newPattern: ["circle", "diamond"]
			},
			{
				oldPattern: ["diamond","star"],
				newPattern: ["diamond", "circle", "circle"]
			},
			{
				oldPattern: ["circle", "circle"],
				newPattern: ["circle"]
			},
			{
				oldPattern: ["triangle", "circle"],
				newPattern: []
			},
			{
				oldPattern: ["hexagon"],
				newPattern: ["triangle"]
			}
            ],
            target: ["square"]

	}
    };

    var opacity_rules_black = 0.4
    var opacity_rules_white = 0.3
    var color_rules_white = "white"
    var color_rules_black = "green"
    
    var paper;
    var visualResult;
    var levelTarget;
    var levelStart;
    var levelRules;

    var shapeParams = {
	cellDiameter: 45,
	shapeSpacing: 35,
	shapeDiameter: 30,
	resultCenterX: 10,
	resultCenterY: 25,
	rulesCenterY: 110,
	targetCenterX: 750,
	slotAttr: {
            "stroke-width": 2,
            fill: "#DDDDDD"
	},
	shapeAttr: {
        circle: {
			fill: "red"
            },
        triangle: {
			fill: "green"
            },
        diamond: {
			fill: "yellow"
            },
        hexagon: {
			fill: "cyan"
            },
        star: {
			fill: "purple"
            },
        ellipsis: {
			"stroke-width": 1,
			fill: "black",
			r: 2
			},
		square: {
			fill: "grey"
			}
		}
    };

    var textParams = {
		startY: shapeParams.rulesCenterY,
		ruleX: 5,
		ruleYSpacing: 70,
		textShapePadX: 9,
		textSuffixPadX: 10,
		targetY: null, // calculated
		targetYPad: 10,
		attr: {
            "font-size": 16,
            "text-anchor": "start"
		},
		targetAttr: {
            "text-anchor": "end",
            "font-weight": "bold"
		}
    };

    var separatorParams = {
		attr: {
            "stroke-width": 2
		}
    };

    var targetRectAttr = {
		"stroke-width": 2
    };

    subTask.loadLevel = function(curLevel) {
		level = curLevel;
		initPermutation();
    };

    subTask.getStateObject = function() {
		return state;
    };

    subTask.reloadAnswerObject = function(answerObj) {
		if(answerObj === null) {
			answer = subTask.getDefaultAnswerObject();
	}
	answer = answerObj;
    };

    subTask.resetDisplay = function() {
		initPaper();
    };

    subTask.getAnswerObject = function() {
		return answer;
    };

    subTask.getDefaultAnswerObject = function() {
		return [levelStart];
    };

    subTask.unloadLevel = function(callback) {
		callback();
    };

    var initPermutation = function() {
		var randomGenerator = new RandomGenerator(subTask.taskParams.randomSeed);
		var permutation = $.extend([], bank);

		// No need to safeShuffle - the original order is arbitrary and doesn't hint at anything.
		randomGenerator.shuffle(permutation);
		
		var permutationObject = {};
		for(var index = 0; index < bank.length; index++) {
			permutationObject[bank[index]] = permutation[index];
		}
		levelTarget = $.map(data[level].target, function(shape) {
			return permutationObject[shape];
		});
		levelStart = $.map(data[level].start, function(shape) {
			return permutationObject[shape];
		});
		levelRules = $.map(data[level].rules, function(rule) {
			return {
				oldPattern: $.map(rule.oldPattern, function(shape) { return permutationObject[shape]; }),
				newPattern: $.map(rule.newPattern, function(shape) { return permutationObject[shape]; })
			};
		});
		randomGenerator.shuffle(levelRules);
	};

	var initPaper = function() {
		textParams.targetY = shapeParams.resultCenterY;
		paperHeight = textParams.startY + textParams.ruleYSpacing * (levelRules.length+1); 

		paper = subTask.raphaelFactory.create("anim", "anim", paperWidth, paperHeight);

		// This fixes a bug that causes Raphael's element.getBBox() method to return wrong values for texts in IE6.
		// Taken from here: https://github.com/DmitryBaranovskiy/raphael/issues/410#issuecomment-17374032 
		if (Raphael.vml) {
			var OriginalFunc = Raphael._engine.create;
			Raphael._engine.create = function() {
				res = OriginalFunc.apply(Raphael, arguments);
				res.span.style.cssText += ";white-space:nowrap;";
				return res;
			};
		}

		refreshResult();
		for(var iRule = 0; iRule < levelRules.length; iRule++) {
            initRule(iRule);
		}
		initBackButton();
		initTarget();
		initSeparators();
    };

    var initSeparators = function() {
		paper.path(["M", 0, shapeParams.rulesCenterY - 40, "H", paperWidth]).attr(separatorParams.attr);
		paper.path(["M", 0, paperHeight - 30, "H", paperWidth]).attr(separatorParams.attr);
    };

    var initRule = function(iRule) {

		var prefixText = levelRules[iRule].newPattern.length > 0 ? taskStrings.rulePrefix(iRule) : taskStrings.removePrefix(iRule);

		// Prefix.
		var leftX = textParams.ruleX;
		var centerY = textParams.startY + textParams.ruleYSpacing * (iRule);
		var prefix = paper.text(leftX, centerY, prefixText).attr(textParams.attr);
		leftX += prefix.getBBox().width + textParams.textShapePadX;
		
		// Old pattern.
		var array = levelRules[iRule].oldPattern;
		var arrayWidth = array.length * shapeParams.cellDiameter;
		var centerX = leftX + arrayWidth / 2;
		createShapeArray(array, centerX, centerY, "rule_" + iRule + "_old");
		leftX += arrayWidth + textParams.textShapePadX;

		if (levelRules[iRule].newPattern.length > 0)
		{
			// Infix.
			var infix = paper.text(leftX, centerY, taskStrings.ruleInfix).attr(textParams.attr);
			leftX += infix.getBBox().width + textParams.textShapePadX;

			// New pattern.
			array = levelRules[iRule].newPattern;
			arrayWidth = array.length * shapeParams.cellDiameter;
			centerX = leftX + arrayWidth / 2;
			createShapeArray(array, centerX, centerY, "rule_" + iRule + "_new");
			leftX += arrayWidth;
		}
		
		var element;
		element = paper.rect(textParams.ruleX-4, centerY-shapeParams.cellDiameter/2, leftX, shapeParams.cellDiameter)
		element.attr({"stroke-width": 2, fill: color_rules_white, opacity : opacity_rules_white});
		
		element[0].onmouseenter = function(event) {
			element.attr({fill : color_rules_black, opacity : opacity_rules_black});
		}

		element[0].onmouseleave = function(event) {
			element.attr({fill : color_rules_white, opacity : opacity_rules_white});
		}
		
		element[0].onclick = function(event) {
			apply_rule(iRule)
		}
    };
	
	var initBackButton = function() {
		var leftX = textParams.ruleX;
		var centerY = textParams.startY + textParams.ruleYSpacing * levelRules.length;
		var prefix = paper.text(leftX, centerY, taskStrings.undo).attr(textParams.attr);
		
		element = paper.rect(textParams.ruleX-4, centerY-shapeParams.cellDiameter/2, prefix.getBBox().width+6, shapeParams.cellDiameter)
		element.attr({"stroke-width": 2, fill: color_rules_white, opacity : opacity_rules_white});
		
		element[0].onmouseenter = function(event) {
			element.attr({fill : color_rules_black, opacity : opacity_rules_black});
		}

		element[0].onmouseleave = function(event) {
			element.attr({fill : color_rules_white, opacity : opacity_rules_white});
		}
		
		element[0].onclick = function(event) {
			undo_last_rule()
		}
	};

    var initTarget = function() {
		var targetCenterX = shapeParams.targetCenterX - textParams.textShapePadX - (levelTarget.length * shapeParams.shapeSpacing);

		paper.text(targetCenterX, textParams.targetY, taskStrings.target).attr(textParams.attr).attr(textParams.targetAttr);

		targetCenterX = shapeParams.targetCenterX - (levelTarget.length * shapeParams.shapeSpacing / 2);

		createShapeArray(levelTarget, targetCenterX, textParams.targetY, "target");
    };

    var createShapeArray = function(array, centerX, centerY, iden) {
		var leftX;
		if(array[0] === null) {
				leftX = centerX - (array.length * shapeParams.cellDiameter) / 2;
				var elements = Beav.Array.init(array.length, drawSlot);
				var positions = Beav.Array.init(array.length, function(index) {
				return [
					leftX + shapeParams.cellDiameter / 2 + (shapeParams.cellDiameter * index),
					centerY
				];
			});
		}
		else {
				leftX = centerX - (array.length * shapeParams.shapeSpacing) / 2;
				for(var iShape = 0; iShape < array.length; iShape++) {
			var shapeSet = drawShape(array[iShape]);
			shapeSet.transform(["T", leftX + shapeParams.shapeSpacing / 2 + iShape * shapeParams.shapeSpacing, centerY]);
				}
		}
    };

    var drawSlot = function() {
		return paper.rect(- shapeParams.cellDiameter / 2, - shapeParams.cellDiameter / 2, shapeParams.cellDiameter, shapeParams.cellDiameter).attr(shapeParams.slotAttr);
    };

    var drawShape = function(shape) {
		var set = paper.set();
		set.push(drawSlot().attr({
				fill: "green",
				opacity: 0
		}));

		var radius = shapeParams.shapeDiameter / 2;
		var element;

		if(shape == "circle") {
				element = paper.circle(0, 0, radius);
		}
		else if(shape == "triangle") {
				element = paper.path(["M", -radius, radius,
					  "L", radius, radius,
					  "L", 0, -radius,
					  "Z"]);
		}
		else if(shape == "diamond") {
				element = paper.path(["M", 0, -radius,
					  "L", radius, 0,
					  "L", 0, radius,
					  "L", -radius, 0,
					  "Z"]);
		}
		else if(shape == "hexagon") {
				element = paper.path(["M", 0, -radius,
					  "L", -radius, -radius / 2,
					  "L", -radius, radius / 2,
					  "L", 0, radius,
					  "L", radius, radius / 2,
					  "L", radius, -radius / 2,
					  "Z"]);
		}
		else if(shape == "star") {
				element = paper.path(["M", 0, -radius,
					  "L", 0.27 * radius, -0.3 * radius,
					  "L", radius, -0.3 * radius,
					  "L", 0.4 * radius, 0.2 * radius,
					  "L", 0.6 * radius, 0.8 * radius,
					  "L", 0, 0.4 * radius,
					  "L", - 0.6 * radius, 0.8 * radius,
					  "L", - 0.4 * radius, 0.2 * radius,
					  "L", - radius, -0.3 * radius,
					  "L", - 0.27 * radius, -0.3 * radius,
					  "Z"]);
		}
		else if(shape == "ellipsis") {
				element = paper.set();
				element.push(paper.circle(0, 0));
				element.push(paper.circle(-8, 0));
				element.push(paper.circle(8, 0));
		}
		else if(shape == "square") {
			element = paper.rect(-radius*0.95, -radius*0.95, 2*radius*0.95, 2*radius*0.95);
	}

		if(shapeParams.shapeAttr[shape]) {
				element.attr(shapeParams.shapeAttr[shape]);
		}
		set.push(element);
		return set;
    };

    var undo_last_rule = function ()
	{
		if (answer.length > 1)
		{
			answer.pop();
			refreshResult();
		}
	}
	
    var apply_rule = function (index)
    {
        var res = false;
        var from = levelRules[index].oldPattern;
        var to = levelRules[index].newPattern;
        var i = 0;
		var last_config = answer[answer.length-1].slice();
        while (i < last_config.length)
        {
            var ok = true;
            for (var j = 0; j < from.length; j++)
            {
                if (i+j >= last_config.length)
                {
                    ok = false;
                    break;
                }
                if (last_config[i+j] != from[j])
                {
                    ok = false;
                    break;
                }
            }
            if (ok)
            {
				// last_config.splice(i,from.length, ...to); // SPREAD OPERATOR NOT SUPPORTED IN IE6
				last_config.splice(i,from.length);
				for (var j = 0; j < to.length; j++)
				{
					last_config.splice(i+j,0,to[j]);
				}

                i += to.length;
                res = true;
            }
            else
                i++;
        }
        if (res)
		{
			answer.push(last_config);
            refreshResult();
		}
    }

    
    var refreshResult = function() {
        removeVisualResult();
        visualResult = [];

        var centerY = shapeParams.resultCenterY;

        var pattern = answer[answer.length-1];
        for(var iShape = 0, offScreen = false; iShape < pattern.length && !offScreen; iShape++) {
            var centerX = shapeParams.resultCenterX + iShape * shapeParams.shapeSpacing + shapeParams.shapeSpacing / 2;
            var shapeSet;

            // If the right edge of this shape is off screen, or if there is another shape
            // and its right edge is going to be off screen, draw ellipsis instead. 
            if((centerX + shapeParams.shapeSpacing / 2 >= paperWidth) || (iShape < pattern.length - 1 && centerX + shapeParams.shapeSpacing * 1.5 >= paperWidth)) {
                shapeSet = drawShape("ellipsis");
                offScreen = true;
            }
            else {
                shapeSet = drawShape(pattern[iShape]);
            }
            shapeSet.transform(["T", centerX, centerY]);
	    visualResult.push(shapeSet);
        }
    };

    var removeVisualResult = function() {
		if(!visualResult || visualResult.length === 0) {
            return;
	}
	while(visualResult.length > 0) {
            visualResult.pop().remove();
	}
    };

    var checkAnswer = function() {
		var pattern = answer[answer.length-1]
		if(pattern.length != levelTarget.length) {
            return false;
	}
	for(var iTarget = 0; iTarget < levelTarget.length; iTarget++) {
        if(pattern[iTarget] !== levelTarget[iTarget]) {
			return false;
        }
	}
	return true;
    };

    var getResultAndMessage = function() {
		if(!checkAnswer()) {
			return {
				successRate: 0,
				message: taskStrings.wrong
			};
		}
		return {
            successRate: 1,
            message: taskStrings.success
		};
    };

    subTask.getGrade = function(callback) {
		callback(getResultAndMessage());
    };
}
initWrapper(initTask, ["easy", "medium", "hard"]);
