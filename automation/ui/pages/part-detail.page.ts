import { type Page, expect } from '@playwright/test';
import { labels } from '../data/parts';
import { webPath } from '../utils/env';
import { PartFormPage } from './part-form.page';

export class PartDetailPage {
  readonly form: PartFormPage;

  constructor(private readonly page: Page) {
    this.form = new PartFormPage(page);
  }

  async goto(partId: number, panel = 'details'): Promise<void> {
    await this.page.goto(webPath(`part/${partId}/${panel}`));
    await this.page.waitForLoadState('networkidle');
  }

  async expectOnDetail(partName?: string): Promise<void> {
    await this.page.waitForURL(/\/part\/\d+/);
    if (partName) {
      await expect(this.page.getByText(partName).first()).toBeVisible();
    }
  }

  async loadTab(tabName: string, exact = false): Promise<void> {
    await this.page
      .getByLabel(/panel-tabs-/)
      .getByRole('tab', { name: tabName, exact })
      .click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectTabVisible(tabName: string): Promise<void> {
    await expect(
      this.page.getByLabel(/panel-tabs-/).getByRole('tab', { name: tabName })
    ).toBeVisible();
  }

  async expectTabHidden(tabName: string): Promise<void> {
    await expect(
      this.page.getByLabel(/panel-tabs-/).getByRole('tab', { name: tabName, exact: true })
    ).toHaveCount(0);
  }

  async openDetailAction(action: string): Promise<void> {
    await this.page.getByRole('button', { name: 'action-menu-part' }).click();
    await this.page
      .getByRole('menuitem', { name: `action-menu-part-actions-${action}` })
      .click();
  }

  async openDuplicate(): Promise<PartFormPage> {
    await this.openDetailAction('duplicate');
    await this.form.expectOpen(/duplicate/i);
    return this.form;
  }

  async openEdit(): Promise<PartFormPage> {
    await this.page.keyboard.press('Control+E');
    await this.form.nameField().waitFor();
    return this.form;
  }

  async addStock(quantity: number, locationSearch?: string): Promise<void> {
    await this.loadTab('Stock', true);
    await this.page.getByLabel(labels.addStockItem).click();
    await this.page.getByLabel(labels.fieldQuantity, { exact: true }).fill(String(quantity));
    if (locationSearch) {
      await this.page.getByLabel(labels.fieldLocation, { exact: true }).fill(locationSearch);
      await this.page.getByRole('option').filter({ hasText: locationSearch }).first().click();
    }
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async addParameter(templateName: string, value: string): Promise<void> {
    await this.loadTab('Parameters');
    const menu = this.page.getByRole('button', { name: labels.addParameterMenu });
    if (await menu.count()) {
      await menu.click();
      await this.page.getByRole('menuitem', { name: labels.createParameterItem }).click();
    } else {
      await this.page.getByLabel(labels.addParameter).click();
    }
    await this.page.getByLabel(labels.fieldTemplate).fill(templateName);
    await this.page.getByRole('option').filter({ hasText: templateName }).first().click();
    const dataField = this.page.getByLabel(labels.fieldData, { exact: true });
    if (await dataField.count()) {
      await dataField.fill(value);
    } else {
      await this.page.getByLabel('choice-field-data').click();
      await this.page.getByRole('option', { name: value }).click();
    }
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectLocked(): Promise<void> {
    await expect(this.page.getByLabel(labels.partLockIcon)).toBeVisible();
    await expect(this.page.getByText('Part is Locked', { exact: true })).toBeVisible();
  }

  async expectRevisionSelector(): Promise<void> {
    await expect(
      this.page.getByText(/select part revision|revision/i).first()
    ).toBeVisible();
  }
}
