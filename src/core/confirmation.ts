import inquirer from "inquirer";

interface ConfirmOptions {
  skip?: boolean; // used when --yes flag is passed
  defaultValue?: boolean;
}

export async function confirmAction(
  message: string,
  options: ConfirmOptions = {}
): Promise<boolean> {
  const { skip = false, defaultValue = false } = options;

  // If --yes is passed, skip prompt
  if (skip) {
    return true;
  }

  // If running in non-interactive environment (CI)
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