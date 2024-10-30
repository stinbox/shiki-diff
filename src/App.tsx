import { createHashRouter, RouterProvider } from "react-router-dom";
import packagejson from "../package.json?raw";
import { ShikiHighlighter } from "./components/syntax-highlighter";
import { EditorPage } from "./pages/editor";
import { DiffPage } from "./pages/diff";

const router = createHashRouter([
  {
    path: "/editor",
    element: <EditorPage />,
  },
  {
    path: "/diff",
    element: <DiffPage />,
  },
  {
    path: "/",
    element: <ShikiHighlighter code={packagejson} language="json" />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
