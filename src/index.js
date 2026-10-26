import React from "react";
import ReactDom from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { getConsent, loadTrackers } from "./consent";

if (getConsent() === "granted") loadTrackers();

ReactDom.render(<App />,document.getElementById("root"));

serviceWorker.register();
