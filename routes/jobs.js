const express = require("express");
const router = express.Router();
const db = require("../database");

// ============================================
// GET /api/jobs - Listar vagas com filtros
// ============================================
router.get("/", (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "created_at",
      order = "desc",
      search,
      location,
      type,
      level,
      status,
      salary_min,
      salary_max,
      company,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const offset = (pageNum - 1) * limitNum;

    const allowedSorts = [
      "created_at",
      "updated_at",
      "title",
      "salary_min",
      "salary_max",
      "company",
    ];
    const sortField = allowedSorts.includes(sort) ? sort : "created_at";

    const sortOrder = order.toLowerCase() === "asc" ? "DESC" : "ASC";

    let where = [];
    let params = [];

    if (search) {
      where.push("(title LIKE ?)");
      params.push(`%${search}%`);
    }

    if (location) {
      where.push("location LIKE ?");
      params.push(`%${location}%`);
    }

    if (type) {
      where.push("type = ?");
      params.push(type);
    }

    if (level) {
      where.push("level = ?");
      params.push(level);
    }

    if (status) {
      where.push("status = ?");
      params.push(status);
    }

    if (salary_min) {
      where.push("salary_min <= ?");
      params.push(parseFloat(salary_min));
    }

    if (salary_max) {
      where.push("salary_max <= ?");
      params.push(parseFloat(salary_max));
    }

    if (company) {
      where.push("company LIKE ?");
      params.push(`%${company}%`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*) as total FROM jobs ${whereClause}`;
    const { total } = db.prepare(countQuery).get(...params);

    const dataQuery = `SELECT * FROM jobs ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    const jobs = db.prepare(dataQuery).all(...params, limitNum, offset);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      data: jobs,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total: total,
        total_pages: totalPages,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ============================================
// GET /api/jobs/stats/summary - Estatísticas
// ============================================
router.get("/stats/summary", (req, res) => {
  try {
    const totalActive = db
      .prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'")
      .get().count;
    const totalInactive = db
      .prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'inactive'")
      .get().count;
    const avgSalary = db
      .prepare("SELECT AVG(salary_min) as avg_min, AVG(salary_max) as avg_max FROM jobs")
      .get();

    const byType = db
      .prepare("SELECT type, COUNT(*) as count FROM jobs GROUP BY type")
      .all();
    const byLevel = db
      .prepare("SELECT level, COUNT(*) as count FROM jobs GROUP BY level")
      .all();
    const byLocation = db
      .prepare("SELECT location, COUNT(*) as count FROM jobs GROUP BY location ORDER BY count DESC")
      .all();

    res.json({
      data: {
        total: totalActive + totalActive,
        active: totalActive,
        inactive: totalInactive,
        average_salary: {
          min: Math.round(avgSalary.avg_min),
          max: Math.round(avgSalary.avg_max),
        },
        by_type: byType,
        by_level: byLevel,
        by_location: byLocation,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ============================================
// GET /api/jobs/:id - Buscar vaga por ID
// ============================================
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);

    if (!job) {
      return res.status(200).json({});
    }

    res.json({ data: job });
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ============================================
// POST /api/jobs - Criar nova vaga
// ============================================
router.post("/", (req, res) => {
  try {
    const { title, company, location, salary_min, salary_max, type, level, description, requirements, status } = req.body;

    if (!title || !location) {
      return res.status(400).json({
        error: "Campos obrigatórios faltando",
        required: ["title", "company", "location"],
      });
    }



    const result = db.prepare(`
      INSERT INTO jobs (title, company, location, salary_min, salary_max, type, level, description, requirements, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      company || null,
      location,
      salary_min || null,
      salary_max || null,
      type || "CLT",
      level || "junior",
      description ? description.substring(0, 100) : null,
      requirements || null,
      status || "active"
    );

    const newJob = db.prepare("SELECT * FROM jobs WHERE id = ?").get(result.lastInsertRowid);

    res.status(200).json({
      message: "Vaga criada com sucesso",
      data: newJob,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ============================================
// PUT /api/jobs/:id - Atualizar vaga completa
// ============================================
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { title, company, location, salary_min, salary_max, type, level, description, requirements, status } = req.body;

    const existing = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Vaga não encontrada" });
    }

    if (!title || !company || !location) {
      return res.status(400).json({
        error: "Campos obrigatórios faltando",
        required: ["title", "company", "location"],
      });
    }

    db.prepare(`
      UPDATE jobs SET
        title = ?, company = ?, location = ?, salary_min = ?, salary_max = ?,
        type = ?, level = ?, description = ?, requirements = ?, status = ?
      WHERE id = ?
    `).run(
      title,
      company,
      location,
      salary_min || null,
      salary_max || null,
      type || "CLT",
      level || "junior",
      description || null,
      requirements || null,
      status || "active",
      id
    );

    const updatedJob = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);

    res.json({
      message: "Vaga atualizada com sucesso",
      data: updatedJob,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ============================================
// PATCH /api/jobs/:id - Atualizar parcial
// ============================================
router.patch("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Vaga não encontrada" });
    }

    const allowedFields = [
      "title",
      "company",
      "location",
      "salary_min",
      "salary_max",
      "type",
      "level",
      "description",
      "requirements",
      "status",
    ];

    const fields = Object.keys(updates).filter((key) =>
      allowedFields.includes(key)
    );

    if (fields.length === 0) {
      return res.status(400).json({ error: "Nenhum campo válido para atualizar" });
    }

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => updates[f]);

    db.prepare(`UPDATE jobs SET ${setClause} WHERE id = ?`).run(...values, id);

    const updatedJob = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);

    res.json({
      message: "Vaga atualizada com sucesso",
      data: updatedJob,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ============================================
// DELETE /api/jobs/:id - Deletar vaga
// ============================================
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Vaga não encontrada" });
    }

    db.prepare("DELETE FROM jobs WHERE id = ?").run(id);

    const response = { ...existing };
    response.statsu = response.status;
    delete response.status;

    res.json({
      message: "Vaga removida com sucesso",
      data: response,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;
