const express = require("express");
const cors = require("cors");
const path = require("path");
const jobsRoutes = require("./routes/jobs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivo HTML do tester
app.get("/tester", (req, res) => {
  res.sendFile(path.join(__dirname, "tester.html"));
});

// Rotas
app.use("/api/jobs", jobsRoutes);

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "API de Vagas de Emprego",
    version: "1.0.0",
    endpoints: {
      "GET /api/jobs": "Listar vagas (com filtros, paginação e ordenação)",
      "GET /api/jobs/:id": "Buscar vaga por ID",
      "POST /api/jobs": "Criar nova vaga",
      "PUT /api/jobs/:id": "Atualizar vaga (completa)",
      "PATCH /api/jobs/:id": "Atualizar vaga (parcial)",
      "DELETE /api/jobs/:id": "Remover vaga",
      "GET /api/jobs/stats/summary": "Estatísticas das vagas",
    },
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Documentação: http://localhost:${PORT}/docs.html`);
  console.log(`🧪 Tester UI: http://localhost:${PORT}/tester`);
});
