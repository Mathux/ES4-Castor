function initTask(subTask) {

    subTask.gridInfos = {
        hideSaveOrLoad: false,
        actionDelay: 200,
        buttonHideInitialDrawing: true,
        buttonScaleDrawing: true,

        includeBlocks: {
            groupByCategory: true,
            generatedBlocks: {
                processing: ["popStyle", "pushStyle", "cursor", "focused", "width", "height", "arc", "ellipse", "line", "point", "quad", "rect", "triangle", "bezier", "bezierDetail", "bezierPoint", "bezierTangent", "curve", "curveDetail", "curvePoint", "curveTangent", "curveTightness", "ellipseMode", "noSmooth", "rectMode", "smooth", "strokeCap", "strokeJoin", "strokeWeight", "beginShape", "bezierVertex", "curveVertex", "endShape", "texture", "textureMode", "vertex", "shape", "shapeMode", "isVisible", "setVisible", "disableStyle", "enableStyle", "getChild", "print", "println", "applyMatrix", "popMatrix", "printMatrix", "pushMatrix", "resetMatrix", "rotate", "rotateX", "rotateY", "rotateZ", "scale", "translate", "ambientLight", "directionalLight", "lightFalloff", "lightSpecular", "lights", "noLights", "normal", "pointLight", "spotLight", "beginCamera", "camera", "endCamera", "frustum", "ortho", "perspective", "printCamera", "printProjection", "modelX", "modelY", "modelZ", "screenX", "screenY", "screenZ", "ambient", "emissive", "shininess", "specular", "background", "colorMode", "fill", "noFill", "noStroke", "stroke", "alpha", "blendColor", "blue", "brightness", "color", "green", "hue", "lerpColor", "red", "saturation", "createImage", "image", "imageMode", "noTint", "tint", "resize", "blend", "copy", "filter", "get", "loadPixels", "pixels", "set", "updatePixels", "createGraphics", "beginDraw", "endDraw", "PFont_list", "createFont", "loadFont", "text_", "textFont", "textAlign", "textLeading", "textMode", "textSize", "textWidth", "textAscent", "textDescent"]
            },
            standardBlocks: {
                wholeCategories: ["input", "logic", "loops", "math", "texts", "lists", "colour", "dicts", "variables", "functions"]
            }
        },
        maxInstructions: 100,
        checkEndEveryTurn: false,

        checkEndConditionOptions: {
            checkRedCoveredGreenNotCovered: true,
            checkAllFiguresConnected: true,
            checkBackgroundCovered: {
                threshold: 200,
                score_lost: 1, // per extra pixel covered
                initial_score: 100, // initial score
                min_score: 1 // minimal score value to perform a task
            }
        },
        checkEndCondition: processingEndConditions.checkEndCondition

    };

    subTask.data = {
        easy: [
            {
                initialDrawing: function(processing) {
                    processing.noStroke();
                    processing.fill(255, 0, 0);
                    processing.ellipse(100, 100, 120, 120);
                },
                options: {
                    canvas_size: {
                        width: 200,
                        height: 200
                    }
                }
            }
        ],
        medium: [
            {
                initialDrawing: function(processing) {
                    processing.noStroke();
                    processing.fill(255, 0, 0);
                    processing.ellipse(150, 180, 180, 180);
                    processing.ellipse(70, 70, 100, 100);
                    processing.ellipse(230, 70, 100, 100);
                    processing.fill(255);
                    processing.ellipse(150, 180, 150, 150);
                    processing.fill(0, 255, 0);
                    processing.ellipse(150, 180, 50, 50);
                },
                options: {
                    canvas_size: {
                        width: 300,
                        height: 300
                    }
                }
            }
        ],
        hard: [
            {
                initialDrawing: function(processing) {
                    processing.noStroke();
                    processing.fill(255, 0, 0);
                    processing.ellipse(150, 180, 180, 180);
                    processing.ellipse(150, 350, 200, 200);
                    processing.ellipse(50, 330, 50, 50);
                    processing.ellipse(250, 330, 50, 50);
                    processing.ellipse(70, 70, 100, 100);
                    processing.ellipse(230, 70, 100, 100);
                    processing.fill(255);
                    processing.ellipse(150, 180, 150, 150);
                    processing.fill(0, 255, 0);
                    processing.ellipse(150, 180, 50, 50);
                },
                options: {
                    canvas_size: {
                        width: 300,
                        height: 470
                    }
                }
            }
        ]
    };

    initBlocklySubTask(subTask);
}

initWrapper(initTask, ["easy", "medium", "hard"], null, null);