import { Provider as GadgetProvider } from "@gadgetinc/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { GadgetConfig } from "gadget-server";
import { Suspense } from "react";
import { api } from "./api";
import appStylesHref from "./app.css?url";

export const links = () => [
  { rel: "stylesheet", href: appStylesHref },
  { rel: "stylesheet", href: "https://assets.gadget.dev/assets/reset.min.css" },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
    integrity: "sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN",
    crossOrigin: "anonymous",
  },
];

export const meta = () => [
  { charset: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { title: "Gadget Remix app" },
];

export type RootOutletContext = {
  gadgetConfig: GadgetConfig;
  csrfToken: string;
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { session, gadgetConfig } = context;

  return json({
    gadgetConfig,
    csrfToken: session?.get("csrfToken"),
  });
};

export default function App() {
  const { gadgetConfig, csrfToken } = useLoaderData<typeof loader>();

  return (
    <html lang="en" className="dark">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Suspense>
          <GadgetProvider api={api}>
            <Outlet context={{ gadgetConfig, csrfToken }} />
          </GadgetProvider>
        </Suspense>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
