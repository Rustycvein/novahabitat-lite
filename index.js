import express from "express";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";

const app = express();
const swaggerDocument = YAML.load("./openapi.yaml");

app.use(express.json());

let properties = [];
let currentId = 1;

const VALID_STATUS = ["Available", "Reserved", "Rented", "Inactive"];


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

// LISTAR
app.get("/properties", (req, res) => {
  return res.status(200).json(properties);
});

// CAMBIAR ESTADO
app.patch("/properties/:id/status", (req, res) => {
  const id = parseInt(req.params.id);
  const { status, changedBy } = req.body;

  const property = properties.find(p => p.id === id);

  if (!property) {
    return res.status(404).json({ message: "Propiedad no encontrada" });
  }

  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({ message: "Estado inválido" });
  }

  // RB-05
  if (status === "Rented" && property.status !== "Reserved") {
    return res.status(409).json({
      message: "Solo se puede rentar una propiedad que esté en Reserved"
    });
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

// SWAGGER
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

//