import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import axios from "axios";
import { toast } from "react-hot-toast";

// Import all necessary components and stores
import useFileStore from "../store/fileStore";
import useAuthStore from "../store/authStore";
import Breadcrumb from "../components/Breadcrumb";
import CreateFolderModal from "../components/CreateFolderModal";
import RenameModal from "../components/RenameModal";
import FolderItem from "../components/FolderItem";
import FileItem from "../components/FileItem";
import FileManagerToolbar from "../components/FileManagerToolbar";
import UploadModal from "../components/UploadModal";
import VideoPlayerModal from "../components/VideoPlayerModal";

// Defines the grid layout classes for different card sizes
const gridLayouts = {
  small: "grid-cols-4 md:grid-cols-8 lg:grid-cols-10",
  medium: "grid-cols-3 md:grid-cols-6 lg:grid-cols-8",
  large: "grid-cols-2 md:grid-cols-4 lg:grid-cols-5",
};

function FilesPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { contents, isLoading, fetchContents, breadcrumb, setBreadcrumb } =
    useFileStore();

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);

  // State for toolbar controls
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [cardSize, setCardSize] = useState("medium");

  // State for upload progress
  const [isUploading, setIsUploading] = useState(false);
  const [progressData, setProgressData] = useState({
    progress: 0,
    speed: 0,
    timeRemaining: 0,
    fileName: "",
  });
  const progressHistory = useRef({ lastLoaded: 0, lastTime: Date.now() });

  // State for the item being acted upon
  const [selectedItem, setSelectedItem] = useState(null);

  // Initial fetch and breadcrumb setup
  useEffect(() => {
    if (user?.streamtapeFolderId) {
      fetchContents(folderId, user.streamtapeFolderId);
      if (!folderId) {
        setBreadcrumb([{ id: "", name: "My Files" }]);
      }
    }
  }, [folderId, user, fetchContents, setBreadcrumb]);

  const refreshContents = useCallback(() => {
    if (user?.streamtapeFolderId) {
      fetchContents(folderId, user.streamtapeFolderId);
    }
  }, [folderId, user, fetchContents]);

  // --- Action Handlers ---

  const handleCreateFolder = async (folderName) => {
    const parentFolder = folderId || user.streamtapeFolderId;
    const promise = API.post("/files/create-folder", {
      parentFolderId: parentFolder,
      folderName,
    });
    toast.promise(promise, {
      loading: "Creating folder...",
      success: () => {
        refreshContents();
        setIsCreateModalOpen(false);
        return "Folder created!";
      },
      error: "Failed to create folder.",
    });
  };

  const handleLocalUpload = async ({ file, title, description }) => {
    if (!file) return toast.error("Please select a file.");

    const currentFolderId = folderId || user.streamtapeFolderId;
    setIsUploading(true);
    setProgressData({
      progress: 0,
      speed: 0,
      timeRemaining: 0,
      fileName: file.name,
    });
    progressHistory.current = { lastLoaded: 0, lastTime: Date.now() };

    try {
      const urlResponse = await API.post("/videos/get-upload-url", {
        folderId: currentFolderId,
      });
      const uploadUrl = urlResponse.data.url;

      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await axios.post(uploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const currentTime = Date.now();
          const timeElapsed =
            (currentTime - progressHistory.current.lastTime) / 1000;
          const bytesUploaded = loaded - progressHistory.current.lastLoaded;

          if (timeElapsed > 0.5) {
            const speedBps = bytesUploaded / timeElapsed;
            const speedMBs = speedBps / (1024 * 1024);
            const remainingSeconds = (total - loaded) / speedBps;
            setProgressData((prev) => ({
              ...prev,
              speed: speedMBs,
              timeRemaining: remainingSeconds,
            }));
            progressHistory.current = {
              lastLoaded: loaded,
              lastTime: currentTime,
            };
          }
          setProgressData((prev) => ({
            ...prev,
            progress: Math.round((loaded * 100) / total),
          }));
        },
      });

      const streamtapeFileId = uploadResponse.data.result.id;
      await API.post("/videos/save-video-metadata", {
        title,
        description,
        streamtapeFileId,
      });

      toast.success("File uploaded successfully!");
      setIsUploadModalOpen(false);
      refreshContents();
    } catch (error) {
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoteUpload = async ({ url, title, description }) => {
    const currentFolderId = folderId || user.streamtapeFolderId;
    const promise = API.post("/videos/remote-upload", {
      url,
      title,
      description,
      folderId: currentFolderId,
    });
    toast.promise(promise, {
      loading: "Initiating remote upload...",
      success: (res) => {
        setIsUploadModalOpen(false);
        refreshContents();
        return res.data.msg || "Remote upload started!";
      },
      error: (err) =>
        err.response?.data?.msg || "Failed to start remote upload.",
    });
  };

  const handleRenameRequest = async (newName) => {
    if (!selectedItem) return;
    const { type, id, parentFolderId } = selectedItem;
    const promise = API.put(`/files/rename-${type}/${id}`, {
      newName,
      parentFolderId,
    });
    toast.promise(promise, {
      loading: "Renaming...",
      success: () => {
        refreshContents();
        setIsRenameModalOpen(false);
        return "Item renamed!";
      },
      error: "Failed to rename.",
    });
  };

  const handleDeleteRequest = (item, type) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`))
      return;
    const parentFolder = folderId || user.streamtapeFolderId;
    const itemId = type === "file" ? item.linkid : item.id;
    const promise = API.delete(`/files/delete-${type}/${itemId}`, {
      data: { parentFolderId: parentFolder },
    });
    toast.promise(promise, {
      loading: "Deleting...",
      success: () => {
        refreshContents();
        return "Item deleted!";
      },
      error: "Failed to delete.",
    });
  };

  const openRenameModal = (item, type) => {
    const parentFolder = folderId || user.streamtapeFolderId;
    const itemId = type === "file" ? item.linkid : item.id;
    setSelectedItem({
      ...item,
      id: itemId,
      type: type,
      parentFolderId: parentFolder,
    });
    setIsRenameModalOpen(true);
  };

  const handlePlayVideo = (file) => {
    if (file.convert === "converted") {
      setSelectedFileId(file.linkid);
      setIsVideoModalOpen(true);
    } else {
      toast.error("This video is still processing and cannot be played yet.");
    }
  };

  const handleBack = () => {
    if (breadcrumb.length > 1) {
      const newPath = breadcrumb.slice(0, -1);
      setBreadcrumb(newPath);
      const parentFolder = newPath[newPath.length - 1];
      navigate(parentFolder.id ? `/files/${parentFolder.id}` : "/files");
    }
  };

  const filteredAndSortedContents = useMemo(() => {
    const { folders = [], files = [] } = contents;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredFolders = folders.filter((f) =>
      f.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
    const filteredFiles = files.filter((f) =>
      f.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
    const sortFn = (a, b) => {
      if (sortOption === "name-desc") return b.name.localeCompare(a.name);
      return a.name.localeCompare(b.name);
    };
    return {
      folders: filteredFolders.sort(sortFn),
      files: filteredFiles.sort(sortFn),
    };
  }, [contents, searchTerm, sortOption]);

  return (
    <>
      <CreateFolderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateFolder}
      />
      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={handleRenameRequest}
        currentName={selectedItem?.name || ""}
      />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => !isUploading && setIsUploadModalOpen(false)}
        onLocalUpload={handleLocalUpload}
        onRemoteUpload={handleRemoteUpload}
        isUploading={isUploading}
        progressData={progressData}
      />
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        fileId={selectedFileId}
      />

      <div className="max-w-7xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            {breadcrumb.length > 1 && (
              <button
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-gray-200 self-start"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
            )}
            <Breadcrumb />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
            >
              Upload
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
            >
              Create Folder
            </button>
          </div>
        </div>

        <FileManagerToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOption={sortOption}
          onSortChange={setSortOption}
          cardSize={cardSize}
          onCardSizeChange={setCardSize}
        />

        {isLoading ? (
          <p className="text-center py-10">Loading...</p>
        ) : (
          <div className={`grid ${gridLayouts[cardSize]} gap-4`}>
            {filteredAndSortedContents.folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                size={cardSize}
                onRename={(item) => openRenameModal(item, "folder")}
                onDelete={(item) => handleDeleteRequest(item, "folder")}
              />
            ))}
            {filteredAndSortedContents.files.map((file) => (
              <FileItem
                key={file.linkid}
                file={file}
                size={cardSize}
                onRename={(item) => openRenameModal(item, "file")}
                onDelete={(item) => handleDeleteRequest(item, "file")}
                onPlay={handlePlayVideo}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default FilesPage;
