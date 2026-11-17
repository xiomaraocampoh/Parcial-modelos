/* =========================================================================
   app.js — Interfaz de la aplicación (pantallas y navegación)
   -------------------------------------------------------------------------
   Pantallas:
     inicio      → explicación + historial de evaluaciones guardadas
     datos       → paso 1: datos del software (ISO 25040: establecer requisitos)
     pesos       → paso 2: importancia de cada característica (especificar)
     medicion k  → pasos 3..10: mediciones A y B de cada característica (ejecutar)
     resultado   → calidad global, nivel, radar y prioridades (concluir)
   Las evaluaciones se guardan en el navegador con localStorage.
   ========================================================================= */
(function () {
  const CLAVE = "square_evaluaciones";
  const app = document.getElementById("app");
  let ev = null;            // evaluación en curso
  let pantalla = "inicio";
  let paso = 0;             // índice de la característica en "medicion"

  /* ---------- Almacenamiento ---------- */
  function leerTodas() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { return []; }
  }
  function guardarTodas(lista) {
    try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch (e) { /* sin almacenamiento */ }
  }
  function guardar(e) {
    const lista = leerTodas().filter(x => x.id !== e.id);
    lista.unshift(e);
    guardarTodas(lista);
  }

  /* ---------- Creación de evaluaciones ---------- */
  function nueva(conEjemplo) {
    return {
      id: Date.now().toString(36),
      software: conEjemplo ? "Tienda en línea (ejemplo)" : "",
      version: conEjemplo ? "1.0" : "",
      evaluador: "",
      fecha: new Date().toISOString().slice(0, 10),
      proposito: conEjemplo ? "Evaluar si el producto puede salir a producción." : "",
      pesos: MODELO.map(c => c.peso),
      valores: MODELO.map(c => c.sub.map(s => conEjemplo ? [s[3], s[4], true] : ["", "", true]))
    };
  }

  const esc = t => String(t ?? "").replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));

  /* ---------- Barra de pasos ---------- */
  function barraPasos() {
    const nombres = ["Datos", "Pesos", ...MODELO.map(c => c.corto), "Resultado"];
    const actual = pantalla === "datos" ? 0 : pantalla === "pesos" ? 1 : pantalla === "medicion" ? 2 + paso : nombres.length - 1;
    return `<nav class="pasos" aria-label="Progreso">${nombres.map((n, i) =>
      `<span class="${i < actual ? "hecho" : i === actual ? "actual" : ""}">${i + 1}. ${n}</span>`).join("")}</nav>`;
  }

  /* ---------- Pantalla: inicio ---------- */
  function vistaInicio() {
    const lista = leerTodas();
    app.innerHTML = `
      <section class="hero">
        <div>
          <h1>Mide la calidad de cualquier software</h1>
          <p class="mute">Aplicación de evaluación basada en la familia de normas ISO/IEC 25000 (SQuaRE).
          Usa el modelo de calidad ISO/IEC 25010 con sus 8 características y 31 subcaracterísticas,
          mide cada una con métricas X = A / B (ISO/IEC 25023) y sigue el proceso de evaluación ISO/IEC 25040.</p>
          <div class="acciones">
            <button id="bNueva" type="button">Nueva evaluación</button>
            <button id="bEjemplo" class="sec" type="button">Probar con un ejemplo</button>
          </div>
        </div>
        <div class="panel-menta">
          <h3>Proceso de evaluación</h3>
          <ol>
            <li>Establecer los requisitos de la evaluación</li>
            <li>Especificar la evaluación (pesos y métricas)</li>
            <li>Diseñar la evaluación (cómo obtener A y B)</li>
            <li>Ejecutar la evaluación (registrar mediciones)</li>
            <li>Concluir la evaluación (informe y mejoras)</li>
          </ol>
        </div>
      </section>
      <section class="historial">
        <h2>Evaluaciones guardadas</h2>
        ${lista.length ? lista.map(e => {
          const r = evaluar(e);
          return `<div class="item">
            <div><b>${esc(e.software) || "Sin nombre"}</b> <span class="mute sm">v${esc(e.version) || "—"} · ${esc(e.fecha)}</span>
              <div class="sm mute">${r.nivel ? r.nivel.nombre : "Sin mediciones"}</div></div>
            <div class="pct">${pct(r.global)}</div>
            <div class="botones">
              <button class="sec" data-ver="${e.id}" type="button">Ver</button>
              <button class="sec" data-editar="${e.id}" type="button">Editar</button>
              <button class="peligro" data-borrar="${e.id}" type="button">Eliminar</button>
            </div></div>`;
        }).join("") : `<div class="vacio">Aún no hay evaluaciones. Crea una nueva o prueba con el ejemplo.</div>`}
      </section>`;

    document.getElementById("bNueva").onclick = () => { ev = nueva(false); ir("datos"); };
    document.getElementById("bEjemplo").onclick = () => { ev = nueva(true); ir("datos"); };
    app.querySelectorAll("[data-ver]").forEach(b => b.onclick = () => { ev = buscar(b.dataset.ver); ir("resultado"); });
    app.querySelectorAll("[data-editar]").forEach(b => b.onclick = () => { ev = buscar(b.dataset.editar); ir("datos"); });
    app.querySelectorAll("[data-borrar]").forEach(b => b.onclick = () => {
      // Confirmación en dos clics (sin ventanas emergentes)
      if (b.dataset.confirmar) { guardarTodas(leerTodas().filter(x => x.id !== b.dataset.borrar)); vistaInicio(); }
      else { b.dataset.confirmar = "1"; b.textContent = "¿Confirmar?"; }
    });
  }
  const buscar = id => JSON.parse(JSON.stringify(leerTodas().find(x => x.id === id)));

  /* ---------- Pantalla: datos del software ---------- */
  function vistaDatos() {
    app.innerHTML = `${barraPasos()}
      <h2>Datos del software a evaluar</h2>
      <p class="mute">Paso 1 · Establecer los requisitos de la evaluación.</p>
      <form class="form" id="f">
        <label>Nombre del software *<input id="software" value="${esc(ev.software)}" required></label>
        <label>Versión<input id="version" value="${esc(ev.version)}"></label>
        <label>Evaluador(a)<input id="evaluador" value="${esc(ev.evaluador)}"></label>
        <label>Fecha<input id="fecha" type="date" value="${esc(ev.fecha)}"></label>
        <label class="ancho">Propósito de la evaluación<textarea id="proposito">${esc(ev.proposito)}</textarea></label>
        <div class="error ancho" id="err"></div>
      </form>
      <div class="acciones">
        <button class="sec" id="bAtras" type="button">Cancelar</button>
        <button class="der" id="bSig" type="button">Siguiente</button>
      </div>`;
    document.getElementById("bAtras").onclick = () => ir("inicio");
    document.getElementById("bSig").onclick = () => {
      ["software", "version", "evaluador", "fecha", "proposito"].forEach(k => ev[k] = document.getElementById(k).value.trim());
      if (!ev.software) { document.getElementById("err").textContent = "Escribe el nombre del software."; return; }
      ir("pesos");
    };
  }

  /* ---------- Pantalla: pesos ---------- */
  function vistaPesos() {
    app.innerHTML = `${barraPasos()}
      <h2>Importancia de cada característica</h2>
      <p class="mute">Paso 2 · Especificar la evaluación. Asigna un peso (%) según lo importante que sea cada característica para este software. Deben sumar 100 %.</p>
      <div class="pesos">${MODELO.map((c, i) => `
        <div class="peso"><label for="p${i}">${c.nombre}<span class="sm mute" style="font-weight:400">${c.definicion}</span></label>
        <input id="p${i}" data-p="${i}" type="number" min="0" max="100" step="1" value="${ev.pesos[i]}"></div>`).join("")}
      </div>
      <div class="suma" id="suma"></div>
      <div class="acciones">
        <button class="sec" id="bAtras" type="button">Atrás</button>
        <button class="sec" id="bReset" type="button">Pesos por defecto</button>
        <button class="der" id="bSig" type="button">Siguiente</button>
      </div>`;
    const actualizar = () => {
      const s = ev.pesos.reduce((t, p) => t + (Number(p) || 0), 0);
      const el = document.getElementById("suma");
      el.textContent = s === 100 ? "Suma: 100 % ✓" : `Suma: ${s} % (debe ser 100 %)`;
      el.className = "suma " + (s === 100 ? "ok" : "mal");
      document.getElementById("bSig").disabled = s !== 100;
    };
    app.querySelectorAll("[data-p]").forEach(inp => inp.oninput = () => { ev.pesos[+inp.dataset.p] = Number(inp.value) || 0; actualizar(); });
    document.getElementById("bReset").onclick = () => { ev.pesos = MODELO.map(c => c.peso); vistaPesos(); };
    document.getElementById("bAtras").onclick = () => ir("datos");
    document.getElementById("bSig").onclick = () => { paso = 0; ir("medicion"); };
    actualizar();
  }

  /* ---------- Pantalla: medición de una característica ---------- */
  function vistaMedicion() {
    const c = MODELO[paso], vals = ev.valores[paso];
    app.innerHTML = `${barraPasos()}
      <div class="cabecera-c">
        <div><h2>${c.nombre}</h2><p class="mute" style="margin:0">${c.definicion}</p>
          <p class="sm mute">Peso: ${ev.pesos[paso]} % · Ingresa A y B de cada métrica. Desmarca “Aplica” si no corresponde.</p></div>
        <div class="puntaje-vivo"><span class="sm">Puntaje</span><b id="pv">—</b></div>
      </div>
      <table class="tabla">
        <thead><tr><th>Subcaracterística</th><th>Métrica</th><th>A</th><th>B</th><th>X</th><th>Aplica</th></tr></thead>
        <tbody>${c.sub.map((s, j) => `
          <tr id="r${j}">
            <td><b>${s[0]}</b></td>
            <td>X = A / B<span class="formula">A: ${s[1]}<br>B: ${s[2]}</span></td>
            <td class="num" data-l="A"><input type="number" min="0" step="any" inputmode="decimal" aria-label="A – ${s[0]}" data-j="${j}" data-k="0" value="${esc(vals[j][0])}"></td>
            <td class="num" data-l="B"><input type="number" min="0" step="any" inputmode="decimal" aria-label="B – ${s[0]}" data-j="${j}" data-k="1" value="${esc(vals[j][1])}"></td>
            <td class="x" data-l="X" id="x${j}">—</td>
            <td class="ap" data-l="Aplica"><input type="checkbox" aria-label="Aplica – ${s[0]}" data-j="${j}" data-k="2" ${vals[j][2] ? "checked" : ""}></td>
          </tr>`).join("")}
        </tbody>
      </table>
      <div class="acciones">
        <button class="sec" id="bAtras" type="button">Atrás</button>
        <button class="der" id="bSig" type="button">${paso === MODELO.length - 1 ? "Ver resultados" : "Siguiente"}</button>
      </div>`;
    const actualizar = () => {
      vals.forEach((v, j) => {
        document.getElementById("x" + j).textContent = pct(medirX(v[0], v[1], v[2]));
        document.getElementById("r" + j).classList.toggle("off", !v[2]);
      });
      document.getElementById("pv").textContent = pct(puntajeCaracteristica(vals));
    };
    app.querySelectorAll("[data-j]").forEach(inp => {
      const f = () => { const j = +inp.dataset.j, k = +inp.dataset.k; vals[j][k] = k === 2 ? inp.checked : inp.value; actualizar(); };
      inp.oninput = f; inp.onchange = f;
    });
    document.getElementById("bAtras").onclick = () => { if (paso === 0) ir("pesos"); else { paso--; ir("medicion"); } };
    document.getElementById("bSig").onclick = () => { if (paso === MODELO.length - 1) { guardar(ev); ir("resultado"); } else { paso++; ir("medicion"); } };
    actualizar();
  }

  /* ---------- Gráfico radar (SVG) ---------- */
  function dibujarRadar(svg, r) {
    const W = svg.clientWidth, H = svg.clientHeight; if (!W || !H) return;
    const chico = W < 640, n = MODELO.length;
    const R = Math.max(40, Math.min(W / 2 - (chico ? 80 : 120), H / 2 - 36)), cx = W / 2, cy = H / 2;
    const punto = (k, v) => { const a = -Math.PI / 2 + k * 2 * Math.PI / n; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
    const tinta = getComputedStyle(document.body).color;
    let h = "";
    [0.25, 0.5, 0.75, 1].forEach(v => h += `<polygon points="${MODELO.map((c, k) => punto(k, v).join(",")).join(" ")}" fill="none" stroke="#999" stroke-opacity=".35"/>`);
    MODELO.forEach((c, k) => { const [x, y] = punto(k, 1); h += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#999" stroke-opacity=".35"/>`; });
    const P = r.caracteristicas.map((c, k) => punto(k, c.puntaje ?? 0));
    h += `<polygon points="${P.map(p => p.join(",")).join(" ")}" fill="#b8f5d0" fill-opacity=".8" stroke="${tinta}" stroke-width="2"/>`;
    P.forEach(p => h += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${tinta}"/>`);
    r.caracteristicas.forEach((c, k) => {
      const a = -Math.PI / 2 + k * 2 * Math.PI / n, co = Math.cos(a), si = Math.sin(a), [x, y] = punto(k, 1);
      const ancla = Math.abs(co) < 0.2 ? "middle" : co > 0 ? "start" : "end";
      h += `<text x="${x + co * 12}" y="${y + si * 14 + (si > 0.3 ? 10 : si < -0.3 ? -4 : 4)}" text-anchor="${ancla}" font-size="${chico ? 11 : 13}" font-weight="600" fill="${tinta}">${chico ? c.corto : c.nombre} ${pct(c.puntaje)}</text>`;
    });
    svg.innerHTML = h;
  }

  /* ---------- Informe en texto ---------- */
  function informe(r) {
    const L = ["INFORME DE EVALUACIÓN DE CALIDAD DE SOFTWARE", "Norma: ISO/IEC 25000 (SQuaRE) · Modelo ISO/IEC 25010", "",
      `Software: ${ev.software}  Versión: ${ev.version || "—"}`, `Evaluador(a): ${ev.evaluador || "—"}  Fecha: ${ev.fecha}`,
      `Propósito: ${ev.proposito || "—"}`, "",
      `CALIDAD GLOBAL: ${pct(r.global)} — ${r.nivel ? r.nivel.nombre + (r.nivel.satisfactorio ? " (Satisfactorio)" : " (Insatisfactorio)") : "sin datos"}`, ""];
    r.caracteristicas.forEach(c => {
      L.push(`${c.nombre} (peso ${c.peso} %): ${pct(c.puntaje)}`);
      c.metricas.forEach(m => L.push(`   - ${m.nombre}: ${m.aplica ? `A=${m.a || "—"} / B=${m.b || "—"} → X=${pct(m.x)}` : "no aplica"}`));
    });
    L.push("", "PRIORIDADES DE MEJORA");
    prioridades(r).forEach((p, i) => L.push(`${i + 1}. ${p.sub} (${p.caracteristica}): ${pct(p.x)}`));
    return L.join("\n");
  }

  /* ---------- Pantalla: resultados ---------- */
  function vistaResultado() {
    const r = evaluar(ev), pr = prioridades(r);
    const idx = r.nivel ? NIVELES.indexOf(r.nivel) : -1;
    app.innerHTML = `${barraPasos()}
      <h1>${esc(ev.software)} <span class="mute" style="font-weight:400">v${esc(ev.version) || "—"}</span></h1>
      <p class="mute">${esc(ev.evaluador) || "Sin evaluador"} · ${esc(ev.fecha)}${ev.proposito ? " · " + esc(ev.proposito) : ""}</p>
      <section class="resumen">
        <div class="global">
          <span class="sm">Calidad global del producto</span>
          <div class="num">${pct(r.global)}</div>
          <div class="nivel">${r.nivel ? `${r.nivel.nombre} · ${r.nivel.satisfactorio ? "Satisfactorio" : "Insatisfactorio"}` : "Sin mediciones suficientes"}</div>
          <div class="escala">${NIVELES.map((n, i) => `<div class="${i === idx ? "on" : ""}">${i ? NIVELES[i - 1].max + 1 : 0}–${n.max}<br>${n.nombre}</div>`).join("")}</div>
        </div>
        <div class="radar"><svg id="radar" role="img" aria-label="Radar de las 8 características"></svg></div>
      </section>
      <section class="dos">
        <div><h2>Por característica</h2>
          ${r.caracteristicas.map(c => `<div class="fila"><span>${c.nombre} <span class="mute sm" style="white-space:nowrap">· ${c.peso} %</span></span>
            <div class="barra"><i style="width:${(c.puntaje ?? 0) * 100}%"></i></div><b>${pct(c.puntaje)}</b></div>`).join("")}
        </div>
        <div><h2>Prioridades de mejora</h2>
          <p class="sm mute">Ordenadas por impacto: (1 − X) × peso de la característica.</p>
          ${pr.length ? `<ol class="prio">${pr.map(p => `<li><b>${p.sub}</b> (${p.caracteristica}): ${pct(p.x)}. Aumentar ${p.accion}.</li>`).join("")}</ol>`
                      : `<p class="mute">Sin brechas: todas las métricas medidas están al 100 %.</p>`}
        </div>
      </section>
      <details class="detalle"><summary>Detalle de todas las métricas</summary>
        <table class="tabla"><thead><tr><th>Característica</th><th>Subcaracterística</th><th>A</th><th>B</th><th>X</th></tr></thead><tbody>
        ${r.caracteristicas.map(c => c.metricas.map(m => `<tr><td>${c.corto}</td><td>${m.nombre}</td>
          <td data-l="A">${m.aplica ? esc(m.a) || "—" : "N/A"}</td><td data-l="B">${m.aplica ? esc(m.b) || "—" : "N/A"}</td><td class="x" data-l="X">${pct(m.x)}</td></tr>`).join("")).join("")}
        </tbody></table>
      </details>
      <div class="acciones">
        <button class="sec" id="bInicio" type="button">Volver al inicio</button>
        <button class="sec" id="bEditar" type="button">Editar mediciones</button>
        <button class="sec" id="bImprimir" type="button">Imprimir / PDF</button>
        <button class="der" id="bDescargar" type="button">Descargar informe (.txt)</button>
      </div>`;

    const svg = document.getElementById("radar");
    dibujarRadar(svg, r);
    new ResizeObserver(() => dibujarRadar(svg, r)).observe(svg);
    document.getElementById("bInicio").onclick = () => ir("inicio");
    document.getElementById("bEditar").onclick = () => { paso = 0; ir("medicion"); };
    document.getElementById("bImprimir").onclick = () => window.print();
    document.getElementById("bDescargar").onclick = () => {
      const blob = new Blob([informe(r)], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `informe-calidad-${(ev.software || "software").replace(/\s+/g, "-").toLowerCase()}.txt`;
      a.click();
      // Se libera el enlace un momento después para que la descarga alcance a iniciar
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
  }

  /* ---------- Navegación ---------- */
  function ir(destino) {
    pantalla = destino;
    ({ inicio: vistaInicio, datos: vistaDatos, pesos: vistaPesos, medicion: vistaMedicion, resultado: vistaResultado })[destino]();
    window.scrollTo(0, 0);
  }
  document.getElementById("irInicio").onclick = () => ir("inicio");
  ir("inicio");
})();
