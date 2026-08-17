export const labels = {
  loginUsername: 'login-username',
  loginPassword: 'login-password',
  navigationMenu: 'navigation-menu',
  addPartsMenu: 'action-menu-add-parts',
  createPartItem: 'action-menu-add-parts-create-part',
  importFromFileItem: 'action-menu-add-parts-import-from-file',
  fieldName: 'text-field-name',
  fieldDescription: 'text-field-description',
  fieldIpn: 'text-field-IPN',
  fieldKeywords: 'text-field-keywords',
  fieldLink: 'text-field-link',
  fieldRevision: 'text-field-revision',
  fieldUnits: 'text-field-units',
  fieldCategory: 'related-field-category',
  fieldCategoryTree: 'tree-field-category',
  fieldRevisionOf: 'related-field-revision_of',
  addParameter: 'action-button-add-parameter',
  addParameterMenu: 'action-menu-add-parameters',
  createParameterItem: 'action-menu-add-parameters-create-parameter',
  addStockItem: 'action-button-add-stock-item',
  fieldQuantity: 'text-field-quantity',
  fieldLocation: 'related-field-location',
  fieldTemplate: 'related-field-template',
  fieldData: 'text-field-data',
  fieldNote: 'text-field-note',
  tableSearch: 'Search',
  parametricView: 'segmented-icon-control-parametric',
  tableView: 'segmented-icon-control-table',
  tableFilters: 'table-select-filters',
  partLockIcon: 'part-lock-icon'
} as const;

export type PartFormValues = {
  name: string;
  description?: string;
  ipn?: string;
  keywords?: string;
  link?: string;
  revision?: string;
  units?: string;
  category?: string;
};
