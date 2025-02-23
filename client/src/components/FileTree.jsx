import React, { memo, useState, useCallback } from "react";
import { useFileExplorer } from "../context/FileExplorerContext";
import { Typography, Button, Dropdown, Modal, Form, Input, Upload, message, Drawer } from "antd";
import { FolderOutlined, FileOutlined, MoreOutlined, FolderOpenOutlined,EditOutlined,DeleteOutlined,FolderAddOutlined,UploadOutlined,InboxOutlined } from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;
const { Dragger } = Upload;

const FileTree = memo(({ data, level = 0 }) => {
    const { 
        handleFolderClick, 
        currentFolder, 
        expandedKeys, 
        fileTree,
        refreshCurrentFolder 
    } = useFileExplorer();
    const [modals, setModals] = useState({
        edit: false,
        create: false,
        upload: false,
        delete: false
    });
    const [form] = Form.useForm();
    const [fileDrawer, setFileDrawer] = useState({
        visible: false,
        fileData: null
    });

    const toggleModal = useCallback((modalName, value) => {
        setModals(prev => ({ ...prev, [modalName]: value }));
    }, []);

    const handleEdit = useCallback(async (values) => {
        try {
            const response = await fetch(`http://localhost:8000/api/files/${data._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update file');
            }
            
            message.success('File updated successfully');
            await refreshCurrentFolder();
            toggleModal('edit', false);
            form.resetFields();
        } catch (error) {
            message.error(error.message);
        }
    }, [data._id, refreshCurrentFolder, form]);

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/${data._id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                message.success('Item deleted successfully');
                await refreshCurrentFolder();
                toggleModal('delete', false);
            }
        } catch (error) {
            message.error('Failed to delete item');
        }
    };

    const handleCreateFolder = async (values) => {
        try {
            const response = await fetch('http://localhost:8000/api/folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    type: 'folder',
                    parentId: data._id
                })
            });
            
            if (response.ok) {
                message.success('Folder created successfully');
                toggleModal('create', false);
                handleFolderClick(data);
                form.resetFields();
            }
        } catch (error) {
            message.error('Failed to create folder');
        }
    };

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('parentId', data._id);

        try {
            const response = await fetch('http://localhost:8000/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                message.success('File uploaded successfully');
                handleFolderClick(data);
                toggleModal('upload', false);
            }
            return false;
        } catch (error) {
            message.error('Failed to upload file');
            return false;
        }
    };

    const handleFolderToggle = (folder) => {
        handleFolderClick(folder);
    };

    const handleFileClick = (file) => {
        if (file.type !== 'folder') {
            setFileDrawer({
                visible: true,
                fileData: file
            });
        }
    };

    const items = [
        {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
            onClick: () => toggleModal('edit', true)
        },
        {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            onClick: () => toggleModal('delete', true)
        },
        {
            key: 'createFolder',
            label: 'Create Folder',
            icon: <FolderAddOutlined />,
            onClick: () => toggleModal('create', true)
        },
        {
            key: 'upload',
            label: 'Upload Document',
            icon: <UploadOutlined />,
            onClick: () => toggleModal('upload', true)
        }
    ];

    const renderRow = (item, isChild = false) => (
        <>
            <tr 
                className={`file-tree-row ${item._id === currentFolder?._id ? 'active' : ''}`}
                onClick={() => {
                    if (item.type === "folder") {
                        handleFolderClick(item);
                    } else {
                        handleFileClick(item);
                    }
                }}
            >
                <td className="file-tree-cell">
                    <div className="file-name-cell" style={{ paddingLeft: `${level * 24}px` }}>
                        {item.type === "folder" ? (
                            item._id === currentFolder?._id ? 
                                <FolderOpenOutlined className="folder-icon" /> : 
                                <FolderOutlined className="folder-icon" />
                        ) : (
                            <FileOutlined className="file-icon" />
                        )}
                        <Text>{item.name}</Text>
                    </div>
                </td>
                <td className="file-tree-cell description-cell">{item.description || "No description"}</td>
                <td className="file-tree-cell date-cell">{moment(item.createdAt).format('MMM DD, YYYY')}</td>
                <td className="file-tree-cell date-cell">{moment(item.updatedAt).format('MMM DD, YYYY')}</td>
                <td className="file-tree-cell actions-cell">
                    <Dropdown menu={{ items }} trigger={['click']} onClick={e => e.stopPropagation()}>
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                </td>
            </tr>
            {expandedKeys.includes(item._id) && fileTree[item._id]?.map(child => (
                <FileTree 
                    key={child._id} 
                    data={child} 
                    level={level + 1}
                />
            ))}
        </>
    );

    return (
        <>
            {renderRow(data, true)}

            <Modal
                title="Edit Item"
                open={modals.edit}
                onCancel={() => toggleModal('edit', false)}
                onOk={() => form.submit()}
            >
                <Form
                    form={form}
                    onFinish={handleEdit}
                    initialValues={{ 
                        name: data.name,
                        description: data.description 
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input the name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Create New Folder"
                open={modals.create}
                onCancel={() => toggleModal('create', false)}
                onOk={() => form.submit()}
            >
                <Form
                    form={form}
                    onFinish={handleCreateFolder}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input folder name!' }]}
                    >
                        <Input placeholder="Folder name" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={4} placeholder="Folder description" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Upload File"
                open={modals.upload}
                onCancel={() => toggleModal('upload', false)}
                footer={null}
            >
                <Dragger
                    customRequest={({ file }) => handleUpload(file)}
                    showUploadList={true}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                </Dragger>
            </Modal>

            <Modal
                title="Confirm Delete"
                open={modals.delete}
                onCancel={() => toggleModal('delete', false)}
                onOk={handleDelete}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete {data.name}?</p>
                <p>This action cannot be undone.</p>
            </Modal>

            <Drawer
                title={fileDrawer.fileData?.name || 'File Details'}
                placement="right"
                onClose={() => setFileDrawer({ visible: false, fileData: null })}
                open={fileDrawer.visible}
                width={500}
            >
                {fileDrawer.fileData && (
                    <div className="file-details">
                        <div className="detail-item">
                            <Text strong>Name:</Text>
                            <Text>{fileDrawer.fileData.name}</Text>
                        </div>
                        <div className="detail-item">
                            <Text strong>Description:</Text>
                            <Text>{fileDrawer.fileData.description || 'No description'}</Text>
                        </div>
                        <div className="detail-item">
                            <Text strong>Created:</Text>
                            <Text>{moment(fileDrawer.fileData.createdAt).format('MMMM DD, YYYY HH:mm')}</Text>
                        </div>
                        <div className="detail-item">
                            <Text strong>Last Modified:</Text>
                            <Text>{moment(fileDrawer.fileData.updatedAt).format('MMMM DD, YYYY HH:mm')}</Text>
                        </div>
                        {fileDrawer.fileData.fileUrl && (
                            <div className="detail-item">
                                <Button 
                                    type="primary" 
                                    onClick={() => window.open(fileDrawer.fileData.fileUrl, '_blank')}
                                >
                                    View File
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>
        </>
    );
});

export default FileTree;
