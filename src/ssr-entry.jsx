import React from "react";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router";
import { Writable } from "node:stream";
import App from "./App";
import { I18nProvider } from "./i18n";

export function render(url) {
  return new Promise((resolve, reject) => {
    let markup = "";
    let didError = false;

    const destination = new Writable({
      write(chunk, _encoding, callback) {
        markup += chunk.toString();
        callback();
      },
    });

    destination.on("finish", () => {
      if (didError) reject(new Error(`Could not pre-render ${url}`));
      else resolve(markup);
    });

    const { pipe } = renderToPipeableStream(
      <StaticRouter location={url}>
        <I18nProvider>
          <App />
        </I18nProvider>
      </StaticRouter>,
      {
        onAllReady() {
          pipe(destination);
        },
        onShellError(error) {
          didError = true;
          reject(error);
        },
        onError(error) {
          didError = true;
          console.error(`Pre-render warning for ${url}:`, error);
        },
      },
    );
  });
}
