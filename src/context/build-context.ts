import { loadConfig } from "../config/config-loader.js";
import { FileManager } from "../core/file-manager.js";
import type { CommandContext, GlobalOptions } from "./types.js";

export async function buildContext(
  options: GlobalOptions
): Promise<CommandContext> {
  const config = await loadConfig();
  const fileManager = new FileManager(config);

  return {
    config,
    fileManager,
    options
  };
}