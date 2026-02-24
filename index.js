import express from "express";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";

const app = express();
const swaggerDocument = YAML.load("./openapi.yaml");

app.use(express.json());
let properties = [];
let currentId = 1;

app.post("/properties", (req,res) =>{
    const {title, price, location} = req.body;

    if(!title || !price || !location){
        return res.status(400).json({message:"Datos incompletos"});
    }

    const newProperty = {
        id: currentId++,
        title,
        price,
        location,
        status: "available"
    }

    properties.push(newProperty);
    res.status(201).json(newProperty);
})


app.get("/properties", (req, res) =>{
    res.status(200).json(properties);
});

app.patch("/properties/:id/status", (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  const property = properties.find(p => p.id === id);

  if (!property) {
    return res.status(404).json({ message: "Propiedad no encontrada" });
  }

  if (!["available", "reserved"].includes(status)) {
    return res.status(400).json({ message: "Estado inválido" });
  }

  property.status = status;

  res.status(200).json(property);
});

app.use("/docs" , swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});