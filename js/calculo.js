/* =========================================================================
   calculo.js — Lógica de medición y evaluación
   -------------------------------------------------------------------------
   1) Métrica de cada subcaracterística:   X = A / B   (0 ≤ X ≤ 1)
   2) Puntaje de cada característica:      promedio de las X aplicables
   3) Calidad global:                      Σ (puntaje × peso) / Σ pesos
   4) Nivel:                               según la tabla NIVELES
   ========================================================================= */

/** Calcula X = A / B. Devuelve null si no se puede medir o no aplica. */
function medirX(a, b, aplica) {
  const A = parseFloat(a), B = parseFloat(b);
  if (!aplica || isNaN(A) || isNaN(B) || B <= 0 || A < 0) return null;
  return Math.min(A / B, 1);              // se limita a 1 (100 %)
}

/** Promedio de las métricas válidas de una característica. */
function puntajeCaracteristica(valores) {
  const xs = valores.map(v => medirX(v[0], v[1], v[2])).filter(x => x !== null);
  if (xs.length === 0) return null;
  return xs.reduce((t, x) => t + x, 0) / xs.length;
}

/** Calcula todos los resultados de una evaluación. */
function evaluar(ev) {
  const caracteristicas = MODELO.map((c, i) => ({
    nombre: c.nombre,
    corto: c.corto,
    peso: Number(ev.pesos[i]) || 0,
    puntaje: puntajeCaracteristica(ev.valores[i]),
    metricas: c.sub.map((s, j) => {
      const v = ev.valores[i][j];
      return { nombre: s[0], a: v[0], b: v[1], aplica: v[2], x: medirX(v[0], v[1], v[2]) };
    })
  }));

  // Solo cuentan las características con peso y con al menos una medición
  const usadas = caracteristicas.filter(c => c.puntaje !== null && c.peso > 0);
  const sumaPesos = usadas.reduce((t, c) => t + c.peso, 0);
  const global = sumaPesos ? usadas.reduce((t, c) => t + c.puntaje * c.peso, 0) / sumaPesos : null;

  return { caracteristicas, global, nivel: global === null ? null : nivel(global * 100) };
}

/** Devuelve el nivel de puntuación correspondiente a un porcentaje. */
function nivel(porcentaje) {
  return NIVELES.find(n => Math.round(porcentaje) <= n.max);
}

/** Subcaracterísticas con mayor impacto de mejora: (1 − X) × peso. */
function prioridades(resultado, cantidad = 5) {
  const lista = [];
  resultado.caracteristicas.forEach((c, i) => c.metricas.forEach((m, j) => {
    if (m.x !== null && m.x < 1) {
      lista.push({ caracteristica: c.nombre, sub: m.nombre, x: m.x,
                   accion: MODELO[i].sub[j][1], impacto: (1 - m.x) * c.peso });
    }
  }));
  return lista.sort((p, q) => q.impacto - p.impacto).slice(0, cantidad);
}

/** Formatea 0.873 → "87 %". */
function pct(x) { return x === null || x === undefined ? "—" : Math.round(x * 100) + " %"; }
