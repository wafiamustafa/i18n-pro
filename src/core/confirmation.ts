import inquirer from "inquirer";

interface ConfirmOptions {
  skip?: boolean; // used when --yes flag is passed
  defaultValue?: boolean;
  ci?: boolean;
}

export async function confirmAction(
  message: string,
  options: ConfirmOptions = {}
): Promise<boolean> {
  const { skip = false, defaultValue = false, ci = false } = options;

  // If --yes is passed, skip prompt
  if (skip) {
    return true;
  }

  // If running in CI mode, require explicit confirmation via --yes
  if (ci) {
    throw new Error(
      "Confirmation required in CI mode. Re-run with --yes to proceed."
    );
  }

  // If running in non-interactive environment
  if (!process.stdout.isTTY) {
    return defaultValue;
  }

  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message,
      default: defaultValue
    }
  ]);

  return confirmed;
}
