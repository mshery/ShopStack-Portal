/**
 * HTTP Client
 *
 * Centralized HTTP client for API communication.
 * Currently uses local data - will be connected to real backend in the future.
 */

import seedData from "@/data/seed.json";

// Re-export seed data for use by API modules
export { seedData };

/**
 * Simulates an API delay for realistic UX
 */
export async function simulateDelay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * HTTP client placeholder for future backend integration
 * Currently all data operations work with local seed data
 */
export const httpClient = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get<T>(_endpoint: string): Promise<T> {
    await simulateDelay();
    throw new Error("HTTP client not implemented - use local data");
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async post<T>(_endpoint: string, _data: unknown): Promise<T> {
    await simulateDelay();
    throw new Error("HTTP client not implemented - use local data");
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async put<T>(_endpoint: string, _data: unknown): Promise<T> {
    await simulateDelay();
    throw new Error("HTTP client not implemented - use local data");
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete<T>(_endpoint: string): Promise<T> {
    await simulateDelay();
    throw new Error("HTTP client not implemented - use local data");
  },
};
