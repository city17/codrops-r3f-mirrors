uniform float time;
uniform vec2 resolution;

in VertexData
{
    vec4 v_position;
    vec3 v_normal;
    vec2 v_texcoord;
} inData;

out vec4 gl_FragColor;

void main(void)
{
    vec2 uv = inData.v_texcoord;
    
    float multiplier = time;
    
    float red = sin(time + 30 * uv.x) * sin(10 * uv.y);
    float green = cos(time + 10 * uv.y) * cos(30 * uv.x);
    float blue = uv.x + uv.y;
    
    gl_FragColor = vec4(
                red,
                green,
                blue,
                1.0
        );
}

