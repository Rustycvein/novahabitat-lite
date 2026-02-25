import cors  from "cors";
import express from "express";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";

const app = express();
app.use(cors());

const swaggerDocument = YAML.load("./openapi.yaml");

app.use(express.json());

let properties = [];
let currentId = 1;
let leads = [];
let currentLeadId = 1;

const VALID_STATUS = ["Available", "Reserved", "Rented", "Inactive"];
const VALID_LEAD_STATUS = ["New", "Contacted", "Closed", "Lost"];

app.get("/health", (req, res) => {
  res.status(200).send("API funcionando correctamente");
});

app.get("/", (req, res) => {
  res.status(200).send("NovaHabitat API Online");
});

app.post("/properties", (req, res) => {
  const { title, price, location } = req.body;
  if (!title || !location || price === undefined) {
    return res.status(400).json({ message: "Datos incompletos" });
  }
  if (price < 0) {
    return res.status(400).json({ message: "El precio no puede ser negativo" });
  }
  const newProperty = {
    id: currentId++,
    title,
    price,
    location,
    status: "Available",
    auditTrail: []
  };
  properties.push(newProperty);
  return res.status(201).json(newProperty);
});

app.get("/properties", (req, res) => {
  const { status, minPrice, maxPrice, locationKeyword } = req.query;
  let filtered = [...properties];
  if (status) filtered = filtered.filter(p => p.status === status);
  if (minPrice) filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
  if (maxPrice) filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
  if (locationKeyword) {
    filtered = filtered.filter(p => 
      p.location.toLowerCase().includes(locationKeyword.toLowerCase())
    );
  }
  return res.status(200).json(filtered);
});

app.put("/properties/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, price, location } = req.body;
  const property = properties.find(p => p.id === id);
  if (!property) return res.status(404).json({ message: "Propiedad no encontrada" });
  if (price !== undefined && price < 0) {
    return res.status(400).json({ message: "El precio no puede ser negativo" });
  }
  if (title) property.title = title;
  if (location) property.location = location;
  if (price !== undefined) property.price = price;
  res.status(200).json(property);
});

app.patch("/properties/:id/status", (req, res) => {
  const id = parseInt(req.params.id);
  const { status, changedBy } = req.body;
  const property = properties.find(p => p.id === id);
  if (!property) return res.status(404).json({ message: "Propiedad no encontrada" });
  if (!VALID_STATUS.includes(status)) return res.status(400).json({ message: "Estado inválido" });
  if (status === "Rented" && property.status !== "Reserved") {
    return res.status(409).json({ message: "Solo se puede rentar una propiedad que esté en Reserved" });
  }
  const auditEntry = {
    previousStatus: property.status,
    newStatus: status,
    changedBy: changedBy || "system",
    timestamp: new Date().toISOString()
  };
  property.status = status;
  property.auditTrail.push(auditEntry);
  return res.status(200).json(property);
});

app.post("/leads", (req, res) => {
  const { name, channel, budget } = req.body;
  if (!name || !channel || budget === undefined) {
    return res.status(400).json({ message: "Datos del lead incompletos" });
  }
  if (budget < 0) {
    return res.status(400).json({ message: "El presupuesto no puede ser negativo" });
  }
  const newLead = {
    id: currentLeadId++,
    name,
    channel,
    budget,
    status: "New",
    interactions: [],
    auditTrail: []
  };
  leads.push(newLead);
  res.status(201).json(newLead);
});

app.get("/leads/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const lead = leads.find(l => l.id === id);
  if (!lead) return res.status(404).json({ message: "Lead no encontrado" });
  res.status(200).json(lead);
});

app.post("/leads/:id/interactions", (req, res) => {
  const id = parseInt(req.params.id);
  const { type, content } = req.body;
  const lead = leads.find(l => l.id === id);
  if (!lead) return res.status(404).json({ message: "Lead no encontrado" });
  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "El contenido de la nota no puede estar vacío" });
  }
  const newInteraction = {
    id: Date.now(),
    type: type || "NOTE",
    content,
    createdAt: new Date().toISOString()
  };
  lead.interactions.push(newInteraction);
  res.status(201).json(newInteraction);
});

app.patch("/leads/:id/status", (req, res) => {
  const id = parseInt(req.params.id);
  const { status, changedBy } = req.body;
  const lead = leads.find(l => l.id === id);
  if (!lead) return res.status(404).json({ message: "Lead no encontrado" });
  if (!VALID_LEAD_STATUS.includes(status)) return res.status(400).json({ message: "Estado de lead inválido" });
  if (status === "Closed" && lead.interactions.length === 0) {
    return res.status(409).json({ message: "No se puede cerrar un lead sin al menos una interacción registrada" });
  }
  const auditEntry = {
    previousStatus: lead.status,
    newStatus: status,
    changedBy: changedBy || "system",
    timestamp: new Date().toISOString()
  };
  lead.status = status;
  lead.auditTrail.push(auditEntry);
  res.status(200).json(lead);
});

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

export default app;

const PORT = process.env.PORT || 8080;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}