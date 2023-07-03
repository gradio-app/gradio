import { describe, it, expect } from "vitest";
import { verifyRequirements } from "./requirements";

describe("verifyRequirements", () => {
  const allowedRequirements = [
    [
      "http://files.pythonhosted.org/packages/62/9c/0467dea0a064a998f94c33d03988f33efc744de1a2a550b56b38910cafa2/streamlit-1.13.0-py2.py3-none-any.whl",
    ],
    [
      "https://files.pythonhosted.org/packages/62/9c/0467dea0a064a998f94c33d03988f33efc744de1a2a550b56b38910cafa2/streamlit-1.13.0-py2.py3-none-any.whl",
    ],
  ];
  allowedRequirements.forEach((requirements) => {
    it(`allows http: and https: schemes (requirements=${JSON.stringify(
      requirements
    )})`, () => {
      expect(() => verifyRequirements(requirements)).not.toThrow();
    });
  });

  const notAllowedRequirements = [["emfs:/tmp/foo.whl"], ["file:/tmp/foo.whl"]];
  notAllowedRequirements.forEach((requirements) => {
    it(`throws an error if the requirements include a not allowed scheme (requirements=${JSON.stringify(
      requirements
    )})`, () => {
      expect(() => verifyRequirements(requirements)).toThrow();
    });
  });
});
