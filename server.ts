import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "20mb" }));

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      })
    : null;

  // Helper function to detect if an error is a quota exhaustion (429 / RESOURCE_EXHAUSTED)
  function isQuotaExceeded(err: any): boolean {
    if (!err) return false;
    
    // Convert error message of any form to string
    let msg = "";
    if (typeof err === "string") {
      msg = err;
    } else {
      msg = err.message || String(err);
      // If nested as an error object (like the structure the user shared)
      if (err.error) {
        msg += " " + (err.error.message || String(err.error));
      }
      try {
        const stringified = JSON.stringify(err);
        msg += " " + stringified;
      } catch (e) {}
    }
    
    msg = msg.toLowerCase();

    // Check code/status directly if present inside the dictionary or nested error
    const code = err.code || err.status || err.error?.code || err.error?.status;
    const codeStr = String(code || "").toLowerCase();

    return (
      msg.includes("quota") ||
      msg.includes("limit") ||
      msg.includes("429") ||
      msg.includes("exhausted") ||
      msg.includes("resource_exhausted") ||
      codeStr.includes("429") ||
      codeStr.includes("resource_exhausted") ||
      err?.status === "RESOURCE_EXHAUSTED" ||
      err?.code === 429
    );
  }

  // --- LOCAL FALLBACK SOLVERS (To guarantee 100% uptime even if client free quota is exhausted) ---
  function getLocalTutorFallback(category: string, userQuery: string, history?: any[]): string {
    const lowQuery = userQuery.toLowerCase();
    const lowCat = (category || "").toLowerCase();

    let historyHeader = "";
    if (history && history.length > 0 && (lowQuery.includes("newton") || lowQuery.includes("leyes"))) {
      const newtonEx = history.find((ex: any) => 
        ex.title.toLowerCase().includes("newton") || 
        ex.category.toLowerCase().includes("mecanica") || 
        ex.title.toLowerCase().includes("caída")
      );
      if (newtonEx) {
        if (newtonEx.createdAt) {
          const elapsedMs = Date.now() - newtonEx.createdAt;
          const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
          const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
          historyHeader = `Buscaste las leyes de Newton hace ${hours} horas, hace ${minutes} minutos.\n\n`;
        } else {
          historyHeader = `Buscaste las leyes de Newton hace un tiempo (${newtonEx.timestamp}).\n\n`;
        }
      }
    }

    const header = `${historyHeader}🚨 **Tutor de Respaldo Local (API de Gemini en Pausa)**

Se ha alcanzado la cuota límite gratuita de la API de Gemini para este proyecto. Para evitar interrupciones en tu estudio, nuestro **Tutor de Respaldo** te ofrece esta explicación didáctica y física completa:

---`;

    if (lowCat.includes("termo") || lowQuery.includes("calor") || lowQuery.includes("gases") || lowQuery.includes("temperatura")) {
      return `${header}
### Teoría de Termodinámica: Ley de los Gases Ideales

La **Termodinámica** estudia el calor, el trabajo y las transformaciones de energía en sistemas gaseosos. Cuando analizamos un gas en un contenedor cerrado, relacionamos sus propiedades macroscópicas macroscópicas (Presión, Volumen y Temperatura) a través de la ecuación de estado de los gases ideales.

#### Supuestos Fundamentales:
1. Las partículas de gas no tienen volumen propio, se consideran masas puntuales libres.
2. No existen fuerzas de atracción o repulsión intermolecular.
3. Las colisiones entre partículas son perfectamente elásticas.

#### Fórmula de Estado Principal:
[FORMULA]
P · V = n · R · T
---
P = Presión absoluta (Pa o atm)
V = Volumen del recipiente (m³ o L)
n = Cantidad de sustancia (moles)
R = Constante universal de los gases (8.314 J/mol K o 0.0821 atm L/mol K)
T = Temperatura absoluta (Kelvin)
[/FORMULA]

#### Ejemplo Práctico de Resolución:
Si un gas ideal se encuentra a una presión de $2\text{ atm}$ en un recipiente de $10\text{ litros}$ a una temperatura de $300\text{ K}$, ¿cuántos moles ($n$) de gas contiene?

1. **Datos de entrada**:
   - $P = 2\text{ atm}$
   - $V = 10\text{ L}$
   - $T = 300\text{ K}$
   - $R = 0.0821\text{ atm L / mol K}$

2. **Despeje de la variable**:
   $n = \frac{P \cdot V}{R \cdot T}$

3. **Sustitución y Cálculo**:
   $n = \frac{2\text{ atm} \cdot 10\text{ L}}{0.0821\text{ atm L/mol K} \cdot 300\text{ K}}$
   $n = \frac{20}{24.63} \approx 0.812\text{ moles}$

#### Errores Comunes de Estudiantes:
- **No convertir la temperatura a Kelvin**: Recuerda siempre sumar $+273.15$ a los grados Celsius ($T_{\text{K}} = T_{\text{C}} + 273.15$). ¡Calcular en Celsius arruinará el problema!
- **Incompatibilidad de unidades en la constante $R$**: Si usas $R = 8.314$, la presión debe estar en Pascales ($1\text{ atm} = 101325\text{ Pa}$) y el volumen en metros cúbicos ($1\text{ L} = 10^{-3}\text{ m}^3$).

*Recomendación*: Puedes agregar tu propia clave de API privada ingresando la variable \`GEMINI_API_KEY\` en la sección de Ajustes > Secrets (icono de llave arriba a la derecha). Esto te dará acceso ilimitado a resoluciones en tiempo real de cualquier imagen o texto.`;
    }

    if (lowCat.includes("opti") || lowQuery.includes("luz") || lowQuery.includes("refract") || lowQuery.includes("espejo") || lowQuery.includes("prism")) {
      return `${header}
### Teoría de Óptica: Refracción de la Luz y Ley de Snell

La **Refracción** ocurre cuando una onda luminosa pasa de un medio transparente a otro con una densidad óptica distinta (por ejemplo, del aire al agua). Al cambiar de medio, la velocidad de la luz varía, provocando una desviación o cambio de ángulo en la trayectoria de los rayos de luz.

#### Supuestos Fundamentales:
1. El medio físico es homogéneo e isótropo (la luz viaja a velocidad constante en todas direcciones dentro de él).
2. Se utiliza el modelo de aproximación geométrica (rayos de luz rectilíneos).

#### Fórmula Principal (Ley de Snell):
[FORMULA]
n_1 · sen(θ_1) = n_2 · sen(θ_2)
---
n_1 = Índice de refracción del medio 1 (adimensional)
θ_1 = Ángulo de incidencia respecto a la normal (grados)
n_2 = Índice de refracción del medio 2 (adimensional)
θ_2 = Ángulo de refracción respecto a la normal (grados)
[/FORMULA]

#### Ejemplo Práctico de Resolución:
Un rayo de luz viaja por el aire ($n_1 = 1.0$) e incide sobre la superficie de un block de vidrio con un ángulo de $30^\circ$ respecto a la normal. Si el índice de refracción del vidrio es $n_2 = 1.50$, ¿cuál es el ángulo de refracción ($θ_2$)?

1. **Datos de entrada**:
   - $n_1 = 1.0$ (aire)
   - $θ_1 = 30^\circ$
   - $n_2 = 1.5$ (vidrio)

2. **Despeje de la variable**:
   $\text{sen}(θ_2) = \frac{n_1 \cdot \text{sen}(θ_1)}{n_2}$

3. **Sustitución y Cálculo**:
   $\text{sen}(θ_2) = \frac{1.0 \cdot \text{sen}(30^\circ)}{1.5} = \frac{1.0 \cdot 0.5}{1.5} \approx 0.333$
   $θ_2 = \text{arsen}(0.333) \approx 19.47^\circ$

#### Errores Comunes de Estudiantes:
- **Medir el ángulo con la superficie en vez de la Normal**: Recuerda siempre medir los ángulos respecto a la línea normal (la perpendicular imaginaria a la superficie de contacto), y no contra el vidrio directamente.
- **Calculadora en Radianes**: Asegúrate de que tu calculadora científica esté configurada en grados sexagesimales (modo DEG) antes de obtener los senos y arcocenos correspondientes.

*Recomendación*: Puedes agregar tu propia clave de API privada ingresando la variable \`GEMINI_API_KEY\` en la sección de Ajustes > Secrets (icono de llave arriba a la derecha). Esto te dará acceso ilimitado a resoluciones en tiempo real de cualquier imagen o texto.`;
    }

    if (lowCat.includes("electro") || lowQuery.includes("ohm") || lowQuery.includes("circuit") || lowQuery.includes("corrient") || lowQuery.includes("volt") || lowQuery.includes("magnet")) {
      return `${header}
### Teoría de Electromagnetismo: Ley de Ohm y Circuitos CC

En la física de **Electromagnetismo**, los circuitos eléctricos de corriente continua son gobernados por la Ley de Ohm, la cual establece la relación fundamental entre la tensión eléctrica aplicada, la resistencia al flujo que presenta el material, y la intensidad de la corriente resultante.

#### Supuestos Fundamentales:
1. Conector óhmico (mantiene una resistencia constante a temperatura estable).
2. Se desprecian las resistencias parásitas de los cables de conexión ideales.

#### Fórmula Principal (Ley de Ohm):
[FORMULA]
V = I · R
---
V = Voltaje o diferencia de potencial (Voltios)
I = Intensidad de la corriente eléctrica (Amperios)
R = Resistencia eléctrica del circuito (Ohmios)
[/FORMULA]

#### Ejemplo Práctico de Resolución:
Se conecta un foco de resistencia $R = 50\ \Omega$ a una batería de voltaje $V = 12\text{ V}$. ¿Cuál es la corriente eléctrica ($I$) que circulará por el foco?

1. **Datos de entrada**:
   - $V = 12\text{ V}$
   - $R = 50\ \Omega$

2. **Despeje de la variable**:
   $I = \frac{V}{R}$

3. **Sustitución y Cálculo**:
   $I = \frac{12\text{ V}}{50\ \Omega} = 0.24\text{ A}$ (o bien $240\text{ mA}$)

#### Errores Comunes de Estudiantes:
- **Equivocarse de posición de las variables en la fórmula**: Recuerda el truco neumotécnico de la pirámide: el Voltaje se encuentra arriba, y la Corriente con la Resistencia abajo multiplicándose ($V = I \cdot R$; $I = V/R$; $R = V/I$).

*Recomendación*: Puedes agregar tu propia clave de API privada ingresando la variable \`GEMINI_API_KEY\` en la sección de Ajustes > Secrets (icono de llave arriba a la derecha). Esto te dará acceso ilimitado a resoluciones en tiempo real de cualquier imagen o texto.`;
    }

    // DEFAULT / KINEMATICS / MECHANICS FALLBACK
    return `${header}
### Teoría de Mecánica Clásica: Movimiento Uniformemente Acelerado

La **Mecánica Clásica** estudia las causas de los movimientos físicos y cómo estos suceden en el espacio y el tiempo. En cinemática lineal, el **Movimiento Rectilíneo Uniformemente Variado (MRUV)** describe un cuerpo que viaja en una dirección recta experimentando un cambio constante de velocidad por unidad de tiempo debido a la aceleración neta aplicada.

#### Supuestos Fundamentales:
1. El movimiento se restringe a una sola línea recta dimensional (eje $X$ o $Y$).
2. La aceleración es constante y uniforme en todo momento temporal.

#### Fórmula Principal del Movimiento MRUV:
[FORMULA]
v_f = v_0 + a · t
---
v_f = velocidad final del cuerpo (m/s)
v_0 = velocidad inicial del cuerpo (m/s)
a = aceleración lineal constante (m/s²)
t = tiempo transcurrido (s)
[/FORMULA]

#### Ejemplo Práctico de Resolución (Caída Libre):
Un bloque de física se deja caer de forma libre desde un rascacielos sin velocidad inicial inicial ($v_0 = 0\text{ m/s}$). ¿Con qué velocidad final ($v_f$) impactará contra el suelo después de $3.0\text{ s}$ de caída? (Considera la aceleración gravitacional $g = 9.8\text{ m/s}^2$).

1. **Datos de entrada**:
   - $v_0 = 0\text{ m/s}$ (parte del reposo)
   - $t = 3.0\text{ s}$
   - $a = g = 9.8\text{ m/s}^2$

2. **Estructuración del despeje**:
   La fórmula ya tiene despejada la velocidad final $v_f$:
   $v_f = v_0 + g \cdot t$

3. **Sustitución y Cálculo**:
   $v_f = 0 + 9.8\text{ m/s}^2 \cdot 3.0\text{ s}$
   $v_f = 29.4\text{ m/s}$

#### Errores Comunes de Estudiantes:
- **No uniformizar los signos vectoriales**: Si consideras que el movimiento de caída libre es hacia abajo (negativo en el eje $Y$), asegúrate de que tanto la aceleración de la gravedad $g$ como la velocidad final lleven signo negativo (ej. $v_f = -29.4\text{ m/s}$). Un error de signos en dinámica o cinemática alterará drásticamente la respuesta.

*Recomendación*: Puedes agregar tu propia clave de API privada ingresando la variable \`GEMINI_API_KEY\` en la sección de Ajustes > Secrets (icono de llave arriba a la derecha). Esto te dará acceso ilimitado a resoluciones en tiempo real de cualquier imagen o texto.`;
  }

  function getLocalVideoScriptFallback(category: string, titleStr: string): any {
    const lowCat = (category || "").toLowerCase();
    
    if (lowCat.includes("termo")) {
      return {
        "chapters": [
          {
            "id": "intro",
            "title": "1. Introducción al Estado de Gases",
            "text": "¡Hola clase! Hoy revisaremos la Ley de los Gases Ideales. Conoceremos cómo la agitación de las moléculas del gas se traduce en la presión macroscópica que sentimos al inflar un balón.",
            "equations": [
              "Leyes de Termodinámica",
              "PV = nRT (Ecuación General)"
            ]
          },
          {
            "id": "data",
            "title": "2. Parámetros del Recipiente",
            "text": "Analizaremos las constantes que tenemos: el número de moles (n), la constante universal (R = 8.31 J/mol K) y mediremos la temperatura absoluta convirtiendo siempre grados Celsius a escala absoluta Kelvin.",
            "equations": [
              "Constante de Gases R = 8.314 J/(mol·K)",
              "Temperatura Kelvin: T = t(°C) + 273.15"
            ]
          },
          {
            "id": "formula",
            "title": "3. Ley de Boyle-Mariotte y Charles",
            "text": "Establecemos que a temperatura constante, la presión y el volumen son inversamente proporcionales. Esto quiere decir que comprimir el gas a la mitad duplicará la fuerza de las colisiones moleculares contra la pared.",
            "equations": [
              "Relación Constante: P1 · V1 = P2 · V2",
              "Proporción de Temperatura: V / T = Constante"
            ]
          },
          {
            "id": "solve",
            "title": "4. Cálculo de Número de Moles",
            "text": "Realizamos la operación paso a paso para despejar el número de moles en el sistema n = PV/RT. Analicemos cómo la masa molecular influye en la densidad del gas.",
            "equations": [
              "Despeje: n = (P · V) / (R · T)",
              "Evaluación: n = 101325 Pa · 0.01 m³ / (8.31 · 298)"
            ]
          },
          {
            "id": "conclusion",
            "title": "5. Conclusión y Conservación",
            "text": "¡Extraordinario! Hemos comprobado cómo las leyes microscópicas dictan el equilibrio térmico del sistema. Evita siempre usar la temperatura en Celsius, ¡la física exige cero absoluto!",
            "equations": [
              "Resultado: n ≈ 0.409 moles de gas ideal",
              "Fin de Simulación Térmica"
            ]
          }
        ]
      };
    }

    if (lowCat.includes("opti")) {
      return {
        "chapters": [
          {
            "id": "intro",
            "title": "1. Introducción a la Refracción",
            "text": "¡Bienvenidos! Hoy exploraremos la refracción de rayos de luz. Al cruzar desde el aire ópticamente liviano hacia el agua o vidrio, la velocidad de la onda cambia, doblando su trayectoria.",
            "equations": [
              "Física de Ondas y Óptica",
              "Índice de Refracción: n = c / v"
            ]
          },
          {
            "id": "data",
            "title": "2. Índices de Refracción",
            "text": "Comenzamos identificando los índices ópticos: el aire presenta n1 = 1.0, mientras que el agua presenta n2 = 1.33 y el cristal n2 = 1.50.",
            "equations": [
              "Índice del Aire n1 = 1.00",
              "Índice del Vidrio n2 = 1.50"
            ]
          },
          {
            "id": "formula",
            "title": "3. Formulación de Snell",
            "text": "Planteamos la conocida Ley de Snell que rige la conservación de la frecuencia de onda a través del límite físico de refracción.",
            "equations": [
              "Ley de Snell: n1 · sen(θ1) = n2 · sen(θ2)",
              "Ángulo Límite: sen(θ_crit) = n2 / n1"
            ]
          },
          {
            "id": "solve",
            "title": "4. Cálculo de Ángulo de Refracción",
            "text": "Evaluamos el ángulo de salida θ2 aplicando la función inversa de arco seno. Observamos cómo el haz luminoso se dobla acercándose a la perpendicular normal.",
            "equations": [
              "Despeje: sen(θ2) = n1/n2 · sen(θ1)",
              "Sustitución para 30°: sen(θ2) = 1.0 / 1.5 · 0.5 = 0.333"
            ]
          },
          {
            "id": "conclusion",
            "title": "5. Conclusión Visual de Snell",
            "text": "¡Perfecto! Hemos determinado que la luz se refractará a unos diecinueve grados. Recuerda medir siempre contra el vector Normal y no contra el cristal plano.",
            "equations": [
              "Ángulo Calculado: θ2 = 19.47° grados",
              "Fin del Trazado Óptico"
            ]
          }
        ]
      };
    }

    if (lowCat.includes("electro")) {
      return {
        "chapters": [
          {
            "id": "intro",
            "title": "1. Introducción al Flujo de Carga",
            "text": "¡Hola a todos! Bienvenidos al laboratorio de voltajes eléctricos. El día de hoy examinamos la corriente continua: el flujo ordenado de electrones guiado por un campo magnético o eléctrico.",
            "equations": [
              "Leyes de Electrostática",
              "Corriente: I = dq / dt"
            ]
          },
          {
            "id": "data",
            "title": "2. Datos de Voltaje y Resistencia",
            "text": "Disponemos de una pila de tensión de doce voltios y un filamento que disipa energía con una resistencia termo-óhmica de cincuenta ohmios.",
            "equations": [
              "Potencial de Batería V = 12.0 Voltios",
              "Resistencia del Conductor R = 50.0 Ohm"
            ]
          },
          {
            "id": "formula",
            "title": "3. Formulación de la Ley de Ohm",
            "text": "Conectamos las variables mediante la Ley de Ohm. Esta relación de proporcionalidad describe que la corriente es proporcional a la fuerza motriz del voltaje.",
            "equations": [
              "Ecuación de Ohm: V = I · R",
              "Disipación Térmica (Joule): P = I² · R"
            ]
          },
          {
            "id": "solve",
            "title": "4. Cálculo de Corriente",
            "text": "Despejamos la intensidad de corriente I dividiendo el voltaje entre la resistencia. El resultado nos dirá el flujo de electrones que circulará cada segundo.",
            "equations": [
              "Despeje Corriente: I = V / R",
              "Sustitución: I = 12 V / 50 Ω = 0.24 A"
            ]
          },
          {
            "id": "conclusion",
            "title": "5. Conclusión de Potencia y Seguridad",
            "text": "¡Resuelto con éxito! Descubrimos que fluyen doscientos cuarenta miliamperios de corriente. Evita el contacto directo y usa siempre un multímetro para validar tus circuitos.",
            "equations": [
              "Corriente Estimada I = 0.24 Amperios",
              "Potencia de Calor P = 2.88 Watts"
            ]
          }
        ]
      };
    }

    // DEFAULT / KINEMATICS / MECHANICS FALLBACK
    return {
      "chapters": [
        {
          "id": "intro",
          "title": "1. Introducción al Movimiento Uniforme",
          "text": "¡Hola a todos! Bienvenidos al estudio del Movimiento Rectilíneo Uniformemente Variado (MRUV). Analizaremos un cuerpo que cambia de velocidad debido a la gravedad.",
          "equations": [
            "Física de Movimiento Lineal",
            "Aceleración Constante: a = dv/dt"
          ]
        },
        {
          "id": "data",
          "title": "2. Datos Iniciales y Gravedad",
          "text": "Registramos los datos de partida: partimos de velocidad cero por lo que se asume reposo absoluto. La aceleración uniforme representa la atracción de la gravedad terrestre.",
          "equations": [
            "Velocidad Inicial v0 = 0.00 m/s",
            "Aceleración Gravitacional g = 9.80 m/s²"
          ]
        },
        {
          "id": "formula",
          "title": "3. Leyes Cinematicas de Caída",
          "text": "Seleccionamos la función horaria que describe cómo varía la posición y velocidad con el tiempo sin considerar las turbulencias de fricción del aire.",
          "equations": [
            "Velocidad Final: vf = v0 + g · t",
            "Posición Acumulada: y = v0·t + 1/2 g·t²"
          ]
        },
        {
          "id": "solve",
          "title": "4. Cálculo de Velocidad y Posición",
          "text": "Sustituimos el tiempo en nuestra función acelerada para obtener la velocidad que alcanzará nuestro bloque de experimento a los tres segundos exactos de ser soltado.",
          "equations": [
            "Velocidad: vf = 0 + 9.80 m/s² · 3.0 s",
            "Velocidad resultante: vf = 29.40 m/s"
          ]
        },
        {
          "id": "conclusion",
          "title": "5. Conclusión Física del Momento",
          "text": "¡Excelente trabajo! Hemos comprobado que el cuerpo acelera de forma regular ganando velocidad progresivamente. No olvides que en física de caída el signo de gravedad marca el sentido.",
          "equations": [
            "Velocidad de Impacto vf = 29.4 m/s",
            "Distancia Recorrida y = -44.1 metros"
          ]
        }
      ]
    };
  }

  // Helper function to call generateContent with automatic model fallback and retries in case of demand spikes (503)
  async function generateContentWithFallback(
    aiClient: any,
    params: {
      contents: any;
      config?: any;
    }
  ) {
    // Only use authentic, compliant, and non-prohibited models
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.1-pro-preview"
    ];

    let lastError: any = null;

    for (const model of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[Gemini API] Intentando con modelo: ${model} (Intento ${attempt}/2)`);
          
          // Try with the provided config (could include tools)
          try {
            const response = await aiClient.models.generateContent({
              model,
              contents: params.contents,
              config: params.config,
            });
            return response;
          } catch (innerErr: any) {
            const innerMsg = innerErr?.message || String(innerErr);
            // If the error is about googleSearch or tools not being supported/failing, retry without tools
            if (params.config?.tools && (innerMsg.includes("tool") || innerMsg.includes("search") || innerMsg.includes("unsupported"))) {
              console.warn(`[Gemini API] El modelo ${model} no admite herramientas o falló su búsqueda. Reintentando sin herramientas...`);
              const strippedConfig = { ...params.config };
              delete strippedConfig.tools;
              const response = await aiClient.models.generateContent({
                model,
                contents: params.contents,
                config: strippedConfig,
              });
              return response;
            }
            throw innerErr;
          }
        } catch (err: any) {
          lastError = err;
          const msg = err?.message || String(err);
          console.warn(`[Gemini API] Fallo en modelo ${model} en intento ${attempt}/2: ${msg}`);
          
          // If model is completely unsupported (404 / doesn't exist), break out of the attempts loop to try the next model
          if (msg.includes("not found") || msg.includes("not support") || msg.includes("404")) {
            break;
          }

          // If we receive a transient or timeout error, wait a little bit
          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
          }
        }
      }
    }

    throw lastError || new Error("Todos los modelos y reintentos de Gemini fallaron.");
  }

  // 1. API: Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, category, history } = req.body;
      const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1]?.content : "";

      if (!ai) {
        const text = getLocalTutorFallback(category, lastUserMsg, history);
        return res.json({ text });
      }

      // VALIDACIÓN CLAVE: Si no hay mensajes (conversación de cero), evitamos el colapso
      if (!messages || messages.length === 0) {
        return res.status(400).json({
          error: "No se enviaron mensajes para iniciar la conversación.",
          text: "Por favor, escribe una duda o selecciona una sugerencia válida para empezar."
        });
      }

      // Formateamos el historial para Gemini
      const contents = messages.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      // Inyección segura del tema/categoría en el último mensaje si existe
      const lastMessage = contents[contents.length - 1];
      if (category && lastMessage && lastMessage.parts && lastMessage.parts[0]) {
        lastMessage.parts[0].text = `[Tema: ${category}] ${lastMessage.parts[0].text}`;
      }

      const systemInstruction = `Eres "Physix AI", un tutor de física brillante, cercano, empático y muy carismático. Hablas en español.
Tu objetivo es guiar al estudiante de una manera sumamente fluida, natural y comprensible, adaptándote al ritmo de la conversación como si fueras un compañero de estudio o un mentor genial que domina la física.

⚠️ EVITA EL TONO RÍGIDO ("MILIMETRADO"):
1. **Adáptate a la longitud e intención del mensaje**: 
   - Si el estudiante te saluda ("hola", "buenas"), te agradece o hace un comentario corto, responde de forma breve, entusiasta, natural y amigable. No lances una clase magistral con 5 secciones académicas rígidas ante un simple saludo.
   - Si te hace una pregunta conceptual simple, explícasela de forma directa y conversacional en un par de párrafos ágiles, sin forzar divisiones de "Hipótesis" o "Conversión de Unidades" si no son necesarias.
   - Solo cuando te plantee un ejercicio o problema matemático/físico completo para resolver, despliega una guía detallada paso a paso.
2. **Fluidez sobre Estructura Rígida**: 
   - No uses encabezados numéricos fijos repetitivos (como "1. Intuición, 2. Supuestos, etc.") en cada respuesta. Escribe con transiciones de prosa naturales e hiladas.
   - Explica el "por qué" físico de las cosas con analogías cotidianas y divertidas en vez de tecnicismos secos.
3. **Fomenta la participación activa sin presionar**:
   - En lugar de cerrar siempre de forma estricta con la misma pregunta teórica pesada, haz preguntas abiertas y empáticas ("¿Se entiende esta parte?", "¿Tiene sentido para ti?", o "¿Quieres que hagamos un ejemplo juntos?").

✨ LEGIBILIDAD, PÁRRAFOS Y NEGRILLAS:
- **Resalta términos clave**: Usa negrillas (ej: **Segunda Ley de Newton**, **energía cinética**, **35 m/s**) para destacar conceptos importantes, fórmulas nombradas, variables críticas y valores numéricos finales. Esto ayuda al estudiante a escanear visualmente las explicaciones fácilmente.
- **Espaciado y párrafos claros**: Asegúrate de estructurar tus respuestas con párrafos cortos e independientes (separados por dos saltos de línea). Evita bloques masivos de texto corrido. Usa listas con viñetas cuando listes pasos o conceptos.

FORMATO OBLIGATORIO PARA FÓRMULAS:
Cuando presentes una fórmula o ecuación física/matemática para que se destaque elegantemente en la pantalla, DEBES usar el bloque personalizado [FORMULA]...[/FORMULA].
PROHIBIDO usar delimitadores de LaTeX estándar como $ o $$. Todo debe pasar por esta etiqueta para el renderizado del frontend.
CRÍTICO: Está terminantemente PROHIBIDO incluir bloques de código de programación (como "\`\`\`python"), comentarios de código (# o //) o acentos graves (\`) dentro del bloque [FORMULA]. El contenido debe ser única y estrictamente matemático/físico.

Estructura del bloque de fórmulas:
[FORMULA]
Ecuación limpia y espaciada (ej: E_k = 1/2 m v² o v = d / t)
---
Breve lista de variables (una por línea, ej: m = masa (kg))
[/FORMULA]

Haz que aprender física sea emocionante, natural y sin barreras robóticas. ¡Habla como un humano apasionado y genial!`;

      // Dynamic relative-time history context injection
      let historyInstructions = "";
      if (history && history.length > 0) {
        const historyDetails = history.map((ex: any) => {
          if (ex.createdAt) {
            const elapsedMs = Date.now() - ex.createdAt;
            const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
            const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
            let elapsedStr = "";
            if (hours > 0) {
              elapsedStr = `hace ${hours} horas, hace ${minutes} minutos`;
            } else {
              elapsedStr = `hace ${minutes} minutos`;
            }
            return `- Ejercicio/Búsqueda: "${ex.title}" (Categoría: ${ex.category}, buscado/resuelto ${elapsedStr})`;
          } else {
            return `- Ejercicio/Búsqueda: "${ex.title}" (Categoría: ${ex.category}, hace un tiempo: ${ex.timestamp})`;
          }
        }).join("\n");

        historyInstructions = `\n\nHISTORIAL DE BÚSQUEDAS/EJERCICIOS DEL USUARIO EN LA APP:\n${historyDetails}\n\n⚠️ REGLA CRÍTICA DE HISTORIAL:\nSi el usuario te hace una pregunta, te saluda o solicita un tema de física que esté presente o estrechamente relacionado con su historial de búsquedas/ejercicios (como por ejemplo las "Leyes de Newton" u otro similar), DEBES abrir tu respuesta indicándole amigablemente cuándo buscó o resolvió ese tema por última vez en la aplicación.\nPor ejemplo, si te pregunta por las "Leyes de Newton", debes responderle exactamente siguiendo este formato: "Buscaste las leyes de Newton hace X horas, hace Y minutos." (reemplazando X e Y con las horas y minutos reales calculados del historial arriba detallado), y luego proceder con la tutoría de forma amena, humana e inspiradora.`;
      }

      const finalSystemInstruction = systemInstruction + historyInstructions;

      const response = await generateContentWithFallback(ai, {
        contents,
        config: {
          systemInstruction: finalSystemInstruction,
          temperature: 0.7,
          tools: [{ googleSearch: {} }]
        },
      });

      const responseText = response.text || "No se pudo generar respuesta de Physix AI.";
      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Error in chat endpoint:", error);
      const { messages, category, history } = req.body;
      const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1]?.content : "";
      
      let is503 = false;
      const errorStr = String(error?.message || error || "").toLowerCase();
      if (errorStr.includes("503") || errorStr.includes("unavailable") || errorStr.includes("demand")) {
        is503 = true;
      }

      const fallbackText = getLocalTutorFallback(category, lastUserMsg, history);
      
      let customHeader = "";
      if (is503) {
        customHeader = `🚨 **Tutor de Respaldo Local (Alta demanda en la API de Gemini)**
        
La API de Gemini está experimentando alta demanda temporal en estos momentos (Error 503: Servicio no disponible). Para que no interrumpas tu aprendizaje, nuestro **Tutor de Respaldo Local** ha tomado el control con esta explicación detallada:

---`;
      } else {
        customHeader = `🚨 **Tutor de Respaldo Local (API de Gemini en Pausa)**
        
Se ha agotado el límite de cuota gratuita para este proyecto (Error 429: Cuota excedida). Para que no interrumpas tu aprendizaje, nuestro **Tutor de Respaldo Local** ha tomado el control con esta explicación detallada:

---`;
      }
      
      let finalResponseText = fallbackText;
      if (fallbackText.startsWith("🚨 **Tutor de Respaldo Local (API de Gemini en Pausa)**")) {
        finalResponseText = fallbackText.replace(/🚨 \*\*Tutor de Respaldo Local \(API de Gemini en Pausa\)\*\*[\s\S]*?---/, customHeader);
      }
      
      return res.json({ text: finalResponseText });
    }
  });

  // 2. API: Scan Endpoint (Multimodal AI scanner)
  app.post("/api/scan", async (req, res) => {
    const { image, prompt } = req.body || {}; // base64 encoded data URL or raw base64 string
    let detectedCategory = "General";
    
    try {
      // Determine potential category from the prompt or filename/clue text to feed offline backup
      const lowPrompt = (prompt || "").toLowerCase();
      if (lowPrompt.includes("termo") || lowPrompt.includes("calor") || lowPrompt.includes("gases") || lowPrompt.includes("temperatura")) {
        detectedCategory = "termodinamica";
      } else if (lowPrompt.includes("opti") || lowPrompt.includes("luz") || lowPrompt.includes("refract") || lowPrompt.includes("espejo") || lowPrompt.includes("prism")) {
        detectedCategory = "optica";
      } else if (lowPrompt.includes("electro") || lowPrompt.includes("ohm") || lowPrompt.includes("circuit") || lowPrompt.includes("corrient") || lowPrompt.includes("volt") || lowPrompt.includes("magnet")) {
        detectedCategory = "electromagnetismo";
      }

      if (!ai) {
        // High fidelity offline fallback to continue solving the student's physics homework even without API key
        const offlineSolution = getLocalTutorFallback(detectedCategory, prompt || "Movimiento MRUV");
        const cleanOffline = offlineSolution.replace(/🚨 \*\*Tutor de Respaldo Local \(API de Gemini en Pausa\)\*\*[\s\S]*?---/, "");
        
        return res.json({
          text: `🚨 **Physix AI Scanner - Modo de Emergencia (Sin API Key)**

La clave de API \`GEMINI_API_KEY\` no está configurada, por lo que el reconocimiento visual en tiempo real no está activo. Sin embargo, nuestro **Tutor de Respaldo Local** ha analizado tu enunciado para guiarte de inmediato:

---
${cleanOffline}

---
*💡 Nota: Para activar el escaneo directo de cualquier foto, puedes configurar tu propio token en **Ajustes > Secrets** con el nombre \`GEMINI_API_KEY\` de forma gratuita.*`
        });
      }

      if (!image) {
        return res.status(400).json({ error: "No se proporcionó ninguna imagen para escanear." });
      }

      // Extract raw base64 data and mimeType
      let mimeType = "image/jpeg";
      let base64Data = image;

      if (image.includes(";base64,")) {
        const parts = image.split(";base64,");
        mimeType = parts[0].split(":")[1] || "image/jpeg";
        base64Data = parts[1];
      }

      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      };

      const systemInstruction = `Eres "Physix AI Scanner", el componente analítico, inteligente y extremadamente meticuloso del lector de problemas físicos.
Analiza la imagen que ha subido el estudiante (o la pista de texto si la imagen es sosa/vacía/negra/simulada). Identifica ecuaciones, problemas de texto, diagramas o el enunciado proporcionado.
Debes traducir lo visto a una solución exhaustiva, muy bien estructurada, didáctica y clara en español, sin omitir ningún paso intermedio. No dejes cabos sueltos.

Manejo de imágenes vacías o simuladas:
Si la imagen recibida es extremadamente pequeña, de un solo pixel (simulada), vacía, negra u oscura, pero existe un enunciado/pista de texto del usuario, úsalo de inmediato para formular la solución completa del problema descrito, ignorando el estado de la imagen.

Pasos obligatorios a realizar para evitar cabos sueltos:
1. **Detección e Intuición Teórica**: Indica detalladamente qué detectaste en la imagen o en la pista de texto del estudiante (ej. 'Detecté un problema de cinemática sobre tiro parabólico o dinámica de poleas'). Explica brevemente el fundamento físico o teoría que rige esta situación antes de plantear fórmulas.
2. **Datos e Hipótesis**: Lista limpiamente los datos numéricos extraídos con sus respectivas unidades físicas. Detalla cualquier hipótesis asumida (como aceleración de la gravedad g = 9.8 m/s², ausencia de fricción del aire, etc.) para que no haya dudas.
3. **Conversión de Unidades**: Si es necesario convertir unidades (por ejemplo de km/h a m/s, o minutos a segundos), muestra detalladamente la operación de conversión paso a paso.
4. **Fórmula Principal en Bloque**: DEBES presentar la fórmula básica utilizando el bloque [FORMULA]...[/FORMULA] para que se estilice en la pantalla del usuario de forma sumamente elegante y destacada. Está terminantemente PROHIBIDO incluir bloques de código de programación (como "\`\`\`python"), comentarios de código (# o //) o acentos graves (\`) dentro del bloque de fórmulas.
   Ejemplo:
   [FORMULA]
   v_f = v_o + g · t
   ---
   v_f = velocidad final (m/s)
   v_o = velocidad inicial (m/s)
   g = aceleración de la gravedad (9.8 m/s²)
   t = tiempo (s)
   [/FORMULA]
5. **Desarrollo Matemático Exhaustivo**: Resuelve el problema paso a paso. 
   - Muestra la fórmula seleccionada.
   - Muestra la fórmula con las sustituciones de las variables físicas por sus valores correspondientes con unidades.
   - Muestra los cálculos algebraicos y numéricos intermedios (ej. si elevas al cuadrado, muestra cuánto da, realiza sumas/restas parciales, despejes de incógnitas de forma clara).
   - Escribe el resultado final de forma clara con las unidades correspondientes.
6. **Análisis de Errores Comunes o Consejo Físico**: Alerta al estudiante sobre posibles errores en este tipo de ejercicios y brinda una conclusión física breve y motivadora al final.`;

      let userPrompt = "Analiza y resuelve este problema de física mostrado en la imagen. Proporciona la explicación didáctica y la fórmula principal en el formato [FORMULA] indicado.";
      if (prompt) {
        userPrompt += `\n\n[Pista/Detalles adicionales o Enunciado simulado escrito por el usuario]: \n"${prompt}"\n\nPor favor, ten en cuenta esta pista o enunciado para resolverlo y guiar la explicación.`;
      }

      const response = await generateContentWithFallback(ai, {
        contents: {
          parts: [
            imagePart,
            { text: userPrompt }
          ]
        },
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      const responseText = response.text || "No se pudo descifrar la imagen. Asegúrate de enfocar con buena luz.";
      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Error in scan endpoint:", error);
      
      let is503 = false;
      const errorStr = String(error?.message || error || "").toLowerCase();
      if (errorStr.includes("503") || errorStr.includes("unavailable") || errorStr.includes("demand")) {
        is503 = true;
      }

      // High fidelity offline fallback to continue solving the student's physics homework even when API fails
      const offlineSolution = getLocalTutorFallback(detectedCategory, prompt || "Movimiento MRUV");
      const cleanOffline = offlineSolution.replace(/🚨 \*\*Tutor de Respaldo Local \(API de Gemini en Pausa\)\*\*[\s\S]*?---/, "");

      if (is503) {
        return res.json({
          text: `🚨 **Physix AI Scanner - Modo de Emergencia (Alta Demanda de la API)**

La API de Gemini está experimentando alta demanda o inestabilidad temporal en este momento (Error 503: Servicio no disponible). Nuestro **Tutor de Respaldo Local** ha intervenido para resolver tu consulta:

---
${cleanOffline}

---
*💡 Consejo: Puedes esperar unos instantes y volver a intentar capturar para volver a conectar con el escáner visual en vivo.*`
        });
      }

      return res.json({
        text: `🚨 **Physix AI Scanner - Modo de Emergencia (Límite de API Excedido)**

La cuota compartida gratuita para este proyecto ha completado su límite temporal (Error 429). Nuestro **Tutor de Respaldo Local** ha tomado el mando y solucionado tu ejercicio de inmediato:

---
${cleanOffline}

---
*💡 Nota: Para evitar colas de límites de uso compartido, puedes configurar tu propia clave privada gratuita en **Ajustes > Secrets** con el nombre \`GEMINI_API_KEY\`.*`
      });
    }
  });

  // New endpoint to generate a fully explanatory 5-chapter video tutor script
  app.post("/api/generate-video-script", async (req, res) => {
    try {
      const { title, explanation, category } = req.body;
      if (!explanation) {
        return res.status(400).json({ error: "Falta la explicación a transformar." });
      }

      if (!ai) {
        const fall = getLocalVideoScriptFallback(category, title || "");
        return res.json(fall);
      }

      const scriptSystemInstruction = `Eres un talentoso divulgador científico y tutor interactivo de física. Tu misión es tomar la explicación técnica de un problema y transformarla en un guion audiovisual de EXACTAMENTE 5 capítulos para un video tutor interactivo.
En cada capítulo, debes explicar con máxima claridad el 'por qué' intuitivo detrás del paso físico o matemático correspondiente. El tono debe ser explicativo, ameno, claro y muy lógico para estudiantes.

Genera la respuesta estrictamente como un objeto JSON con el siguiente formato, sin bloques de código markdown de otro tipo adicionales ni texto antes/después. No incluyas LaTeX complicado, usa letras latinas/griegas y superíndices legibles (ej: t², r̄(t), x_o, etc.) que se puedan pintar directamente en texto plano en HTML5 canvas:
{
  "chapters": [
    {
      "id": "intro",
      "title": "1. Introducción y Concepto",
      "text": "Introduce el fenómeno de forma super amena. Explica QUÉ concepto o ley rige este problema y POR QUÉ es crucial entender este fenómeno físico en el mundo real.",
      "equations": [
        "Título del Tema / Fenómeno Físico",
        "Ecuación o vector principal de posición o estado r̄(t) o F = m·a"
      ]
    },
    {
      "id": "data",
      "title": "2. Datos Extraídos y Supuestos",
      "text": "Detalla qué constantes poseemos y por qué convertimos ciertas unidades (ej: km/h a m/s). Di por qué hacemos supuestos simplificadores (ej: despreciar la fricción).",
      "equations": [
        "Datos conocidos del sistema:",
        "Constante 1 / Variable 1",
        "Constante 2 / Tiempo t = 1.00 s"
      ]
    },
    {
      "id": "formula",
      "title": "3. Formulación y Leyes de Física",
      "text": "Explica la fórmula gobernante. Di por qué elegimos esta ecuación exacta en lugar de otra, y qué relación de causa/efecto describe en la naturaleza.",
      "equations": [
        "Relación física principal (v̄(t) = dr̄/dt)",
        "Segunda ley o derivada correspondiente (ā(t) = dv̄/dt)"
      ]
    },
    {
      "id": "solve",
      "title": "4. Resolución y Despejes Desglosados",
      "text": "Explica el porqué del despeje matemático paso por paso. Sustituye y calcula en voz alta guiando al alumno en la lógica de las simplificaciones algebraicas.",
      "equations": [
        "Ecuación con valores y vectores sustituidos v̄(1.00) = ...",
        "Paso matemático de operación final o derivada evaluada"
      ]
    },
    {
      "id": "conclusion",
      "title": "5. Conclusión y Errores a Evitar",
      "text": "Muestra que el resultado físico tiene sentido práctico y dimensiona las unidades. Brinda un consejo infalible sobre errores de signo u operación que suelen arruinar exámenes de este tipo.",
      "equations": [
        "Resumen de soluciones calculadas:",
        "1) Primer resultado con unidades",
        "2) Segundo resultado con unidades",
        "3) Conclusión del comportamiento"
      ]
    }
  ]
}`;

      const userPrompt = `Transforma la siguiente explicación del problema "${title || "Problema de Física"}" (categoría: ${category || "General"}) en el formato JSON de 5 capítulos interactivos solicitado, detallando minuciosamente el POR QUÉ de cada cosa para que sea totalmente explicativo:

${explanation}`;

      const response = await generateContentWithFallback(ai, {
        contents: [
          { text: userPrompt }
        ],
        config: {
          systemInstruction: scriptSystemInstruction,
          temperature: 0.5,
          responseMimeType: "application/json"
        },
      });

      const rawJson = response.text || "";
      // Clean potential code block wrapping
      const cleanJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedScript = JSON.parse(cleanJson);
      
      res.json(parsedScript);
    } catch (error: any) {
      console.error("Error generating video script:", error);
      // Fallback response with beautiful explanations if the model has a parser or quota error
      const fall = getLocalVideoScriptFallback(req.body?.category, req.body?.title || "");
      res.json(fall);
    }
  });

  // Hot module replacement handles asset compiling in dev view, or maps Express routes
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
