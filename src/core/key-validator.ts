export function validateNoStructuralConflict(
  flatObject: Record<string, any>,
  newKey: string
): void {
  const parts = newKey.split(".");

  // Parent conflict check
  for (let i = 1; i < parts.length; i++) {
    const parentPath = parts.slice(0, i).join(".");

    if (flatObject[parentPath] !== undefined) {
      throw new Error(
        `Structural conflict detected:\n\n` +
        `Cannot create key "${newKey}" because "${parentPath}" ` +
        `is already defined as a non-object value.\n\n` +
        `Resolve conflict before proceeding.`
      );
    }
  }

  // Child conflict check
  const prefix = `${newKey}.`;

  for (const existingKey of Object.keys(flatObject)) {
    if (existingKey.startsWith(prefix)) {
      throw new Error(
        `Structural conflict detected:\n\n` +
        `Cannot create key "${newKey}" because it would overwrite nested keys like "${existingKey}".\n\n` +
        `Resolve conflict before proceeding.`
      );
    }
  }
}