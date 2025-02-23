import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import { Layout } from 'antd';
import { FileExplorerProvider } from "./context/FileExplorerContext";
import './styles/theme.css';

const App = () => {

  return (
    <FileExplorerProvider>
      <Layout style={{
        minHeight: '100vh'
      }}>
        <Sidebar />
        <MainContent />
      </Layout>
    </FileExplorerProvider>
  );
};

export default App;
