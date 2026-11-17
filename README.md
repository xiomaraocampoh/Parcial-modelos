# Medidor de Calidad de Software — ISO/IEC 25000 (SQuaRE)

Aplicación web para medir la calidad de cualquier producto de software usando la familia de normas **ISO/IEC 25000 (SQuaRE)**.

## Cómo ejecutarla
No necesita instalación ni internet. Abre `index.html` con doble clic en cualquier navegador (Chrome, Edge o Firefox).

Si prefieres usar un servidor local, puedes usar la extensión *Live Server* de VS Code o ejecutar `python -m http.server` dentro de la carpeta y abrir `http://localhost:8000`.

## Qué hace
1. **Datos:** registra el software, la versión, el evaluador, la fecha y el propósito de la evaluación.
2. **Pesos:** asigna la importancia (%) de cada una de las 8 características. Los pesos deben sumar 100 %.
3. **Medición:** para cada subcaracterística ingresas A y B y la app calcula **X = A / B**.
4. **Resultado:** muestra la calidad global, el nivel de puntuación, un gráfico de radar, los puntajes por característica y las prioridades de mejora.
5. **Historial:** guarda las evaluaciones en el navegador (localStorage) para verlas, editarlas o eliminarlas.
6. **Informe:** se puede descargar en .txt o imprimir/guardar como PDF.

## Relación con SQuaRE
| División | Norma | Uso en la app |
|---|---|---|
| 2501n – Modelo de calidad | ISO/IEC 25010 | 8 características y 31 subcaracterísticas (`js/modelo.js`) |
| 2502n – Medición | ISO/IEC 25023 | Métricas X = A / B (`js/calculo.js`) |
| 2504n – Evaluación | ISO/IEC 25040 | Flujo de pasos, ponderación y niveles de puntuación (`js/app.js`) |

## Fórmulas
- Métrica: `X = A / B`, limitada entre 0 y 1
- Puntaje de una característica: promedio de sus X aplicables
- Calidad global: `Σ (puntaje × peso) / Σ pesos`
- Prioridad de mejora: `(1 − X) × peso`

## Niveles de puntuación
| Rango | Nivel | Resultado |
|---|---|---|
| 0–25 % | Inaceptable | Insatisfactorio |
| 26–50 % | Mínimamente aceptable | Insatisfactorio |
| 51–85 % | Rango objetivo | Satisfactorio |
| 86–100 % | Excede los requisitos | Satisfactorio |

## Estructura
```
medidor-calidad-square/
├── index.html        Estructura de la página
├── css/styles.css    Estilos (incluye vista móvil e impresión)
└── js/
    ├── modelo.js     Modelo ISO/IEC 25010 y niveles de puntuación
    ├── calculo.js    Lógica de medición y evaluación
    └── app.js        Pantallas, navegación y almacenamiento
```

## Tecnologías
HTML5, CSS3 y JavaScript sin librerías externas.
