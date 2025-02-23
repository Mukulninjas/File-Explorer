import React, { useState } from "react";
import { Button, Flex, Layout, Dropdown } from "antd";
import { FilterOutlined, PlusOutlined, FolderAddOutlined, UploadOutlined } from "@ant-design/icons";
import Breadcrumbs from "./Breadcrumbs";
import FilterModal from "./FilterModal";
import { CreateFolderModal, UploadModal } from "./FileActions";
import { useFileExplorer } from "../context/FileExplorerContext";

const { Header } = Layout;

const CustomHeader = () => {
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [isCreateFolderModalVisible, setIsCreateFolderModalVisible] = useState(false);
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
    const { currentFolder, refreshCurrentFolder } = useFileExplorer();

    const handleFilterApply = async (filters) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`http://localhost:8000/api/files/filter?${queryParams}`);
            if (response.ok) {
                await refreshCurrentFolder();
                setIsFilterModalVisible(false);
            }
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    };

    const items = [
        {
            key: 'createFolder',
            label: 'Create Folder',
            icon: <FolderAddOutlined />,
            onClick: () => setIsCreateFolderModalVisible(true)
        },
        {
            key: 'upload',
            label: 'Upload Document',
            icon: <UploadOutlined />,
            onClick: () => setIsUploadModalVisible(true)
        }
    ];

    return (
        <Header style={{ padding: "0 16px"	, background: "#f0f2f5" }}>
            <Flex justify="space-between" align="center">
                <Breadcrumbs />
                <div>
                    <Button 
                        style={{ marginRight: "5px" }} 
                        type="primary" 
                        icon={<FilterOutlined />}
                        onClick={() => setIsFilterModalVisible(true)}
                    />
                    <Dropdown menu={{ items }} placement="bottomRight">
                        <Button type="primary" icon={<PlusOutlined />} />
                    </Dropdown>
                </div>
            </Flex>

            <FilterModal
                open={isFilterModalVisible}
                onCancel={() => setIsFilterModalVisible(false)}
                onApply={handleFilterApply}
                onClear={() => {
                    refreshCurrentFolder();
                    setIsFilterModalVisible(false);
                }}
            />

            <CreateFolderModal
                open={isCreateFolderModalVisible}
                onCancel={() => setIsCreateFolderModalVisible(false)}
                onSubmit={() => {
                    setIsCreateFolderModalVisible(false);
                    refreshCurrentFolder();
                }}
                parentId={currentFolder?._id}
            />

            <UploadModal
                open={isUploadModalVisible}
                onCancel={() => setIsUploadModalVisible(false)}
                onSubmit={() => {
                    setIsUploadModalVisible(false);
                    refreshCurrentFolder();
                }}
                parentId={currentFolder?._id}
            />
        </Header>
    );
};

export default CustomHeader;
