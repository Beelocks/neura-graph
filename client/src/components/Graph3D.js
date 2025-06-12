import React, { forwardRef, useImperativeHandle } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

const Graph3D = forwardRef(({ graphData, onCreateRelationship, onNodeSelect }, ref) => {
  const fgRef = useRef();
  const [linking, setLinking] = useState(false);
  const [sourceNode, setSourceNode] = useState(null);

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      fgRef.current.cameraPosition({ z: 300 });
    }
  }));

  const handleNodeClick = (node) => {
    if (linking) {
      if (sourceNode && sourceNode.id !== node.id) {
        onCreateRelationship(sourceNode.id, node.id);
      }
      setLinking(false);
      setSourceNode(null);
    } else {
      onNodeSelect(node);
    }
  };

  const startLinking = (node) => {
    setLinking(true);
    setSourceNode(node);
  };

  return (
    <div className="graph-container">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="content"
        nodeAutoColorBy="id"
        linkDirectionalArrowLength={3.5}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={0.001}
        linkCurvature={0.25}
        onNodeClick={handleNodeClick}
        onNodeRightClick={startLinking}
        nodeThreeObject={node => {
          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ 
              color: node === sourceNode ? 0xff0000 : 0x3498db,
              sizeAttenuation: false 
            })
          );
          sprite.scale.set(10, 10, 1);
          return sprite;
        }}
        linkColor={() => 'rgba(200, 200, 200, 0.5)'}
        linkWidth={2}
      />
      {linking && <div className="linking-mode">Linking Mode: Select target node</div>}
    </div>
  );
});

export default Graph3D;