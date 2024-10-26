import { Suspense, use } from "react";
import { createHighlighterCore, HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerNotationFocus,
  transformerNotationErrorLevel,
  transformerRenderWhitespace,
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerCompactLineOptions,
  transformerRemoveLineBreak,
  transformerRemoveNotationEscape,
} from "@shikijs/transformers";
import "./syntax-highlighter.css";

let highlighter: HighlighterCore;

const getHighlighter = async () => {
  if (!highlighter) {
    highlighter = await createHighlighterCore({
      engine: createOnigurumaEngine(import("shiki/wasm")),
      themes: [
        import("shiki/themes/dark-plus.mjs"),
        import("shiki/themes/light-plus.mjs"),
      ],
      langs: [
        import("shiki/langs/astro.mjs"),
        import("shiki/langs/csharp.mjs"),
        import("shiki/langs/css.mjs"),
        import("shiki/langs/dotenv.mjs"),
        import("shiki/langs/go.mjs"),
        import("shiki/langs/html.mjs"),
        import("shiki/langs/javascript.mjs"),
        import("shiki/langs/json.mjs"),
        import("shiki/langs/jsx.mjs"),
        import("shiki/langs/rust.mjs"),
        import("shiki/langs/scss.mjs"),
        import("shiki/langs/sql.mjs"),
        import("shiki/langs/tsx.mjs"),
        import("shiki/langs/typescript.mjs"),
      ],
    });
  }

  return highlighter;
};

export const SyntaxHighlighter: React.FC<{
  language: string;
  code: string;
  useTransforms?: boolean;
}> = ({ language, code, useTransforms }) => {
  const highlighterPromise = getHighlighter();

  return (
    <Suspense fallback={<pre>{code}</pre>}>
      <SyntaxHighlighterInner
        language={language}
        code={code}
        useTransforms={!!useTransforms}
        highlighterPromise={highlighterPromise}
      />
    </Suspense>
  );
};

const SyntaxHighlighterInner: React.FC<{
  language: string;
  code: string;
  useTransforms: boolean;
  highlighterPromise: Promise<HighlighterCore>;
}> = ({ language, code, useTransforms, highlighterPromise }) => {
  const highlighter = use(highlighterPromise);

  const highlighted = highlighter.codeToHtml(code, {
    lang: language,
    defaultColor: false,
    themes: {
      light: "light-plus",
      dark: "dark-plus",
    },
    transformers: useTransforms
      ? [
          transformerNotationDiff(),
          transformerNotationHighlight(),
          transformerNotationWordHighlight(),
          transformerNotationFocus(),
          transformerNotationErrorLevel(),
          transformerRenderWhitespace(),
          transformerMetaHighlight(),
          transformerMetaWordHighlight(),
          transformerCompactLineOptions(),
          transformerRemoveLineBreak(),
          transformerRemoveNotationEscape(),
        ]
      : undefined,
  });

  return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
};
