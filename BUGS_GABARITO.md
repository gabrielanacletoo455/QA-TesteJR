# 🔐 GABARITO — NÃO MOSTRAR PARA A QA!

São **14 bugs** no total. Abra o `gabarito.html` para a versão completa com visual bonito.

| #  | Bug                                    | Endpoint             | Severidade |
|----|----------------------------------------|----------------------|------------|
| 1  | Ordenação asc/desc invertida           | GET /api/jobs        | Major      |
| 2  | Search só busca no title               | GET /api/jobs        | Major      |
| 3  | Filtro salary_min invertido (<=)       | GET /api/jobs        | Major      |
| 4  | ID inexistente retorna 200 + {}        | GET /api/jobs/:id    | Major      |
| 5  | POST não valida company obrigatório    | POST /api/jobs       | Major      |
| 6  | POST aceita salary_min > salary_max    | POST /api/jobs       | Minor      |
| 7  | POST aceita qualquer type              | POST /api/jobs       | Minor      |
| 8  | POST aceita qualquer level             | POST /api/jobs       | Minor      |
| 9  | Description truncada em 100 chars      | POST /api/jobs       | Major      |
| 10 | POST retorna 200 ao invés de 201       | POST /api/jobs       | Minor      |
| 11 | PUT não atualiza updated_at            | PUT /api/jobs/:id    | Major      |
| 12 | PATCH não atualiza updated_at          | PATCH /api/jobs/:id  | Major      |
| 13 | DELETE retorna typo "statsu"           | DELETE /api/jobs/:id | Cosmetic   |
| 14 | Stats total soma active+active         | GET /stats/summary   | Major      |
