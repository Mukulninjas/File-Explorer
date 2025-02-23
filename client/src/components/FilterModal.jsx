import React from 'react';
import { Modal, Form, Input, DatePicker, Button, Space } from 'antd';
import moment from 'moment';

const FilterModal = ({ open, onCancel, onApply, onClear }) => {
    const [form] = Form.useForm();

    const handleApply = (values) => {
        const filters = {
            ...values,
            dateFrom: values.dateFrom?.format('YYYY-MM-DD'),
            dateTo: values.dateTo?.format('YYYY-MM-DD')
        };
        onApply(filters);
    };

    const handleClear = () => {
        form.resetFields();
        onClear();
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Filter</span>
                    <Button style={{ marginRight: '20px' }} onClick={handleClear}>Clear Filter</Button>
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={
                <Space>
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button type="primary" onClick={() => form.submit()}>Apply</Button>
                </Space>
            }
        >
            <Form
                form={form}
                onFinish={handleApply}
                layout="vertical"
            >
                <Form.Item name="name" label="Name">
                    <Input placeholder="Search by name" />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input placeholder="Search by description" />
                </Form.Item>
                <Form.Item name="dateFrom" label="Date From">
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="dateTo" label="Date To">
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default FilterModal; 