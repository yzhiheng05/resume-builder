import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import App from "../App";
import { buildPresetState, RESUME_TOOL_BRAND } from "../data/identityPresets";
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

function getTopbarIdentity() {
  return document.querySelector(".topbar__identity");
}

function getPreviewHeader() {
  return document.querySelector(".preview-panel__heading-group") as HTMLElement;
}

function getMainPreviewSurface() {
  return document.querySelector(".preview-surface .resume-paper:not(.resume-paper--thumbnail)") as HTMLElement;
}

function resetStoreToEmpty() {
  useResumeStore.setState({
    selectedIdentity: null,
    templateId: "classic",
    hasUserSelectedTemplate: false,
    modules: [],
    moduleOrder: [],
    hasStoredState: false
  });
}

function seedStoredResume(identity: "student" | "professional" | "general") {
  const state = buildPresetState(identity);
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
  useResumeStore.getState().replaceResumeState(state);
}

describe("App", () => {
  beforeEach(() => {
    storage.clear();
    resetStoreToEmpty();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    vi.restoreAllMocks();
  });

  test("renders identity entry when no local state exists", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "选择简历结构" })).toBeInTheDocument();
    expect(screen.getByText(RESUME_TOOL_BRAND)).toBeInTheDocument();
    expect(screen.getByText("选择起点")).toBeInTheDocument();
    expect(screen.getByText("纸面编辑")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /学生/ })).toBeInTheDocument();
  });

  test("initializes student identity and shows file-style title", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /学生/ }));

    expect(screen.getByRole("heading", { name: "模块" })).toBeInTheDocument();
    expect(screen.getByLabelText("纸面状态")).toHaveTextContent("校招简历");
    expect(screen.getByRole("heading", { name: "属性" })).toBeInTheDocument();
    expect(screen.getByLabelText("简历名称")).toHaveValue("新建简历");
    expect(getTopbarIdentity()).toHaveTextContent("学生");
    expect(getPreviewHeader()).toHaveTextContent("校招简历");
    expect(screen.getByRole("heading", { name: "当前纸面" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /选择模块：个人信息/ })).toHaveClass("module-outline__item--active");
    expect(document.querySelector(".module-outline__grip")).toBeInTheDocument();
    expect(document.querySelector(".module-outline__index")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /选择模块：项目经历/ }));
    expect(screen.getByRole("button", { name: /选择模块：项目经历/ })).toHaveClass("module-outline__item--active");
    expect(screen.getByText("可拖动排序")).toBeInTheDocument();
    const moduleDrawer = document.querySelector(".module-add-drawer") as HTMLDetailsElement;
    expect(moduleDrawer.open).toBe(false);
    expect(screen.getByText("添加模块")).toBeInTheDocument();
    fireEvent.click(screen.getByText("添加模块"));
    expect(moduleDrawer.open).toBe(true);
    expect(screen.getByRole("button", { name: /项目经历 添加/ })).toBeInTheDocument();
    const libraryPanel = document.querySelector(".editor-sidebar--library") as HTMLElement;
    const inspectorPanel = document.querySelector(".inspector-panel") as HTMLElement;
    expect(within(libraryPanel).getByRole("heading", { name: "纸张样式" })).toBeInTheDocument();
    expect(within(libraryPanel).getByRole("group", { name: "当前模板" })).toBeInTheDocument();
    expect(within(inspectorPanel).queryByRole("heading", { name: "纸张样式" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("简历模板选择器")).not.toBeInTheDocument();
  });

  test("exports versioned resume data as json", () => {
    seedStoredResume("general");
    render(<App />);

    const anchorClicks: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function clickMock(
      this: HTMLAnchorElement
    ) {
      anchorClicks.push(this);
    });

    fireEvent.click(screen.getByRole("button", { name: "导出 JSON" }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:resume-backup");
    expect(anchorClicks[0].download).toMatch(/^campus-resume-\d{4}-\d{2}-\d{2}\.json$/);
    expect(getTopbarStatus()).toHaveTextContent("数据已导出。");
  });

  test("edits the document title and includes it in exported json", () => {
    seedStoredResume("general");
    render(<App />);

    const titleInput = screen.getByLabelText("简历名称");
    fireEvent.change(titleInput, { target: { value: "前端求职简历" } });

    const anchorClicks: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function clickMock(
      this: HTMLAnchorElement
    ) {
      anchorClicks.push(this);
    });

    fireEvent.click(screen.getByRole("button", { name: "导出 JSON" }));

    expect(titleInput).toHaveValue("前端求职简历");
    const storedState = JSON.parse(storage.getItem(STORAGE_KEY) ?? "{}");
    expect(storedState.documentTitle).toBe("前端求职简历");
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(anchorClicks[0].download).toMatch(/^campus-resume-\d{4}-\d{2}-\d{2}\.json$/);
  });

  test("imports valid backup after confirmation", async () => {
    seedStoredResume("professional");
    render(<App />);

    vi.spyOn(window, "confirm").mockReturnValue(true);

    const payload = createResumeBackupPayload(buildPresetState("student"));
    const file = createJsonFile(JSON.stringify(payload));

    fireEvent.change(screen.getByLabelText("导入 JSON", { selector: "input" }), {
      target: { files: [file] }
    });

    await screen.findByDisplayValue("新建简历");
    expect(getTopbarIdentity()).toHaveTextContent("学生");
    expect(screen.getByLabelText("简历名称")).toHaveValue("新建简历");
    expect(getPreviewHeader()).toHaveTextContent("校招简历");
    expect(getTopbarStatus()).toHaveTextContent("数据已导入。");
  });

  test("uses stored identity with a file-style title when entering editor directly", () => {
    seedStoredResume("professional");
    render(<App />);

    expect(getTopbarIdentity()).toHaveTextContent("职场人");
    expect(screen.getByLabelText("简历名称")).toHaveValue("新建简历");
    expect(getPreviewHeader()).toHaveTextContent("经典简历");
    expect(screen.getByLabelText("模块标题")).toHaveValue("个人信息");
    expect(document.querySelector(".inspector-context")).toHaveTextContent("个人信息");
    const inspectorPanel = document.querySelector(".inspector-panel") as HTMLElement;
    expect(within(inspectorPanel).getByText("模块")).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("资料")).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("基础字段")).toBeInTheDocument();
    expect(within(inspectorPanel).queryByRole("button", { name: "复制模块" })).not.toBeInTheDocument();
    expect(within(inspectorPanel).queryByRole("button", { name: "删除模块" })).not.toBeInTheDocument();
  });

  test("personal inspector uses compact field rows with icon visibility switches", () => {
    seedStoredResume("general");
    render(<App />);

    const inspectorPanel = document.querySelector(".inspector-panel") as HTMLElement;
    const phoneSwitch = within(inspectorPanel).getByRole("checkbox", { name: "手机显示到简历" });

    expect(inspectorPanel.querySelectorAll(".personal-field-row").length).toBeGreaterThanOrEqual(7);
    expect(within(inspectorPanel).getByLabelText("姓名")).toHaveValue("陈知远");
    expect(phoneSwitch.closest(".visibility-toggle--icon")).not.toHaveTextContent("显示到简历");
    expect(within(getMainPreviewSurface()).getByText("137 0000 8800")).toBeInTheDocument();

    fireEvent.click(phoneSwitch);

    expect(within(getMainPreviewSurface()).queryByText("137 0000 8800")).not.toBeInTheDocument();
  });

  test("switches identity safely without changing the file-style title", () => {
    seedStoredResume("general");
    render(<App />);

    expect(screen.getByLabelText("简历名称")).toHaveValue("新建简历");
    expect(getPreviewHeader()).toHaveTextContent("经典简历");

    fireEvent.click(screen.getByRole("button", { name: "职场" }));
    expect(screen.getByLabelText("简历名称")).toHaveValue("新建简历");
    expect(getPreviewHeader()).toHaveTextContent("经典简历");
    expect(getTopbarStatus()).toHaveTextContent("身份已切换，当前内容不会自动覆盖。");

    fireEvent.click(screen.getByRole("button", { name: "推荐模块" }));
    expect(getTopbarStatus()).toHaveTextContent("已应用当前身份的推荐配置。");
  });

  test("adds repeated modules from module library", () => {
    seedStoredResume("general");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /项目经历 添加/ }));
    expect(screen.getAllByText("项目经历").length).toBeGreaterThan(1);
    expect(screen.getByLabelText("模块标题")).toHaveValue("项目经历");
  });

  test("renders module library as a persistent left panel", () => {
    seedStoredResume("general");
    render(<App />);

    expect(screen.getByRole("heading", { name: "模块" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /技能 添加/ })).toBeInTheDocument();
  });

  test("renders the polished workbench chrome with grouped controls", () => {
    seedStoredResume("general");
    render(<App />);

    expect(screen.getByRole("navigation", { name: "身份切换" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "文件操作" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "编辑工具" })).toBeInTheDocument();
    expect(getTopbarStatus()).toHaveTextContent("本地草稿");
    expect(screen.getByRole("button", { name: "推荐模块" })).toHaveTextContent("推荐");
    expect(screen.getByRole("status", { name: "画布状态" })).toHaveTextContent("经典简历");
    expect(screen.getByText("基础内容")).toBeInTheDocument();
    expect(screen.getByText("经历模块")).toBeInTheDocument();
    expect(screen.getByText("补充亮点")).toBeInTheDocument();
  });

  test("edits selected canvas module from the inspector", () => {
    seedStoredResume("general");
    render(<App />);

    fireEvent.click(screen.getAllByText("职业摘要")[0]);
    const titleInput = screen.getByLabelText("模块标题");
    fireEvent.change(titleInput, { target: { value: "个人优势" } });
    const inspectorPanel = document.querySelector(".inspector-panel") as HTMLElement;

    expect(screen.getAllByText("个人优势").length).toBeGreaterThan(0);
    expect(within(inspectorPanel).getByText("模块")).toBeInTheDocument();
    expect(inspectorPanel.querySelector(".inspector-module-card")).toBeInTheDocument();
    expect(inspectorPanel.querySelectorAll(".inspector-module-row").length).toBe(2);
    expect(within(inspectorPanel).getByText("内容")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "复制模块" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除模块" })).toBeInTheDocument();
  });

  test("timeline inspector uses the same section rhythm as personal modules", () => {
    seedStoredResume("general");
    render(<App />);

    fireEvent.click(screen.getAllByText("项目经历")[0]);

    const inspectorPanel = document.querySelector(".inspector-panel") as HTMLElement;
    expect(within(inspectorPanel).getByText("模块")).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("条目")).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("条目 1")).toBeInTheDocument();
    expect(within(inspectorPanel).getByRole("button", { name: "删除条目 1" })).toBeInTheDocument();
    expect(within(inspectorPanel).getByLabelText("标题")).toBeInTheDocument();
  });

  test("list inspector uses compact entry headers instead of side delete buttons", () => {
    seedStoredResume("general");
    render(<App />);

    fireEvent.click(screen.getAllByText("技能")[0]);

    const inspectorPanel = document.querySelector(".inspector-panel") as HTMLElement;
    expect(within(inspectorPanel).getByText("条目 1")).toBeInTheDocument();
    expect(within(inspectorPanel).getByRole("button", { name: "删除技能 1" })).toBeInTheDocument();
    expect(inspectorPanel.querySelector(".inspector-list-row")).toBeInTheDocument();
  });

  test("confirms module deletion with an in-app dialog instead of browser confirm", () => {
    seedStoredResume("general");
    render(<App />);

    const confirmSpy = vi.spyOn(window, "confirm").mockImplementation(() => {
      throw new Error("browser confirm should not be used for module deletion");
    });
    const previewSurface = getMainPreviewSurface();
    fireEvent.click(within(previewSurface).getByRole("heading", { name: "职业摘要" }));
    fireEvent.click(screen.getByRole("button", { name: "删除模块" }));

    const dialog = screen.getByRole("dialog", { name: "删除模块" });
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(dialog).toHaveTextContent("职业摘要");

    fireEvent.click(within(dialog).getByRole("button", { name: "取消" }));
    expect(screen.queryByRole("dialog", { name: "删除模块" })).not.toBeInTheDocument();
    expect(within(previewSurface).getByRole("heading", { name: "职业摘要" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "删除模块" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "删除模块" })).getByRole("button", { name: "确认删除" }));

    expect(within(previewSurface).queryByRole("heading", { name: "职业摘要" })).not.toBeInTheDocument();
  });

  test("applies selected style controls to the resume paper", () => {
    seedStoredResume("general");
    render(<App />);

    fireEvent.change(screen.getByLabelText("主题色", { selector: "input" }), { target: { value: "#0f766e" } });
    fireEvent.click(within(screen.getByRole("group", { name: "主题色预设" })).getByRole("button", { name: "应用主题色 #111111" }));
    fireEvent.change(screen.getByLabelText("主题色", { selector: "input" }), { target: { value: "#0f766e" } });
    fireEvent.click(within(screen.getByRole("group", { name: "字体密度" })).getByRole("button", { name: "紧凑" }));
    fireEvent.click(within(screen.getByRole("group", { name: "标题样式" })).getByRole("button", { name: "色条" }));
    fireEvent.change(screen.getByLabelText("字号"), { target: { value: "15.5" } });
    fireEvent.change(screen.getByLabelText("行距"), { target: { value: "1.7" } });
    fireEvent.change(screen.getByLabelText("段落间距"), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("左右页边距"), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText("上下页边距"), { target: { value: "22" } });

    const typographyGroup = screen.getByRole("group", { name: "排版" });
    const spacingGroup = screen.getByRole("group", { name: "间距" });

    expect(within(typographyGroup).getByLabelText("字号")).toHaveValue(15.5);
    expect(within(typographyGroup).getByLabelText("行距")).toHaveValue(1.7);
    expect(within(typographyGroup).getByLabelText("段落间距")).toHaveValue(8);
    expect(within(spacingGroup).getByLabelText("左右页边距")).toHaveValue(20);
    expect(within(spacingGroup).getByLabelText("上下页边距")).toHaveValue(22);
    expect(getMainPreviewSurface()).toHaveStyle({ "--resume-accent": "#0f766e" });
    expect(getMainPreviewSurface()).toHaveStyle({ "--resume-font-size": "15.5px" });
    expect(getMainPreviewSurface()).toHaveStyle({ "--resume-line-height": "1.7" });
    expect(getMainPreviewSurface()).toHaveStyle({ "--resume-paragraph-gap": "8px" });
    expect(getMainPreviewSurface()).toHaveStyle({ "--resume-page-margin-x": "20mm" });
    expect(getMainPreviewSurface()).toHaveStyle({ "--resume-page-margin-y": "22mm" });
    expect(getMainPreviewSurface()).toHaveClass("resume-density-compact");
    expect(getMainPreviewSurface()).toHaveClass("resume-heading-bar");
    expect(within(screen.getByRole("group", { name: "当前模板" })).getByRole("button", { name: "经典简历" })).toHaveClass(
      "template-chip--active"
    );
    expect(screen.getByText("#0F766E")).toBeInTheDocument();
    expect(within(screen.getByRole("group", { name: "主题色预设" })).getByRole("button", { name: "应用主题色 #111111" })).not.toHaveClass(
      "is-active"
    );
  });

  test("renders empty resume content as draft skeletons instead of visible form prompts", () => {
    const state = buildPresetState("student");
    const summaryModule = state.modules.find((module) => module.kind === "summary");
    if (!summaryModule || !("value" in summaryModule.data)) {
      throw new Error("Expected preset to include a summary module");
    }
    summaryModule.data = { value: "" };
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    useResumeStore.getState().replaceResumeState(state);
    render(<App />);

    const previewSurface = getMainPreviewSurface();

    expect(within(previewSurface).queryByText("摘要内容")).not.toBeInTheDocument();
    expect(within(previewSurface).getByLabelText("摘要内容")).toBeInTheDocument();
    expect(previewSurface.querySelectorAll(".resume-placeholder__line").length).toBeGreaterThan(0);
    expect(within(previewSurface).getByText("宋哈娜")).toBeInTheDocument();
  });

  test("renders personal contacts as separate paper items", () => {
    const state = buildPresetState("general");
    const personalModule = state.modules.find((module) => module.kind === "personal");
    if (!personalModule || !("personalVisibility" in personalModule.data)) {
      throw new Error("Expected preset to include a personal module");
    }

    personalModule.data = {
      ...personalModule.data,
      name: "林知夏",
      phone: "139-1111-2222",
      email: "linzhixia@example.com",
      city: "上海",
      github: "github.com/linzhixia",
      personalVisibility: {
        ...personalModule.data.personalVisibility,
        phone: true,
        email: true,
        city: true,
        github: true
      }
    };
    useResumeStore.getState().replaceResumeState(state);

    render(<App />);

    const previewSurface = getMainPreviewSurface();
    const contacts = previewSurface.querySelector(".resume-personal__contacts");

    expect(contacts?.querySelectorAll(".resume-personal__contact-item")).toHaveLength(4);
    expect(contacts).toHaveTextContent("linzhixia@example.com");
    expect(contacts).not.toHaveTextContent("139-1111-2222 · linzhixia@example.com");
  });

  test("photo upload displays in preview and can be removed", async () => {
    seedStoredResume("general");
    render(<App />);

    const fileInput = screen.getByLabelText("上传照片", { selector: "input" });
    const photo = new File(["photo"], "photo.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [photo] } });

    const previewSurface = getMainPreviewSurface();
    const previewPhoto = await within(previewSurface).findByAltText("个人照片");

    expect(previewPhoto).toHaveAttribute(
      "src",
      "data:image/jpeg;base64,photo"
    );

    fireEvent.click(screen.getByRole("button", { name: "移除照片" }));
    expect(within(previewSurface).queryByAltText("个人照片")).not.toBeInTheDocument();
  });

  test("shows an error for unsupported import files", async () => {
    seedStoredResume("general");
    render(<App />);

    const file = createJsonFile(
      JSON.stringify({ app: RESUME_BACKUP_APP_ID, version: RESUME_BACKUP_VERSION, data: {} })
    );

    fireEvent.change(screen.getByLabelText("导入 JSON", { selector: "input" }), {
      target: { files: [file] }
    });

    await screen.findByText("文件缺少必要的简历数据。");
    expect(getTopbarStatus()).toHaveTextContent("文件缺少必要的简历数据。");
  });

  test("preview order can be changed through drag-order callback path", () => {
    seedStoredResume("student");
    render(<App />);

    expect(screen.getByRole("heading", { name: "纸面" })).toBeInTheDocument();
    const previewPanel = screen.getByLabelText("简历预览面板");
    expect(within(previewPanel).getByText("可拖动排序")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 }).length).toBeGreaterThan(0);
  });

  test("switches template from the inspector style controls", () => {
    seedStoredResume("general");
    useResumeStore.getState().selectModule(null);
    render(<App />);

    const selector = screen.getByRole("group", { name: "当前模板" });
    fireEvent.click(within(selector).getByRole("button", { name: /双栏简历/ }));

    expect(getTopbarStatus()).toHaveTextContent("已切换到双栏简历。");
    expect(within(selector).getByRole("button", { name: /双栏简历/ })).toHaveClass("template-chip--active");
    expect(screen.getByText("同栏排序")).toBeInTheDocument();
    expect(screen.queryByLabelText("简历模板选择器")).not.toBeInTheDocument();
  });

  test("renders all template chips in the inspector style controls", () => {
    seedStoredResume("general");
    useResumeStore.getState().selectModule(null);
    render(<App />);

    const selector = screen.getByRole("group", { name: "当前模板" });
    expect(within(selector).getByRole("button", { name: "经典简历" })).toHaveClass("template-chip--active");
    expect(within(selector).getByRole("button", { name: "双栏简历" })).toBeInTheDocument();
    expect(within(selector).getByRole("button", { name: "校招简历" })).toBeInTheDocument();
    expect(screen.queryByLabelText("简历模板选择器")).not.toBeInTheDocument();
  });
});
