import { type Page, expect } from '@playwright/test';
import { labels } from '../data/parts';
import { webPath } from '../utils/env';
import { PartFormPage } from './part-form.page';

export class PartsListPage {
  readonly form: PartFormPage;

  constructor(private readonly page: Page) {
    this.form = new PartFormPage(page);
  }

  async gotoIndex(): Promise<void> {
    await this.page.goto(webPath('part/category/index/parts'));
    await this.page.waitForLoadState('networkidle');
  }

  async gotoCategory(categoryId: number): Promise<void> {
    await this.page.goto(webPath(`part/category/${categoryId}/parts`));
    await this.page.waitForLoadState('networkidle');
  }

  addPartsMenu() {
    return this.page.getByRole('button', { name: labels.addPartsMenu });
  }

  async openCreatePart(): Promise<PartFormPage> {
    await this.addPartsMenu().click();
    await this.page.getByRole('menuitem', { name: labels.createPartItem }).click();
    await this.form.expectOpen();
    return this.form;
  }

  async expectCreatePartAvailable(): Promise<void> {
    await expect(this.addPartsMenu()).toBeVisible();
    await this.addPartsMenu().click();
    await expect(
      this.page.getByRole('menuitem', { name: labels.createPartItem })
    ).toBeVisible();
    await expect(
      this.page.getByRole('menuitem', { name: labels.importFromFileItem })
    ).toBeVisible();
    await this.page.keyboard.press('Escape');
  }

  async expectCreatePartHidden(): Promise<void> {
    await expect(this.addPartsMenu()).toHaveCount(0);
  }

  async search(term: string): Promise<void> {
    const search = this.page.getByPlaceholder(labels.tableSearch);
    await search.fill(term);
    await this.page.waitForLoadState('networkidle');
  }

  async openPartFromTable(name: string): Promise<void> {
    await this.search(name);
    await this.page.getByText(name, { exact: true }).first().click();
    await this.page.waitForURL(/\/part\/\d+/);
  }

  async expectPartListed(name: string): Promise<void> {
    await this.search(name);
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }

  async showParametricView(): Promise<void> {
    await this.page.getByRole('button', { name: labels.parametricView }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async showTableView(): Promise<void> {
    await this.page.getByRole('button', { name: labels.tableView }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async setActiveFilter(value: 'Yes' | 'No'): Promise<void> {
    await this.page.getByLabel(labels.tableFilters).click();
    const addFilter = this.page.getByRole('button', { name: 'Add Filter' });
    if (await addFilter.isVisible()) {
      await addFilter.click();
      await this.page.getByPlaceholder('Select filter').fill('Active');
      await this.page.getByRole('option', { name: /^Active$/i }).click();
      await this.page.getByPlaceholder('Select filter value').click();
      await this.page.getByRole('option', { name: value }).click();
    }
    await this.page.getByLabel('filter-drawer-close').click();
    await this.page.waitForLoadState('networkidle');
  }
}
