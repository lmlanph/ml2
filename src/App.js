
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Layout from './pages/Layout';
import Top from './pages/Top';
import All from './pages/All';
import About from './pages/About';


function App() {
  return (
      <Router>
        <Layout>
          <Routes>
            <Route exact path="/" element={<Top />} />
            <Route exact path="/all" element={<All />} />
            <Route exact path="/about" element={<About />} />
          </Routes>
        </Layout> 
      </Router>
  );
}

export default App;
