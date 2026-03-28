# Specs — Formato e Convenções

Specs são criadas **antes** de implementar qualquer feature não-trivial. O objetivo é alinhar decisões técnicas e ter um checklist de implementação claro.

## Estrutura obrigatória

```md
# Spec: [Nome da Feature]

## Contexto
Por que essa feature existe. O que ela resolve. Quais requisitos do produto ela atende.

## Decisão
Abordagem escolhida e justificativa. Se houve alternativas relevantes avaliadas, incluir tabela de comparação antes desta seção.

## Arquivos a criar/modificar
| Arquivo | Operação | Descrição |
|---|---|---|

## Checklist de implementação
Dividido em fases se necessário. Cada item é uma tarefa atômica.
- [ ] ...
```

## Regras

- **Seções de detalhe técnico** (schema, configuração, snippets de código) ficam entre `## Decisão` e `## Arquivos a criar/modificar` — quantas forem necessárias
- **Alternativas avaliadas**: incluir tabela de comparação apenas quando a escolha não for óbvia
- Decisões de design ainda abertas ficam no Contexto; decisões já tomadas ficam como notas nas seções relevantes
- Checklist deve cobrir **todas** as mudanças necessárias (deps, config, código, integração)
