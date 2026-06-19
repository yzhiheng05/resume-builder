import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import PreviewPanel, {
  buildPreviewModules,
  getVisibleModuleOrder,
  moveModuleOrder,
  normalizeModuleOrder
} from "../components/preview/PreviewPanel";
import { buildPresetState } from "../data/identityPresets";
import { isListModuleData, isPersonalModuleData, isTextModuleData } from "../lib/moduleRegistry";

const sampleState = buildPresetState("student");

sampleState.modules.push({
  id: "highlight-extra",
  kind: "highlight",
  title: "个人亮点",
  visible: true,
  data: {
    items: ["结果导向", "沟通顺畅"]
  }
});
sampleState.moduleOrder.push("highlight-extra");

function extractHeadings(): string[] {
  return screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent ?? "");
}

describe("preview sorting", () => {
  test("renders modules in moduleOrder order", () => {
    const nextOrder = [sampleState.moduleOrder[3], sampleState.moduleOrder[0], sampleState.moduleOrder[1]];

    render(<PreviewPanel modules={sampleState.modules} moduleOrder={nextOrder} />);

    expect(extractHeadings().slice(0, 3)).toEqual(["项目经历", "个人信息", "职业摘要"]);
  });

  test("renders visible module content", () => {
    const personal = sampleState.modules.find((module) => module.kind === "personal");
    const summary = sampleState.modules.find((module) => module.kind === "summary");
    const skills = sampleState.modules.find((module) => module.kind === "skills");

    if (personal && isPersonalModuleData(personal.data)) {
      personal.data.name = "陈晨";
      personal.data.title = "后端开发实习生";
    }
    if (summary && isTextModuleData(summary.data)) {
      summary.data.value = "熟悉 Web 全栈开发，关注工程效率与用户体验。";
    }
    if (skills && isListModuleData(skills.data)) {
      skills.data.items = ["TypeScript", "React", "Node.js"];
    }

    render(<PreviewPanel modules={sampleState.modules} moduleOrder={sampleState.moduleOrder} />);

    expect(screen.getByText("陈晨")).toBeInTheDocument();
    expect(screen.getByText("熟悉 Web 全栈开发，关注工程效率与用户体验。")).toBeInTheDocument();
    expect(screen.getByText("TypeScript / React / Node.js")).toBeInTheDocument();
  });

  test("filters hidden modules but keeps the chosen order", () => {
    const nextModules = sampleState.modules.map((module) =>
      module.kind === "campus" ? { ...module, visible: false } : module
    );

    expect(getVisibleModuleOrder(sampleState.moduleOrder, nextModules)).not.toContain(
      nextModules.find((module) => module.kind === "campus")?.id
    );
  });

  test("supports module order helpers", () => {
    const normalized = normalizeModuleOrder(["missing", sampleState.moduleOrder[1]], sampleState.modules);
    expect(normalized[0]).toBe(sampleState.moduleOrder[1]);

    const moved = moveModuleOrder(sampleState.moduleOrder, sampleState.moduleOrder[0], sampleState.moduleOrder[3]);
    expect(moved[3]).toBe(sampleState.moduleOrder[0]);

    const previewModules = buildPreviewModules(sampleState.modules, sampleState.moduleOrder);
    expect(previewModules[0]?.title).toBe("个人信息");
  });
});
