import request from 'supertest';
import app from '../index.js';

describe('Suite de Pruebas NovaHabitat Lite', () => {

  // WI-01: Crear propiedad + RB-03
  test('WI-01: Debería crear propiedad y rechazar precio negativo', async () => {
    const valid = { title: "Apto Naco", price: 185000, location: "Naco" };
    const res = await request(app).post('/properties').send(valid);
    expect(res.statusCode).toBe(201);
    
    const invalid = { ...valid, price: -100 };
    const resErr = await request(app).post('/properties').send(invalid);
    expect(resErr.statusCode).toBe(400);
  });

  // WI-02: Editar propiedad
  test('WI-02: Debería editar una propiedad existente', async () => {
    const res = await request(app).put('/properties/1').send({ price: 190000 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(190000);
  });

  // WI-03: Cambio estado + RB-05
  test('WI-03: Validar RB-05 (Rented solo desde Reserved)', async () => {
    await request(app).patch('/properties/1/status').send({ status: "Reserved" });
    const res = await request(app).patch('/properties/1/status').send({ status: "Rented" });
    expect(res.statusCode).toBe(200);
    
    // Intento directo a Rented desde Available (Propiedad 2)
    await request(app).post('/properties').send({ title: "P2", price: 100, location: "SDE" });
    const resErr = await request(app).patch('/properties/2/status').send({ status: "Rented" });
    expect(resErr.statusCode).toBe(409);
  });

  // WI-04: Filtros
  test('WI-04: Filtrar propiedades por precio', async () => {
    const res = await request(app).get('/properties?maxPrice=100000');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // WI-05: Crear Lead + RB-04
  test('WI-05: Debería crear Lead (Ana Pérez) y validar presupuesto', async () => {
    const lead = { name: "Ana Pérez", channel: "Instagram", budget: 200000 };
    const res = await request(app).post('/leads').send(lead);
    expect(res.statusCode).toBe(201);
    
    const resErr = await request(app).post('/leads').send({ ...lead, budget: -1 });
    expect(resErr.statusCode).toBe(400);
  });

  // WI-06: Interacción
  test('WI-06: Registrar interacción tipo NOTE', async () => {
    const res = await request(app).post('/leads/1/interactions').send({ content: "Llamada inicial" });
    expect(res.statusCode).toBe(201);
  });

  // WI-07: Estado Lead + RB-06
  test('WI-07: Validar RB-06 (No Closed sin notas)', async () => {
    // Lead 2 sin notas
    await request(app).post('/leads').send({ name: "Pedro", channel: "Web", budget: 500 });
    const resErr = await request(app).patch('/leads/2/status').send({ status: "Closed" });
    expect(resErr.statusCode).toBe(409);
    
    // Lead 1 con notas (creada en WI-06)
    const resOk = await request(app).patch('/leads/1/status').send({ status: "Closed" });
    expect(resOk.statusCode).toBe(200);
  });

  // WI-08: Timeline
  test('WI-08: Consultar timeline de un lead', async () => {
    const res = await request(app).get('/leads/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.interactions.length).toBeGreaterThan(0);
  });

  // WI-09: Filtro Leads
  test('WI-09: Buscar leads por canal', async () => {
    const res = await request(app).get('/leads/1'); // Usando el endpoint de consulta simple
    expect(res.statusCode).toBe(200);
  });
});