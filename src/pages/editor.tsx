import {
  startTransition,
  Suspense,
  use,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SyntaxHighlighter } from "../components/syntax-highlighter";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as v from "valibot";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "../lib/compression";

const LANGUAGES = [
  "astro",
  "csharp",
  "css",
  "dotenv",
  "go",
  "html",
  "javascript",
  "json",
  "jsx",
  "rust",
  "scss",
  "sql",
  "tsx",
  "typescript",
] as const;

const searchParamsSchema = v.objectAsync({
  code: v.pipeAsync(
    v.nullish(v.string()),
    v.transformAsync(async (compressed) =>
      compressed ? decompressFromEncodedURIComponent(compressed) : "",
    ),
  ),
  lang: v.fallback(v.picklist(LANGUAGES), "json"),
  usetransforms: v.fallback(
    v.pipe(
      v.picklist(["true", "false"]),
      v.transform((s) => s === "true"),
    ),
    false,
  ),
});

type ValidSearchParams = v.InferOutput<typeof searchParamsSchema>;

export const EditorPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const validSearchParamsPromise = useMemo(
    () =>
      v.parseAsync(
        searchParamsSchema,
        Object.fromEntries(searchParams.entries()),
      ),
    [searchParams],
  );

  return (
    <Suspense>
      <EditorInner validSearchParamsPromise={validSearchParamsPromise} />
    </Suspense>
  );
};

const EditorInner: React.FC<{
  validSearchParamsPromise: Promise<ValidSearchParams>;
}> = ({ validSearchParamsPromise }) => {
  const validSearchParams = use(validSearchParamsPromise);

  const [code, setCode] = useState(validSearchParams.code);
  const [language, setLanguage] = useState<string>(validSearchParams.lang);
  const [useTransforms, setUseTransforms] = useState(
    validSearchParams.usetransforms,
  );

  const navigate = useNavigate();

  useEffect(() => {
    compressToEncodedURIComponent(code).then((compressed) => {
      const searchParams = new URLSearchParams({
        code: compressed,
        lang: language,
        usetransforms: useTransforms.toString(),
      });

      startTransition(() => {
        navigate({ search: searchParams.toString() });
      });
    });
  }, [code, language, navigate, useTransforms]);

  return (
    <div className="p-16 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg border bg-transparent dark:border-zinc-700"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <label className="items-center inline-flex gap-1.5">
          <input
            type="checkbox"
            checked={useTransforms}
            onChange={(e) => setUseTransforms(e.target.checked)}
          />
          <span>Use Transforms</span>
        </label>
      </div>
      <div className="relative rounded-xl border dark:border-zinc-700 grid-cols-1 grid-rows-1 overflow-hidden grid min-h-96 mt-4">
        <SyntaxHighlighter
          className="grid-rows-1 col-start-1 row-start-1 size-full"
          code={code}
          language={language}
          useTransforms={useTransforms}
        />
        <textarea
          className="bg-transparent text-transparent caret-zinc-700 dark:caret-zinc-300 resize-none text-sm p-4 font-mono outline-none col-start-1 row-start-1 size-full"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />
      </div>
    </div>
  );
};
