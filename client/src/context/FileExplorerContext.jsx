import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const FileExplorerContext = createContext();

const API_URL = "http://localhost:8000/api";

export const FileExplorerProvider = ({ children }) => {
    const [state, setState] = useState({
        currentFolder: null,
        fileTree: {},
        expandedKeys: [],
        breadcrumbs: [{ _id: 'root', name: 'Home' }],
        loading: false,
        error: null
    });

    const fetchFolderContents = useCallback(async (folderId = null) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await fetch(`${API_URL}/${folderId || ''}`);
            if (!response.ok) throw new Error('Failed to fetch files');
            const data = await response.json();
            
            setState(prev => ({ 
                ...prev,
                fileTree: {
                    ...prev.fileTree,
                    [folderId || 'root']: data
                },
                loading: false 
            }));
            
            return data;
        } catch (error) {
            setState(prev => ({ 
                ...prev, 
                error: error.message,
                loading: false 
            }));
        }
    }, []);

    const findPath = useCallback((tree, targetId, path = []) => {
        for (const item of tree) {
            if (item._id === targetId) return [...path, item];
            if (item.children) {
                const found = findPath(item.children, targetId, [...path, item]);
                if (found) return found;
            }
        }
        return null;
    }, []);

    const buildBreadcrumbs = useCallback((folderId) => {
        if (!folderId || folderId === 'root') {
            return [{ _id: 'root', name: 'Home' }];
        }

        const breadcrumbs = [{ _id: 'root', name: 'Home' }];
        let currentId = folderId;
        let safety = 0; // Prevent infinite loops

        while (currentId && safety < 100) {
            for (const [parentId, children] of Object.entries(state.fileTree)) {
                const currentFolder = children.find(f => f._id === currentId);
                if (currentFolder) {
                    breadcrumbs.unshift(currentFolder);
                    currentId = parentId === 'root' ? null : parentId;
                    break;
                }
            }
            safety++;
        }

        return breadcrumbs.reverse();
    }, [state.fileTree]);

    useEffect(() => {
        fetchFolderContents();
    }, [fetchFolderContents]);

    const handleFolderClick = async (folder) => {
        const folderId = folder?._id || 'root';
        
        setState(prev => ({
            ...prev,
            expandedKeys: prev.expandedKeys.includes(folderId) ?
                prev.expandedKeys.filter(k => k !== folderId) :
                [...prev.expandedKeys, folderId],
            currentFolder: folder,
            breadcrumbs: buildBreadcrumbs(folderId)
        }));

        if (!state.fileTree[folderId] && folderId !== 'root') {
            await fetchFolderContents(folderId);
        }
    };

    const refreshCurrentFolder = useCallback(async () => {
        const folderId = state.currentFolder?._id || null;
        await fetchFolderContents(folderId);
        
        // Also refresh parent folder if exists
        if (state.currentFolder?.parentId) {
            await fetchFolderContents(state.currentFolder.parentId);
        }
        
        // Refresh root if we're not in root
        if (folderId !== null) {
            await fetchFolderContents(null);
        }
    }, [state.currentFolder, fetchFolderContents]);

    const value = {
        currentFolder: state.currentFolder,
        fileTree: state.fileTree,
        expandedKeys: state.expandedKeys,
        breadcrumbs: state.breadcrumbs,
        loading: state.loading,
        handleFolderClick,
        refreshCurrentFolder,
        fetchFolderContents
    };

    return (
        <FileExplorerContext.Provider value={value}>
            {children}
        </FileExplorerContext.Provider>
    );
};

export const useFileExplorer = () => {
    const context = useContext(FileExplorerContext);
    if (!context) {
        throw new Error('useFileExplorer must be used within a FileExplorerProvider');
    }
    return context;
};
