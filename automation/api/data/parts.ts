export const BOOLEAN_FLAGS = [
  'active',
  'assembly',
  'component',
  'consumable',
  'is_template',
  'locked',
  'purchaseable',
  'salable',
  'testable',
  'trackable',
  'virtual'
] as const;

export type BooleanFlag = (typeof BOOLEAN_FLAGS)[number];
