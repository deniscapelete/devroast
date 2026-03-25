# Spec: Editor de Código com Syntax Highlighting

## Contexto

O `RoastForm` atualmente usa um `<textarea>` simples. A feature a implementar é um editor com:

- Syntax highlighting em tempo real enquanto o usuário digita
- Detecção automática de linguagem ao colar código
- Visual consistente com o design existente (tema vesper, JetBrains Mono)
- Nenhuma quebra de funcionalidade existente (estado `code`, botão desabilitado, toggle "roast mode")

---

## Referência: como o ray.so faz

O editor do ray.so usa a abordagem **textarea transparente sobre HTML do Shiki**:

1. Um `<div>` renderiza o HTML gerado pelo Shiki como camada visual
2. Um `<textarea>` fica sobreposto com `color: transparent` / `-webkit-text-fill-color: transparent` — captura input, mas fica invisível
3. A cada keystroke, o estado atualiza, o Shiki re-renderiza o HTML abaixo
4. Detecção de linguagem via `highlight.js highlightAuto()` no evento `onPaste`
5. Estado global com Jotai atoms + persistência no hash da URL

O ray.so usa Shiki no **cliente** (via `@shikijs/core` com bundle customizado). Isso é viável mas adiciona complexidade: o pipeline do Shiki é assíncrono (`codeToHtml` retorna `Promise`), o que força um `useEffect` + estado separado para o HTML renderizado.

---

## Opções avaliadas

| Biblioteca | Bundle (gz) | Setup Next.js App Router | Theming com Tailwind | Notas |
|---|---|---|---|---|
| **CodeMirror 6** (`@uiw/react-codemirror`) | ~135 KB | Zero fricção | CSS vars mapeiam para tokens | Usado por Replit, Sourcegraph, StackBlitz |
| **textarea + Shiki client-side** | ~80-200 KB | Médio (async, bundle) | Nativo — já usamos Shiki | Requer `useEffect` + sincronização de scroll |
| **react-simple-code-editor + Prism** | ~20 KB | Zero fricção | Classe no `<pre>` | Problemas de performance documentados em pastas grandes |
| **@uiw/react-textarea-code-editor** | ~30 KB | Problemático (ESM/CSS) | Limitado | Issues com App Router; abandonado |
| **Monaco** | ~2 MB | Complexo (workers, dynamic import) | Incompatível com Tailwind | Overkill para esse caso de uso |

---

## Decisão recomendada: CodeMirror 6

**Justificativa:**

- Bundle razoável (~135 KB gzipped), linguagens lazy-loaded sob demanda
- Funciona como componente React diretamente, sem configuração de workers ou dynamic imports
- Theming via objeto JS — cada propriedade mapeia diretamente para um token CSS do projeto (ex: `background: "var(--color-bg-input)"`)
- Suporte a 140+ linguagens; pode-se incluir apenas as necessárias inicialmente
- API estável, amplamente usada em produção

**Alternativa viável se CodeMirror for rejeitado:** textarea transparente sobre Shiki (padrão ray.so) — mais alinhado com o stack existente, mas requer lógica manual de sincronização de scroll e o pipeline assíncrono do Shiki.

---

## Detecção de linguagem

- **Biblioteca:** `highlight.js` com `highlightAuto()`
- **Momento:** evento `onPaste` (não em cada keystroke — caro demais)
- **Lista de candidatas:** restringir a ~15-20 linguagens relevantes para reduzir bundle e melhorar precisão

```ts
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
// ... demais linguagens

hljs.registerLanguage("javascript", javascript);
// ...

const result = hljs.highlightAuto(pastedCode, [
  "javascript", "typescript", "python", "sql",
  "go", "rust", "java", "cpp", "c", "php",
  "ruby", "swift", "kotlin", "css", "html",
]);
// result.language → string com a linguagem detectada
```

- Bundle adicional: ~25-35 KB gzipped com imports seletivos
- Fallback: `"javascript"` quando `result.language` for `undefined`

---

## Linguagens suportadas (MVP)

`javascript`, `typescript`, `python`, `sql`, `go`, `rust`, `java`, `cpp`, `c`, `php`, `ruby`, `swift`, `kotlin`, `css`, `html`

---

## Integração com `RoastForm`

O componente `RoastForm` (`src/components/roast-form.tsx`) concentra o estado `code`. As mudanças ficam nele:

- Substituir o `<textarea>` atual pelo componente CodeMirror
- Adicionar estado `lang` (default `"javascript"`) detectado no `onPaste`
- Manter a lógica de `code.trim().length === 0` para o botão desabilitado
- Passar `lang` para o futuro endpoint de roast

```tsx
const [code, setCode] = useState("");
const [lang, setLang] = useState("javascript");

// no handler de paste do CodeMirror:
const handlePaste = (pastedCode: string) => {
  const result = hljs.highlightAuto(pastedCode, SUPPORTED_LANGS);
  if (result.language) setLang(result.language);
};
```

---

## Tema do editor

O editor CodeMirror precisa de um tema customizado alinhado ao design do projeto:

```ts
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";

export const vesperTheme = createTheme({
  theme: "dark",
  settings: {
    background: "var(--color-bg-input)",       // #111111
    foreground: "var(--color-text-primary)",   // #fafafa
    caret: "var(--color-accent-green)",        // #10b981
    selection: "var(--color-bg-elevated)",     // #1a1a1a
    lineHighlight: "transparent",
    gutterBackground: "transparent",
    gutterForeground: "var(--color-text-tertiary)",
  },
  styles: [
    { tag: t.keyword, color: "var(--color-accent-amber)" },
    { tag: t.string, color: "var(--color-accent-green)" },
    { tag: t.comment, color: "var(--color-text-tertiary)" },
    { tag: t.number, color: "var(--color-accent-cyan)" },
    { tag: t.function(t.variableName), color: "var(--color-text-primary)" },
    { tag: t.typeName, color: "var(--color-accent-amber)" },
  ],
});
```

> **Nota:** os valores exatos de cor devem ser ajustados para aproximar o tema vesper do Shiki já usado no `CodeBlock.Body` — isso garante consistência visual entre o editor e o bloco de resultado.

---

## Arquivos a criar/modificar

| Arquivo | Operação | Descrição |
|---|---|---|
| `src/lib/editor-theme.ts` | Criar | Tema CodeMirror mapeado para tokens do projeto |
| `src/lib/lang-detect.ts` | Criar | Wrapper do `highlightAuto` com lista de candidatas |
| `src/components/roast-form.tsx` | Modificar | Substituir `<textarea>` por `<CodeMirror>`, adicionar estado `lang` |
| `package.json` | Modificar | Adicionar `@uiw/react-codemirror`, extensões de linguagem, `highlight.js` |

---

## TODOs de implementação

### Fase 1 — Setup

- [ ] Instalar dependências:
  ```bash
  npm install @uiw/react-codemirror @codemirror/lang-javascript @codemirror/lang-python @codemirror/lang-sql @codemirror/lang-go @codemirror/lang-rust @codemirror/lang-java @codemirror/lang-cpp @codemirror/lang-php @codemirror/autocomplete highlight.js
  ```

### Fase 2 — Tema e detecção

- [ ] Criar `src/lib/editor-theme.ts` com tema customizado baseado nos tokens do projeto
- [ ] Criar `src/lib/lang-detect.ts` com `highlightAuto` e lista de candidatas
- [ ] Validar visualmente que as cores do editor aproximam o tema vesper do `CodeBlock.Body`

### Fase 3 — Integração no RoastForm

- [ ] Substituir `<textarea>` por `<CodeMirror>` em `roast-form.tsx`
- [ ] Adicionar estado `lang` inicializado em `"javascript"`
- [ ] Implementar handler `onPaste` que chama `detectLang()` e atualiza `lang`
- [ ] Garantir que `onChange` do CodeMirror atualize o estado `code`
- [ ] Garantir que botão continue desabilitado quando `code.trim().length === 0`
- [ ] Garantir que extensão de linguagem do CodeMirror atualiza quando `lang` muda
- [ ] Ativar extensão de autocompletar (`@codemirror/autocomplete`) com `autocompletion()` e `closeBrackets()`

### Fase 4 — Ajustes visuais

- [ ] Manter gutter (numeração de linhas) visível — estilizado com `text-text-tertiary`, background transparente
- [ ] Ativar line wrapping (`lineWrapping: true`) — sem scroll horizontal
- [ ] Exibir badge com linguagem detectada no header do editor (lado direito, ao lado dos 3 dots)
  - Badge atualiza em tempo real após cada paste
  - Exibir label em lowercase: `"typescript"`, `"python"`, etc.
- [ ] Garantir que o `placeholder` ("// paste your code here...") continua funcionando
- [ ] Manter altura mínima de `280px` e comportamento de crescimento vertical
- [ ] Confirmar que o estilo de borda/background do wrapper externo não muda

### Fase 5 — Qualidade

- [ ] Testar com snippets reais de cada linguagem suportada (paste → detecção correta)
- [ ] Testar com código ambíguo (ex: snippet curto — fallback correto para `"javascript"`)
- [ ] Verificar bundle size com `npm run build` e analisar o output
- [ ] Rodar `npm run check` (Biome) sem erros

---

## Decisões de design (respondidas)

1. **Numeração de linhas** → **sim**, gutter visível estilizado com tokens do projeto
2. **Wrap vs scroll horizontal** → **wrap** (`lineWrapping: true`), sem scroll horizontal
3. **Mostrar linguagem detectada** → **sim**, badge no header do editor, atualiza a cada paste
4. **Autocompletar** → **sim**, `autocompletion()` + `closeBrackets()` do `@codemirror/autocomplete`
