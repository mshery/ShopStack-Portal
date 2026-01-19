import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  truncate,
  capitalize,
  getInitials,
} from "../format";

describe("Format Utilities", () => {
  describe("formatCurrency", () => {
    it("should format a number as currency with default USD", () => {
      const result = formatCurrency(99.99);

      expect(result).toBe("$99.99");
    });

    it("should format zero correctly", () => {
      const result = formatCurrency(0);

      expect(result).toBe("$0.00");
    });

    it("should format large numbers with commas", () => {
      const result = formatCurrency(1234567.89);

      expect(result).toBe("$1,234,567.89");
    });

    it("should format with EUR currency code", () => {
      const result = formatCurrency(99.99, "EUR");

      expect(result).toContain("99.99");
    });
  });

  describe("formatNumber", () => {
    it("should format a number with commas", () => {
      const result = formatNumber(1234567);

      expect(result).toBe("1,234,567");
    });

    it("should format zero correctly", () => {
      const result = formatNumber(0);

      expect(result).toBe("0");
    });

    it("should format decimal numbers", () => {
      const result = formatNumber(1234.56);

      expect(result).toBe("1,234.56");
    });
  });

  describe("formatDate", () => {
    it("should format a date string to readable format", () => {
      const result = formatDate("2025-01-15T10:30:00Z");

      expect(result).toContain("2025");
      expect(result).toContain("Jan");
    });

    it("should handle Date object", () => {
      const date = new Date("2025-01-15T10:30:00Z");
      const result = formatDate(date);

      expect(result).toBeTruthy();
      expect(result).toContain("2025");
    });

    it("should return dash for invalid date", () => {
      const result = formatDate("invalid-date");

      expect(result).toBe("—");
    });
  });

  describe("truncate", () => {
    it("should truncate long text", () => {
      const result = truncate(
        "This is a very long text that should be truncated",
        20,
      );

      expect(result).toBe("This is a very long ...");
    });

    it("should not truncate short text", () => {
      const result = truncate("Short", 20);

      expect(result).toBe("Short");
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      const result = capitalize("hello");

      expect(result).toBe("Hello");
    });

    it("should handle all caps", () => {
      const result = capitalize("HELLO");

      expect(result).toBe("Hello");
    });

    it("should handle empty string", () => {
      const result = capitalize("");

      expect(result).toBe("");
    });
  });

  describe("getInitials", () => {
    it("should get initials from full name", () => {
      const result = getInitials("John Doe");

      expect(result).toBe("JD");
    });

    it("should get single initial from single name", () => {
      const result = getInitials("John");

      expect(result).toBe("J");
    });

    it("should return ? for empty name", () => {
      const result = getInitials("");

      expect(result).toBe("?");
    });
  });
});
