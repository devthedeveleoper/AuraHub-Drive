import { create } from 'zustand';
import API from '../services/api';

const useFileStore = create((set) => ({
  breadcrumb: [{ id: '', name: 'My Files' }], // Start with the root
  contents: { folders: [], files: [] },
  isLoading: true,

  // Action to set the breadcrumb path
  setBreadcrumb: (newBreadcrumb) => {
    set({ breadcrumb: newBreadcrumb });
  },

  // Action to fetch contents for a folder
  fetchContents: async (folderId) => {
    set({ isLoading: true });
    try {
      const currentId = folderId || '';
      const response = await API.get(`/files/list/${currentId}`);
      set({ contents: response.data });
    } catch (error) {
      console.error('Could not fetch folder contents.');
      toast.error('Could not fetch folder contents.');
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useFileStore;