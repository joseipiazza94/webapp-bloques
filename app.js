// =========================================================================
// REGISTRO DE HARDWARE DINÁMICO
// =========================================================================
let componentesConectados = [
  { tipo: "led", pin: "13", etiqueta: "LED Simple (Pin 13)" },
  { tipo: "servo", pin: "9", etiqueta: "Servo (Pin 9)" },
  { tipo: "dht", pin: "2", etiqueta: "DHT11 (Pin 2)" },
  { tipo: "pot", pin: "A0", etiqueta: "Potenciómetro (Pin A0)" },
  { tipo: "ldr", pin: "A1", etiqueta: "LDR Luz (Pin A1)" },
  { tipo: "ultra", pin: "7, 8", etiqueta: "Ultrasónico (Trig 7, Echo 8)" },
];

function renderizarChipsHardware() {
  const cont = document.getElementById("hw-chips-list");
  cont.innerHTML = "";
  componentesConectados.forEach((c, idx) => {
    const chip = document.createElement("div");
    chip.className = "hw-chip";
    chip.innerHTML = `
      <span>● ${c.etiqueta}</span>
      <span class="btn-del-chip" onclick="quitarComponenteHardware(${idx})">✕</span>
    `;
    cont.appendChild(chip);
  });
  actualizarTodosLosSelectsDinamicos();
}

function agregarComponenteHardware() {
  const tipo = document.getElementById("sel-tipo-comp").value;
  const pin = document
    .getElementById("inp-pin-comp")
    .value.trim()
    .toUpperCase();
  if (!pin) return alert("Escribe un número de pin válido (ej: 13, A0)");

  const nombres = {
    led: "LED Simple",
    servo: "Servomotor",
    boton: "Pulsador",
    switch: "Switch 2 Estados",
    selector3: "Selector 3 Vías",
    dht: "DHT11",
    pot: "Potenciómetro",
    ldr: "Sensor LDR",
    ultra: "Sensor Ultrasónico",
  };

  componentesConectados.push({
    tipo: tipo,
    pin: pin,
    etiqueta: `${nombres[tipo]} (Pin ${pin})`,
  });

  renderizarChipsHardware();
}

function quitarComponenteHardware(idx) {
  componentesConectados.splice(idx, 1);
  renderizarChipsHardware();
}

// Devuelve los pines registrados para un tipo dado
// Devuelve los pines registrados para un tipo dado, con filtro estricto para PWM
function obtenerOpcionesHardware(tipo) {
  // Pines PWM válidos en Arduino Uno / Nano
  const pinesPWM = ["3", "5", "6", "9", "10", "11"];

  if (tipo === "led-pwm") {
    const ledsValidos = componentesConectados.filter(
      (c) => c.tipo === "led" && pinesPWM.includes(c.pin.replace(/\D/g, "")),
    );
    if (ledsValidos.length === 0)
      return ["¡Conecta LED en pin ~ 3, 5, 6, 9, 10 u 11!"];
    return ledsValidos.map((c) => `Pin ${c.pin} (PWM ~)`);
  }

  const filtrados = componentesConectados.filter((c) => c.tipo === tipo);
  if (filtrados.length === 0) return ["Sin asignar"];
  return filtrados.map((c) => `Pin ${c.pin}`);
}

// Si los chicos agregan un LED nuevo, se actualizan los desplegables ya puestos en el tablero
function actualizarTodosLosSelectsDinamicos() {
  document.querySelectorAll(".select-dinamico").forEach((sel) => {
    const fuente = sel.getAttribute("data-fuente");
    const valorPrevio = sel.value;
    const nuevasOpciones = obtenerOpcionesHardware(fuente);

    sel.innerHTML = nuevasOpciones
      .map((o) => `<option value="${o}">${o}</option>`)
      .join("");
    if (nuevasOpciones.includes(valorPrevio)) {
      sel.value = valorPrevio;
    }
  });
}

// =========================================================================
// MOTOR DE LA PALETA Y TABLEROS
// =========================================================================

function construirHerramientas(lado, idContenedor, idTablero) {
  const contenedor = document.getElementById(idContenedor);
  contenedor.innerHTML = "";

  SISTEMA[lado].forEach((cat) => {
    const divCat = document.createElement("div");
    divCat.className = "cat-section";

    const titulo = document.createElement("div");
    titulo.className = "cat-title";
    titulo.innerHTML = `<span>●</span> ${cat.categoria}`;
    divCat.appendChild(titulo);

    const contenedorBloques = document.createElement("div");
    contenedorBloques.className = "cat-blocks";

    cat.bloques.forEach((b) => {
      const btnBloque = document.createElement("div");
      btnBloque.className = "block";
      btnBloque.style.backgroundColor = cat.color;
      btnBloque.innerText = "+ " + b.texto;
      btnBloque.onclick = () => agregarAlTablero(b, cat.color, idTablero);
      contenedorBloques.appendChild(btnBloque);
    });

    divCat.appendChild(contenedorBloques);
    contenedor.appendChild(divCat);
  });
}

function renderizarCampo(c) {
  if (c.tipo === "select") {
    return `<select class="val-input">${c.opts.map((o) => `<option value="${o}">${o}</option>`).join("")}</select>`;
  } else if (c.tipo === "dinamico") {
    const opts = obtenerOpcionesHardware(c.fuente);
    return `<select class="val-input select-dinamico" data-fuente="${c.fuente}">${opts.map((o) => `<option value="${o}">${o}</option>`).join("")}</select>`;
  } else if (c.tipo === "color") {
    return `<input class="val-input" type="color" value="${c.val}" style="width: 45px; height: 26px; padding: 1px; border: none; cursor: pointer; border-radius: 4px;">`;
  } else if (c.tipo === "input") {
    return `<input class="val-input" type="text" value="${c.val}" style="width: 90px;">`;
  }
  return "";
}

function agregarAlTablero(b, color, idTablero) {
  const tablero = document.getElementById(idTablero);
  const el = document.createElement("div");
  el.className = "block block-in-board";
  el.style.backgroundColor = color;
  el.draggable = true;

  let html = `<div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">`;
  html += `<span class="step-number">#</span>`;
  html += `<span>${b.texto}</span>`;

  if (b.campos) b.campos.forEach((c) => (html += renderizarCampo(c)));
  if (b.sufijo) html += `<span>${b.sufijo}</span>`;
  if (b.campos2) b.campos2.forEach((c) => (html += renderizarCampo(c)));
  if (b.sufijo2) html += `<span>${b.sufijo2}</span>`;
  if (b.campos3) b.campos3.forEach((c) => (html += renderizarCampo(c)));
  if (b.sufijo3) html += `<span>${b.sufijo3}</span>`;

  html += `</div>`;

  html += `
    <div class="controls-group">
      <button class="btn-move" onclick="moverBloque(this, -1)" title="Subir">▲</button>
      <button class="btn-move" onclick="moverBloque(this, 1)" title="Bajar">▼</button>
      <button class="btn-del" onclick="borrarBloque(this)" title="Quitar">✕</button>
    </div>
  `;

  el.innerHTML = html;
  tablero.appendChild(el);

  configurarArrastre(el, tablero);
  actualizarNumeros(tablero);
}

function moverBloque(boton, direccion) {
  const bloque = boton.closest(".block-in-board");
  const tablero = bloque.parentElement;
  if (direccion === -1 && bloque.previousElementSibling) {
    tablero.insertBefore(bloque, bloque.previousElementSibling);
  } else if (direccion === 1 && bloque.nextElementSibling) {
    tablero.insertBefore(bloque.nextElementSibling, bloque);
  }
  actualizarNumeros(tablero);
}

function borrarBloque(boton) {
  const bloque = boton.closest(".block-in-board");
  const tablero = bloque.parentElement;
  bloque.remove();
  actualizarNumeros(tablero);
}

function limpiar(id) {
  document.getElementById(id).innerHTML = "";
}

function actualizarNumeros(tablero) {
  const bloques = tablero.querySelectorAll(".block-in-board");
  let dentroDeBucle = false;

  bloques.forEach((b, index) => {
    const pill = b.querySelector(".step-number");
    if (pill) pill.innerText = `#${index + 1}`;

    const texto = b.innerText;

    if (texto.includes("Bucle (Repetir")) {
      b.classList.add("loop-header");
      b.classList.remove("inside-loop", "loop-footer");
      dentroDeBucle = true;
    } else if (texto.includes("Fin del bucle")) {
      b.classList.add("loop-footer");
      b.classList.remove("inside-loop");
      dentroDeBucle = false;
    } else if (dentroDeBucle) {
      b.classList.add("inside-loop");
      b.classList.remove("loop-header", "loop-footer");
    } else {
      b.classList.remove("inside-loop", "loop-header", "loop-footer");
    }
  });
}

// Drag & Drop
let elementoArrastrado = null;
function configurarArrastre(el, tablero) {
  el.addEventListener("dragstart", (e) => {
    elementoArrastrado = el;
    el.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });
  el.addEventListener("dragend", () => {
    el.classList.remove("dragging");
    tablero
      .querySelectorAll(".block-in-board")
      .forEach((b) => b.classList.remove("drag-over"));
    elementoArrastrado = null;
    actualizarNumeros(tablero);
  });
  el.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (elementoArrastrado && elementoArrastrado !== el)
      el.classList.add("drag-over");
  });
  el.addEventListener("dragleave", () => el.classList.remove("drag-over"));
  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("drag-over");
    if (elementoArrastrado && elementoArrastrado !== el) {
      const rect = el.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        tablero.insertBefore(elementoArrastrado, el);
      } else {
        tablero.insertBefore(elementoArrastrado, el.nextSibling);
      }
      actualizarNumeros(tablero);
    }
  });
}

// =========================================================================
// EXPORTADOR BLINDADO CON MAPA DE HARDWARE
// =========================================================================
function exportarLogica() {
  let prompt =
    "ERES UN COMPILADOR ESTRICTO DE ROBÓTICA EDUCATIVA PARA ARDUINO Y NOTEBOOK (PYGAME).\n";
  prompt +=
    "Tu tarea es traducir la siguiente secuencia a código funcional, limpio y 100% libre de errores.\n\n";

  prompt += "=== MAPA DE COMPONENTES DECLARADOS POR LOS ALUMNOS ===\n";
  componentesConectados.forEach((c) => {
    prompt += `• ${c.etiqueta}\n`;
  });
  prompt +=
    "• HuskyLens 2 y Panel LCD 16x2 van fijos al bus I2C (Pines A4 SDA y A5 SCL). Dirección LCD: 0x27.\n\n";

  prompt += "REGLAS TÉCNICAS OBLIGATORIAS:\n";
  prompt +=
    "1. Declara cada componente usando constantes (#define o const int) respetando los pines exactos declarados arriba.\n";
  prompt +=
    "2. En Arduino: usa <Wire.h>, 'HUSKYLENS.h', <LiquidCrystal_I2C.h>, 'DHT.h' según corresponda.\n";
  prompt +=
    "3. En Python: usa Pygame a pantalla completa fondo negro (0,0,0) para efecto holograma OLED, salir con tecla ESC, y PySerial a 9600 baudios con timeout corto.\n\n";

  prompt += "=== RESUMEN DEL ALGORITMO ===\n\n";

  function procesarTablero(idTablero, titulo) {
    let salida = `[${titulo}]\n`;
    const bloques = document.querySelectorAll(`#${idTablero} .block-in-board`);

    if (bloques.length === 0) {
      salida += "• Sin bloques definidos.\n";
      return salida;
    }

    let indentado = false;
    bloques.forEach((b, idx) => {
      const clon = b.cloneNode(true);
      const controles = clon.querySelector(".controls-group");
      if (controles) controles.remove();
      const stepPill = clon.querySelector(".step-number");
      if (stepPill) stepPill.remove();

      const elementosOriginales = b.querySelectorAll(".val-input");
      const valores = Array.from(elementosOriginales).map(
        (el) => `[${el.value}]`,
      );

      clon.querySelectorAll(".val-input").forEach((el) => el.remove());
      let textoBase = clon.innerText.replace(/\s+/g, " ").trim();

      if (textoBase.includes("Fin del bucle")) {
        indentado = false;
        salida += `Paso ${idx + 1}: ${textoBase}\n`;
      } else if (indentado) {
        salida += `   └── Paso ${idx + 1}: ${textoBase} ${valores.join(" ")}\n`;
      } else {
        salida += `Paso ${idx + 1}: ${textoBase} ${valores.join(" ")}\n`;
      }

      if (textoBase.includes("Bucle (Repetir")) {
        indentado = true;
      }
    });

    return salida + "\n";
  }

  prompt += procesarTablero("board-arduino", "PROGRAMA ARDUINO");
  prompt += procesarTablero("board-pc", "PROGRAMA NOTEBOOK / PC");

  navigator.clipboard
    .writeText(prompt)
    .then(() => {
      alert(
        "¡Prompt, mapa de hardware y lógica copiados con éxito! Pega esto en el chat.",
      );
    })
    .catch(() => {
      prompt("Copia este texto manualmente:", prompt);
    });
}

window.onload = () => {
  renderizarChipsHardware();
  construirHerramientas("arduino", "toolbox-arduino", "board-arduino");
  construirHerramientas("pc", "toolbox-pc", "board-pc");
};
