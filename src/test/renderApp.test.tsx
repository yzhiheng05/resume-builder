import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach } from "vitest";
import App from "../App";
import { useResumeStore } from "../store/useResumeStore";

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
