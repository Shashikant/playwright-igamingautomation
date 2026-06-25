// helpers/gameApiCollector.ts

import { Page, Response } from '@playwright/test';

export class GameApiCollector {
  private responses = new Map<string, any[]>();
  private started = false;

  constructor(private page: Page) { }

  /**
   * Start listening for all SlotMachine API responses.
   * Call BEFORE launching the game.
   */
  start(): void {
    if (this.started) return;

    this.started = true;

    this.page.on(
      'response',
      async (response: Response) => {
        try {

          const url = response.url();

          if (!url.includes('/game/') || !url.includes('ccy=GBP') || response.status() !== 200) {
            return;
          }

          const postData = response.request().postData() ?? '';
          let command = 'init'; // default for launch GET

          const commandMatch = postData.match(/"command"\s*:\s*"([^"]+)"/);
          if (commandMatch) {
            command = commandMatch[1];
          }

          let responseBody: any;
          try {
            responseBody = await response.json();
          } catch {
            responseBody = await response.text();
          }

          if (!this.responses.has(command)) {
            this.responses.set(command, []);
          }
          this.responses.get(command)!.push(responseBody);

          console.log(`[GameApiCollector] Captured command: ${command} (${url})`);

        } catch (error) {

          console.error(
            '[GameApiCollector] Error:',
            error
          );

        }
      }
    );
  }

  /**
   * Returns true if command exists.
   */
  has(command: string): boolean {
    return this.responses.has(command);
  }

  /**
   * Returns all responses for command.
   */
  getAll(command: string): any[] {
    return this.responses.get(command) ?? [];
  }

  /**
   * Returns latest response for command.
   */
  getLatest(command: string): any {

    const responses =
      this.responses.get(command);

    if (
      !responses ||
      responses.length === 0
    ) {
      return undefined;
    }

    return responses[
      responses.length - 1
    ];
  }

  /**
   * Wait until a command is captured.
   */
  async waitForCommand(
    command: string,
    timeout = 30000
  ): Promise<any> {

    const startTime =
      Date.now();

    while (
      Date.now() - startTime <
      timeout
    ) {

      const response =
        this.getLatest(command);

      if (response) {
        return response;
      }

      await new Promise(
        resolve =>
          setTimeout(resolve, 500)
      );
    }

    throw new Error(
      `Timed out waiting for command: ${command}`
    );
  }

  /**
   * Print all captured commands.
   */
  printCapturedCommands(): void {

    console.log(
      '\n===== Captured Commands ====='
    );

    for (const key of this.responses.keys()) {

      const count =
        this.responses.get(key)?.length ?? 0;

      console.log(
        `${key} (${count})`
      );
    }

    console.log(
      '=============================\n'
    );
  }

  /**
   * Clear all stored responses.
   */
  clear(): void {
    this.responses.clear();
  }
}