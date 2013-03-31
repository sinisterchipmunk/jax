shared uniform bool LIGHT_ENABLED;
shared uniform int LIGHT_TYPE;
shared uniform vec3 LIGHT_POSITION, LIGHT_DIRECTION;
shared uniform vec4 LIGHT_AMBIENT, LIGHT_DIFFUSE, LIGHT_SPECULAR;
shared uniform float LIGHT_ATTENUATION_CONSTANT, LIGHT_ATTENUATION_LINEAR, LIGHT_ATTENUATION_QUADRATIC,
                     LIGHT_SPOT_EXPONENT, LIGHT_SPOT_COS_CUTOFF;

float calcAttenuation(in vec3 ecPosition3,
                      out vec3 lightDirection)
{
//  lightDirection = vec3(vnMatrix * -light.position) - ecPosition3;
  lightDirection = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;
  float d = length(lightDirection);
  
  return 1.0 / (LIGHT_ATTENUATION_CONSTANT + LIGHT_ATTENUATION_LINEAR * d + LIGHT_ATTENUATION_QUADRATIC * d * d);
}

void DirectionalLight(in vec3 normal,
                      inout vec4 ambient,
                      inout vec4 diffuse,
                      inout vec4 specular)
{
  vec3 nLDir = normalize(vnMatrix * -normalize(LIGHT_DIRECTION));
  vec3 halfVector = normalize(nLDir + vec3(0,0,1));
  float pf;
    
  float NdotD  = max(0.0, dot(normal, nLDir));
  float NdotHV = max(0.0, dot(normal, halfVector));
    
  if (NdotD == 0.0) pf = 0.0;
  else pf = pow(NdotHV, materialShininess);
    
  ambient += LIGHT_AMBIENT;
  diffuse += LIGHT_DIFFUSE * NdotD;
  specular += LIGHT_SPECULAR * pf;
}

/* Use when attenuation != (1,0,0) */
void PointLightWithAttenuation(in vec3 ecPosition3,
                               in vec3 normal,
                               inout vec4 ambient,
                               inout vec4 diffuse,
                               inout vec4 specular)
{
  float NdotD; // normal . light direction
  float NdotHV;// normal . half vector
  float pf;    // specular factor
  float attenuation;
  vec3 VP;     // direction from surface to light position
  vec3 halfVector; // direction of maximum highlights
  
  attenuation = calcAttenuation(ecPosition3, VP);
  VP = normalize(VP);
  
  halfVector = normalize(VP+vec3(0,0,1));
  NdotD = max(0.0, dot(normal, VP));
  NdotHV= max(0.0, dot(normal, halfVector));
  
  if (NdotD == 0.0) pf = 0.0;
  else pf = pow(NdotHV, materialShininess);

  ambient += LIGHT_AMBIENT * attenuation;
  diffuse += LIGHT_DIFFUSE * NdotD * attenuation;
  specular += LIGHT_SPECULAR * pf * attenuation;
}

/* Use for better performance when attenuation == (1,0,0) */
void PointLightWithoutAttenuation(in vec3 ecPosition3,
                                  in vec3 normal,
                                  inout vec4 ambient,
                                  inout vec4 diffuse,
                                  inout vec4 specular)
{
  float NdotD; // normal . light direction
  float NdotHV;// normal . half vector
  float pf;    // specular factor
  float d;     // distance from surface to light source
  vec3 VP;     // direction from surface to light position
  vec3 halfVector; // direction of maximum highlights
  
  VP = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;
  d = length(VP);
  VP = normalize(VP);
  halfVector = normalize(VP+vec3(0,0,1));
  NdotD = max(0.0, dot(normal, VP));
  NdotHV= max(0.0, dot(normal, halfVector));
  
  if (NdotD == 0.0) pf = 0.0;
  else pf = pow(NdotHV, materialShininess);
  
  ambient += LIGHT_AMBIENT;
  diffuse += LIGHT_DIFFUSE * NdotD;
  specular += LIGHT_SPECULAR * pf;
}

void SpotLight(in vec3 ecPosition3,
               in vec3 normal,
               inout vec4 ambient,
               inout vec4 diffuse,
               inout vec4 specular)
{
  float NdotD; // normal . light direction
  float NdotHV;// normal . half vector
  float pf;    // specular factor
  float attenuation;
  vec3 VP;     // direction from surface to light position
  vec3 halfVector; // direction of maximum highlights
  float spotDot; // cosine of angle between spotlight
  float spotAttenuation; // spotlight attenuation factor
  
  attenuation = calcAttenuation(ecPosition3, VP);
  VP = normalize(VP);
  
  // See if point on surface is inside cone of illumination
  spotDot = dot(-VP, normalize(vnMatrix*LIGHT_DIRECTION));
  if (spotDot < LIGHT_SPOT_COS_CUTOFF)
    spotAttenuation = 0.0;
  else spotAttenuation = pow(spotDot, LIGHT_SPOT_EXPONENT);
  
  attenuation *= spotAttenuation;
  
  halfVector = normalize(VP+vec3(0,0,1));
  NdotD = max(0.0, dot(normal, VP));
  NdotHV= max(0.0, dot(normal, halfVector));
  
  if (NdotD == 0.0) pf = 0.0;
  else pf = pow(NdotHV, materialShininess);
  
  ambient += LIGHT_AMBIENT * attenuation;
  diffuse += LIGHT_DIFFUSE * NdotD * attenuation;
  specular += LIGHT_SPECULAR * pf * attenuation;
}
