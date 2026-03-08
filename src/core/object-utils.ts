export type FlatObject = Record<string, any>;

const DANGEROUS_KEY_SEGMENTS = new Set([
  "__proto__",
  "constructor",
  "prototype"
]);

function assertSafeKeySegment(segment: string): void {
  if (DANGEROUS_KEY_SEGMENTS.has(segment)) {
    throw new Error(
      `Unsafe key segment "${segment}" is not allowed.`
    );
  }
}

export function flattenObject(
  obj: Record<string, any>,
  parentKey = "",
  result: FlatObject = Object.create(null)
): FlatObject {
  for (const key of Object.keys(obj)) {
    assertSafeKeySegment(key);
    const value = obj[key];
    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      flattenObject(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

export function unflattenObject(flatObj: FlatObject): Record<string, any> {
  const result: Record<string, any> = Object.create(null);

  for (const flatKey of Object.keys(flatObj)) {
    const keys = flatKey.split(".");
    let current = result;

    keys.forEach((key, index) => {
      assertSafeKeySegment(key);
      const isLast = index === keys.length - 1;

      if (isLast) {
        current[key] = flatObj[flatKey];
      } else {
        if (!current[key] || typeof current[key] !== "object") {
          current[key] = Object.create(null);
        }
        current = current[key];
      }
    });
  }

  return result;
}

export function getAllFlatKeys(obj: Record<string, any>): string[] {
  return Object.keys(flattenObject(obj));
}

export function removeEmptyObjects(obj: any): any {
  if (Array.isArray(obj)) {
    return obj;
  }

  if (obj !== null && typeof obj === "object") {
    const cleaned: any = Object.create(null);

    for (const key of Object.keys(obj)) {
      assertSafeKeySegment(key);
      const value = removeEmptyObjects(obj[key]);

      if (
        value !== undefined &&
        (typeof value !== "object" || Object.keys(value).length > 0)
      ) {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }

  return obj;
}
