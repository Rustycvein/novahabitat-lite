## NovaHabitat Lite - Gestión Inmobiliaria
Sistema interno diseñado para centralizar el catálogo de propiedades y la gestión de leads (CRM básico) de NovaHabitat. Este proyecto sigue un enfoque API First y está desplegado en un entorno público.

URL del Sistema: https://novahabitat-lite-nuuo.onrender.com

Salud del Sistema: GET /health (Retorna 200 OK)

## Guía de Inicio Rápido
Ejecución Local
Instala las dependencias: npm install

Inicia el servidor: npm start (o node server.js)

El servidor correrá por defecto en: http://localhost:8080

Ejecución de Pruebas (Tests)
Para validar las Reglas de Negocio (RB) y los Work Items:

Bash
npm test
Resultado actual: 9 tests pasados satisfactoriamente (Jest + Supertest).

## Documentación de la API
Puedes probar los endpoints y ver el contrato completo de la siguiente forma:

Swagger UI: Accediendo a la ruta /docs en la URL desplegada.

Archivo: openapi.yaml disponible en la raíz del repositorio.

## Tabla de Trazabilidad (Endpoint -> RF)
Endpoint	Work Item (RF)	Prioridad
POST /properties	WI-01: Crear propiedad	Must
PUT /properties/:id	WI-02: Editar propiedad	Must
PATCH /properties/:id/status	WI-03: Cambiar estado (Propiedad)	Must
GET /properties	WI-04: Listar y filtrar propiedades	Must
POST /leads	WI-05: Crear lead	Must
POST /leads/:id/interactions	WI-06: Registrar interacción	Must
PATCH /leads/:id/status	WI-07: Cambiar estado (Lead)	Should
GET /leads/:id	WI-08: Consultar lead con timeline	Should
GET /leads	WI-09: Buscar leads por filtros	Could
No aplica	WI-10: Generación de contratos	Won’t

## Reglas de Negocio Implementadas (RB)
RB-01/02: Validación estricta de estados permitidos para propiedades y leads.

RB-03/04: El sistema rechaza precios o presupuestos negativos (HTTP 400).

RB-05: Una propiedad solo puede pasar a Rented si su estado actual es Reserved.

RB-06: No se permite cambiar un lead a Closed sin al menos una interacción registrada (HTTP 409).

RB-07: Registro automático de auditoría (changedBy y timestamp) en cambios de estado.

RB-08: Respuestas de error claras con códigos HTTP estandarizados.

## Decisiones y Trade-offs
Persistencia Volátil: Se utiliza almacenamiento en memoria para este MVP Lite con el fin de agilizar la ejecución y despliegue, asumiendo el trade-off de pérdida de datos al reiniciar el servidor.

Priorización MoSCoW: Se decidió dejar la generación de contratos (WI-10) como Won’t Have para asegurar la robustez de la lógica de auditoría y transiciones de estado en la API.

## Datos de Prueba Obligatorios

Propiedad: "Apto 2 hab en Naco", 185,000 USD, Ubicación: Naco, Estado: Available.

Lead: "Ana Pérez", Canal: Instagram, Presupuesto: 200,000.
