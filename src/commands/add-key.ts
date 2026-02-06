import type { CommandContext } from "../context/types.js";

export async function addKeyCommand(
  context: CommandContext,
  lang: string
): Promise<void> {
  console.log("Context config:", context.config);
  console.log("Language:", lang);
}