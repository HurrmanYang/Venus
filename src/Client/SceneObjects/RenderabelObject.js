VENUS.RenderabelObject = function() {
	VENUS.SceneObject.call(this);
}

VENUS.RenderabelObject.prototype = Object.create(VENUS.SceneObject.prototype);

VENUS.RenderabelObject.prototype.render = function(modelViewMatrix44) {
	// each sub class has its own render method.
}

