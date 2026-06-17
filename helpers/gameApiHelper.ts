import { Page, Response } from '@playwright/test';

export class GameApiHelper {
  constructor(private page: Page) {}

  /**
   * Waits for a SlotMachine API response with a given command (e.g. "init", "spin")
   * @param command - The command string to filter for
   * @param timeout - Optional timeout in ms (default 30s)
   */
  async waitForApiResponse(command: string, timeout: number = 30000): Promise<any> {
    const response: Response = await this.page.waitForResponse(resp => {
      if (!resp.url().includes('/api/SlotMachine/') || resp.status() !== 200) return false;
      const postData = resp.request().postData();
      return postData ? postData.includes(`"command":"${command}"`) : false;
    }, { timeout });

    return await response.json();
  }
}
