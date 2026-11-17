/* =========================================================================
   modelo.js — Modelo de calidad del producto ISO/IEC 25010 (familia SQuaRE)
   -------------------------------------------------------------------------
   Cada característica tiene:
     - nombre, nombre corto (para el gráfico), definición y peso por defecto (%)
     - subcaracterísticas, cada una con una métrica de la forma X = A / B
       (enfoque de medición de ISO/IEC 25023):
         [nombre, descripción de A, descripción de B, ejemploA, ejemploB]
   ========================================================================= */

const MODELO = [
  {
    nombre: "Adecuación funcional", corto: "Funcional", peso: 15,
    definicion: "Grado en que el producto proporciona funciones que satisfacen las necesidades declaradas e implícitas.",
    sub: [
      ["Completitud funcional", "funciones implementadas", "funciones especificadas", 46, 50],
      ["Corrección funcional", "casos de prueba con resultado correcto", "casos de prueba ejecutados", 188, 200],
      ["Pertinencia funcional", "funciones que apoyan las tareas del usuario", "funciones requeridas para esas tareas", 27, 30]
    ]
  },
  {
    nombre: "Eficiencia de desempeño", corto: "Desempeño", peso: 10,
    definicion: "Desempeño relativo a la cantidad de recursos utilizados bajo determinadas condiciones.",
    sub: [
      ["Comportamiento temporal", "transacciones dentro del tiempo objetivo", "transacciones medidas", 410, 500],
      ["Utilización de recursos", "escenarios bajo el umbral de CPU/memoria", "escenarios medidos", 8, 10],
      ["Capacidad", "usuarios concurrentes soportados", "usuarios concurrentes requeridos", 400, 500]
    ]
  },
  {
    nombre: "Compatibilidad", corto: "Compatib.", peso: 10,
    definicion: "Capacidad de intercambiar información con otros sistemas y/o compartir el mismo entorno.",
    sub: [
      ["Coexistencia", "productos con los que coexiste sin degradarse", "productos del entorno probados", 5, 5],
      ["Interoperabilidad", "formatos e interfaces intercambiados correctamente", "formatos e interfaces requeridos", 7, 8]
    ]
  },
  {
    nombre: "Usabilidad", corto: "Usabilidad", peso: 15,
    definicion: "Capacidad del producto para ser entendido, aprendido, usado y resultar atractivo al usuario.",
    sub: [
      ["Capacidad para reconocer su adecuación", "usuarios que identifican para qué sirve", "usuarios consultados", 17, 20],
      ["Capacidad de aprendizaje", "usuarios que completan la tarea sin ayuda", "usuarios observados", 14, 20],
      ["Operabilidad", "funciones con operación consistente", "funciones revisadas", 36, 40],
      ["Protección contra errores de usuario", "entradas inválidas controladas", "entradas inválidas probadas", 42, 50],
      ["Estética de la interfaz de usuario", "pantallas conformes a la guía de estilo", "pantallas revisadas", 22, 25],
      ["Accesibilidad", "criterios WCAG AA cumplidos", "criterios evaluados", 30, 50]
    ]
  },
  {
    nombre: "Fiabilidad", corto: "Fiabilidad", peso: 15,
    definicion: "Capacidad de desempeñar funciones especificadas bajo condiciones y periodo de tiempo determinados.",
    sub: [
      ["Madurez", "fallas corregidas antes de la entrega", "fallas detectadas", 57, 60],
      ["Disponibilidad", "horas en operación", "horas programadas", 715, 720],
      ["Tolerancia a fallos", "fallos inyectados que no detienen el servicio", "fallos inyectados", 8, 10],
      ["Capacidad de recuperación", "recuperaciones dentro del tiempo objetivo", "interrupciones ocurridas", 4, 5]
    ]
  },
  {
    nombre: "Seguridad", corto: "Seguridad", peso: 15,
    definicion: "Capacidad de proteger la información y los datos frente a accesos no autorizados.",
    sub: [
      ["Confidencialidad", "datos sensibles cifrados o protegidos", "datos sensibles identificados", 18, 20],
      ["Integridad", "intentos de alteración bloqueados", "intentos de alteración probados", 19, 20],
      ["No repudio", "eventos críticos con registro firmado o trazable", "eventos críticos", 9, 12],
      ["Responsabilidad", "acciones de usuario registradas en auditoría", "acciones auditables", 20, 25],
      ["Autenticidad", "intentos de suplantación rechazados", "intentos de suplantación probados", 15, 15]
    ]
  },
  {
    nombre: "Mantenibilidad", corto: "Mantenib.", peso: 10,
    definicion: "Capacidad del producto para ser modificado de forma efectiva y eficiente.",
    sub: [
      ["Modularidad", "componentes con bajo acoplamiento", "componentes del sistema", 16, 20],
      ["Reusabilidad", "activos reutilizables", "activos desarrollados", 9, 15],
      ["Analizabilidad", "fallas diagnosticadas en el tiempo objetivo", "fallas analizadas", 11, 15],
      ["Capacidad para ser modificado", "cambios sin defectos nuevos", "cambios realizados", 22, 25],
      ["Capacidad para ser probado", "funciones con pruebas automatizadas", "funciones totales", 30, 50]
    ]
  },
  {
    nombre: "Portabilidad", corto: "Portabil.", peso: 10,
    definicion: "Capacidad de ser transferido de un entorno de hardware, software u operación a otro.",
    sub: [
      ["Adaptabilidad", "entornos donde funciona correctamente", "entornos objetivo", 5, 6],
      ["Capacidad para ser instalado", "instalaciones exitosas", "intentos de instalación", 19, 20],
      ["Capacidad para ser reemplazado", "funciones del sistema anterior cubiertas", "funciones del sistema anterior", 12, 15]
    ]
  }
];

/* Niveles de puntuación para interpretar el resultado (proceso de evaluación
   ISO/IEC 25040). "max" es el límite superior del rango en %. */
const NIVELES = [
  { max: 25,  nombre: "Inaceptable",            satisfactorio: false },
  { max: 50,  nombre: "Mínimamente aceptable",  satisfactorio: false },
  { max: 85,  nombre: "Rango objetivo",         satisfactorio: true  },
  { max: 100, nombre: "Excede los requisitos",  satisfactorio: true  }
];
