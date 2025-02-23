import { Layout } from "antd";
import { useFileExplorer } from "../context/FileExplorerContext";
import CustomHeader from "./CustomHeader";
import FileTree from "./FileTree";

const { Content } = Layout;

const MainContent = () => {
    const { fileTree } = useFileExplorer();

    // Get the root level items from fileTree
    const rootItems = fileTree['root'] || [];

    return (
        <Layout>
            <CustomHeader />
            <Content style={{ margin: "24px 16px", padding: 24, background: "#fff" }}>
                <div className="file-tree-container">
                    <table className="file-tree-table">
                        <thead>
                            <tr>
                                <th className="file-tree-cell">Name</th>
                                <th className="file-tree-cell">Description</th>
                                <th className="file-tree-cell">Created At</th>
                                <th className="file-tree-cell">Updated At</th>
                                <th className="file-tree-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rootItems.map(item => (
                                <FileTree key={item._id} data={item} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Content>
        </Layout>
    );
};

export default MainContent;