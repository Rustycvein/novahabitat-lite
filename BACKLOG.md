# NovaHabitat Lite – Product Backlog (MVP)

## Distribución MoSCoW
Must: 6
Should: 2
Could: 1
Won’t: 1

---

## WI-01 – Crear propiedad
Tipo: RF
Prioridad: Must

Descripción:
Permite registrar una propiedad con título, ubicación, precio y estado inicial.

Criterios de aceptación:

Given un payload válido con título, ubicación, precio mayor o igual a 0 y estado "Available"
When se envía una solicitud POST /properties
Then el sistema responde 201 con el objeto creado y un id único

And si el precio es negativo
Then responde 400 con mensaje claro

And si el estado no es uno de los permitidos (Available, Reserved, Rented, Inactive)
Then responde 400

Endpoint involucrado:
POST /properties

Reglas de negocio relacionadas:
RB-01, RB-03, RB-08

---

## WI-02 – Editar propiedad
Tipo: RF
Prioridad: Must

Descripción:
Permite actualizar título, ubicación o precio de una propiedad existente.

Criterios de aceptación:

Given una propiedad existente
When se envía PUT /properties/{id} con datos válidos
Then responde 200 con los datos actualizados

And si el id no existe
Then responde 404

And si el precio es negativo
Then responde 400

Endpoint involucrado:
PUT /properties/{id}

Reglas de negocio relacionadas:
RB-03, RB-08

---

## WI-03 – Cambiar estado de propiedad con auditoría
Tipo: RF
Prioridad: Must

Descripción:
Permite cambiar el estado de una propiedad registrando quién realizó el cambio y cuándo.

Regla de transición definida (implementación RB-05):
Una propiedad solo puede pasar a "Rented" si su estado actual es "Reserved".

Criterios de aceptación:

Given una propiedad existente en estado "Available"
When se cambia a "Reserved" enviando changedBy
Then responde 200 y guarda registro en auditTrail con changedBy y timestamp

And si se intenta cambiar a "Rented" desde un estado distinto de "Reserved"
Then responde 409

Endpoint involucrado:
PATCH /properties/{id}/status

Reglas de negocio relacionadas:
RB-01, RB-05, RB-07, RB-08

---

## WI-04 – Listar y filtrar propiedades
Tipo: RF
Prioridad: Must

Descripción:
Permite consultar propiedades con filtros opcionales.

Criterios de aceptación:

Given propiedades registradas
When se consulta GET /properties con filtros opcionales (status, minPrice, maxPrice, locationKeyword)
Then responde 200 con la lista filtrada correctamente

And si no hay resultados
Then responde 200 con lista vacía

Endpoint involucrado:
GET /properties

Reglas de negocio relacionadas:
RB-08

---

## WI-05 – Crear lead
Tipo: RF
Prioridad: Must

Descripción:
Permite registrar un lead con nombre, canal de entrada, criterios de búsqueda y presupuesto.

Criterios de aceptación:

Given un payload válido con nombre, canal y presupuesto mayor o igual a 0
When se envía POST /leads
Then responde 201 con id único y estado inicial "New"

And si el presupuesto es negativo
Then responde 400

And si el estado no es uno de los permitidos (New, Contacted, Closed, Lost)
Then responde 400

Endpoint involucrado:
POST /leads

Reglas de negocio relacionadas:
RB-02, RB-04, RB-08

---

## WI-06 – Registrar interacción en un lead
Tipo: RF
Prioridad: Must

Descripción:
Permite registrar una interacción tipo NOTE asociada a un lead.

Criterios de aceptación:

Given un lead existente
When se envía POST /leads/{id}/interactions con contenido no vacío
Then responde 201 y la interacción queda asociada al lead

And si el lead no existe
Then responde 404

And si el contenido está vacío
Then responde 400

Endpoint involucrado:
POST /leads/{id}/interactions

Reglas de negocio relacionadas:
RB-08

---

## WI-07 – Cambiar estado de lead
Tipo: RF
Prioridad: Should

Descripción:
Permite cambiar el estado de un lead registrando auditoría.

Regla definida (implementación RB-06):
No se permite cambiar un lead a "Closed" si no tiene al menos una interacción registrada.

Criterios de aceptación:

Given un lead existente
When se cambia a "Contacted"
Then responde 200

And cuando se intenta cambiar a "Closed" sin interacciones registradas
Then responde 409

Endpoint involucrado:
PATCH /leads/{id}/status

Reglas de negocio relacionadas:
RB-02, RB-06, RB-07, RB-08

---

## WI-08 – Consultar lead con timeline
Tipo: RF
Prioridad: Should

Descripción:
Permite consultar un lead incluyendo sus interacciones ordenadas por fecha.

Criterios de aceptación:

Given un lead con interacciones registradas
When se consulta GET /leads/{id}
Then responde 200 incluyendo las interacciones ordenadas por fecha ascendente

And si el id no existe
Then responde 404

Endpoint involucrado:
GET /leads/{id}

Reglas de negocio relacionadas:
RB-08

---

## WI-09 – Buscar leads por canal y estado
Tipo: RF
Prioridad: Could

Descripción:
Permite filtrar leads por canal de entrada y estado.

Criterios de aceptación:

Given múltiples leads registrados
When se consulta GET /leads?channel=Instagram&status=Contacted
Then responde 200 con los leads filtrados correctamente

And si no hay resultados
Then responde 200 con lista vacía

Endpoint involucrado:
GET /leads

Reglas de negocio relacionadas:
RB-02, RB-08

---

## WI-10 – Generación automática de contratos de alquiler/venta
Tipo: RF
Prioridad: Won’t

Descripción:
La generación automática de contratos de alquiler o venta queda fuera del alcance del MVP NovaHabitat Lite y se considera parte de una futura versión del sistema.

Estado:
No implementado en esta entrega.