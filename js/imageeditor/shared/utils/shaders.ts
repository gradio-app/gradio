/**
 * GLSL Shader that takes two textures and erases the second texture from the first.
 */
export const erase_shader = `
precision highp float;

uniform sampler2D uDrawingTexture;
uniform sampler2D uEraserTexture;

varying vec2 vTextureCoord;

void main(void) {
	vec4 drawingColor = texture2D(uDrawingTexture,vTextureCoord);
	vec4 eraserColor = texture2D(uEraserTexture, vTextureCoord);

	// Use the alpha of the eraser to determine how much to "erase" from the drawing
	float alpha = 1.0 - eraserColor.a;
	gl_FragColor = vec4(drawingColor.rgb * alpha, drawingColor.a * alpha);
}`;
