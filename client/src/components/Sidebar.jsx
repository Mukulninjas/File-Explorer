import React, { useState } from "react";
import { Layout, Menu, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useFileExplorer } from "../context/FileExplorerContext";

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { handleFolderClick, currentFolder, fileTree, expandedKeys } = useFileExplorer();

  const transformToMenuItems = (files = []) => {
    if (!Array.isArray(files)) return [];
    
    return files.filter(file => file.type === 'folder').map(folder => ({
      key: folder._id,
      label: folder.name,
      children: fileTree[folder._id] ? transformToMenuItems(fileTree[folder._id]) : [],
      data: folder,
    }));
  };

  const handleMenuClick = ({ key, domEvent }) => {
    domEvent.stopPropagation();
    const findFolder = (items) => {
      for (let item of items) {
        if (item.key === key) return item.data;
        if (item.children) {
          const found = findFolder(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const rootItems = transformToMenuItems(fileTree['root'] || []);
    const folderData = findFolder(rootItems);
    if (folderData) {
      handleFolderClick(folderData);
    }
  };

  const menuItems = transformToMenuItems(fileTree['root'] || []);

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      className="app-sidebar"
    >
      <div className="sidebar-header">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="collapse-button"
        />
      </div>
      <Menu
        mode="inline"
        items={menuItems}
        onClick={handleMenuClick}
        className="sidebar-menu"
        selectedKeys={currentFolder ? [currentFolder._id] : []}
        openKeys={expandedKeys}
        onOpenChange={(keys) => {
          const lastKey = keys[keys.length - 1];
          const folder = findFolder(menuItems, lastKey);
          if (folder) {
            handleFolderClick(folder);
          }
        }}
      />
    </Sider>
  );
};

const findFolder = (items, key) => {
  for (let item of items) {
    if (item.key === key) return item.data;
    if (item.children) {
      const found = findFolder(item.children, key);
      if (found) return found;
    }
  }
  return null;
};

export default Sidebar;
