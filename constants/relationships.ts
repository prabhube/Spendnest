export const RELATIONSHIPS = [
  'self',
  'spouse',
  'child',
  'parent',
  'sibling',
  'other',
] as const;

export type Relationship = (typeof RELATIONSHIPS)[number];

export function relationshipLabel(value: string): string {
  switch (value) {
    case 'self':
      return 'Self';
    case 'spouse':
      return 'Spouse';
    case 'child':
      return 'Child';
    case 'parent':
      return 'Parent';
    case 'sibling':
      return 'Sibling';
    default:
      return 'Other';
  }
}
