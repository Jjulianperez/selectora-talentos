# Tareas Pendientes — Selectora Talentos

## Seguridad (Prioridad Alta)
- [ ] Proteger ruta `/admin` con autenticación robusta (sesión + expires)
- [ ] Implementar RLS (Row Level Security) en Supabase para `candidates` y `vacancies`
- [ ] Validar y sanitizar todos los inputs del formulario de postulación (lado servidor)
- [ ] Limitar tasa de envío (rate limiting) para evitar spam de postulaciones
- [ ] Agregar CAPTCHA en el formulario de postulación
- [ ] Proteger el storage de archivos (CVs) contra acceso público no autorizado
- [ ] Usar variables de entorno para todas las claves y URLs sensibles

## UX / Funcionalidad (Prioridad Media)
- [ ] Agregar edición/borrado de vacantes desde el panel admin
- [ ] Notificaciones en tiempo real (WebSocket / Supabase Realtime) para nuevas postulaciones
- [ ] Exportar postulaciones a PDF o Excel con un solo clic
- [ ] Confirmación por email al postulante cuando se recibe su postulación
- [ ] Barra de búsqueda y filtros combinados en la tabla de candidatos
- [ ] Paginación o scroll infinito en la tabla de candidatos (si hay muchos)
- [ ] Vista de detalle de vacante con candidatos que aplicaron a esa vacante
- [ ] Permitir al candidato editar su postulación dentro de un plazo (ej: 24 h)
- [ ] Feedback visual más claro cuando se completa cada test (check + transición)
- [ ] Tooltips o ayuda contextual en los tests psicotécnicos

## Tests Psicotécnicos (Prioridad Media)
- [ ] Agregar más módulos de test (personalidad, habilidades blandas, etc.)
- [ ] Mostrar resultados gráficos (radar chart, barras) en el perfil del admin
- [ ] Permitir al admin ver la evolución de un candidato si se postula varias veces
- [ ] Tiempo límite por test (opcional, con cuenta regresiva visible)
- [ ] Guardar progreso de tests aunque el usuario cierre el navegador (localStorage)

## Infraestructura / DevOps (Prioridad Baja)
- [ ] Configurar CI/CD para deploy automático (GitHub Actions + Vercel)
- [ ] Agregar tests automatizados (unitarios + e2e con Playwright o Cypress)
- [ ] Monitoreo de errores (Sentry o similar)
- [ ] Backup automático de la base de datos Supabase
- [ ] Analítica básica (cuántas postulaciones por día, tests más populares, etc.)
- [ ] Auditoría de accesibilidad (WCAG)

## Deuda Técnica (Prioridad Baja)
- [ ] Migrar a TypeScript estricto (strict mode) en `tsconfig.json`
- [ ] Extraer constantes de estilo (colores, spacing) a un tema CSS o Tailwind config
- [ ] Componentizar secciones repetitivas del formulario de postulación
- [ ] Estandarizar manejo de errores con un hook personalizado `useAsync`
- [ ] Agregar tipos Tipados para las respuestas de Supabase (generar tipos con `supabase gen types`)
