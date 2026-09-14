import { createGame } from "./game";

const parent = document.getElementById("game");
if (!parent) throw new Error("#game missing");

createGame({ parent });
