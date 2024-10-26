import { createHashRouter, RouterProvider } from "react-router-dom";
import packagejson from "../package.json?raw";
import { SyntaxHighlighter } from "./components/syntax-highlighter";
import { EditorPage } from "./pages/editor";

const router = createHashRouter([
  {
    path: "/editor",
    element: <EditorPage />,
  },
  {
    path: "/",
    element: <SyntaxHighlighter code={packagejson} language="json" />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
