import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import App from "../App";
import { useResumeStore } from "../store/useResumeStore";

vi.mock("../lib/image", () => ({
  fileToResizedDataUrl: vi.fn(async () => "data:image/jpeg;base64,photo")
}));

function createMemoryStorage(): Storage {
  const data = new Map<string, string>();

  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key) {
      return data.has(key) ? data.get(key)! : null;
    },
    key(index) {
      return [...data.keys()][index] ?? null;
    },
    removeItem(key) {
      data.delete(key);
    },
    setItem(key, value) {
      data.set(key, value);
    }
  };
}

const storage = createMemoryStorage();
Object.defineProperty(window, "localStorage", {
  value: storage,
  configurable: true
});

function expandSection(name: string) {
  const toggle = screen.getByRole("checkbox", { name });
  const card = toggle.closest(".section-card");
  expect(card).not.toBeNull();
  fireEvent.click(within(card as HTMLElement).getByRole("button", { name: /显示中/i }));
}

function getInputCountByLabel(label: RegExp) {
  return screen
    .getAllByLabelText(label)
    .filter((node) => node.tagName.toLowerCase() === "input").length;
}

function getTextareaCountByLabel(label: RegExp) {
  return screen
    .getAllByLabelText(label)
    .filter((node) => node.tagName.toLowerCase() === "textarea").length;
}

describe("App", () => {
  beforeEach(() => {
    storage.clear();
    useResumeStore.getState().reset();
  });

  test("renders chinese editor and preview headings", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "简历编辑器" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "实时预览" })).toBeInTheDocument();
  });

  test("personal edits drive preview", () => {
    render(<App />);

    const nameInput = screen.getByLabelText("姓名");
    fireEvent.change(nameInput, { target: { value: "李雷" } });

    expect(screen.getByText("李雷")).toBeInTheDocument();
  });

  test("optional personal fields can be shown, hidden, and keep draft values", () => {
    render(<App />);

    const blogInput = screen.getByLabelText("个人博客");
    fireEvent.change(blogInput, { target: { value: "zhangsan.dev" } });
    expect(screen.queryByText(/zhangsan\.dev/)).not.toBeInTheDocument();

    fireEvent.click(within(blogInput.closest(".personal-field") as HTMLElement).getByLabelText("显示到简历"));
    expect(screen.getByText(/zhangsan\.dev/)).toBeInTheDocument();

    fireEvent.click(within(blogInput.closest(".personal-field") as HTMLElement).getByLabelText("显示到简历"));
    expect(screen.queryByText(/zhangsan\.dev/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("个人博客")).toHaveValue("zhangsan.dev");
  });

  test("personal photo upload displays in preview and can be removed", async () => {
    render(<App />);

    const fileInput = screen.getByLabelText("上传照片", { selector: "input" });
    const photo = new File(["photo"], "photo.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [photo] } });

    expect(await screen.findByAltText("个人照片")).toHaveAttribute(
      "src",
      "data:image/jpeg;base64,photo"
    );

    fireEvent.click(screen.getByRole("button", { name: "移除照片" }));
    expect(screen.queryByAltText("个人照片")).not.toBeInTheDocument();
  });

  test("education entries can be added and deleted", () => {
    render(<App />);

    expandSection("教育经历");

    fireEvent.click(screen.getByRole("button", { name: "新增教育经历" }));
    expect(screen.getAllByLabelText("学校").length).toBe(2);

    fireEvent.click(screen.getAllByRole("button", { name: /删除教育经历条目/i })[0]);
    expect(screen.getAllByLabelText("学校").length).toBe(1);
  });

  test("bullet entries edit independently in project sections", () => {
    render(<App />);

    expandSection("项目经历");

    const bulletInput = screen.getByLabelText("亮点 1");
    expect(bulletInput.tagName.toLowerCase()).toBe("textarea");
    fireEvent.change(bulletInput, { target: { value: "新的项目亮点" } });

    expect(screen.getAllByText("新的项目亮点").length).toBeGreaterThan(0);
  });

  test("skills stay single-line while awards support multiline editing", () => {
    render(<App />);

    expandSection("技能");

    fireEvent.click(screen.getByRole("button", { name: "新增技能" }));
    expect(getInputCountByLabel(/^技能 \d+$/)).toBeGreaterThan(3);
    expect(getTextareaCountByLabel(/^技能 \d+$/)).toBe(0);

    expandSection("获奖 / 证书");

    const awardTextareaCountBefore = getTextareaCountByLabel(/^获奖 \/ 证书 \d+$/);
    fireEvent.click(screen.getByRole("button", { name: "新增获奖 / 证书" }));
    expect(getTextareaCountByLabel(/^获奖 \/ 证书 \d+$/)).toBe(awardTextareaCountBefore + 1);
    expect(screen.getByLabelText("获奖 / 证书 1").tagName.toLowerCase()).toBe("textarea");
  });

  test("section toggle hides preview block", () => {
    render(<App />);

    const toggles = screen.getAllByRole("checkbox");
    fireEvent.click(toggles[0]);

    expect(screen.queryByText("张三")).not.toBeInTheDocument();
  });

  test("only personal section is expanded by default", () => {
    render(<App />);

    expect(screen.getByLabelText("姓名")).toBeInTheDocument();
    expect(screen.queryByLabelText("学校")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("标题")).not.toBeInTheDocument();
  });

  test("expanding a section collapses the previous one", () => {
    render(<App />);

    const educationToggle = screen.getByRole("checkbox", { name: "教育经历" });
    const educationCard = educationToggle.closest(".section-card");
    expect(educationCard).not.toBeNull();

    const expandButton = within(educationCard as HTMLElement).getByRole("button", { name: /显示中/i });
    fireEvent.click(expandButton);

    expect(screen.getByLabelText("学校")).toBeInTheDocument();
    expect(screen.queryByLabelText("姓名")).not.toBeInTheDocument();
  });

  test("clicking a preview section expands the matching editor section", () => {
    render(<App />);

    const previewSection = screen.getByRole("region", { name: "项目经历" });
    fireEvent.click(previewSection);

    expect(screen.getByLabelText("标题")).toBeInTheDocument();
    expect(screen.queryByLabelText("姓名")).not.toBeInTheDocument();
  });

  test("hiding the active section falls back to a nearby visible section", () => {
    render(<App />);

    const educationToggle = screen.getByRole("checkbox", { name: "教育经历" });
    const educationCard = educationToggle.closest(".section-card");
    expect(educationCard).not.toBeNull();

    const expandEducation = within(educationCard as HTMLElement).getByRole("button", { name: /显示中/i });
    fireEvent.click(expandEducation);

    fireEvent.click(educationToggle);

    expect(screen.queryByLabelText("学校")).not.toBeInTheDocument();
    expect(screen.getByLabelText("标题")).toBeInTheDocument();
  });
});
