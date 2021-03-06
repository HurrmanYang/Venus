VENUS.Scene = function() {
	this._root = new VENUS.SceneNode();
	this._sceneNodeList = [];
	this._currentCameraNode = null;
}

VENUS.Scene.prototype.getRootSceneNode = function() {
	return this._root;
}

VENUS.Scene.prototype.getSceneNodeByName = function() {}

VENUS.Scene.prototype.getSceneNodeById = function() {}

VENUS.Scene.prototype.render = function() {

	var sceneObjectList = this._root.getDescendants();

	for (var i = 0; i < sceneObjectList.length; ++i) {
		var node = sceneObjectList[i];
		if (node instanceof VENUS.MovableSceneNode) {
			node.animate();
		}
	}

	var gl = VENUS.Engine.getInstance().getWebGLConfiguration().getContext();
	var cameraNode = this.getCurrentCameraSceneNode();
	var viewMatrix = new VENUS.Matrix44(cameraNode.getViewMatrix());
	var projectionMatrix = cameraNode.getProjectionMatrix();
	var cameraPosition = cameraNode.getPosition();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);

	var renderableLists = this._getRenderableSceneObjectList();
	var transparentSceneObjectList = renderableLists["transparent"];
	var opaqueSceneObjectList = renderableLists["opaque"];



	for (var i = 0; i < opaqueSceneObjectList.length; ++i) {
		opaqueSceneObjectList[i].render(projectionMatrix, cameraPosition, viewMatrix);
	}

	for (var i = 0; i < transparentSceneObjectList.length; ++i) {
		transparentSceneObjectList[i].render(projectionMatrix, cameraPosition, viewMatrix);

	}

}

VENUS.Scene.prototype._getRenderableSceneObjectList = function() {
	var sceneObjectList = this._root.getDescendants();
	var transparentSceneObjectList = [];
	var opaqueSceneObjectList = [];
	var renderableLists = {};
	var cameraNode = this._currentCameraNode;
	var lookAtDirection = cameraNode.getLookAtDirection();

	for (var i = 0; i < sceneObjectList.length; ++i) {
		var node = sceneObjectList[i];
		if (node.isRenderable()) {
			if (node.isTransparent()) {
				transparentSceneObjectList.push(node);
			}
			else {
				opaqueSceneObjectList.push(node);
			}
		}
	}

	renderableLists["transparent"] = transparentSceneObjectList;
	renderableLists["opaque"] = opaqueSceneObjectList;
	return renderableLists;
};

VENUS.Scene.prototype.getCurrentCameraSceneNode = function() {
	return this._currentCameraNode;
}

/*
 *Camara node is attach to root node by default, if you want to change, please attach it to other node directly.
 */
VENUS.Scene.prototype.setCurrentCameraNode = function(cameraNode) {
	SharedUtil.assert(cameraNode !== undefined && cameraNode instanceof VENUS.CameraSceneNode, "setCurrentCamera need parameters");
	this._currentCameraNode = cameraNode;
	this._root.addChild(this._currentCameraNode);
}

VENUS.Scene.prototype.createPerspectiveCameraSceneNode = function(fovyDegree, near, far, position, lookAtDirection, upDirection, name) {
	var engine = VENUS.Engine.getInstance();
	var aspect = engine.getCanvasWidth() / engine.getCanvasHeight();
	var camera = new VENUS.PerspectiveCamera(fovyDegree, aspect, near, far);
	var node = new VENUS.CameraSceneNode(camera, position, lookAtDirection, upDirection);

	if (name !== undefined) {
		node.setName(name);
	}

	return node;
}

VENUS.Scene.prototype.createEntitySceneNode = function(name) {
	var entity = new VENUS.Entity();
	var node = new VENUS.EntitySceneNode(entity);

	if (name !== undefined) {
		node.setName(name);
	}

	return node;
}

VENUS.Scene.prototype.createSkyBoxSceneNode = function(name, size, imagePX, imageNX, imagePY, imageNY, imagePZ, imageNZ) {
	var entity = new VENUS.Entity();
	var webglConst = VENUS.Engine.getWebGLConstants();
	entity.setMesh(VENUS.Mesh.createCubeMesh(size));

	var cubeMaterial = entity.getMaterial();
	var cubeTexture = new VENUS.Texture();
	cubeMaterial.setEnableLighting(false);

	cubeTexture.createTexture(webglConst.TEXTURE_CUBE_MAP, webglConst.RGBA, webglConst.RGBA, webglConst.UNSIGNED_BYTE, imagePX, imageNX, imagePY, imageNY, imagePZ, imageNZ);
	cubeMaterial.setCubeMapTexture(cubeTexture);

	var node = new VENUS.SkyBoxSceneNode(entity);

	if (name !== undefined) {
		node.setName(name);
	}

	return node;
};

VENUS.Scene.prototype.createBillboardSceneNode = function(width, height, image) {
	var billboard = new VENUS.Billboard(width, height);
	var webglConst = VENUS.Engine.getWebGLConstants();
	var material = billboard.getMaterial();
	var texture = new VENUS.Texture();

	texture.createTexture(webglConst.TEXTURE_2D, webglConst.RGBA, webglConst.RGBA, webglConst.UNSIGNED_BYTE, image);
	material.set2DTexture(texture);
	material.setTransparent(true);

	var node = new VENUS.BillboardSceneNode(billboard);

	return node;
};

VENUS.Scene.prototype.createParticleEmmiterSceneNode = function(image) {
	var particleEmmiter = new VENUS.ParticleEmmiter();
	var webglConst = VENUS.Engine.getWebGLConstants();
	var texture = new VENUS.Texture();
	texture.createTexture(webglConst.TEXTURE_2D, webglConst.RGBA, webglConst.RGBA, webglConst.UNSIGNED_BYTE, image);
	particleEmmiter.setTexture(texture);

	var node = new VENUS.ParticleEmmiterSceneNode(particleEmmiter);

	return node;
};

VENUS.Scene.prototype.createFPSCameraSceneNode = function(fovyDegree, near, far, position, lookAtDirection, upDirection) {
	var node = this.createPerspectiveCameraSceneNode(fovyDegree, near, far, position, lookAtDirection, upDirection, name);
	var fpsCameraAnimation = new VENUS.FPSCameraAnimation();
	node.addAnimation(fpsCameraAnimation);
	return node;
};

VENUS.Scene.prototype.createDirectionLightSceneNode = function(ambientColorVector3, diffuseColorVector3, specularColorVector3, directionVector3) {
	var directionLight = new VENUS.DirectionLight();

	directionLight.setAmbientLightColor(ambientColorVector3);
	directionLight.setDiffuseLightColor(diffuseColorVector3);
	directionLight.setSpecularLightColor(specularColorVector3);

	directionLight.setDirection(directionVector3);

	var node = new VENUS.LightSceneNode(directionLight);

	return node;
};

VENUS.Scene.prototype.createPointLightSceneNode = function(ambientColorVector3, diffuseColorVector3, specularColorVector3, positionVector3) {
	var pointLight = new VENUS.PointLight();

	pointLight.setAmbientLightColor(ambientColorVector3);
	pointLight.setDiffuseLightColor(diffuseColorVector3);
	pointLight.setSpecularLightColor(specularColorVector3);

	var node = new VENUS.LightSceneNode(pointLight);
	node.setPosition(positionVector3);

	return node;
};

VENUS.Scene.prototype.createSpotLightSceneNode = function(ambientColorVector3, diffuseColorVector3, specularColorVector3, directionVector3, positionVector3, maxDegree) {
	var spotLight = new VENUS.SpotLight();

	spotLight.setAmbientLightColor(ambientColorVector3);
	spotLight.setDiffuseLightColor(diffuseColorVector3);
	spotLight.setSpecularLightColor(specularColorVector3);
	spotLight.setDirection(directionVector3);
	spotLight.setRange(maxDegree);

	var node = new VENUS.LightSceneNode(spotLight);
	node.setPosition(positionVector3);

	return node;
};

VENUS.Scene.prototype.getLights = function() {
	var ligths = {};

	var directionLights = [];
	var pointLights = [];
	var spotLights = [];

	var objList = this._root.getDescendants();
	for (var i in objList) {
		var obj = objList[i];
		if (obj.isLight()) {
			switch (objList[i].getLightType()) {
			case VENUS.TYPE_LIGHT_DIRECTION:
				{
					directionLights.push(objList[i]);
					break;
				}
			case VENUS.TYPE_LIGHT_POINT:
				{
					pointLights.push(objList[i]);
					break;
				}
			case VENUS.TYPE_LIGHT_SPOT:
				{
					spotLights.push(objList[i]);
					break;
				}

			}
		}
	}

	ligths["directionLights"] = directionLights;
	ligths["spotLights"] = spotLights;
	ligths["pointLights"] = pointLights;

	return ligths;
};

