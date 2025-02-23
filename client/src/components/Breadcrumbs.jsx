import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useFileExplorer } from '../context/FileExplorerContext';

const Breadcrumbs = () => {
    const { breadcrumbs, handleFolderClick } = useFileExplorer();

    return (
        <Breadcrumb style={{ margin: '16px 0' }}>
            {breadcrumbs.map((item, index) => (
                <Breadcrumb.Item 
                    key={item._id}
                    onClick={() => {
                        if (index < breadcrumbs.length - 1) { // Only clickable if not the last item
                            handleFolderClick(item);
                        }
                    }}
                    style={{ 
                        cursor: index < breadcrumbs.length - 1 ? 'pointer' : 'default'
                    }}
                >
                    {item._id === 'root' ? <HomeOutlined /> : item.name}
                </Breadcrumb.Item>
            ))}
        </Breadcrumb>
    );
};

export default Breadcrumbs;
