# Demo: recorrido de mantenimiento (Espacio)

Edificio ficticio **Edificio Demo Allviewser**. Nada de esto es un inmueble real.

## Pasos (modo directo o inmersivo)

1. Abrir `http://localhost:3000/espacio`.
2. Seleccionar la tubería de aseo planta 1 (lista o plano).
3. Revisar la ficha (hechos, desconocidos, documentos).
4. Crear una incidencia (actor residente) o pulsar **Ejecutar recorrido completo**.
5. Con administrador: asignar al técnico.
6. Con técnico: marcar en progreso y anexar evidencia demo.
7. Solicitar revisión.
8. Con revisor: verificar y cerrar.
9. Abrir **Línea de tiempo** y **Pasaporte**.
10. **Reiniciar demo** y comprobar que la semilla vuelve y la incidencia cerrada ya no está (o ejecutar de nuevo el flujo para ver persistencia durante la sesión).

## Roles de demostración

| Actor | Rol |
|-------|-----|
| Olivia Observadora | solo lectura |
| René Residente | crea incidencias |
| Tania Técnica | trabaja y anexa evidencia |
| Ricardo Revisor | cierra tras revisión |
| Ana Administradora | asigna / confirma borradores / extensiones |

## Aceptación

- Persistencia en `data/space/state.json`
- Restricción por rol
- Evidencia obligatoria antes de revisión/cierre
- Conflicto de revisión optimista
- Asistente responde «Información no disponible» ante precios desconocidos
