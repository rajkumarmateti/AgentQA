import { type Locator, type Page, expect } from '@playwright/test';
import { labels, type PartFormValues } from '../data/parts';

/**
 * Create / edit Part modal (PUI ApiForm).
 * Field aria names follow InvenTree `text-field-*` / `related-field-*` conventions.
 */
export class PartFormPage {
  constructor(private readonly page: Page) {}

  dialog(): Locator {
    return this.page.getByRole('dialog').or(this.page.locator('[role="dialog"]'));
  }

  async expectOpen(title = /add part|create part|edit part|duplicate part/i): Promise<void> {
    await expect(this.page.getByText(title).first()).toBeVisible();
  }

  nameField(): Locator {
    return this.page.getByLabel(labels.fieldName, { exact: true });
  }

  descriptionField(): Locator {
    return this.page.getByLabel(labels.fieldDescription, { exact: true });
  }

  ipnField(): Locator {
    return this.page.getByLabel(labels.fieldIpn, { exact: true });
  }

  async fill(values: PartFormValues): Promise<void> {
    await this.nameField().waitFor();
    await this.nameField().fill(values.name);
    if (values.description !== undefined) {
      await this.descriptionField().fill(values.description);
    }
    if (values.ipn !== undefined) {
      await this.ipnField().fill(values.ipn);
    }
    if (values.keywords !== undefined) {
      await this.page.getByLabel(labels.fieldKeywords, { exact: true }).fill(values.keywords);
    }
    if (values.link !== undefined) {
      await this.page
        .getByRole('textbox', { name: labels.fieldLink, exact: true })
        .fill(values.link);
    }
    if (values.revision !== undefined) {
      await this.page.getByLabel(labels.fieldRevision, { exact: true }).fill(values.revision);
    }
    if (values.units !== undefined) {
      await this.page.getByLabel(labels.fieldUnits, { exact: true }).fill(values.units);
    }
    if (values.category) {
      await this.selectCategory(values.category);
    }
    await this.nameField().blur();
  }

  async selectCategory(search: string): Promise<void> {
    const tree = this.page.getByRole('textbox', { name: labels.fieldCategoryTree });
    const related = this.page
      .getByRole('combobox', { name: labels.fieldCategory })
      .or(this.page.getByLabel(labels.fieldCategory, { exact: true }));

    if ((await tree.count()) > 0) {
      await tree.fill(search);
    } else {
      await related.first().fill(search);
    }

    const option = this.page.getByRole('option').filter({ hasText: search }).first();
    if ((await option.count()) > 0) {
      await option.click();
      return;
    }
    await this.page.getByText(search).first().click();
  }

  async setCheckbox(field: string, checked: boolean): Promise<void> {
    const box = this.page.getByRole('checkbox', { name: new RegExp(field, 'i') });
    if (checked) {
      await box.check();
    } else {
      await box.uncheck();
    }
  }

  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Submit' }).click();
  }

  async cancel(): Promise<void> {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  async expectValidationError(): Promise<void> {
    const alert = this.page.getByRole('alert').or(this.page.locator('.mantine-Input-error'));
    await expect(alert.first()).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Submit' })).toBeVisible();
  }
}
