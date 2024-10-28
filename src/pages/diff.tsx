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
import { diffLines } from "diff";

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
  "text",
] as const;

const searchParamsSchema = v.objectAsync({
  codeold: v.pipeAsync(
    v.nullish(v.string()),
    v.transformAsync(async (compressed) =>
      compressed ? decompressFromEncodedURIComponent(compressed) : "",
    ),
  ),
  codenew: v.pipeAsync(
    v.nullish(v.string()),
    v.transformAsync(async (compressed) =>
      compressed ? decompressFromEncodedURIComponent(compressed) : "",
    ),
  ),
  lang: v.fallback(v.picklist(LANGUAGES), "json"),
});

type ValidSearchParams = v.InferOutput<typeof searchParamsSchema>;

export const DiffPage: React.FC = () => {
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

  const [codeold, setCodeOld] = useState(validSearchParams.codeold);
  const [codenew, setCodeNew] = useState(validSearchParams.codenew);
  const [language, setLanguage] = useState<string>(validSearchParams.lang);

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      compressToEncodedURIComponent(codeold),
      compressToEncodedURIComponent(codenew),
    ]).then(([oldCompressed, newCompressed]) => {
      const searchParams = new URLSearchParams({
        codeold: oldCompressed,
        codenew: newCompressed,
        lang: language,
      });

      startTransition(() => {
        navigate({ search: searchParams.toString() });
      });
    });
  }, [codenew, codeold, language, navigate]);

  return (
    <div className="p-16 h-dvh">
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
      </div>
      <div className="grid grid-cols-3 gap-4 h-full">
        <textarea
          className="bg-transparent text-nowrap caret-zinc-700 dark:caret-zinc-300 resize-none text-sm p-4 font-mono outline-none  size-full rounded-xl border dark:border-zinc-700 h-full"
          value={codeold}
          onChange={(e) => setCodeOld(e.target.value)}
        />
        <textarea
          className="bg-transparent text-nowrap caret-zinc-700 dark:caret-zinc-300 resize-none text-sm p-4 font-mono outline-none  size-full rounded-xl border dark:border-zinc-700 h-full"
          value={codenew}
          onChange={(e) => setCodeNew(e.target.value)}
        />
        <SyntaxHighlighter
          className="grid-rows-1 size-full rounded-xl border dark:border-zinc-700 overflow-hidden"
          code={diffText(codeold, codenew)}
          language={language}
          useTransforms
        />
      </div>
    </div>
  );
};

const diffText = (oldText: string, newText: string): string => {
  const diffs = diffLines(oldText, newText);

  return diffs
    .reduce((acc, diff) => {
      if (diff.added) {
        const concat =
          acc +
          diff.value
            .split("\n")
            .map((line) => (line ? line + "// [!code ++]" : ""))
            .join("\n");
        return concat.endsWith("\n") ? concat : concat + "\n";
      } else if (diff.removed) {
        const concat =
          acc +
          diff.value
            .split("\n")
            .map((line) => (line ? line + "// [!code --]" : ""))
            .join("\n");
        return concat.endsWith("\n") ? concat : concat + "\n";
      } else {
        return acc + diff.value;
      }
    }, "")
    .trim();
};
