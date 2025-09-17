import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TaskForm from "./TaskForm";
import { vi } from "vitest";

vi.mock(
  "@/components/ui/molecules/modals/image-upload/ImageContentData",
  () => ({
    default: ({ onUpload }: { onUpload: (file: File) => void }) => (
      <div>
        <button
          onClick={() => {
            const mockFile = new File(["sample file"], "sample.jpg", {
              type: "image/jpeg",
            });
            onUpload(mockFile);
          }}
          data-testid="mock-upload-trigger"
        >
          Upload
        </button>
      </div>
    ),
  }),
);

describe("TaskForm Component", () => {
  it("renders task form with Add Task heading", () => {
    render(<TaskForm selectedDay={1} />);
    
    expect(screen.getByText("Add Task")).toBeInTheDocument();
  });

  it("renders task title input field", () => {
    render(<TaskForm selectedDay={1} />);
    const titleInput = screen.getByPlaceholderText("Task Title");
    expect(titleInput).toBeInTheDocument();
    expect(titleInput.tagName).toBe("INPUT");
  });

  it("renders submit button", () => {
    render(<TaskForm selectedDay={1} />);
    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton.tagName).toBe("BUTTON");
    expect(submitButton).toHaveTextContent("Submit");
  });

  it("shows content type buttons when add button is clicked", () => {
    render(<TaskForm selectedDay={1} />);
    expect(screen.queryByText("Enter YouTube URL")).not.toBeInTheDocument();
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    expect(screen.getByTestId("image-button")).toBeInTheDocument();
    expect(screen.getByTestId("music-button")).toBeInTheDocument();
    expect(screen.getByTestId("video-button")).toBeInTheDocument();
    expect(screen.getByTestId("text-button")).toBeInTheDocument();
    expect(screen.getByTestId("pecha-button")).toBeInTheDocument();
  });

  it("allows typing in title input", () => {
    render(<TaskForm selectedDay={1} />);
    const titleInput = screen.getByPlaceholderText("Task Title");
    fireEvent.change(titleInput, { target: { value: "Test Task Title" } });
    expect(titleInput).toHaveValue("Test Task Title");
  });

  it("shows video input when video content type is selected", () => {
    render(<TaskForm selectedDay={1} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const videoButton = screen.getByTestId("video-button");
    fireEvent.click(videoButton);
    expect(screen.getByPlaceholderText("Enter YouTube URL")).toBeInTheDocument();
  });

  it("shows text input when text content type is selected", () => {
    render(<TaskForm selectedDay={1} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const textButton = screen.getByTestId("text-button");
    fireEvent.click(textButton);
    expect(screen.getByPlaceholderText("Enter your text content")).toBeInTheDocument();
  });

  it("shows music input when music content type is selected", () => {
    render(<TaskForm selectedDay={1} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const musicButton = screen.getByTestId("music-button");
    fireEvent.click(musicButton);
    expect(screen.getByPlaceholderText("Enter Spotify or SoundCloud URL")).toBeInTheDocument();
  });

  it("validates YouTube URL and shows error for invalid URL", () => {
    render(<TaskForm selectedDay={1} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const videoButton = screen.getByTestId("video-button");
    fireEvent.click(videoButton);
    const videoInput = screen.getByPlaceholderText("Enter YouTube URL");
    fireEvent.change(videoInput, { target: { value: "invalid-url" } });
    expect(screen.getByText("Please enter a valid YouTube URL")).toBeInTheDocument();
  });

  it("validates music URL and shows error for invalid URL", () => {
    render(<TaskForm selectedDay={1} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const musicButton = screen.getByTestId("music-button");
    fireEvent.click(musicButton);
    const musicInput = screen.getByPlaceholderText("Enter Spotify or SoundCloud URL");
    fireEvent.change(musicInput, { target: { value: "invalid-url" } });
    expect(screen.getByText("Please enter a valid music platform URL")).toBeInTheDocument();
  });

  it("allows typing in text content textarea", () => {
    render(<TaskForm selectedDay={1} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const textButton = screen.getByTestId("text-button");
    fireEvent.click(textButton);
    const textArea = screen.getByPlaceholderText("Enter your text content");
    fireEvent.change(textArea, { target: { value: "Test content" } });
    expect(textArea).toHaveValue("Test content");
  });

  it("opens image dialog when image button is clicked", async () => {
    render(<TaskForm selectedDay={1} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const imageButton = screen.getByTestId("image-button");
    fireEvent.click(imageButton);
    await waitFor(() => {
      expect(screen.getByText("Upload & Crop Image")).toBeInTheDocument();
    });
  });

  it("clears form data when submitted", () => {
    render(<TaskForm selectedDay={1} />);
    const titleInput = screen.getByPlaceholderText("Task Title");
    fireEvent.change(titleInput, { target: { value: "Test Task" } });
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const textButton = screen.getByTestId("text-button");
    fireEvent.click(textButton);
    const textArea = screen.getByPlaceholderText("Enter your text content");
    fireEvent.change(textArea, { target: { value: "Test content" } });
    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);
    expect(titleInput).toHaveValue("");
    expect(screen.queryByPlaceholderText("Enter your text content")).not.toBeInTheDocument();
  });

  it("displays image preview and allows removal after upload", async () => {
    render(<TaskForm selectedDay={1} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const imageButton = screen.getByTestId("image-button");
    fireEvent.click(imageButton);
    const uploadTrigger = screen.getByTestId("mock-upload-trigger");
    fireEvent.click(uploadTrigger);
    expect(screen.getByAltText("Task image preview")).toBeInTheDocument();
    expect(screen.getByText("sample.jpg")).toBeInTheDocument();
    const removeButton = screen.getByTestId("remove-image-button");
    fireEvent.click(removeButton);
    expect(screen.queryByAltText("Task image preview")).not.toBeInTheDocument();
  });
  
  it("shows YouTube preview for valid URL", () => {
    render(<TaskForm selectedDay={1} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const videoButton = screen.getByTestId("video-button");
    fireEvent.click(videoButton);
    const videoInput = screen.getByPlaceholderText("Enter YouTube URL");
    fireEvent.change(videoInput, { target: { value: "https://youtube.com/watch?v=dQw4w9WgXcQ" } });
    expect(screen.getByTitle("YouTube preview")).toBeInTheDocument();
  });
});