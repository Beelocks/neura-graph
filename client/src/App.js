import React, { useState, useEffect, useRef } from 'react';
import Graph3D from './components/Graph3D';
import Editor from './components/Editor';
import NodeInspector from './components/NodeInspector';
import AIAssistant from './components/AIAssistant';
import './styles.css';

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const graphRef = useRef();

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    const response = await fetch('http://localhost:8000/graph');
    const data = await response.json();
    setGraphData(data);
  };

  const handleCreateNode = async (content, position) => {
    const response = await fetch('http://localhost:8000/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        x: position.x,
        y: position.y,
        z: position.z
      })
    });
    const newNode = await response.json();
    setGraphData(prev => ({
      nodes: [...prev.nodes, {
        id: newNode.id,
        content: newNode.content,
        position
      }],
      links: prev.links
    }));
    return newNode.id;
  };

  const handleCreateRelationship = async (source, target) => {
    await fetch('http://localhost:8000/relationships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_id: source,
        target_id: target,
        relationship_type: "RELATED"
      })
    });
    fetchGraphData();
  };

  const handleAIProcess = async (content) => {
    const response = await fetch('http://localhost:8000/ai/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    });
    return await response.json();
  };

  return (
    <div className="app-container">
      <div className="editor-panel">
        <Editor 
          onCreateNode={handleCreateNode} 
          onAIProcess={handleAIProcess}
          setAiSuggestions={setAiSuggestions}
        />
        <AIAssistant suggestions={aiSuggestions} />
      </div>
      
      <div className="graph-panel">
        <Graph3D 
          ref={graphRef}
          graphData={graphData}
          onCreateRelationship={handleCreateRelationship}
          onNodeSelect={setSelectedNode}
        />
      </div>
      
      {selectedNode && (
        <NodeInspector 
          node={selectedNode} 
          onClose={() => setSelectedNode(null)} 
        />
      )}
    </div>
  );
}

export default App;