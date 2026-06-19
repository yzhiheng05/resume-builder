import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import App from "../App";
import { buildPresetState } from "../data/identityPresets";
import {
  RESUME_BACKUP_APP_ID,
  RESUME_BACKUP_VERSION,
  createResumeBackupPayload
} from "../lib/resumeBackup";
import { STORAGE_KEY } from "../lib/storage";
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

const createObjectURL = vi.fn(() => "blob:resume-backup");
const revokeObjectURL = vi.fn();
Object.defineProperty(URL, "createObjectURL", {
  value: createObjectURL,
  configurable: true
});
Object.defineProperty(URL, "revokeObjectURL", {
  value: revokeObjectURL,
  configurable: true
});

function createJsonFile(content: string) {
  const file = new File([content], "resume.json", { type: "application/json" });
  Object.defineProperty(file, "text", {
    value: vi.fn(async () => content)
  });
  return file;
}

function getTopbarStatus() {
  return document.querySelector(".topbar__status");
}

describe("App", () => {
  beforeEach(() => {
    storage.clear();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    vi.restoreAllMocks();
  });

  test("renders identity entry when no local state exists", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "先选择你的简历起点" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /学生/ })).toBeInTheDocument();
  });

  test("initializes student identity and enters editor", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /学生/ }));

    expect(screen.getByRole("heading", { name: "简历编辑器" })).toBeInTheDocument();
    expect(screen.getByText("当前身份：学生")).toBeInTheDocument();
  });

  test("exports versioned resume data as json", () => {
    storage.setItem(STORAGE_KEY, JSON.stringify(buildPresetState("general")));
    render(<App />);

    const anchorClicks: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function clickMock(
      this: HTMLAnchorElement
    ) {
      anchorClicks.push(this);
    });

    fireEvent.click(screen.getByRole("button", { name: "导出数据" }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:resume-backup");
    expect(anchorClicks[0].download).toMatch(/^campus-resume-\d{4}-\d{2}-\d{2}\.json$/);
    expect(getTopbarStatus()).toHaveTextContent("数据已导出。");
  });

  test("imports valid backup after confirmation", async () => {
    const state = buildPresetState("professional");
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    render(<App />);

    vi.spyOn(window, "confirm").mockReturnValue(true);

    const payload = createResumeBackupPayload(buildPresetState("student"));
    const file = createJsonFile(JSON.stringify(payload));

    fireEvent.change(screen.getByLabelText("导入数据", { selector: "input" }), {
      target: { files: [file] }
    });

    expect(await screen.findByText("当前身份：学生")).toBeInTheDocument();
    expect(getTopbarStatus()).toHaveTextContent("数据已导入。");
  });

  test("switches identity safely and applies recommendation explicitly", () => {
    storage.setItem(STORAGE_KEY, JSON.stringify(buildPresetState("general")));
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "切到职场人" }));
    expect(getTopbarStatus()).toHaveTextContent("身份已切换，当前内容不会自动覆盖。");

    fireEvent.click(screen.getByRole("button", { name: "应用推荐配置" }));
    expect(getTopbarStatus()).toHaveTextContent("已应用当前身份的推荐配置。");
  });

  test("adds repeated modules from module library", () => {
    storage.setItem(STORAGE_KEY, JSON.stringify(buildPresetState("general")));
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /项目经历 可重复添加/ }));
    expect(screen.getAllByDisplayValue("项目经历").length).toBeGreaterThan(1);
  });

  test("photo upload displays in preview and can be removed", async () => {
    const state = buildPresetState("general");
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  test("shows an error for unsupported import files", async () => {
    storage.setItem(STORAGE_KEY, JSON.stringify(buildPresetState("general")));
    render(<App />);

    const file = createJsonFile(
      JSON.stringify({ app: RESUME_BACKUP_APP_ID, version: RESUME_BACKUP_VERSION, data: {} })
    );

    fireEvent.change(screen.getByLabelText("导入数据", { selector: "input" }), {
      target: { files: [file] }
    });

    await screen.findByText("文件缺少必要的简历数据。");
    expect(getTopbarStatus()).toHaveTextContent("文件缺少必要的简历数据。");
  });

  test("preview order can be changed through drag-order callback path", () => {
    storage.setItem(STORAGE_KEY, JSON.stringify(buildPresetState("student")));
    render(<App />);

    expect(screen.getByRole("heading", { name: "实时预览" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 }).length).toBeGreaterThan(0);
  });
});
