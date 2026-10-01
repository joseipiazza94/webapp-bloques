// =========================================================================
// POLYFILL COMPATIBILIDAD CANVAS (roundRect)
// =========================================================================
if (
  typeof CanvasRenderingContext2D !== "undefined" &&
  !CanvasRenderingContext2D.prototype.roundRect
) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (typeof r === "undefined") r = 5;
    if (typeof r === "number") {
      r = { tl: r, tr: r, br: r, bl: r };
    } else {
      const defaultRadius = { tl: 0, tr: 0, br: 0, bl: r };
      for (const side in defaultRadius) {
        r[side] = r[side] || defaultRadius[side];
      }
    }
    this.beginPath();
    this.moveTo(x + r.tl, y);
    this.lineTo(x + w - r.tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    this.lineTo(x + w, y + h - r.br);
    this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
    this.lineTo(x + r.bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
    this.lineTo(x, y + r.tl);
    this.quadraticCurveTo(x, y, x + r.tl, y);
    this.closePath();
    return this;
  };
}

// =========================================================================
// REGISTRO DE HARDWARE DINÁMICO (VACÍO AL INICIAR)
// =========================================================================
let componentesConectados = [];

function renderizarChipsHardware() {
  const cont = document.getElementById("hw-chips-list");
  if (!cont) return;
  cont.innerHTML = "";

  if (componentesConectados.length === 0) {
    cont.innerHTML = `<span style="color: #7b838f; font-size: 13px; font-style: italic;">Sin componentes conectados. Conecta los que uses arriba.</span>`;
  } else {
    componentesConectados.forEach((c, idx) => {
      const chip = document.createElement("div");
      chip.className = "hw-chip";
      chip.innerHTML = `
        <span>● ${c.etiqueta}</span>
        <span class="btn-del-chip" onclick="quitarComponenteHardware(${idx})">✕</span>
      `;
      cont.appendChild(chip);
    });
  }

  actualizarTodosLosSelectsDinamicos();

  const panel = document.getElementById("seccion-circuito");
  if (panel && window.getComputedStyle(panel).display !== "none") {
    dibujarDiagramaCircuito();
  }
}

function verificarCambioTipoComponente() {
  const selTipo = document.getElementById("sel-tipo-comp");
  if (!selTipo) return;
  const tipo = selTipo.value;
  const inputPin = document.getElementById("inp-pin-comp");
  let selModoHusky = document.getElementById("sel-modo-husky-hw");

  if (tipo === "huskylens") {
    if (inputPin) inputPin.style.display = "none";
    if (!selModoHusky) {
      selModoHusky = document.createElement("select");
      selModoHusky.id = "sel-modo-husky-hw";
      selModoHusky.className = "val-input";
      selModoHusky.innerHTML = `
        <option value="i2c">I2C (A4 SDA, A5 SCL)</option>
        <option value="serial">Serial 9600 (SoftwareSerial 10 RX, 11 TX)</option>
      `;
      if (inputPin && inputPin.parentNode) {
        inputPin.parentNode.insertBefore(selModoHusky, inputPin.nextSibling);
      }
    } else {
      selModoHusky.style.display = "";
    }
  } else if (tipo === "lcd") {
    if (inputPin) {
      inputPin.style.display = "none";
      inputPin.value = "A4, A5";
    }
    if (selModoHusky) selModoHusky.style.display = "none";
  } else {
    if (inputPin) {
      inputPin.style.display = "";
      if (inputPin.value === "A4, A5") inputPin.value = "";
    }
    if (selModoHusky) selModoHusky.style.display = "none";
  }
}

function agregarComponenteHardware() {
  const selTipo = document.getElementById("sel-tipo-comp");
  if (!selTipo) return;
  const tipo = selTipo.value;

  if (tipo === "huskylens") {
    const yaExiste = componentesConectados.some((c) => c.tipo === "huskylens");
    if (yaExiste) {
      return alert(
        "Ya hay una HuskyLens 2 registrada. Quita la existente si deseas cambiar su conexión.",
      );
    }

    const selModo = document.getElementById("sel-modo-husky-hw");
    const modo = selModo ? selModo.value : "i2c";

    if (modo === "i2c") {
      componentesConectados.push({
        tipo: "huskylens",
        modo: "i2c",
        pin: "A4, A5",
        etiqueta: "HuskyLens 2 (I2C: A4 SDA, A5 SCL)",
      });
    } else {
      componentesConectados.push({
        tipo: "huskylens",
        modo: "serial",
        pin: "10, 11",
        etiqueta: "HuskyLens 2 (Serial: Pin 10 RX, Pin 11 TX)",
      });
    }

    renderizarChipsHardware();
    return;
  }

  if (tipo === "lcd") {
    const yaExisteLcd = componentesConectados.some((c) => c.tipo === "lcd");
    if (yaExisteLcd) {
      return alert("Ya hay un display LCD registrado.");
    }
    componentesConectados.push({
      tipo: "lcd",
      pin: "A4, A5",
      etiqueta: "Display LCD 16x2 I2C (0x27: A4 SDA, A5 SCL)",
    });
    renderizarChipsHardware();
    return;
  }

  const inputPin = document.getElementById("inp-pin-comp");
  const pin = inputPin ? inputPin.value.trim().toUpperCase() : "";
  if (!pin) return alert("Escribe un número de pin válido (ej: 13, A0, 8)");

  const nombres = {
    buzzer: "Buzzer Pasivo",
    boton: "Pulsador",
    led: "LED Simple",
    servo: "Servomotor",
    switch: "Switch 2 Estados",
    selector3: "Selector 3 Vías",
    dht: "DHT11",
    pot: "Potenciómetro",
    ldr: "Sensor LDR",
    ultra: "Sensor Ultrasónico",
  };

  const nombreEtiqueta = nombres[tipo] || "Componente";

  componentesConectados.push({
    tipo: tipo,
    pin: pin,
    etiqueta: `${nombreEtiqueta} (Pin ${pin})`,
  });

  renderizarChipsHardware();
}

function quitarComponenteHardware(idx) {
  componentesConectados.splice(idx, 1);
  renderizarChipsHardware();
}

function obtenerOpcionesHardware(tipo) {
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
// ESTADO Y DETECCIÓN DEL EASTER EGG (BLOQUES SECRETOS)
// =========================================================================
let bloquesSecretosActivados = false;
let contadorClicsSecretos = 0;
let timerClicsSecretos = null;

function verificarSiEsBloqueSecreto(bloqueElemento) {
  const texto = bloqueElemento.innerText.toLowerCase();
  return (
    texto.includes("fuera del umbral") ||
    texto.includes("alerta ambiental") ||
    texto.includes("emergencia biológica") ||
    texto.includes("dashboard web") ||
    texto.includes("servidor web")
  );
}

// =========================================================================
// MOTOR DE LA PALETA Y TABLEROS
// =========================================================================
function construirHerramientas(lado, idContenedor, idTablero) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;
  contenedor.innerHTML = "";

  if (typeof SISTEMA === "undefined" || !SISTEMA[lado]) {
    console.warn("No se encontró la definición de bloques para:", lado);
    return;
  }

  SISTEMA[lado].forEach((cat) => {
    // Si la categoría tiene la marca 'secreta: true' y no está activada, se omite
    if (cat.secreta && !bloquesSecretosActivados) {
      return;
    }

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

function configurarEasterEggNotebook() {
  const headerPC = document.querySelector(".col-header.col-pc");
  if (!headerPC) return;

  headerPC.style.cursor = "pointer";
  headerPC.addEventListener("click", () => {
    contadorClicsSecretos++;

    clearTimeout(timerClicsSecretos);
    timerClicsSecretos = setTimeout(() => {
      contadorClicsSecretos = 0;
    }, 1800);

    if (contadorClicsSecretos >= 5) {
      contadorClicsSecretos = 0;
      bloquesSecretosActivados = !bloquesSecretosActivados;
      construirHerramientas("pc", "toolbox-pc", "board-pc");

      if (bloquesSecretosActivados) {
        alert("🔓 ¡Bloques especiales de vitrina patrimonial activados!");
      } else {
        alert("🔒 Bloques especiales ocultados.");
      }
    }
  });
}

function renderizarCampo(c) {
  const estiloBase =
    "height: 28px; line-height: 28px; padding: 2px 8px; border-radius: 5px; border: 1px solid rgba(0,0,0,0.2); font-size: 13px; font-weight: bold; box-sizing: border-box; vertical-align: middle;";

  if (c.tipo === "select") {
    return `<select class="val-input" style="${estiloBase}">${c.opts.map((o) => `<option value="${o}">${o}</option>`).join("")}</select>`;
  } else if (c.tipo === "dinamico") {
    const opts = obtenerOpcionesHardware(c.fuente);
    return `<select class="val-input select-dinamico" data-fuente="${c.fuente}" style="${estiloBase}">${opts.map((o) => `<option value="${o}">${o}</option>`).join("")}</select>`;
  } else if (c.tipo === "color") {
    return `<input class="val-input" type="color" value="${c.val}" style="width: 45px; height: 28px; padding: 1px; border: none; cursor: pointer; border-radius: 4px; vertical-align: middle;">`;
  } else if (c.tipo === "input") {
    return `<input class="val-input" type="text" value="${c.val}" style="width: 155px; ${estiloBase} background: #ffffff; color: #222222;">`;
  }
  return "";
}

function aplicarEstiloSangria(bloque, nivel) {
  const pasoIndent = 26;
  bloque.setAttribute("data-indent", nivel);
  bloque.style.boxSizing = "border-box";
  bloque.style.marginLeft = `${nivel * pasoIndent}px`;
  bloque.style.width = `calc(100% - ${nivel * pasoIndent}px)`;

  if (nivel > 0) {
    bloque.style.borderLeft = `${nivel * 4}px solid rgba(255, 255, 255, 0.7)`;
  } else {
    bloque.style.borderLeft = "";
  }
}

function tabularBloque(boton, direccion) {
  const bloque = boton.closest(".block-in-board");
  if (!bloque) return;

  if (bloque.classList.contains("selected")) {
    const seleccionados = Array.from(
      document.querySelectorAll(".block-in-board.selected"),
    );
    seleccionados.forEach((b) => {
      let n = parseInt(b.getAttribute("data-indent") || "0", 10);
      n = Math.max(0, Math.min(4, n + direccion));
      aplicarEstiloSangria(b, n);
    });
    return;
  }

  let nivelActual = parseInt(bloque.getAttribute("data-indent") || "0", 10);
  nivelActual = Math.max(0, Math.min(4, nivelActual + direccion));
  aplicarEstiloSangria(bloque, nivelActual);
}

function agregarAlTablero(b, color, idTablero) {
  const tablero = document.getElementById(idTablero);
  if (!tablero) return;
  const el = document.createElement("div");
  el.className = "block block-in-board";
  el.style.backgroundColor = color;
  el.draggable = true;

  let nivelInicial = 0;
  const ultimoBloque = tablero.querySelector(".block-in-board:last-child");
  if (ultimoBloque) {
    const textoUltimo = ultimoBloque.innerText;
    const indentUltimo = parseInt(
      ultimoBloque.getAttribute("data-indent") || "0",
      10,
    );
    if (textoUltimo.includes("Bucle (Repetir") || textoUltimo.includes("Si ")) {
      nivelInicial = Math.min(4, indentUltimo + 1);
    } else {
      nivelInicial = indentUltimo;
    }
  }

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
      <button class="btn-move" onclick="tabularBloque(this, -1)" title="Disminuir sangría">⇤</button>
      <button class="btn-move" onclick="tabularBloque(this, 1)" title="Aumentar sangría">⇥</button>
      <button class="btn-move" onclick="moverBloque(this, -1)" title="Subir">▲</button>
      <button class="btn-move" onclick="moverBloque(this, 1)" title="Bajar">▼</button>
      <button class="btn-del" onclick="borrarBloque(this)" title="Quitar">✕</button>
    </div>
  `;

  el.innerHTML = html;
  tablero.appendChild(el);

  aplicarEstiloSangria(el, nivelInicial);
  configurarArrastre(el, tablero);
  configurarSeleccionBloque(el);
  actualizarNumeros(tablero);
}

function moverBloque(boton, direccion) {
  const bloque = boton.closest(".block-in-board");
  const tablero = bloque.parentElement;

  if (bloque.classList.contains("selected")) {
    moverSeleccionados(tablero, direccion);
    return;
  }

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

  if (bloque.classList.contains("selected")) {
    borrarSeleccionados();
    return;
  }

  bloque.remove();
  actualizarNumeros(tablero);
  actualizarBarraLote();
}

function limpiar(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = "";
  deseleccionarTodos();
}

function actualizarNumeros(tablero) {
  const bloques = tablero.querySelectorAll(".block-in-board");
  bloques.forEach((b, index) => {
    const pill = b.querySelector(".step-number");
    if (pill) pill.innerText = `#${index + 1}`;

    const texto = b.innerText;
    if (texto.includes("Bucle (Repetir")) {
      b.classList.add("loop-header");
      b.classList.remove("loop-footer");
    } else if (texto.includes("Fin del bucle")) {
      b.classList.add("loop-footer");
      b.classList.remove("loop-header");
    } else {
      b.classList.remove("loop-header", "loop-footer");
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
    if (elementoArrastrado && elementoArrastrado !== el) {
      el.classList.add("drag-over");
    }
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
// SISTEMA DE SELECCIÓN MÚLTIPLE, DUPLICACIÓN Y GESTIÓN EN LOTE
// =========================================================================
let ultimoBloqueSeleccionado = null;

function configurarSeleccionBloque(el) {
  el.addEventListener("click", (e) => {
    if (
      e.target.closest(".controls-group") ||
      e.target.classList.contains("val-input") ||
      e.target.tagName === "INPUT" ||
      e.target.tagName === "SELECT"
    ) {
      return;
    }

    const tablero = el.parentElement;

    if (e.ctrlKey || e.metaKey) {
      el.classList.toggle("selected");
      ultimoBloqueSeleccionado = el;
    } else if (
      e.shiftKey &&
      ultimoBloqueSeleccionado &&
      ultimoBloqueSeleccionado.parentElement === tablero
    ) {
      const todos = Array.from(tablero.querySelectorAll(".block-in-board"));
      const idxA = todos.indexOf(ultimoBloqueSeleccionado);
      const idxB = todos.indexOf(el);
      const min = Math.min(idxA, idxB);
      const max = Math.max(idxA, idxB);

      todos.forEach((b, i) => {
        if (i >= min && i <= max) {
          b.classList.add("selected");
        }
      });
    } else {
      deseleccionarTodos();
      el.classList.add("selected");
      ultimoBloqueSeleccionado = el;
    }

    actualizarBarraLote();
  });
}

function deseleccionarTodos() {
  document.querySelectorAll(".block-in-board.selected").forEach((b) => {
    b.classList.remove("selected");
  });
  actualizarBarraLote();
}

function clonarBloqueProfundo(bloqueOriginal) {
  const clon = bloqueOriginal.cloneNode(true);
  clon.classList.remove("selected", "dragging", "drag-over");

  const origInputs = bloqueOriginal.querySelectorAll(".val-input");
  const clonInputs = clon.querySelectorAll(".val-input");
  origInputs.forEach((inp, idx) => {
    if (clonInputs[idx]) {
      clonInputs[idx].value = inp.value;
    }
  });

  const tablero = bloqueOriginal.parentElement;
  configurarArrastre(clon, tablero);
  configurarSeleccionBloque(clon);

  return clon;
}

function duplicarSeleccionados() {
  const seleccionados = Array.from(
    document.querySelectorAll(".block-in-board.selected"),
  );
  if (seleccionados.length === 0) return;

  const tablero = seleccionados[0].parentElement;

  seleccionados.sort((a, b) => {
    const pos = a.compareDocumentPosition(b);
    return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });

  const ultimo = seleccionados[seleccionados.length - 1];
  let referenciaInsercion = ultimo.nextSibling;

  const nuevosClones = [];
  seleccionados.forEach((b) => {
    const clon = clonarBloqueProfundo(b);
    tablero.insertBefore(clon, referenciaInsercion);
    nuevosClones.push(clon);
  });

  deseleccionarTodos();
  nuevosClones.forEach((c) => c.classList.add("selected"));
  ultimoBloqueSeleccionado = nuevosClones[nuevosClones.length - 1];

  actualizarNumeros(tablero);
  actualizarBarraLote();
}

function borrarSeleccionados() {
  const seleccionados = Array.from(
    document.querySelectorAll(".block-in-board.selected"),
  );
  if (seleccionados.length === 0) return;

  const tablerosAfectados = new Set();
  seleccionados.forEach((b) => {
    tablerosAfectados.add(b.parentElement);
    b.remove();
  });

  tablerosAfectados.forEach((t) => actualizarNumeros(t));
  actualizarBarraLote();
}

function moverSeleccionados(tablero, direccion) {
  const seleccionados = Array.from(
    tablero.querySelectorAll(".block-in-board.selected"),
  );
  if (seleccionados.length === 0) return;

  if (direccion === -1) {
    for (const b of seleccionados) {
      const prev = b.previousElementSibling;
      if (prev && !prev.classList.contains("selected")) {
        tablero.insertBefore(b, prev);
      }
    }
  } else {
    for (let i = seleccionados.length - 1; i >= 0; i--) {
      const b = seleccionados[i];
      const next = b.nextElementSibling;
      if (next && !next.classList.contains("selected")) {
        tablero.insertBefore(next, b);
      }
    }
  }

  actualizarNumeros(tablero);
}

function actualizarBarraLote() {
  let barra = document.getElementById("batch-toolbar");
  const seleccionados = document.querySelectorAll(".block-in-board.selected");

  if (seleccionados.length >= 2) {
    if (!barra) {
      barra = document.createElement("div");
      barra.id = "batch-toolbar";
      barra.className = "batch-toolbar";
      document.body.appendChild(barra);
    }
    barra.innerHTML = `
      <span class="batch-toolbar-count">✓ ${seleccionados.length} bloques</span>
      <button class="batch-btn" onclick="duplicarSeleccionados()" title="Duplicar (Ctrl+D)">📋 Duplicar</button>
      <button class="batch-btn" onclick="tabularSeleccionados(-1)" title="Menos sangría">⇤ Sangría</button>
      <button class="batch-btn" onclick="tabularSeleccionados(1)" title="Más sangría">⇥ Sangría</button>
      <button class="batch-btn danger" onclick="borrarSeleccionados()" title="Eliminar (Supr)">🗑️ Eliminar</button>
    `;
    barra.style.display = "flex";
  } else {
    if (barra) barra.style.display = "none";
  }
}

function tabularSeleccionados(dir) {
  const seleccionados = document.querySelectorAll(".block-in-board.selected");
  seleccionados.forEach((b) => {
    let n = parseInt(b.getAttribute("data-indent") || "0", 10);
    n = Math.max(0, Math.min(4, n + dir));
    aplicarEstiloSangria(b, n);
  });
}

document.addEventListener("keydown", (e) => {
  if (
    e.target.tagName === "INPUT" ||
    e.target.tagName === "TEXTAREA" ||
    e.target.isContentEditable
  ) {
    return;
  }

  const seleccionados = document.querySelectorAll(".block-in-board.selected");
  if (seleccionados.length === 0) return;

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
    e.preventDefault();
    duplicarSeleccionados();
  }

  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault();
    borrarSeleccionados();
  }

  if (e.altKey && e.key === "ArrowUp") {
    e.preventDefault();
    const tablero = seleccionados[0].parentElement;
    moverSeleccionados(tablero, -1);
  } else if (e.altKey && e.key === "ArrowDown") {
    e.preventDefault();
    const tablero = seleccionados[0].parentElement;
    moverSeleccionados(tablero, 1);
  }

  if (e.key === "Tab") {
    e.preventDefault();
    tabularSeleccionados(e.shiftKey ? -1 : 1);
  }

  if (e.key === "Escape") {
    deseleccionarTodos();
  }
});

document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".block-in-board") &&
    !e.target.closest(".batch-toolbar") &&
    !e.target.closest(".toolbox")
  ) {
    deseleccionarTodos();
  }
});

// =========================================================================
// EXPORTADOR VISUAL DE TABLERO A IMAGEN PNG (CAPTURA COMPLETA)
// =========================================================================
function exportarTableroComoImagen(idTablero, nombreArchivo) {
  const tablero = document.getElementById(idTablero);
  if (!tablero || tablero.querySelectorAll(".block-in-board").length === 0) {
    return alert("El tablero está vacío. Agrega bloques antes de exportar.");
  }

  deseleccionarTodos();

  const controles = tablero.querySelectorAll(".controls-group");
  controles.forEach((c) => (c.style.display = "none"));

  const camposInputs = tablero.querySelectorAll(".val-input");
  const sustitutos = [];

  camposInputs.forEach((el) => {
    const textoValor = el.value || "";
    const spanPildora = document.createElement("span");
    spanPildora.className = "temp-capture-span";
    spanPildora.textContent = textoValor;
    spanPildora.style.cssText = `
      display: inline-block;
      min-width: ${el.offsetWidth ? el.offsetWidth - 16 : 60}px;
      padding: 3px 8px;
      background: #ffffff;
      color: #111111;
      border-radius: 5px;
      font-size: 13px;
      font-weight: bold;
      line-height: 1.3;
      border: 1px solid rgba(0, 0, 0, 0.25);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
      vertical-align: middle;
      text-align: center;
    `;

    el.style.display = "none";
    el.parentNode.insertBefore(spanPildora, el.nextSibling);
    sustitutos.push({ original: el, fake: spanPildora });
  });

  const estiloPrevioOverflow = tablero.style.overflow;
  const estiloPrevioHeight = tablero.style.height;
  const estiloPrevioMaxHeight = tablero.style.maxHeight;

  tablero.style.overflow = "visible";
  tablero.style.height = "auto";
  tablero.style.maxHeight = "none";

  const alturaTotal = tablero.scrollHeight;
  const anchoTotal = tablero.scrollWidth;

  html2canvas(tablero, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    height: alturaTotal,
    width: anchoTotal,
    windowHeight: alturaTotal + 200,
    scrollY: -window.scrollY,
  })
    .then((canvas) => {
      sustitutos.forEach((s) => {
        s.fake.remove();
        s.original.style.display = "";
      });
      tablero.style.overflow = estiloPrevioOverflow;
      tablero.style.height = estiloPrevioHeight;
      tablero.style.maxHeight = estiloPrevioMaxHeight;
      controles.forEach((c) => (c.style.display = ""));

      const enlace = document.createElement("a");
      enlace.download = nombreArchivo;
      enlace.href = canvas.toDataURL("image/png");
      enlace.click();
    })
    .catch((err) => {
      sustitutos.forEach((s) => {
        s.fake.remove();
        s.original.style.display = "";
      });
      tablero.style.overflow = estiloPrevioOverflow;
      tablero.style.height = estiloPrevioHeight;
      tablero.style.maxHeight = estiloPrevioMaxHeight;
      controles.forEach((c) => (c.style.display = ""));
      console.error("Error al exportar:", err);
      alert("No se pudo generar la imagen del tablero.");
    });
}

// =========================================================================
// CONTROL DEL PANEL Y ALTERNANCIA DEL DIAGRAMA
// =========================================================================
function alternarDiagramaCircuito() {
  const panel = document.getElementById("seccion-circuito");
  if (!panel) return;

  const estiloActual = window.getComputedStyle(panel).display;

  if (estiloActual === "none") {
    panel.style.display = "block";
    setTimeout(() => {
      dibujarDiagramaCircuito();
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  } else {
    panel.style.display = "none";
  }
}

// =========================================================================
// GENERADOR DINÁMICO DE DIAGRAMA ESQUEMÁTICO (HiDPI / RETINA 2X + ZERO COLISIÓN)
// =========================================================================
function dibujarDiagramaCircuito() {
  const canvas = document.getElementById("canvas-circuito");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const logicoW = 1200;
  const logicoH = 800;

  const scaleDPI = 2;
  canvas.width = logicoW * scaleDPI;
  canvas.height = logicoH * scaleDPI;
  canvas.style.width = "100%";
  canvas.style.maxWidth = `${logicoW}px`;
  canvas.style.height = "auto";

  ctx.resetTransform();
  ctx.scale(scaleDPI, scaleDPI);

  const W = logicoW;
  const H = logicoH;

  ctx.fillStyle = "#12141a";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "#1a1d26";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  const ardW = 460;
  const ardH = 250;
  const ardX = (W - ardW) / 2 + 15;
  const ardY = (H - ardH) / 2 + 35;

  const mapaTerminales = {};

  dibujarPlacaArduinoSimplificada(ctx, ardX, ardY, ardW, ardH, mapaTerminales);
  const perifericos = procesarYUbicarPerifericosAntiColision(
    componentesConectados,
    mapaTerminales,
    W,
    H,
    ardX,
    ardY,
    ardW,
    ardH,
  );
  dibujarElementosPerifericos(ctx, perifericos);
  trazarCablesCompletos(ctx, perifericos, mapaTerminales);

  if (componentesConectados.length === 0) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "italic 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "No hay componentes conectados. Conéctalos desde el panel superior.",
      W / 2,
      H - 35,
    );
  }
}

function dibujarPlacaArduinoSimplificada(ctx, x, y, w, h, mapaTerminales) {
  ctx.fillStyle = "#8f9ca8";
  ctx.beginPath();
  ctx.roundRect(x - 32, y + 30, 38, 48, 3);
  ctx.fill();
  ctx.strokeStyle = "#6b7580";
  ctx.stroke();

  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.roundRect(x - 36, y + 155, 42, 52, 4);
  ctx.fill();

  ctx.fillStyle = "#008184";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = "#005c5e";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.fillText("ARDUINO", x + w / 2, y + 110);
  ctx.font = "bold 14px monospace";
  ctx.fillStyle = "#b2dfdb";
  ctx.fillText("UNO", x + w / 2, y + 130);

  ctx.fillStyle = "#1a1a1c";
  ctx.fillRect(x + w / 2 - 80, y + 165, 160, 26);
  ctx.fillStyle = "#555b66";
  ctx.font = "9px monospace";
  ctx.fillText("ATmega328P", x + w / 2, y + 181);

  ctx.fillStyle = "#c0392b";
  ctx.beginPath();
  ctx.arc(x + 36, y + 38, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e0e0e0";
  ctx.font = "bold 8px sans-serif";
  ctx.fillText("RESET", x + 36, y + 25);

  const pinesDig = [
    { id: "GND_D", label: "GND", pwr: true },
    { id: "13", label: "D13" },
    { id: "12", label: "D12" },
    { id: "11", label: "~D11" },
    { id: "10", label: "~D10" },
    { id: "9", label: "~D9" },
    { id: "8", label: "D8" },
    { id: "7", label: "D7" },
    { id: "6", label: "~D6" },
    { id: "5", label: "~D5" },
    { id: "4", label: "D4" },
    { id: "3", label: "~D3" },
    { id: "2", label: "D2" },
    { id: "1", label: "TX>1" },
    { id: "0", label: "RX<0" },
  ];

  const headerSupX = x + 75;
  const headerSupY = y + 8;
  const pasoDig = 24;

  ctx.fillStyle = "#18191d";
  ctx.fillRect(
    headerSupX - 8,
    headerSupY - 3,
    pinesDig.length * pasoDig + 4,
    22,
  );

  pinesDig.forEach((p, i) => {
    const px = headerSupX + i * pasoDig;
    const py = headerSupY + 8;
    mapaTerminales[p.id] = { x: px, y: py, lado: "arriba" };

    ctx.fillStyle = "#09090b";
    ctx.fillRect(px - 4, py - 4, 8, 8);

    ctx.save();
    ctx.translate(px, headerSupY + 28);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = p.pwr ? "#95a5a6" : "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "right";
    ctx.fillText(p.label, 0, 3);
    ctx.restore();
  });

  const headerInfY = y + h - 26;

  const pinesPwr = [
    { id: "5V", label: "5V", color: "#e74c3c" },
    { id: "GND_1", label: "GND", color: "#95a5a6" },
    { id: "GND_2", label: "GND", color: "#95a5a6" },
  ];

  const headerPwrX = x + 75;
  ctx.fillStyle = "#18191d";
  ctx.fillRect(headerPwrX - 8, headerInfY, pinesPwr.length * 24 + 4, 22);

  pinesPwr.forEach((p, i) => {
    const px = headerPwrX + i * 24;
    const py = headerInfY + 11;
    mapaTerminales[p.id] = { x: px, y: py, lado: "abajo" };

    ctx.fillStyle = "#09090b";
    ctx.fillRect(px - 4, py - 4, 8, 8);

    ctx.fillStyle = p.color;
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(p.label, px, headerInfY - 7);
  });

  mapaTerminales["GND"] = mapaTerminales["GND_1"];

  const pinesAna = ["A0", "A1", "A2", "A3", "A4", "A5"];
  const headerAnaX = x + w - pinesAna.length * 24 - 20;

  ctx.fillStyle = "#18191d";
  ctx.fillRect(headerAnaX - 8, headerInfY, pinesAna.length * 24 + 4, 22);

  pinesAna.forEach((aId, i) => {
    const px = headerAnaX + i * 24;
    const py = headerInfY + 11;
    mapaTerminales[aId] = { x: px, y: py, lado: "abajo" };

    ctx.fillStyle = "#09090b";
    ctx.fillRect(px - 4, py - 4, 8, 8);

    ctx.fillStyle = "#48c8f5";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(aId, px, headerInfY - 7);
  });
}

function procesarYUbicarPerifericosAntiColision(
  comps,
  mapa,
  W,
  H,
  ardX,
  ardY,
  ardW,
  ardH,
) {
  const elementos = [];

  const leds = comps.filter((c) => c.tipo === "led");
  const otros = comps.filter((c) => c.tipo !== "led");

  if (leds.length > 1) {
    leds.sort((a, b) => {
      const pinA = parseInt(a.pin.replace(/\D/g, ""), 10) || 0;
      const pinB = parseInt(b.pin.replace(/\D/g, ""), 10) || 0;
      return pinB - pinA;
    });

    const pasoLed = 36;
    const paddingX = 24;
    const barraW = Math.max(220, leds.length * pasoLed + paddingX * 2);
    const barraH = 75;

    const posX = ardX + (ardW - barraW) / 2 + 30;
    const posY = 35;

    const ledsMapeados = leds.map((l, idx) => {
      const pinLimpio = l.pin.replace(/\D/g, "");
      const termX = posX + paddingX + idx * pasoLed + pasoLed / 2;
      const termY = posY + barraH;
      return {
        pin: pinLimpio,
        label: `D${pinLimpio}`,
        terminal: { x: termX, y: termY },
      };
    });

    elementos.push({
      tipoEspecial: "barra_leds",
      x: posX,
      y: posY,
      w: barraW,
      h: barraH,
      leds: ledsMapeados,
      terminalGND: { x: posX + 16, y: posY + barraH / 2 },
    });
  } else if (leds.length === 1) {
    otros.push(leds[0]);
  }

  let stackIzqY = 35;
  let stackDerY = 35;
  const colIzqX = 35;
  const colDerX = W - 200;
  const cardW = 165;
  const cardH = 68;
  const margenV = 22;

  const objHusky = otros.find((c) => c.tipo === "huskylens");
  if (objHusky) {
    let hX, hY, hLado;
    if (objHusky.modo === "i2c") {
      hX = colIzqX;
      hY = ardY + ardH + 30;
      hLado = "abajo";
    } else {
      hX = colIzqX;
      hY = stackIzqY;
      hLado = "arriba";
      stackIzqY += cardH + margenV;
    }

    elementos.push({
      tipoEspecial: "individual",
      comp: objHusky,
      x: hX,
      y: hY,
      w: cardW,
      h: cardH,
      lado: hLado,
    });
  }

  const objLcd = otros.find((c) => c.tipo === "lcd");
  if (objLcd) {
    elementos.push({
      tipoEspecial: "individual",
      comp: objLcd,
      x: Math.min(W - cardW - 35, ardX + ardW - cardW),
      y: ardY + ardH + 30,
      w: cardW,
      h: cardH,
      lado: "abajo",
    });
  }

  const resto = otros.filter((c) => c.tipo !== "huskylens" && c.tipo !== "lcd");

  resto.forEach((c) => {
    let pX, pY, pLado;

    if (c.pin.startsWith("A")) {
      pX = colIzqX;
      pY =
        ardY +
        50 +
        elementos.filter((e) => e.x === colIzqX && e.y >= ardY).length *
          (cardH + margenV);
      pLado = "abajo";
    } else {
      if (stackIzqY + cardH < ardY + ardH) {
        pX = colIzqX;
        pY = stackIzqY;
        pLado = "arriba";
        stackIzqY += cardH + margenV;
      } else {
        pX = colDerX;
        pY = stackDerY;
        pLado = "arriba";
        stackDerY += cardH + margenV;
      }
    }

    elementos.push({
      tipoEspecial: "individual",
      comp: c,
      x: pX,
      y: pY,
      w: cardW,
      h: cardH,
      lado: pLado,
    });
  });

  return elementos;
}

function dibujarElementosPerifericos(ctx, perifericos) {
  perifericos.forEach((p) => {
    if (p.tipoEspecial === "barra_leds") {
      ctx.fillStyle = "#181a22";
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, p.h, 10);
      ctx.fill();
      ctx.strokeStyle = "#383d4f";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = "#f39c12";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`MÓDULO DE LEDS (${p.leds.length}x)`, p.x + 16, p.y + 18);

      p.leds.forEach((item) => {
        const lx = item.terminal.x;
        const ly = p.y + 36;

        ctx.save();
        ctx.translate(lx, ly);
        ctx.fillStyle = "#f39c12";
        ctx.beginPath();
        ctx.arc(0, -2, 7, Math.PI, 0);
        ctx.lineTo(7, 4);
        ctx.lineTo(-7, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(item.label, lx, p.y + p.h - 8);

        ctx.fillStyle = "#f39c12";
        ctx.beginPath();
        ctx.arc(item.terminal.x, item.terminal.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = "#95a5a6";
      ctx.beginPath();
      ctx.arc(p.terminalGND.x, p.terminalGND.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#95a5a6";
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GND", p.terminalGND.x, p.terminalGND.y - 8);
    } else {
      const c = p.comp;
      ctx.fillStyle = "#181a22";
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, p.h, 8);
      ctx.fill();
      ctx.strokeStyle = "#2e3240";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.translate(p.x + 24, p.y + p.h / 2);
      dibujarIconoComponente(ctx, c.tipo);
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(c.etiqueta.split("(")[0].trim(), p.x + 48, p.y + 26);

      ctx.fillStyle = "#8a94a6";
      ctx.font = "10px monospace";
      ctx.fillText(c.pin, p.x + 48, p.y + 44);

      const termX = p.x + p.w / 2;
      const termY = p.lado === "arriba" ? p.y + p.h : p.y;
      p.terminal = { x: termX, y: termY, lado: p.lado };

      ctx.fillStyle = "#48c8f5";
      ctx.beginPath();
      ctx.arc(termX, termY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function trazarCablesCompletos(ctx, perifericos, mapa) {
  perifericos.forEach((p) => {
    if (p.tipoEspecial === "barra_leds") {
      p.leds.forEach((item) => {
        if (mapa[item.pin]) {
          conectarConCurva(ctx, item.terminal, mapa[item.pin], "#f39c12");
        }
      });

      if (mapa["GND_D"]) {
        conectarConCurva(ctx, p.terminalGND, mapa["GND_D"], "#7f8c8d");
      }
    } else {
      const c = p.comp;
      const desde = p.terminal;

      if (c.tipo === "huskylens") {
        if (c.modo === "i2c") {
          conectarConCurva(
            ctx,
            { x: desde.x - 10, y: desde.y, lado: desde.lado },
            mapa["A4"],
            "#48c8f5",
          );
          conectarConCurva(
            ctx,
            { x: desde.x + 10, y: desde.y, lado: desde.lado },
            mapa["A5"],
            "#2ecc71",
          );
          conectarConCurva(
            ctx,
            { x: p.x + 15, y: desde.y, lado: desde.lado },
            mapa["GND_2"] || mapa["GND"],
            "#7f8c8d",
          );
        } else {
          conectarConCurva(
            ctx,
            { x: desde.x - 10, y: desde.y, lado: desde.lado },
            mapa["10"],
            "#2ecc71",
          );
          conectarConCurva(
            ctx,
            { x: desde.x + 10, y: desde.y, lado: desde.lado },
            mapa["11"],
            "#48c8f5",
          );
          conectarConCurva(
            ctx,
            { x: p.x + 15, y: desde.y, lado: desde.lado },
            mapa["GND_D"],
            "#7f8c8d",
          );
        }
      } else if (c.tipo === "lcd") {
        conectarConCurva(
          ctx,
          { x: desde.x - 12, y: desde.y, lado: desde.lado },
          mapa["A4"],
          "#48c8f5",
        );
        conectarConCurva(
          ctx,
          { x: desde.x + 8, y: desde.y, lado: desde.lado },
          mapa["A5"],
          "#2ecc71",
        );
        conectarConCurva(
          ctx,
          { x: p.x + 15, y: desde.y, lado: desde.lado },
          mapa["5V"],
          "#e74c3c",
        );
        conectarConCurva(
          ctx,
          { x: p.x + 32, y: desde.y, lado: desde.lado },
          mapa["GND_1"],
          "#7f8c8d",
        );
      } else if (c.tipo === "servo") {
        const pinLimpio = c.pin.replace(/\D/g, "");
        if (mapa[pinLimpio]) {
          conectarConCurva(ctx, desde, mapa[pinLimpio], "#f1c40f");
        }
        conectarConCurva(
          ctx,
          { x: p.x + 15, y: desde.y, lado: desde.lado },
          mapa["5V"],
          "#e74c3c",
        );
        conectarConCurva(
          ctx,
          { x: p.x + 30, y: desde.y, lado: desde.lado },
          mapa["GND_1"],
          "#7f8c8d",
        );
      } else {
        const pinLimpio = c.pin.replace(/\D/g, "");
        let destino = null;

        if (c.pin.startsWith("A") && mapa[c.pin]) {
          destino = mapa[c.pin];
        } else if (mapa[pinLimpio]) {
          destino = mapa[pinLimpio];
        }

        if (destino) {
          const color =
            c.tipo === "led"
              ? "#f39c12"
              : c.tipo === "buzzer"
                ? "#e74c3c"
                : "#9b59b6";
          conectarConCurva(ctx, desde, destino, color);
        }
      }
    }
  });
}

function conectarConCurva(ctx, desde, hasta, color) {
  if (!desde || !hasta) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(desde.x, desde.y);

  const dy = hasta.lado === "arriba" ? -45 : 45;
  const cp1x = desde.x;
  const cp1y = desde.lado === "abajo" ? desde.y - 35 : desde.y + 35;
  const cp2x = hasta.x;
  const cp2y = hasta.y + dy;

  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, hasta.x, hasta.y);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(hasta.x, hasta.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function dibujarIconoComponente(ctx, tipo) {
  if (tipo === "huskylens") {
    ctx.fillStyle = "#2c3e50";
    ctx.beginPath();
    ctx.roundRect(-16, -14, 32, 28, 4);
    ctx.fill();
    ctx.fillStyle = "#3498db";
    ctx.fillRect(-12, -10, 24, 14);
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(0, 7, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#00d2d3";
    ctx.beginPath();
    ctx.arc(0, 7, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (tipo === "lcd") {
    ctx.fillStyle = "#1b4d3e";
    ctx.beginPath();
    ctx.roundRect(-16, -12, 32, 24, 3);
    ctx.fill();
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(-12, -8, 24, 16);
    ctx.fillStyle = "#000000";
    ctx.fillRect(-10, -5, 20, 3);
    ctx.fillRect(-10, 1, 20, 3);
  } else if (tipo === "servo") {
    ctx.fillStyle = "#2980b9";
    ctx.beginPath();
    ctx.roundRect(-14, -12, 28, 24, 3);
    ctx.fill();
    ctx.fillStyle = "#bdc3c7";
    ctx.beginPath();
    ctx.arc(0, -2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-2, -12, 4, 10);
  } else if (tipo === "led") {
    ctx.fillStyle = "#f39c12";
    ctx.beginPath();
    ctx.arc(0, -2, 10, Math.PI, 0);
    ctx.lineTo(10, 6);
    ctx.lineTo(-10, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#bdc3c7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(-4, 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 6);
    ctx.lineTo(4, 14);
    ctx.stroke();
  } else if (tipo === "buzzer") {
    ctx.fillStyle = "#1e272c";
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#485460";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e74c3c";
    ctx.font = "bold 9px sans-serif";
    ctx.fillText("+", 6, -5);
  } else if (tipo === "pot") {
    ctx.fillStyle = "#34495e";
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#95a5a6";
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(5, -5);
    ctx.stroke();
  } else if (tipo === "boton") {
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(-10, -10, 20, 20);
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#16a085";
    ctx.beginPath();
    ctx.roundRect(-12, -12, 24, 24, 3);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("S", 0, 4);
  }
}

function descargarDiagramaCircuito() {
  const canvas = document.getElementById("canvas-circuito");
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = "esquema_circuito_arduino_hd.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// =========================================================================
// INTEGRACIÓN CON GOOGLE GEMINI AI (CLAVE DIRECTA EN CÓDIGO)
// =========================================================================
const GEMINI_API_KEY = "AQ.Ab8RN6JOb3OrWR0FZ5zwaQtGk3f9L0GZtyG_Vemy5ib_a51kMw";

let codigoGeneradoIno = "";
let codigoGeneradoPy = "";
let tabActiva = "ino";

// 1. Construir prompt completo unificado (para IA y portapapeles)
function construirPromptCompilador(omitirPython = false) {
  const puertoCom = document.getElementById("sel-puerto-com")
    ? document.getElementById("sel-puerto-com").value
    : "COM7";
  const modeloHusky = document.getElementById("sel-modelo-husky")
    ? document.getElementById("sel-modelo-husky").value
    : "ALGORITHM_TAG_RECOGNITION";
  const objHusky = componentesConectados.find((c) => c.tipo === "huskylens");
  const modoHusky = objHusky ? objHusky.modo : "i2c";

  const inpContexto = document.getElementById("inp-contexto-ia");
  const contextoUsuario = inpContexto ? inpContexto.value.trim() : "";

  let prompt = "=== ESPECIFICACIÓN DEL PROYECTO PARA COMPILACIÓN ===\n";
  if (contextoUsuario) {
    prompt += `CONTEXTO / OBJETIVO DEL PROYECTO: ${contextoUsuario}\n`;
  }
  prompt += `Puerto COM sugerido: ${puertoCom}\n`;
  prompt += `Modo conexión HuskyLens: ${modoHusky.toUpperCase()}\n`;
  prompt += `Algoritmo HuskyLens: ${modeloHusky}\n\n`;

  prompt += "=== COMPONENTES FÍSICOS CONECTADOS ===\n";
  if (componentesConectados.length === 0) {
    prompt += "• Ninguno declarado explícitamente.\n";
  } else {
    componentesConectados.forEach((c) => (prompt += `• ${c.etiqueta}\n`));
  }

  function serializarTablero(idTablero, titulo) {
    let s = `\n[${titulo}]\n`;
    const bloques = document.querySelectorAll(`#${idTablero} .block-in-board`);
    if (bloques.length === 0) return s + "• Sin bloques definidos.\n";

    bloques.forEach((b, idx) => {
      const clon = b.cloneNode(true);
      const controles = clon.querySelector(".controls-group");
      if (controles) controles.remove();
      const stepPill = clon.querySelector(".step-number");
      if (stepPill) stepPill.remove();

      const inputs = Array.from(b.querySelectorAll(".val-input")).map(
        (el) => `[${el.value}]`,
      );
      clon.querySelectorAll(".val-input").forEach((el) => el.remove());
      const texto = clon.innerText.replace(/\s+/g, " ").trim();
      const nivel = parseInt(b.getAttribute("data-indent") || "0", 10);
      const sangria = "  ".repeat(nivel);

      s += `${sangria}Paso ${idx + 1}: ${texto} ${inputs.join(" ")}\n`;
    });
    return s;
  }

  prompt += serializarTablero("board-arduino", "ALGORITMO ARDUINO");

  if (!omitirPython) {
    prompt += serializarTablero("board-pc", "ALGORITMO NOTEBOOK / PC");
  }

  return prompt;
}

// 2. Copia manual del prompt con contexto incluido
function exportarLogica() {
  const promptCompleto = construirPromptCompilador();
  navigator.clipboard
    .writeText(promptCompleto)
    .then(() => {
      alert(
        "¡Prompt copiado con éxito con todo el contexto, componentes y lógica incluidos!",
      );
    })
    .catch(() => {
      window.prompt("Copia este texto manualmente:", promptCompleto);
    });
}

// 3. Compilación directa automática a través de la API
async function compilarConIA() {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("PEGA_AQUI")) {
    return alert(
      "Coloca tu API Key de Gemini en la variable GEMINI_API_KEY dentro de app.js.",
    );
  }

  const tableroArd = document.querySelectorAll(
    "#board-arduino .block-in-board",
  );
  const tableroPC = document.querySelectorAll("#board-pc .block-in-board");

  if (tableroArd.length === 0 && tableroPC.length === 0) {
    return alert("Agrega bloques a los tableros antes de compilar.");
  }

  // Comprobar si hay algún bloque secreto en el tablero de PC
  let contieneBloquesSecretos = false;
  tableroPC.forEach((b) => {
    if (verificarSiEsBloqueSecreto(b)) {
      contieneBloquesSecretos = true;
    }
  });

  const overlay = document.getElementById("overlay-cargando");
  if (overlay) overlay.style.display = "flex";

  // Si contiene bloques secretos, NO enviamos el algoritmo de PC a la IA
  const promptEntrada = construirPromptCompilador(contieneBloquesSecretos);

  let promptCompleto = "";

  if (contieneBloquesSecretos) {
    // Modo especial: compilar solo Arduino y omitir Python por completo
    promptCompleto = `
ERES UN COMPILADOR ESTRICTO PARA SISTEMAS EMBEBIDOS EDUCATIVOS (ARDUINO UNO).
Tu labor es traducir fielmente la especificación algorítmica y los componentes declarados al sketch .ino de Arduino Uno.

============================================================
REGLAS OBLIGATORIAS PARA ARDUINO (.INO):
============================================================
1. INICIALIZACIÓN SERIAL LIMPIA:
   - En setup(): usar estrictamente Serial.begin(9600); (PROHIBIDO usar 'while (!Serial);').

2. DECLARACIÓN DE HARDWARE:
   - Define constantes (const int) para todos los pines respetando estrictamente los componentes conectados declarados abajo.
   - Configura adecuadamente pinMode() en setup() para cada periférico.

3. CÁMARA HUSKYLENS 2 (DFRobot_HuskylensV2.h) - CONTRATO ESTRICTO:
   - Incluir cabecera: #include "DFRobot_HuskylensV2.h"
   - Instancia exacta: HuskylensV2 huskylens; (NUNCA usar DFRobot_HuskylensV2 como clase, PROHIBIDO usar huskylens.available() o huskylens.read()).
   - Si la conexión es SERIAL:
       #include <SoftwareSerial.h>
       SoftwareSerial huskySerial(10, 11); // 10 RX, 11 TX
       En setup(): huskySerial.begin(9600); while (!huskylens.begin(huskySerial)) { delay(500); }
   - Si la conexión es I2C:
       #include <Wire.h>
       En setup(): Wire.begin(); while (!huskylens.begin(Wire)) { delay(500); }
   - Configurar algoritmo en setup():
       huskylens.switchAlgorithm(ALGORITMO_SELECCIONADO);
       delay(500);
   - Lectura estricta en loop():
       int tagDetectado = 0;
       if (huskylens.getResult(ALGORITMO_SELECCIONADO)) {
         Result* res = (Result*)huskylens.popCachedResult(ALGORITMO_SELECCIONADO);
         if (res != nullptr) {
           tagDetectado = res->ID;
         }
       }
   - GESTIÓN DE PERSISTENCIA Y PROTOCOLO SERIAL CON PYTHON:
     * Implementa persistencia temporal con millis() (ventana de gracia de 350 ms: const unsigned long TIEMPO_PERSISTENCIA_MS = 350;).
     * Cuando se detecta un ID activo nuevo, enviar el ID por Serial (ej: Serial.println(tagDetectado);).
     * Cuando se retira la tarjeta / tag y vence la ventana de gracia, notificar obligatoriamente a Python enviando "0" (Serial.println("0");), apagar los actuadores activos y restaurar el LCD con un mensaje de espera (Fila 1: "SISTEMA LISTO", Fila 2: "Muestre un Tag").

4. DISPLAY LCD 16x2 I2C:
   - #include <Wire.h> y #include <LiquidCrystal_I2C.h>
   - Instancia: LiquidCrystal_I2C lcd(0x27, 16, 2);
   - En setup(): lcd.init(); lcd.backlight(); lcd.clear(); mostrar mensaje de bienvenida o espera.

5. ACTUADORES Y SENSORES:
   - LEDs: si hay varios asignados a diferentes IDs/estados, al activar uno apaga previamente los demás (función apagarLeds()).
   - Servomotores: #include <Servo.h> y adjuntar pines en setup().
   - Potenciómetros: rango de entrada calibrado de 0 a 253 -> usar constrain(analogRead(pin), 0, 253) y map(..., 0, 253, 0, 255) para PWM o 0 a 180 para servo.

ESPECIFICACIÓN DEL PROYECTO:
${promptEntrada}

FORMATO DE RESPUESTA OBLIGATORIO:
Responde ÚNICAMENTE un objeto JSON válido con esta estructura (para python_code devuelve un string vacío o comentario):
{
  "arduino_code": "// Código Arduino C++ completo aquí...",
  "python_code": "# Generación de Python bloqueada por el sistema."
}
`;
  } else {
    // Flujo normal: compila tanto Arduino como Pygame
    promptCompleto = `
ERES UN COMPILADOR ESTRICTO Y ARQUITECTO DE SOFTWARE PARA SISTEMAS EMBEBIDOS EDUCATIVOS (ARDUINO UNO) Y MULTIMEDIA (PYTHON PYGAME).
Tu labor es traducir fielmente la especificación algorítmica y los componentes declarados a dos códigos funcionales, profesionales y 100% libres de errores de compilación:
1. "arduino_code": sketch .ino completo para Arduino Uno.
2. "python_code": script .py completo para la notebook.

============================================================
REGLAS OBLIGATORIAS PARA ARDUINO (.INO):
============================================================
1. INICIALIZACIÓN SERIAL LIMPIA:
   - En setup(): usar estrictamente Serial.begin(9600); (PROHIBIDO usar 'while (!Serial);').

2. DECLARACIÓN DE HARDWARE:
   - Define constantes (const int) para todos los pines respetando estrictamente los componentes conectados declarados abajo.
   - Configura adecuadamente pinMode() en setup() para cada periférico.

3. CÁMARA HUSKYLENS 2 (DFRobot_HuskylensV2.h) - CONTRATO ESTRICTO:
   - Incluir cabecera: #include "DFRobot_HuskylensV2.h"
   - Instancia exacta: HuskylensV2 huskylens; (NUNCA usar DFRobot_HuskylensV2 como clase, PROHIBIDO usar huskylens.available() o huskylens.read()).
   - Si la conexión es SERIAL:
       #include <SoftwareSerial.h>
       SoftwareSerial huskySerial(10, 11); // 10 RX, 11 TX
       En setup(): huskySerial.begin(9600); while (!huskylens.begin(huskySerial)) { delay(500); }
   - Si la conexión es I2C:
       #include <Wire.h>
       En setup(): Wire.begin(); while (!huskylens.begin(Wire)) { delay(500); }
   - Configurar algoritmo en setup():
       huskylens.switchAlgorithm(ALGORITMO_SELECCIONADO);
       delay(500);
   - Lectura estricta en loop():
       int tagDetectado = 0;
       if (huskylens.getResult(ALGORITMO_SELECCIONADO)) {
         Result* res = (Result*)huskylens.popCachedResult(ALGORITMO_SELECCIONADO);
         if (res != nullptr) {
           tagDetectado = res->ID;
         }
       }
   - GESTIÓN DE PERSISTENCIA Y PROTOCOLO SERIAL CON PYTHON:
     * Implementa persistencia temporal con millis() (ventana de gracia de 350 ms: const unsigned long TIEMPO_PERSISTENCIA_MS = 350;).
     * Cuando se detecta un ID activo nuevo, enviar el ID por Serial (ej: Serial.println(tagDetectado);).
     * Cuando se retira la tarjeta / tag y vence la ventana de gracia, notificar obligatoriamente a Python enviando "0" (Serial.println("0");), apagar los actuadores activos y restaurar el LCD con un mensaje de espera (Fila 1: "SISTEMA LISTO", Fila 2: "Muestre un Tag").

4. DISPLAY LCD 16x2 I2C:
   - #include <Wire.h> y #include <LiquidCrystal_I2C.h>
   - Instancia: LiquidCrystal_I2C lcd(0x27, 16, 2);
   - En setup(): lcd.init(); lcd.backlight(); lcd.clear(); mostrar mensaje de bienvenida o espera.

5. ACTUADORES Y SENSORES:
   - LEDs: si hay varios asignados a diferentes IDs/estados, al activar uno apaga previamente los demás (función apagarLeds()).
   - Servomotores: #include <Servo.h> y adjuntar pines en setup().
   - Potenciómetros: rango de entrada calibrado de 0 a 253 -> usar constrain(analogRead(pin), 0, 253) y map(..., 0, 253, 0, 255) para PWM o 0 a 180 para servo.

============================================================
REGLAS OBLIGATORIAS PARA PYTHON (.PY):
============================================================
1. AUTO-DETECCIÓN Y LECTURA SERIAL ROBUSTA:
   - Función de detección de puerto: iterar serial.tools.list_ports.comports() y evaluar la descripción en minúsculas con .lower():
     desc = (p.description + " " + p.manufacturer if p.manufacturer else p.description).lower()
     buscar keywords como: ["arduino", "ch340", "ch341", "ftdi", "usb serial", "usb-serial"]
   - Si no coincide ninguna, usar como fallback directo el puerto sugerido por el usuario en la especificación.
   - Bucle serial no bloqueante con timeout=0.1 y lectura con decode('utf-8', errors='ignore').strip().

2. PANTALLA Y MULTIMEDIA (PYGAME):
   - Inicializar pygame y pygame.mixer.
   - Pantalla completa fondo negro (0, 0, 0) para efecto holograma OLED.
   - Control de velocidad del bucle a 30 FPS exactos (reloj.tick(30)) para evitar sobrecargar la CPU.
   - Salida limpia cerrando el puerto serial y Pygame al presionar la tecla ESC.
   - Manejo de imágenes: ruta segura en carpeta 'assets/', usar convert_alpha(), escalar proporcionalmente con pygame.transform.smoothscale() y centrar en pantalla.
   - Manejo de audio: usar pygame.mixer.music con reproducción adecuada y fadeout suave.
   - SINCRONIZACIÓN DE RESET: Al recibir "0" (retirada de tag), detener la música con pygame.mixer.music.fadeout(300), limpiar la pantalla a negro absoluto y restablecer el estado para esperar un nuevo tag.

============================================================
ESPECIFICACIÓN DEL PROYECTO:
============================================================
${promptEntrada}

============================================================
FORMATO DE RESPUESTA OBLIGATORIO:
============================================================
Responde ÚNICAMENTE un objeto JSON válido sin texto previo ni posterior:
{
  "arduino_code": "// Código Arduino C++ completo aquí...",
  "python_code": "# Código Python completo aquí..."
}
`;
  }

  const listaModelos = [
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.5-flash",
  ];

  const cuerpoPeticion = {
    contents: [{ parts: [{ text: promptCompleto }] }],
    generationConfig: {
      temperature: 0.1,
    },
  };

  let data = null;
  let ultimoErrorMsg = "";

  for (const modelo of listaModelos) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${GEMINI_API_KEY}`;
      const respuesta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpoPeticion),
      });

      if (respuesta.ok) {
        data = await respuesta.json();
        break;
      } else {
        const errData = await respuesta.json().catch(() => ({}));
        ultimoErrorMsg = errData.error?.message || `HTTP ${respuesta.status}`;
        console.warn(
          `Modelo ${modelo} no disponible (${ultimoErrorMsg}). Probando alternativa...`,
        );
      }
    } catch (e) {
      ultimoErrorMsg = e.message;
    }
  }

  if (overlay) overlay.style.display = "none";

  if (!data) {
    return alert(
      `No fue posible conectar con los modelos de IA en este momento:\n${ultimoErrorMsg}\n\nPor favor intenta nuevamente en unos instantes.`,
    );
  }

  try {
    let textoRaw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textoRaw) {
      throw new Error("Respuesta vacía del modelo de IA.");
    }

    textoRaw = textoRaw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const resultado = JSON.parse(textoRaw);
    codigoGeneradoIno =
      resultado.arduino_code || "// Error generando código Arduino";

    // Si hay bloques secretos, se bloquea la generación de Python
    if (contieneBloquesSecretos) {
      codigoGeneradoPy =
        "# =========================================================================\n" +
        "# CÓDIGO PYTHON BLOQUEADO\n" +
        "# =========================================================================\n" +
        "# Este proyecto utiliza bloques especiales de exhibición / banner.\n" +
        "# El backend de este equipo se ejecuta a través de su servidor web Flask externo.\n" +
        "# No se generó código Python para evitar sobrescribir el archivo real del proyecto.";
    } else {
      codigoGeneradoPy =
        resultado.python_code || "# Error generando código Python";
    }

    abrirModalCodigo();
  } catch (error) {
    console.error("Error al procesar la respuesta JSON de Gemini:", error);
    alert(
      `Error al procesar el código generado:\n${error.message}\n\nIntenta compilar nuevamente.`,
    );
  }
}

function abrirModalCodigo() {
  const modal = document.getElementById("modal-codigo");
  if (!modal) return;
  modal.style.display = "flex";
  cambiarTabCodigo("ino");
}

function cerrarModalCodigo() {
  const modal = document.getElementById("modal-codigo");
  if (modal) modal.style.display = "none";
}

function cambiarTabCodigo(tipo) {
  tabActiva = tipo;
  const txt = document.getElementById("txt-codigo-salida");
  const btnIno = document.getElementById("tab-btn-ino");
  const btnPy = document.getElementById("tab-btn-py");

  if (tipo === "ino") {
    txt.value = codigoGeneradoIno;
    btnIno.style.background = "#008184";
    btnPy.style.background = "#3b3f54";
  } else {
    txt.value = codigoGeneradoPy;
    btnIno.style.background = "#3b3f54";
    btnPy.style.background = "#306998";
  }
}

function copiarCodigoActual() {
  const txt = document.getElementById("txt-codigo-salida");
  if (!txt || !txt.value) return;
  navigator.clipboard.writeText(txt.value).then(() => {
    alert(
      `¡Código ${tabActiva === "ino" ? "Arduino (.ino)" : "Python (.py)"} copiado al portapapeles!`,
    );
  });
}

function descargarCodigoActual() {
  const contenido = tabActiva === "ino" ? codigoGeneradoIno : codigoGeneradoPy;
  const nombreArchivo =
    tabActiva === "ino" ? "proyecto_arduino.ino" : "main.py";
  const tipoMime = tabActiva === "ino" ? "text/x-c" : "text/x-python";

  const blob = new Blob([contenido], { type: tipoMime });
  const enlace = document.createElement("a");
  enlace.download = nombreArchivo;
  enlace.href = URL.createObjectURL(blob);
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

// =========================================================================
// ARRANQUE AUTOMÁTICO AL CARGAR LA PÁGINA
// =========================================================================
window.onload = () => {
  renderizarChipsHardware();
  construirHerramientas("arduino", "toolbox-arduino", "board-arduino");
  construirHerramientas("pc", "toolbox-pc", "board-pc");
  configurarEasterEggNotebook();

  const selTipo = document.getElementById("sel-tipo-comp");
  if (selTipo) {
    selTipo.addEventListener("change", verificarCambioTipoComponente);
    verificarCambioTipoComponente();
  }
};
