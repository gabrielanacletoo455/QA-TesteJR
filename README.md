# 📋 API de Vagas de Emprego - Documentação

API REST para gerenciamento e busca de vagas de emprego.

## 🚀 Como rodar

```bash
npm install
npm run seed    # Popular banco com dados de exemplo
npm start       # Iniciar servidor na porta 3000
```

---

## 📡 Endpoints

### Base URL: `http://localhost:3000`

---

### 1. Listar Vagas

```
GET /api/jobs
```

**Query Parameters:**

| Parâmetro    | Tipo    | Padrão       | Descrição                                              |
| ------------ | ------- | ------------ | ------------------------------------------------------ |
| `page`       | number  | 1            | Número da página                                       |
| `limit`      | number  | 10           | Itens por página                                       |
| `sort`       | string  | `created_at` | Campo de ordenação: `created_at`, `title`, `salary_min`, `salary_max`, `company`, `updated_at` |
| `order`      | string  | `desc`       | Direção: `asc` ou `desc`                               |
| `search`     | string  | -            | Busca por texto em `title`, `description` e `requirements` |
| `location`   | string  | -            | Filtrar por localização (parcial)                      |
| `type`       | string  | -            | Filtrar por tipo: `CLT`, `PJ`, `Estágio`, `Freelancer` |
| `level`      | string  | -            | Filtrar por nível: `estagio`, `junior`, `pleno`, `senior` |
| `status`     | string  | -            | Filtrar por status: `active`, `inactive`               |
| `salary_min` | number  | -            | Salário mínimo (vagas com salário >= este valor)       |
| `salary_max` | number  | -            | Salário máximo (vagas com salário <= este valor)       |
| `company`    | string  | -            | Filtrar por empresa (parcial)                          |

**Exemplo:**
```
GET /api/jobs?page=1&limit=5&sort=salary_min&order=asc&level=pleno&status=active
```

**Resposta:**
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 5,
    "total": 12,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### 2. Buscar Vaga por ID

```
GET /api/jobs/:id
```

**Resposta de sucesso (200):**
```json
{
  "data": {
    "id": 1,
    "title": "Desenvolvedor Frontend React",
    "company": "TechBrasil",
    ...
  }
}
```

**Resposta de erro (404):**
```json
{
  "error": "Vaga não encontrada"
}
```

---

### 3. Criar Nova Vaga

```
POST /api/jobs
```

**Body (JSON):**
```json
{
  "title": "Desenvolvedor Full Stack",
  "company": "MinhaEmpresa",
  "location": "Remoto",
  "salary_min": 5000,
  "salary_max": 9000,
  "type": "CLT",
  "level": "pleno",
  "description": "Desenvolvimento web full stack com React e Node.js",
  "requirements": "React, Node.js, TypeScript, PostgreSQL",
  "status": "active"
}
```

**Campos obrigatórios:** `title`, `company`, `location`

**Valores válidos para `type`:** `CLT`, `PJ`, `Estágio`, `Freelancer`

**Valores válidos para `level`:** `estagio`, `junior`, `pleno`, `senior`

**Resposta de sucesso (201):**
```json
{
  "message": "Vaga criada com sucesso",
  "data": { ... }
}
```

---

### 4. Atualizar Vaga (Completa)

```
PUT /api/jobs/:id
```

**Body (JSON):** Todos os campos obrigatórios devem ser enviados.

**Campos obrigatórios:** `title`, `company`, `location`

**Resposta de sucesso (200):**
```json
{
  "message": "Vaga atualizada com sucesso",
  "data": { ... }
}
```

O campo `updated_at` deve ser atualizado automaticamente.

---

### 5. Atualizar Vaga (Parcial)

```
PATCH /api/jobs/:id
```

**Body (JSON):** Apenas os campos que deseja atualizar.

```json
{
  "salary_max": 10000,
  "status": "inactive"
}
```

**Campos que NÃO podem ser alterados:** `id`, `created_at`

O campo `updated_at` deve ser atualizado automaticamente.

---

### 6. Remover Vaga

```
DELETE /api/jobs/:id
```

**Resposta de sucesso (200):**
```json
{
  "message": "Vaga removida com sucesso",
  "data": { ... }
}
```

A vaga deve ser permanentemente removida. Um GET subsequente deve retornar 404.

---

### 7. Estatísticas

```
GET /api/jobs/stats/summary
```

**Resposta (200):**
```json
{
  "data": {
    "total": 20,
    "active": 18,
    "inactive": 2,
    "average_salary": {
      "min": 6750,
      "max": 10975
    },
    "by_type": [...],
    "by_level": [...],
    "by_location": [...]
  }
}
```

O campo `total` deve ser a soma de `active` + `inactive`.

---

## 📦 Modelo de Dados

| Campo          | Tipo    | Obrigatório | Descrição                          |
| -------------- | ------- | ----------- | ---------------------------------- |
| `id`           | integer | auto        | ID único (auto incremento)         |
| `title`        | string  | ✅          | Título da vaga                     |
| `company`      | string  | ✅          | Nome da empresa                    |
| `location`     | string  | ✅          | Localização da vaga                |
| `salary_min`   | number  | ❌          | Salário mínimo                     |
| `salary_max`   | number  | ❌          | Salário máximo (deve ser >= salary_min) |
| `type`         | string  | ❌          | Tipo: CLT, PJ, Estágio, Freelancer (padrão: CLT) |
| `level`        | string  | ❌          | Nível: estagio, junior, pleno, senior (padrão: junior) |
| `description`  | string  | ❌          | Descrição completa da vaga         |
| `requirements` | string  | ❌          | Requisitos da vaga                 |
| `status`       | string  | ❌          | Status: active, inactive (padrão: active) |
| `created_at`   | string  | auto        | Data de criação                    |
| `updated_at`   | string  | auto        | Data de atualização                |

---

## 🧪 Dicas para Testes no Postman

1. **Teste todos os endpoints** — GET, POST, PUT, PATCH, DELETE
2. **Teste a paginação** — navegue pelas páginas e verifique se os dados estão corretos
3. **Teste a ordenação** — verifique se `asc` e `desc` funcionam corretamente
4. **Teste os filtros** — search, location, type, level, salary, status
5. **Teste validações** — envie dados inválidos, campos faltando, valores errados
6. **Teste status codes** — verifique se os códigos HTTP estão corretos (200, 201, 400, 404)
7. **Teste o DELETE** — depois de deletar, confirme que a vaga realmente foi removida
8. **Compare com a documentação** — o comportamento real deve bater com o documentado
9. **Teste edge cases** — IDs que não existem, strings muito longas, valores negativos
10. **Teste a consistência** — os dados retornados devem ser consistentes entre endpoints
