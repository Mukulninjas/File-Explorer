import React, { useState } from 'react';
import { Modal, Form, Input, Upload, Button, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

export const CreateFolderModal = ({ open, onCancel, onSubmit, parentId }) => {
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        try {
            const response = await fetch('http://localhost:8000/api/folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    type: 'folder',
                    parentId: parentId === 'root' ? null : parentId
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create folder');
            }
            
            message.success('Folder created successfully');
            form.resetFields();
            onSubmit();
        } catch (error) {
            message.error(error.message);
        }
    };

    return (
        <Modal
            title="Create New Folder"
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
        >
            <Form form={form} onFinish={handleSubmit}>
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please input folder name!' }]}
                >
                    <Input placeholder="Folder name" />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input.TextArea rows={4} placeholder="Folder description" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export const UploadModal = ({ open, onCancel, onSubmit, parentId }) => {
    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('parentId', parentId);

        try {
            const response = await fetch('http://localhost:8000/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                message.success('File uploaded successfully');
                onSubmit();
            }
            return false;
        } catch (error) {
            message.error('Failed to upload file');
            return false;
        }
    };

    return (
        <Modal
            title="Upload File"
            open={open}
            onCancel={onCancel}
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
    );
}; 