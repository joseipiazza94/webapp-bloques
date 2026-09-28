const SISTEMA = {
  arduino: [
    {
      categoria: "Comandos de Control",
      color: "#FFAB19",
      bloques: [
        { texto: "Bucle (Repetir por siempre):" },
        { texto: "Salir del bucle" },
        { texto: "Fin del bucle" },
        {
          texto: "Esperar",
          campos: [{ tipo: "input", val: "1" }],
          sufijo: "segundos",
        },
      ],
    },
    {
      categoria: "Comunicación USB (Hacia PC)",
      color: "#E91E63",
      bloques: [
        {
          texto: "Enviar a la PC mensaje USB:",
          campos: [{ tipo: "input", val: "1" }],
        },
        {
          texto: "Enviar a la PC valor de:",
          campos: [
            {
              tipo: "select",
              opts: [
                "Temperatura DHT11",
                "Humedad DHT11",
                "Distancia Ultrasónica",
                "Nivel Luz LDR",
                "Giro Potenciómetro",
                "ID HuskyLens",
              ],
            },
          ],
        },
      ],
    },
    {
      categoria: "HuskyLens 2 (Visión IA)",
      color: "#00A896",
      bloques: [
        {
          texto: "Si HuskyLens reconoce ID:",
          campos: [
            { tipo: "select", opts: ["1", "2", "3", "4", "5", "6", "7", "8"] },
          ],
        },
        { texto: "Si HuskyLens no detecta nada" },
      ],
    },
    {
      categoria: "LEDs Simples",
      color: "#4CAF50",
      bloques: [
        {
          texto: "Encender LED en",
          campos: [{ tipo: "dinamico", fuente: "led" }],
        },
        {
          texto: "Apagar LED en",
          campos: [{ tipo: "dinamico", fuente: "led" }],
        },
        {
          texto: "Ajustar brillo de LED (PWM ~) en",
          campos: [{ tipo: "dinamico", fuente: "led-pwm" }],
          sufijo: "al",
          campos2: [{ tipo: "input", val: "50" }],
          sufijo2: "%",
        },
        {
          texto: "Regular brillo de LED (PWM ~) en",
          campos: [{ tipo: "dinamico", fuente: "led-pwm" }],
          sufijo: "con giro de Potenciómetro en",
          campos2: [{ tipo: "dinamico", fuente: "pot" }],
        },
        {
          texto: "Parpadear LED en",
          campos: [{ tipo: "dinamico", fuente: "led" }],
          sufijo: "veces:",
          campos2: [{ tipo: "input", val: "3" }],
        },
      ],
    },
    {
      categoria: "Sonido y Alertas",
      color: "#d35400",
      bloques: [
        {
          texto: "Tocar nota en",
          campos: [
            { tipo: "dinamico", fuente: "buzzer" },
            {
              tipo: "select",
              opts: [
                "DO4 (262 Hz)",
                "RE4 (294 Hz)",
                "MI4 (330 Hz)",
                "FA4 (349 Hz)",
                "SOL4 (392 Hz)",
                "LA4 (440 Hz)",
                "SI4 (494 Hz)",
                "DO5 (523 Hz)",
              ],
            },
          ],
        },
        {
          texto: "Silenciar",
          campos: [{ tipo: "dinamico", fuente: "buzzer" }],
        },
      ],
    },
    {
      categoria: "LEDs RGB",
      color: "#2E7D32",
      bloques: [
        {
          texto: "Poner LED RGB en color",
          campos: [
            {
              tipo: "select",
              opts: ["Rojo", "Verde", "Azul", "Amarillo", "Blanco", "Apagado"],
            },
          ],
        },
        {
          texto: "Poner LED RGB en color personalizado:",
          campos: [{ tipo: "color", val: "#ff007f" }],
        },
      ],
    },
    {
      categoria: "Servomotores",
      color: "#FF5722",
      bloques: [
        {
          texto: "Mover Servo en",
          campos: [{ tipo: "dinamico", fuente: "servo" }],
          sufijo: "a ángulo:",
          campos2: [{ tipo: "input", val: "90" }],
          sufijo2: "grados",
        },
        {
          texto: "Copiar giro: Mover Servo en",
          campos: [{ tipo: "dinamico", fuente: "servo" }],
          sufijo: "siguiendo al Potenciómetro en",
          campos2: [{ tipo: "dinamico", fuente: "pot" }],
        },
      ],
    },
    {
      categoria: "Panel LCD 16x2 (I2C)",
      color: "#3F51B5",
      bloques: [
        {
          texto: "Escribir en LCD",
          campos: [{ tipo: "select", opts: ["Fila 1", "Fila 2"] }],
          sufijo: "texto:",
          campos2: [{ tipo: "input", val: "HOLA MUNDO" }],
        },
        {
          texto: "Si HuskyLens ve ID:",
          campos: [{ tipo: "select", opts: ["1", "2", "3", "4", "5", "6"] }],
          sufijo: "mostrar en LCD",
          campos2: [{ tipo: "select", opts: ["Fila 1", "Fila 2"] }],
          sufijo2: "el nombre:",
          campos3: [{ tipo: "input", val: "ARGENTINA" }],
        },
        {
          texto: "Mostrar en LCD",
          campos: [{ tipo: "select", opts: ["Fila 1", "Fila 2"] }],
          sufijo: "etiqueta:",
          campos2: [{ tipo: "input", val: "Temp: " }],
          sufijo2: "+ sensor:",
          campos3: [
            {
              tipo: "select",
              opts: [
                "Temperatura DHT11",
                "Humedad DHT11",
                "Distancia",
                "Luz LDR",
                "Potenciómetro",
              ],
            },
          ],
        },
        { texto: "Limpiar pantalla LCD" },
      ],
    },
    {
      categoria: "Sensor Ultrasónico",
      color: "#0288D1",
      bloques: [
        {
          texto: "Si distancia en Ultrasónico",
          campos: [{ tipo: "dinamico", fuente: "ultra" }],
          sufijo: "es",
          campos2: [{ tipo: "select", opts: ["menor que", "mayor que"] }],
          sufijo2: "",
          campos3: [{ tipo: "input", val: "20" }],
          sufijo3: "cm",
        },
        {
          texto: "Esperar hasta que Ultrasónico",
          campos: [{ tipo: "dinamico", fuente: "ultra" }],
          sufijo: "detecte menos de",
          campos2: [{ tipo: "input", val: "15" }],
          sufijo2: "cm",
        },
      ],
    },
    {
      categoria: "Potenciómetro (Perilla)",
      color: "#795548",
      bloques: [
        {
          texto: "Si Potenciómetro en",
          campos: [{ tipo: "dinamico", fuente: "pot" }],
          sufijo: "es",
          campos2: [{ tipo: "select", opts: ["mayor que", "menor que"] }],
          sufijo2: "el",
          campos3: [{ tipo: "input", val: "50" }],
          sufijo3: "%",
        },
      ],
    },
    {
      categoria: "Sensor Temp / Humedad (DHT11)",
      color: "#E65100",
      bloques: [
        {
          texto: "Si Temperatura en",
          campos: [{ tipo: "dinamico", fuente: "dht" }],
          sufijo: "es",
          campos2: [{ tipo: "select", opts: ["mayor que", "menor que"] }],
          sufijo3: "°C",
          campos3: [{ tipo: "input", val: "25" }],
        },
      ],
    },
    {
      categoria: "Sensor de Luz (LDR)",
      color: "#FBC02D",
      bloques: [
        {
          texto: "Si Nivel de Luz en",
          campos: [{ tipo: "dinamico", fuente: "ldr" }],
          sufijo: "es",
          campos2: [{ tipo: "select", opts: ["mayor que", "menor que"] }],
          sufijo2: "el",
          campos3: [{ tipo: "input", val: "50" }],
          sufijo3: "%",
        },
      ],
    },
    {
      categoria: "Pulsadores (Botones)",
      color: "#607D8B",
      bloques: [
        {
          texto: "Si Pulsador en",
          campos: [{ tipo: "dinamico", fuente: "boton" }],
          sufijo: "está",
          campos2: [
            {
              tipo: "select",
              opts: ["Presionado (apretado)", "Suelto (sin presionar)"],
            },
          ],
        },
        {
          texto: "Esperar hasta que Pulsador en",
          campos: [{ tipo: "dinamico", fuente: "boton" }],
          sufijo: "sea presionado",
        },
      ],
    },
    {
      categoria: "Switches y Selectores",
      color: "#455A64",
      bloques: [
        {
          texto: "Si Switch 2 Estados en",
          campos: [{ tipo: "dinamico", fuente: "switch" }],
          sufijo: "está en posición:",
          campos2: [
            { tipo: "select", opts: ["ACTIVADO (ON)", "DESACTIVADO (OFF)"] },
          ],
        },
        {
          texto: "Si Selector 3 Vías en",
          campos: [{ tipo: "dinamico", fuente: "selector3" }],
          sufijo: "está en:",
          campos2: [
            {
              tipo: "select",
              opts: [
                "Posición 1 (A)",
                "Posición Central (OFF)",
                "Posición 2 (B)",
              ],
            },
          ],
        },
      ],
    },
  ],

  // ==========================================
  // BLOQUES DE PC / PYTHON MULTIMEDIA
  // ==========================================
  pc: [
    {
      categoria: "Eventos de Escucha USB",
      color: "#FFAB19",
      bloques: [
        {
          texto: "Al recibir mensaje USB:",
          campos: [{ tipo: "input", val: "1" }],
        },
      ],
    },
    {
      categoria: "Imagen / Holograma",
      color: "#9C27B0",
      bloques: [
        {
          texto: "Abrir imagen:",
          campos: [{ tipo: "input", val: "vasija.png" }],
        },
        { texto: "Cerrar imagen" },
      ],
    },
    {
      categoria: "Audio y Sonido",
      color: "#E91E63",
      bloques: [
        {
          texto: "Reproducir sonido:",
          campos: [{ tipo: "input", val: "relato_museo.mp3" }],
        },
        { texto: "Detener sonido" },
      ],
    },
    {
      categoria: "Video",
      color: "#673AB7",
      bloques: [
        {
          texto: "Reproducir video a pantalla completa:",
          campos: [{ tipo: "input", val: "intro.mp4" }],
        },
        { texto: "Detener video" },
      ],
    },
    {
      categoria: "Voz Sintetizada",
      color: "#00BCD4",
      bloques: [
        {
          texto: "Hablar:",
          campos: [{ tipo: "input", val: "Pieza arqueológica detectada" }],
        },
      ],
    },
  ],
};
